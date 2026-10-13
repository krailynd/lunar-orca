import React, { useMemo, useState } from 'react'
import {
  Bot,
  CalendarRange,
  ExternalLink,
  FolderKanban,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react'
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
import { useLocalProjectTasks } from './local-tasks-store'
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
  TASK_KANBAN_COLUMNS,
  TASK_KANBAN_DISPATCH_AGENTS
} from './task-kanban-model'

export function TaskPageKanbanBoard({
  model
}: {
  model: TaskPageComposerActionsModel
}): React.JSX.Element {
  const { tasks: localTasks, overrides } = useLocalProjectTasks()
  const [draggedCardKey, setDraggedCardKey] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskKanbanColumnId | null>(null)

  const cards = useMemo(
    () => buildKanbanCardsFromTaskPageModel(model, { localTasks, overrides }),
    [model, localTasks, overrides]
  )

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
            {model.localTasksMode
              ? 'Kanban · Proyectos Locales Personalizados'
              : 'Kanban · Lunar Orca Multi-Agent Task Board'}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Arrastra tarjetas entre columnas o delégalas a Pi, OpenCode, Agy, Claude, Codex o Hermes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => model.setTaskPageViewMode('gantt')}
          >
            <CalendarRange className="size-3" />
            Ver Diagrama de Gantt
          </Button>
          <Button
            type="button"
            size="xs"
            onClick={() => {
              model.setLocalTasksMode(true)
              model.setLocalTaskComposerOpen(true)
            }}
          >
            <Plus className="size-3" />
            Nueva Tarea Local
          </Button>
          <span className="font-mono text-[11px] text-muted-foreground">Total: {cards.length}</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 scrollbar-sleek md:grid-cols-2 xl:grid-cols-4">
        {TASK_KANBAN_COLUMNS.map((col) => {
          const colCards = cardsByColumn.get(col.id) ?? []
          const isDropTarget = dragOverColumn === col.id
          return (
            <section
              key={col.id}
              data-testid={`task-kanban-column-${col.id}`}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragOverColumn !== col.id) {
                  setDragOverColumn(col.id)
                }
              }}
              onDragLeave={() => {
                if (dragOverColumn === col.id) {
                  setDragOverColumn(null)
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverColumn(null)
                if (!draggedCardKey) {
                  return
                }
                const found = cards.find((c) => c.key === draggedCardKey)
                if (found && found.column !== col.id) {
                  found.onMoveColumn(col.id)
                }
                setDraggedCardKey(null)
              }}
              className={cn(
                'flex min-h-[260px] flex-col overflow-hidden rounded-md border border-t-2 border-border/60 bg-background/70 transition-colors',
                col.accentClass,
                isDropTarget && 'border-workspace-status-review/60 bg-workspace-status-review/10'
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
                    Arrastra tareas a {col.label}
                  </div>
                ) : (
                  colCards.map((card) => (
                    <div
                      key={card.key}
                      draggable
                      onDragStart={() => setDraggedCardKey(card.key)}
                      onDragEnd={() => {
                        setDraggedCardKey(null)
                        setDragOverColumn(null)
                      }}
                      data-testid="task-kanban-card"
                      className="group flex cursor-grab flex-col gap-2 rounded-md border border-border/60 bg-card/90 p-2.5 shadow-xs transition-colors hover:border-workspace-status-review/40 active:cursor-grabbing"
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
                        {card.isLocalTask && card.onDeleteLocalTask ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 shrink-0"
                            aria-label={`Delete ${card.identifier}`}
                            onClick={card.onDeleteLocalTask}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        ) : (
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
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                          {card.startDate.slice(5)} → {card.endDate.slice(5)}
                        </span>
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

                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {TASK_KANBAN_COLUMNS.map((targetCol) => (
                          <button
                            key={targetCol.id}
                            type="button"
                            data-testid={`task-kanban-move-${targetCol.id}`}
                            onClick={() => card.onMoveColumn(targetCol.id)}
                            className={cn(
                              'rounded border px-1.5 py-0.5 text-[9px] font-medium transition-colors',
                              card.column === targetCol.id
                                ? 'border-workspace-status-review/50 bg-workspace-status-review/20 text-git-graph-lane-4'
                                : 'border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {targetCol.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1 border-t border-border/40 pt-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              data-testid="task-kanban-agent-dispatch-trigger"
                              className="inline-flex h-6 items-center gap-1 rounded-md border border-workspace-status-review/35 bg-workspace-status-review/10 px-2 text-[10px] font-medium text-git-graph-lane-4 transition-colors hover:bg-workspace-status-review/20"
                            >
                              <Bot className="size-3" />
                              <span>Delegar a Agente</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Delegar a Agente del Entorno</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {TASK_DISPATCH_AGENTS.map((agent) => (
                              <DropdownMenuItem
                                key={agent.id}
                                data-testid={`task-kanban-dispatch-agent-${agent.id}`}
                                onClick={() => card.onDispatchAgent(agent.id, card.column)}
                                className="flex items-center justify-between"
                              >
                                <span>{agent.label}</span>
                                <span className="font-mono text-[10px] uppercase text-git-graph-lane-4">
                                  {agent.shortLabel}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex items-center gap-1">
                          {(['pi', 'opencode', 'antigravity', 'claude', 'codex'] as const).map(
                            (agentId) => (
                              <button
                                key={agentId}
                                type="button"
                                title={`Dispatch to ${agentId.toUpperCase()} in Lunar Orca worktree`}
                                onClick={() => card.onDispatchAgent(agentId, card.column)}
                                className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-muted-foreground transition-colors hover:border-workspace-status-review/50 hover:bg-workspace-status-review/15 hover:text-git-graph-lane-4"
                              >
                                {agentId === 'antigravity' ? 'agy' : agentId}
                              </button>
                            )
                          )}
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
