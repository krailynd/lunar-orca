import React, { useMemo, useState } from 'react'
import { ArrowRight, GitBranch, Search } from 'lucide-react'
import { useAppStore } from '@/store'
import { useAllWorktrees } from '@/store/selectors'
import { useSessionHistory } from '../sidebar/session-history-types'
import { cn } from '@/lib/utils'

export function HomeSessionSearchOmnibar({
  onSelectWorktree
}: {
  onSelectWorktree?: (worktreeId: string) => void
}): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'worktrees' | 'history'>('all')
  const worktrees = useAllWorktrees()
  const historyStore = useSessionHistory()

  // Buscar coincidencia en Worktrees
  const matchingWorktrees = useMemo(() => {
    if (!query.trim()) {
      return worktrees.slice(0, 5)
    }
    const q = query.toLowerCase()
    return worktrees.filter(
      (wt) =>
        wt.displayName.toLowerCase().includes(q) ||
        wt.path.toLowerCase().includes(q) ||
        (wt.repoId && wt.repoId.toLowerCase().includes(q))
    )
  }, [worktrees, query])

  // Buscar coincidencia en Historial de Sesiones
  const matchingHistory = useMemo(() => {
    if (!query.trim()) {
      return historyStore.sessions.slice(0, 4)
    }
    const q = query.toLowerCase()
    return historyStore.sessions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.worktreeNames.some((w) => w.toLowerCase().includes(q))
    )
  }, [historyStore.sessions, query])

  const handleActivateWorktree = (id: string): void => {
    useAppStore.getState().setActiveWorktree(id)
    useAppStore.getState().setActiveView('terminal')
    onSelectWorktree?.(id)
  }

  return (
    <div className="relative rounded-2xl border border-border/80 bg-card/60 p-4 shadow-xl backdrop-blur-xl">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-primary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar sesión, worktree, rama o punto de restauración..."
          className="w-full rounded-xl border border-border/70 bg-background/80 py-2.5 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      {/* Filter Chips */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Filtrar:
        </span>
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={cn(
            'rounded-lg px-2.5 py-1 text-xs transition-colors',
            filterType === 'all'
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground'
          )}
        >
          Todo
        </button>
        <button
          type="button"
          onClick={() => setFilterType('worktrees')}
          className={cn(
            'rounded-lg px-2.5 py-1 text-xs transition-colors',
            filterType === 'worktrees'
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground'
          )}
        >
          Worktrees ({matchingWorktrees.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('history')}
          className={cn(
            'rounded-lg px-2.5 py-1 text-xs transition-colors',
            filterType === 'history'
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground'
          )}
        >
          Historial ({matchingHistory.length})
        </button>
      </div>

      {/* Results View */}
      <div className="mt-3 space-y-2">
        {/* Worktrees list */}
        {filterType === 'all' || filterType === 'worktrees' ? (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Worktrees &amp; Espacios de Trabajo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {matchingWorktrees.length === 0 ? (
                <div className="col-span-2 rounded-lg border border-border/40 p-2 text-center text-xs text-muted-foreground">
                  No se encontraron worktrees coincidentes
                </div>
              ) : (
                matchingWorktrees.map((wt) => (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => handleActivateWorktree(wt.id)}
                    className="group flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-2.5 text-left transition hover:border-primary/50 hover:bg-background/90"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <GitBranch className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {wt.displayName}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">{wt.path}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}

        {/* History snapshots list */}
        {filterType === 'all' || filterType === 'history' ? (
          <div className="mt-3 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Snapshots de Historial
            </span>
            <div className="grid grid-cols-2 gap-2">
              {matchingHistory.length === 0 ? (
                <div className="col-span-2 rounded-lg border border-border/40 p-2 text-center text-xs text-muted-foreground">
                  No se encontraron snapshots en el historial
                </div>
              ) : (
                matchingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-border/60 bg-background/50 p-2.5 transition hover:border-primary/40"
                    style={{ borderLeftWidth: 3, borderLeftColor: item.color }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-foreground">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                    </div>
                    {item.description ? (
                      <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>{item.worktreesCount} wt</span>
                      <span>•</span>
                      <span>{item.terminalsCount} terminales</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
