import React from 'react'
import { Bot, RefreshCw, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiVaultSession } from '../../../../shared/ai-vault-types'
import { HARNESS_CATEGORIES } from './home-page-types'
import { HomePageSessionCards } from './HomePageSessionCards'

export type HomePageSessionsSectionProps = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  loadingSessions: boolean
  onRefreshSessions: () => void
  activeCategory: string
  setActiveCategory: (category: string) => void
  sessions: AiVaultSession[]
  filteredSessions: AiVaultSession[]
  onOpenSession: (session: AiVaultSession) => void
}

export function HomePageSessionsSection({
  searchQuery,
  setSearchQuery,
  loadingSessions,
  onRefreshSessions,
  activeCategory,
  setActiveCategory,
  sessions,
  filteredSessions,
  onOpenSession
}: HomePageSessionsSectionProps): React.JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="size-4 text-workspace-status-review" />
            Historial de Sesiones por Arnés
          </h2>
          <p className="text-xs text-muted-foreground">
            Sesiones indexadas y agrupadas por entorno (Pi, OpenCode, Hermes, Claude, Codex y
            otros).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar sesiones, comandos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg bg-card/90 border border-border/60 focus:outline-hidden focus:border-workspace-status-review/60 w-44 sm:w-60 transition-all placeholder:text-muted-foreground/60 shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={onRefreshSessions}
            disabled={loadingSessions}
            title="Refrescar sesiones"
            className="size-8 rounded-lg border border-border/60 bg-card/90 hover:bg-accent/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn('size-3.5', loadingSessions && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Categorías Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 duration-200 border',
            activeCategory === 'all'
              ? 'bg-card text-primary border-primary/30 shadow-xs font-semibold'
              : 'bg-card/90 text-muted-foreground hover:bg-accent/60 hover:text-foreground border-border/60 shadow-xs'
          )}
        >
          Todos ({sessions.length})
        </button>
        {HARNESS_CATEGORIES.map((cat) => {
          const count = sessions.filter((s) => cat.agents.includes(s.agent)).length
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 duration-200 border',
                isActive
                  ? 'bg-card border-primary/30 text-primary font-semibold shadow-xs'
                  : 'bg-card/90 border-border/60 text-muted-foreground hover:bg-accent/60 hover:text-foreground shadow-xs'
              )}
            >
              <Icon className={cn('size-3.5', cat.color)} />
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Sesiones Grid or Empty State */}
      {loadingSessions && sessions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-border/50 bg-card/40 animate-pulse"
            />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/30">
          <Bot className="size-8 stroke-[1.25] text-muted-foreground/40" />
          <p className="text-sm font-medium mt-3 text-muted-foreground">
            No se encontraron sesiones para este filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all')
              setSearchQuery('')
            }}
            className="text-xs text-primary hover:underline mt-1"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <HomePageSessionCards
          sessions={filteredSessions}
          activeCategory={activeCategory}
          onOpenSession={onOpenSession}
        />
      )}
    </section>
  )
}
