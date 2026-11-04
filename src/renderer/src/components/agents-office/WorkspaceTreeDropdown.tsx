import React, { useState, useRef, useEffect, useMemo } from 'react'
import { FolderGit2, GitBranch, ChevronDown, Check, Folder } from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Worktree } from '../../../../shared/worktree/types'
import type { Repo } from '../../../../shared/repo-types'

type WorkspaceTreeDropdownProps = {
  selectedWorkspaceName: string
  onSelectWorkspace: (workspaceName: string, worktreeId?: string) => void
  worktrees: Worktree[]
}

type ProjectGroup = {
  repo: Repo | null
  repoName: string
  worktrees: Worktree[]
}

export function WorkspaceTreeDropdown({
  selectedWorkspaceName,
  onSelectWorkspace,
  worktrees
}: WorkspaceTreeDropdownProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const repos = useAppStore((s) => s.repos)

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [open])

  // Agrupar worktrees por repositorio/proyecto
  const groups: ProjectGroup[] = useMemo(() => {
    const map = new Map<string, ProjectGroup>()

    // Inicializar grupos con todos los repos conocidos
    for (const r of repos) {
      map.set(r.id, {
        repo: r,
        repoName: r.displayName || r.path.split('/').pop() || 'Proyecto',
        worktrees: []
      })
    }

    // Ubicar cada worktree en su repositorio
    for (const wt of worktrees) {
      const existing = map.get(wt.repoId)
      if (existing) {
        existing.worktrees.push(wt)
      } else {
        // Worktree suelto o folder workspace
        const fallbackName = wt.repoId ? wt.repoId.split('/').pop() || wt.repoId : 'General'
        if (!map.has(fallbackName)) {
          map.set(fallbackName, {
            repo: null,
            repoName: fallbackName,
            worktrees: []
          })
        }
        map.get(fallbackName)!.worktrees.push(wt)
      }
    }

    return Array.from(map.values()).filter(
      (g) => g.worktrees.length > 0 || (g.repo && g.repo.displayName === 'lunar-orca')
    )
  }, [repos, worktrees])

  // Hallar qué proyecto y worktree están seleccionados actualmente
  const activeSelectionInfo = useMemo(() => {
    for (const g of groups) {
      for (const wt of g.worktrees) {
        if (wt.displayName === selectedWorkspaceName) {
          return { repoName: g.repoName, branchName: wt.displayName, isHQ: false }
        }
      }
    }
    if (selectedWorkspaceName === 'lunar-orca') {
      return { repoName: 'Lunar Orca', branchName: 'HQ Central', isHQ: true }
    }
    return { repoName: 'Oficina', branchName: selectedWorkspaceName, isHQ: false }
  }, [groups, selectedWorkspaceName])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md shadow-xs transition-all hover:border-primary/50 hover:bg-background/90',
          open && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <FolderGit2 className="h-3.5 w-3.5 text-primary" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground/90">{activeSelectionInfo.repoName}</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="flex items-center gap-1 text-primary">
            <GitBranch className="h-3 w-3" />
            <span>{activeSelectionInfo.branchName}</span>
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180 text-foreground'
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-80 w-72 overflow-y-auto rounded-xl border border-border/80 bg-popover/90 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-xl scrollbar-sleek animate-in fade-in-50 zoom-in-95">
          {/* Opción HQ Central Predeterminada */}
          <button
            type="button"
            onClick={() => {
              onSelectWorkspace('lunar-orca')
              setOpen(false)
            }}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors hover:bg-accent/80 hover:text-accent-foreground',
              selectedWorkspaceName === 'lunar-orca' &&
                'bg-accent/90 text-accent-foreground font-semibold'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span>Oficina Central (HQ)</span>
            </div>
            {selectedWorkspaceName === 'lunar-orca' ? (
              <Check className="size-3.5 text-primary" />
            ) : null}
          </button>

          <div className="my-1.5 h-px bg-border/50" />

          {/* Lista de Grupos de Proyectos y sus Ramas / Worktrees */}
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.repoName} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  <Folder className="size-3 text-muted-foreground/70" />
                  <span className="truncate">{group.repoName}</span>
                  <span className="text-[10px] text-muted-foreground/60">
                    ({group.worktrees.length})
                  </span>
                </div>

                <div className="ml-2.5 space-y-0.5 border-l border-border/40 pl-2">
                  {group.worktrees.length === 0 ? (
                    <span className="block px-2 py-1 text-[11px] italic text-muted-foreground/60">
                      Sin worktrees activos
                    </span>
                  ) : (
                    group.worktrees.map((wt) => {
                      const isSelected = selectedWorkspaceName === wt.displayName
                      return (
                        <button
                          key={wt.id}
                          type="button"
                          onClick={() => {
                            onSelectWorkspace(wt.displayName, wt.id)
                            setOpen(false)
                          }}
                          className={cn(
                            'group flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-accent/70 hover:text-accent-foreground',
                            isSelected && 'bg-accent text-accent-foreground font-medium'
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <GitBranch
                              className={cn(
                                'size-3 shrink-0 text-muted-foreground group-hover:text-primary',
                                isSelected && 'text-primary'
                              )}
                            />
                            <span className="truncate">{wt.displayName}</span>
                          </div>
                          {isSelected ? <Check className="size-3 text-primary shrink-0" /> : null}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
