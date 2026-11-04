import { useAppStore } from '@/store'
import { runWorktreeDeletesInParallel } from './delete-worktree-flow'
import { toast } from 'sonner'
import type { SavedSessionSnapshot } from './session-history-types'
import { getRepoExecutionHostId } from '../../../../shared/execution-host'

/**
 * Limpia por completo el workspace actual:
 * 1. Cierra todas las pestañas de terminales activas.
 * 2. Elimina todos los worktrees secundarios creados.
 * 3. Remueve todos los proyectos/repositorios cargados en el workspace.
 */
export async function clearCurrentWorkspace(): Promise<void> {
  const state = useAppStore.getState()
  const allWorktreesMap = state.worktreesByRepo
  const worktreeList = Object.values(allWorktreesMap).flat()

  // 1. Cerrar todas las terminales
  const tabsByWorktree = state.tabsByWorktree
  const allTabs = Object.values(tabsByWorktree).flat()
  for (const tab of allTabs) {
    try {
      state.closeTab(tab.id, { recordInteraction: false })
    } catch (e) {
      console.warn('Error cerrando tab durante limpieza:', e)
    }
  }

  // 2. Filtrar worktrees secundarios para eliminación segura (excluir el main checkout)
  const nonMainWorktrees = worktreeList.filter((wt) => !wt.isMainWorktree)

  if (nonMainWorktrees.length > 0) {
    try {
      await runWorktreeDeletesInParallel(nonMainWorktrees, { force: true })
    } catch (err) {
      console.error('Error limpiando worktrees en paralelo:', err)
    }
  }

  // 3. Remover todos los repositorios para dejar el espacio 100% estéril
  const repos = state.repos
  for (const repo of repos) {
    try {
      const hostId = getRepoExecutionHostId(repo)
      await state.removeProject(repo.id, { hostId, errorFeedback: 'silent' })
    } catch (err) {
      console.warn(`No se pudo remover el proyecto ${repo.displayName}:`, err)
    }
  }
}

/**
 * Restaura una sesión guardada de forma limpia:
 * Primero purga el estado actual para evitar mezclas o solapamientos,
 * añade los repositorios guardados y luego reconstruye los worktrees y pestañas.
 */
export async function restoreSessionSnapshot(
  snapshot: SavedSessionSnapshot,
  onProgress?: (step: string) => void
): Promise<boolean> {
  try {
    onProgress?.('Limpiando espacio de trabajo actual...')
    await clearCurrentWorkspace()

    const state = useAppStore.getState()

    // 1. Re-importar o añadir los repositorios guardados en el snapshot
    const savedRepos = snapshot.reposData ?? []
    if (savedRepos.length > 0) {
      onProgress?.('Restaurando proyectos de la sesión...')
      for (const repoData of savedRepos) {
        try {
          await state.addRepoPath(repoData.path, repoData.kind ?? 'git', {
            displayName: repoData.displayName
          })
        } catch (e) {
          console.warn(`No se pudo re-añadir el repositorio ${repoData.displayName}:`, e)
        }
      }
    }

    onProgress?.('Recreando estructura de la sesión...')
    const worktrees = snapshot.worktreesData ?? []

    // Obtener el estado fresco de repos tras la adición
    const freshState = useAppStore.getState()
    const currentRepos = freshState.repos

    for (const wt of worktrees) {
      // Buscar el repo correspondiente (por path o displayName si el ID cambió)
      const matchingRepo = currentRepos.find(
        (r) => r.id === wt.repoId || r.displayName === wt.displayName || r.path === wt.path
      )
      const targetRepoId = matchingRepo ? matchingRepo.id : wt.repoId

      // Si no es el worktree principal y tiene rama y repo, re-crear el worktree
      if (!wt.isMainWorktree && targetRepoId && wt.branch) {
        try {
          await freshState.createWorktree(targetRepoId, wt.displayName, wt.branch)
        } catch (e) {
          console.warn(`No se pudo recrear el worktree ${wt.displayName}:`, e)
        }
      }

      // Recrear las pestañas de terminales asociadas
      if (wt.terminals && wt.terminals.length > 0) {
        for (const term of wt.terminals) {
          try {
            const newTab = freshState.createTab(wt.id)
            if (term.customTitle || term.title) {
              freshState.setTabCustomTitle(newTab.id, term.customTitle ?? term.title ?? null)
            }
          } catch (e) {
            console.warn(`No se pudo restaurar terminal para ${wt.displayName}:`, e)
          }
        }
      }
    }

    toast.success(`Sesión "${snapshot.name}" restaurada con éxito`)
    return true
  } catch (error) {
    console.error('Error restaurando sesión:', error)
    toast.error('Ocurrió un error al restaurar la sesión')
    return false
  }
}
