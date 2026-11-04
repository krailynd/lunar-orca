import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Terminal, Cpu } from 'lucide-react'
import type { HerdrPaneInfo } from '../../../../../../shared/herdr-types'
import { AgentHoverCard } from './AgentHoverCard'

export type WorktreeAgentBranchProps = {
  panes: HerdrPaneInfo[]
  surfaceInset?: number
  onPaneClick?: (pane: HerdrPaneInfo) => void
}

export function WorktreeAgentBranch({
  panes,
  surfaceInset = 28,
  onPaneClick
}: WorktreeAgentBranchProps): React.JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!panes || panes.length === 0) {
    return null
  }

  const workingCount = panes.filter((p) => p.agent_status === 'working').length

  return (
    <div className="flex flex-col py-1 relative select-none">
      {/* Resumen plegable / Header de Agentes */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="group relative flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 text-xs rounded-md cursor-pointer transition-colors hover:bg-accent/40 active:bg-accent/60"
        style={{ marginLeft: `${surfaceInset + 2}px` }}
      >
        {/* Guía conectora L desde el worktree */}
        <div className="absolute -left-3 top-0 w-3 h-3 border-l border-b border-border/50 rounded-bl-[4px] pointer-events-none" />

        <button
          type="button"
          className="p-0.5 text-muted-foreground hover:text-foreground transition-transform shrink-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 opacity-70" />
          ) : (
            <ChevronRight className="w-3 h-3 opacity-70" />
          )}
        </button>

        <span className="font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-primary/15 text-primary border border-primary/25 shrink-0 flex items-center gap-0.5">
          <Cpu className="w-2.5 h-2.5" />
          <span>π</span>
        </span>

        <span className="text-[11px] font-medium tracking-tight text-muted-foreground group-hover:text-foreground">
          Agentes ({panes.length})
        </span>

        {workingCount > 0 ? (
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            {workingCount} activo{workingCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">en espera</span>
        )}
      </div>

      {/* Lista detallada de agentes */}
      {isExpanded ? (
        <div
          className="flex flex-col gap-1 mt-0.5 pl-3 border-l border-border/30"
          style={{ marginLeft: `${surfaceInset + 8}px` }}
        >
          {panes.map((pane, idx) => {
            const isWorking = pane.agent_status === 'working'
            const modelLabel = pane.tokens?.m_model || pane.model || '3.8-flash'
            const taskSummary = pane.tokens?.summary || pane.tokens?.summary2
            const costTokens = pane.tokens?.m_cost || pane.tokens?.m_ctxd
            const cleanTitle = pane.title.replace(/^π\s*-\s*/, '')

            return (
              <AgentHoverCard key={pane.pane_id || idx} pane={pane}>
                <div
                  onClick={() => onPaneClick?.(pane)}
                  className="group relative flex flex-col gap-0.5 pl-2 pr-2.5 py-1 text-xs rounded-md cursor-pointer transition-all border border-transparent hover:border-border/40 hover:bg-accent/40 active:bg-accent/70"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    {/* Status Indicator */}
                    <div className="relative flex items-center justify-center shrink-0 w-2.5 h-2.5">
                      {isWorking ? (
                        <>
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400/80 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </>
                      ) : (
                        <span className="inline-flex rounded-full h-1.5 w-1.5 bg-muted-foreground/40" />
                      )}
                    </div>

                    {/* Title / Tab Name */}
                    <span className="truncate font-medium text-[11px] text-foreground/90 group-hover:text-primary transition-colors">
                      {cleanTitle}
                    </span>

                    {/* Model badge */}
                    <span className="ml-auto text-[9px] font-mono text-muted-foreground/80 bg-muted/50 px-1 py-0.2 rounded border border-border/30 shrink-0">
                      {modelLabel}
                    </span>

                    {/* Focus link icon on hover */}
                    <Terminal className="w-2.5 h-2.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>

                  {/* Subtitle with current prompt/task if available */}
                  {taskSummary ? (
                    <div className="text-[10px] text-muted-foreground/75 truncate pl-4">
                      {taskSummary}
                    </div>
                  ) : null}

                  {/* Context tokens/cost indicator on hover */}
                  {costTokens ? (
                    <div className="hidden group-hover:flex items-center gap-1.5 text-[9px] font-mono text-emerald-400/80 pl-4">
                      <span>{costTokens}</span>
                    </div>
                  ) : null}
                </div>
              </AgentHoverCard>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
