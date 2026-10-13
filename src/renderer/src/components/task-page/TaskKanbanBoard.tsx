import React, { useMemo } from 'react'
import { Bot, ExternalLink, FolderKanban, Sparkles } from 'lucide-react'
import type { TaskPageComposerActionsModel } from '../use-task-page-composer-actions'
import { formatRelativeTime } from '../task-page-source-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  buildKanbanCardsFromTaskPageModel,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS,
  type TaskKanbanColumnId,
  type UnifiedKanbanTaskCard
} from './task-kanban-model'

export {
  buildLunarOrcaMultiAgentDispatchPrompt,
  classifyTaskKanbanColumn,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS
} from './task-kanban-model'

export function TaskPageKanbanBoard({
  model
}: {
  model: TaskPageComposerActionsModel
}): React.JSX.Element {
  const cards = useMemo(() => buildKanbanCardsFromTaskPageModel(model), [model])

  const cardsByColumn = useMemo(() => {
    const map = new Map<TaskKanbanColumnId, UnifiedKanbanTaskCard[]>()
    for (const col of TASK_KANBAN_COLUMNS) {
      map.set(col.id, [])
    }
    for (const card of cards) {
      const bucket = map.get(card.column)
      if (bucket) {
        bucket.push(card)
      }
    }
    return map
  }, [cards])

  return (
    <div
      data-testid="task-page-kanban-board"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md rounded-t-none border border-t-0 border-border/50 bg-muted/25 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-muted/40 px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-workspace-status-review/35 bg-workspace-status-review/10 px-2.5 py-0.5 font-semibold text-git-graph-lane-4">
            <Sparkles className="size-3" />
            Lunar Orca Multi-Agent Task Board
          </span>
          <span className="text-[11px] text-muted-foreground">
            Dispatch tasks to isolated worktrees with full Lunar Orca Intercom awareness
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span>Total: {cards.length}</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 scrollbar-sleek md:grid-cols-2 xl:grid-cols-4">
        {TASK_KANBAN_COLUMNS.map((col) => {
          const colCards = cardsByColumn.get(col.id) ?? []
          return (
            <section
              key={col.id}
              data-testid={`task-kanban-column-${col.id}`}
              className={cn(
                'flex min-h-[260px] flex-col overflow-hidden rounded-md border border-t-2 border-border/60 bg-background/70',
                col.accentClass
              )}
            >
              <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/50 bg-muted/30 px-3">
                <span className="text-xs font-semibold text-foreground">{col.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {colCards.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-2 scrollbar-sleek">
                {colCards.length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border/60 text-[11px] text-muted-foreground">
                    No tasks in {col.label}
                  </div>
                ) : (
                  colCards.map((card) => (
                    <div
                      key={card.key}
                      data-testid="task-kanban-card"
                      className="group flex flex-col gap-2 rounded-md border border-border/60 bg-card/90 p-2.5 shadow-xs transition-colors hover:border-workspace-status-review/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={card.onOpenDetail}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="font-mono font-semibold text-git-graph-lane-4">
                              {card.identifier}
                            </span>
                            {card.repoLabel ? (
                              <span className="truncate rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                {card.repoLabel}
                              </span>
                            ) : null}
                            {card.updatedAt ? (
                              <span className="ml-auto shrink-0 text-[10px]">
                                {formatRelativeTime(card.updatedAt)}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs font-medium text-foreground group-hover:text-git-graph-lane-4">
                            {card.title}
                          </div>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="size-6 shrink-0"
                          aria-label={`Open ${card.identifier} in browser`}
                          onClick={() => void window.api.shell.openUrl(card.url)}
                        >
                          <ExternalLink className="size-3" />
                        </Button>
                      </div>

                      {card.labels.length > 0 || card.attachedWorkspaceLabel ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {card.attachedWorkspaceLabel ? (
                            <span className="inline-flex items-center gap-1 rounded border border-workspace-status-review/35 bg-workspace-status-review/10 px-1.5 py-0.5 text-[10px] font-medium text-git-graph-lane-4">
                              <FolderKanban className="size-2.5" />
                              {card.attachedWorkspaceLabel}
                            </span>
                          ) : null}
                          {card.labels.map((label) => (
                            <span
                              key={label}
                              className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between gap-1.5 border-t border-border/40 pt-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              data-testid="task-kanban-agent-dispatch-trigger"
                              className="inline-flex h-6 items-center gap-1 rounded-md border border-workspace-status-review/35 bg-workspace-status-review/10 px-2 text-[10px] font-medium text-git-graph-lane-4 transition-colors hover:bg-workspace-status-review/20"
                            >
                              <Bot className="size-3" />
                              <span>Asignar a Agente</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Agent Dispatch / Intercom</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {TASK_DISPATCH_AGENTS.map((agent) => (
                              <DropdownMenuItem
                                key={agent.id}
                                data-testid={`task-kanban-dispatch-agent-${agent.id}`}
                                onClick={() => card.onDispatchAgent(agent.id, card.column)}
                                className="flex items-center justify-between"
                              >
                                <span>Asignar a Agente: {agent.label}</span>
                                <span className="font-mono text-[10px] uppercase text-git-graph-lane-4">
                                  {agent.id}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex items-center gap-1">
                          {(['pi', 'opencode', 'claude', 'codex'] as const).map((agentId) => (
                            <button
                              key={agentId}
                              type="button"
                              title={`Dispatch to ${agentId.toUpperCase()} in Lunar Orca worktree`}
                              onClick={() => card.onDispatchAgent(agentId, card.column)}
                              className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-muted-foreground transition-colors hover:border-workspace-status-review/50 hover:bg-workspace-status-review/15 hover:text-git-graph-lane-4"
                            >
                              {agentId}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
