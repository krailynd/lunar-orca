import React, { useMemo } from 'react'
import {
  History,
  Trash2,
  Save,
  PanelsTopLeft,
  Search,
  GitPullRequest,
  Users,
  Terminal,
  Settings
} from 'lucide-react'
import { useAppStore } from '@/store'

export type OmnibarCommandItem = {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
}

export function useOmnibarCommands(
  query: string,
  activeCategory: string,
  closeModal: () => void,
  activeWorktreeId: string | null
): OmnibarCommandItem[] {
  return useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'commands') {
      return []
    }
    const store = useAppStore.getState()
    const q = query.toLowerCase().trim()
    const allCommands: OmnibarCommandItem[] = [
      {
        id: 'cmd-save-session',
        title: 'Guardar Sesión Snapshot',
        subtitle: 'Crear una instantánea persistente del workspace actual',
        icon: <Save className="size-4 text-emerald-400" />,
        action: () => {
          closeModal()
          window.dispatchEvent(new CustomEvent('lunar-orca:open-save-session'))
        }
      },
      {
        id: 'cmd-session-history',
        title: 'Historial de Sesiones',
        subtitle: 'Explorar, restaurar o exportar snapshots guardados',
        icon: <History className="size-4 text-sky-400" />,
        action: () => {
          closeModal()
          window.dispatchEvent(new CustomEvent('lunar-orca:open-sessions-drawer'))
        }
      },
      {
        id: 'cmd-kill-agents',
        title: 'Detener Todos los Agentes en Ejecución',
        subtitle: 'Cerrar procesos huérfanos y agentes background',
        icon: <Trash2 className="size-4 text-rose-400" />,
        action: () => {
          closeModal()
          window.dispatchEvent(new CustomEvent('lunar-orca:open-kill-agents'))
        }
      },
      {
        id: 'cmd-agents-office',
        title: 'Ir a Agents Office (Oficina de Agentes)',
        subtitle: 'Visualizar colaboradores y subagentes en sus puestos de trabajo',
        icon: <Users className="size-4 text-amber-400" />,
        action: () => {
          store.setSidebarBody?.('agents')
          closeModal()
        }
      },
      {
        id: 'cmd-git-staging',
        title: 'Quick Git Staging & Diff Inspector',
        subtitle: 'Inspeccionar cambios, diffs y preparar commits rápidamente',
        icon: <GitPullRequest className="size-4 text-emerald-400" />,
        shortcut: 'Ctrl+Shift+G',
        action: () => {
          closeModal()
          window.dispatchEvent(new CustomEvent('lunar-orca:toggle-git-staging'))
        }
      },
      {
        id: 'cmd-new-terminal',
        title: 'Nueva Pestaña de Terminal',
        subtitle: 'Abrir un shell interactivo en el workspace actual',
        icon: <Terminal className="size-4 text-teal-400" />,
        shortcut: 'Ctrl+Shift+T',
        action: () => {
          closeModal()
          if (activeWorktreeId) {
            store.createTab(activeWorktreeId)
          }
        }
      },
      {
        id: 'cmd-toggle-sidebar',
        title: 'Alternar Barra Lateral Izquierda',
        subtitle: 'Mostrar u ocultar la navegación principal y lista de workspaces',
        icon: <PanelsTopLeft className="size-4 text-slate-400" />,
        shortcut: 'Ctrl+B',
        action: () => {
          store.toggleSidebar()
          closeModal()
        }
      },
      {
        id: 'cmd-explorer',
        title: 'Alternar Explorador de Archivos',
        subtitle: 'Mostrar árbol de archivos en el panel derecho',
        icon: <Search className="size-4 text-indigo-400" />,
        shortcut: 'Ctrl+Shift+E',
        action: () => {
          store.showRightSidebarFiles()
          closeModal()
        }
      },
      {
        id: 'cmd-settings',
        title: 'Abrir Configuración',
        subtitle: 'Preferencias de Lunar-Orca, temas y shortcuts',
        icon: <Settings className="size-4 text-zinc-400" />,
        shortcut: 'Ctrl+,',
        action: () => {
          store.openSettingsPage()
          closeModal()
        }
      },
      {
        id: 'cmd-clear-workspace',
        title: 'Limpiar Espacio de Trabajo',
        subtitle: 'Cerrar repositorios y worktrees abiertos sin borrar archivos',
        icon: <Trash2 className="size-4 text-muted-foreground" />,
        action: () => {
          closeModal()
          window.dispatchEvent(new CustomEvent('lunar-orca:clear-workspace'))
        }
      }
    ]

    return allCommands.filter((cmd) => {
      if (!q) {
        return true
      }
      return cmd.title.toLowerCase().includes(q) || cmd.subtitle.toLowerCase().includes(q)
    })
  }, [query, activeCategory, closeModal, activeWorktreeId])
}
