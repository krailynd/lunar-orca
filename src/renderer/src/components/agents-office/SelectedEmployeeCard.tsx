import React from 'react'
import { Laptop, MessageSquare, Coffee, Activity, Send } from 'lucide-react'
import type { Agent } from './types'
import { useAppStore } from '@/store'
import type { Worktree } from '../../../../shared/worktree/types'
import type { HerdrPaneInfo } from '../../../../shared/herdr-types'

export type SelectedEmployeeCardProps = {
  selectedAgent: Agent | null
  selectedWorkspaceName: string
  worktrees: Worktree[]
  activeHerdrPanes: HerdrPaneInfo[]
  onMakeTalk: () => void
  onGoToBoard: () => void
  onSendToLounge: () => void
  onSendToDesk: () => void
  onFocusPane: (sessionName: string, paneId: string) => Promise<boolean>
}

export function SelectedEmployeeCard({
  selectedAgent,
  selectedWorkspaceName,
  worktrees,
  activeHerdrPanes,
  onMakeTalk,
  onGoToBoard,
  onSendToLounge,
  onSendToDesk,
  onFocusPane
}: SelectedEmployeeCardProps): React.JSX.Element | null {
  if (!selectedAgent) {
    return null
  }

  const handleAgentChatOrTerminal = async (): Promise<void> => {
    if (selectedAgent.id.startsWith('sub-')) {
      const subName = selectedAgent.id.replace(/^sub-/, '').replace(/^π-/, '')
      const matchedPane = activeHerdrPanes.find(
        (p) =>
          p.title.toLowerCase().includes(subName) ||
          (p.pane_id && selectedAgent.id.includes(p.pane_id))
      )
      if (matchedPane) {
        await onFocusPane('lunar-orca', matchedPane.pane_id)
        return
      }
    }

    const worktree = worktrees.find((w) => w.displayName === selectedWorkspaceName)
    if (worktree) {
      useAppStore.getState().setActiveWorktree(worktree.id)
    }
    useAppStore.getState().setActiveView('terminal')
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-background/80 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md font-bold text-white shadow"
          style={{ backgroundColor: selectedAgent.appearance.shirt }}
        >
          {selectedAgent.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>{selectedAgent.name}</span>
            {selectedAgent.lead ? (
              <span className="rounded bg-annotation-highlight/20 px-1 py-0.2 text-[9px] font-bold text-annotation-highlight">
                LEAD
              </span>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">{selectedAgent.role}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Ubicación:</span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium bg-annotation-highlight/10 text-annotation-highlight">
            <Laptop className="h-3 w-3" /> Escritorio #{selectedAgent.seat + 1}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 pt-2">
          <button
            onClick={onMakeTalk}
            className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/80 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Hacer hablar (Burbuja)</span>
          </button>

          <button
            onClick={onGoToBoard}
            className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/80 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition"
          >
            <span>📋 Ir a la Pizarra</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onSendToLounge}
              className="flex items-center justify-center gap-1 rounded-md border border-border bg-secondary/60 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <Coffee className="h-3 w-3" />
              <span>Al Lounge</span>
            </button>
            <button
              onClick={onSendToDesk}
              className="flex items-center justify-center gap-1 rounded-md border border-border bg-secondary/60 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <Activity className="h-3 w-3" />
              <span>Al Escritorio</span>
            </button>
          </div>

          <button
            onClick={handleAgentChatOrTerminal}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/90 py-2 text-xs font-semibold text-primary-foreground shadow-md backdrop-blur-md transition-all hover:bg-primary hover:shadow-lg active:scale-98"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Ir a la Terminal / Chat del Agente</span>
          </button>
        </div>
      </div>
    </div>
  )
}
