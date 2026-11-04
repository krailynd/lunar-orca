import React from 'react'
import { Terminal, Cpu, Clock, CheckCircle2, Zap } from 'lucide-react'
import type { HerdrPaneInfo } from '../../../../../../shared/herdr-types'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

export type AgentHoverCardProps = {
  pane: HerdrPaneInfo
  children: React.ReactNode
}

export function AgentHoverCard({ pane, children }: AgentHoverCardProps): React.JSX.Element {
  const isWorking = pane.agent_status === 'working'
  const tokens = pane.tokens || {}
  const modelLabel = tokens.m_model || pane.model || '3.8-flash-high'
  const taskText = [tokens.summary, tokens.summary2].filter(Boolean).join(' ').trim()
  const cleanTitle = pane.title.replace(/^π\s*-\s*/, '')
  const ctxPercent = tokens.m_ctxp ? `${tokens.m_ctxp}%` : null

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          sideOffset={10}
          className="w-72 p-0 border border-border/60 bg-[#121319]/95 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden text-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200"
        >
          {/* Header Card */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-accent/30 border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex items-center justify-center shrink-0 w-2.5 h-2.5">
                {isWorking ? (
                  <>
                    <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </>
                ) : (
                  <span className="inline-flex rounded-full h-2 w-2 bg-muted-foreground/40" />
                )}
              </div>
              <span className="font-semibold text-xs tracking-tight truncate text-foreground">
                {cleanTitle}
              </span>
            </div>

            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
              {tokens.m_piver || 'π v1.4.0'}
            </span>
          </div>

          {/* Body Content */}
          <div className="p-3.5 space-y-3 font-mono text-[11px]">
            {/* Tarea Actual */}
            <div className="p-2 rounded-lg bg-background/60 border border-border/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <Cpu className="w-3 h-3 text-primary" />
                <span>Tarea en ejecución</span>
              </div>
              <div className="text-[11px] leading-relaxed text-foreground/95 break-words font-sans">
                {taskText || (isWorking ? 'Ejecutando proceso...' : 'En espera de instrucciones')}
              </div>
            </div>

            {/* Métricas estilo Herdr */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {/* Modelo */}
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[9px] uppercase">Modelo</span>
                <div className="text-amber-400/95 font-medium truncate">{modelLabel}</div>
              </div>

              {/* Context Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase">
                  <span>Contexto</span>
                  {ctxPercent ? (
                    <span className="text-emerald-400 font-bold">{ctxPercent}</span>
                  ) : null}
                </div>
                <div className="text-emerald-400/90 tracking-tighter truncate text-[10px]">
                  {tokens.m_ctxbar || '░░░░░░░░░░'}
                </div>
              </div>

              {/* Tokens In/Out */}
              {tokens.m_ctxd ? (
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[9px] uppercase">Tráfico</span>
                  <div className="text-foreground/90 truncate">{tokens.m_ctxd}</div>
                </div>
              ) : null}

              {/* Costo / Tokens */}
              {tokens.m_cost ? (
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[9px] uppercase">Costo</span>
                  <div className="text-emerald-400/90 truncate">{tokens.m_cost}</div>
                </div>
              ) : null}

              {/* MCP Tools */}
              {tokens.m_mcp ? (
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[9px] uppercase">Herramientas</span>
                  <div className="text-cyan-400/90 font-medium flex items-center gap-1 truncate">
                    <Zap className="w-2.5 h-2.5 shrink-0" />
                    <span>{tokens.m_mcp}</span>
                  </div>
                </div>
              ) : null}

              {/* Comandos ejecutados */}
              {tokens.m_cmds ? (
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[9px] uppercase">Comandos</span>
                  <div className="text-foreground/90 flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>{tokens.m_cmds}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Tiempo transcurrido si existe */}
            {tokens.m_elapsed ? (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 pt-1 border-t border-border/30">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>Tiempo activo: {tokens.m_elapsed}</span>
              </div>
            ) : null}
          </div>

          {/* Footer Callout */}
          <div className="px-3 py-1.5 bg-accent/20 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground/80">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-primary" />
              <span>Click para enfocar terminal</span>
            </span>
            <kbd className="px-1 py-0.5 text-[9px] rounded bg-muted/60 text-muted-foreground font-mono">
              Alacritty
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
