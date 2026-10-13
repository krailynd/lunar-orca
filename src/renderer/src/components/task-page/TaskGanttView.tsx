import React, { useMemo, useState } from 'react'
import {
  Bot,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  GripHorizontal,
  Plus,
  Sparkles
} from 'lucide-react'
import type { TaskPageComposerActionsModel } from '../use-task-page-composer-actions'
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
  addDaysToIsoDate,
  diffDaysIsoDate,
  formatIsoDateOffset,
  useLocalProjectTasks
} from './local-tasks-store'
import {
  buildKanbanCardsFromTaskPageModel,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS,
  type TaskKanbanColumnId,
  type UnifiedKanbanTaskCard
} from './task-kanban-model'

const GANTT_WINDOW_DAYS = 14

function getBarColorClasses(column: TaskKanbanColumnId): string {
  if (column === 'done') {
    return 'border-ring/60 bg-ring/25 text-foreground'
  }
  if (column === 'in_review') {
    return 'border-git-graph-lane-4/60 bg-git-graph-lane-4/20 text-git-graph-lane-4'
  }
  if (column === 'in_progress') {
    return 'border-workspace-status-review/60 bg-workspace-status-review/25 text-git-graph-lane-4'
  }
  return 'border-border/80 bg-muted/70 text-foreground'
}

export function TaskPageGanttView({
  model
}: {
  model: TaskPageComposerActionsModel
}): React.JSX.Element {
  const { tasks: localTasks, overrides } = useLocalProjectTasks()
  const [todayIso] = useState(() => formatIsoDateOffset(new Date(), 0))
  const [windowOffsetDays, setWindowOffsetDays] = useState(-2)
  const [dragState, setDragState] = useState<{
    cardKey: string
    mode: 'move' | 'resize-start' | 'resize-end'
    startX: number
  } | null>(null)

  const cards = useMemo(
    () => buildKanbanCardsFromTaskPageModel(model, { localTasks, overrides }),
    [model, localTasks, overrides]
  )

  const timelineDays = useMemo(() => {
    const startIso = addDaysToIsoDate(todayIso, windowOffsetDays)
    return Array.from({ length: GANTT_WINDOW_DAYS }, (_, idx) => {
      const iso = addDaysToIsoDate(startIso, idx)
      const dayNumber = iso.slice(8, 10)
      const monthNumber = iso.slice(5, 7)
      return {
        iso,
        label: `${monthNumber}/${dayNumber}`,
        isToday: iso === todayIso
      }
    })
  }, [todayIso, windowOffsetDays])

  const windowStartIso = timelineDays[0]?.iso ?? todayIso

  const handleCycleColumn = (card: UnifiedKanbanTaskCard): void => {
    const order: TaskKanbanColumnId[] = ['todo', 'in_progress', 'in_review', 'done']
    const nextIdx = (order.indexOf(card.column) + 1) % order.length
    card.onMoveColumn(order[nextIdx] ?? 'todo')
  }

  return (
    <div
      data-testid="task-gantt-view"
      className="mt-2 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
      onMouseMove={(e) => {
        if (!dragState) {
          return
        }
        const deltaPx = e.clientX - dragState.startX
        const dayStepPx = 42
        if (Math.abs(deltaPx) >= dayStepPx) {
          const deltaDays = deltaPx > 0 ? 1 : -1
          const target = cards.find((c) => c.key === dragState.cardKey)
          if (target) {
            target.onShiftDates(deltaDays, dragState.mode)
          }
          setDragState({ ...dragState, startX: e.clientX })
        }
      }}
      onMouseUp={() => {
        if (dragState) {
          setDragState(null)
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarRange className="size-3.5 text-git-graph-lane-4" />
          <span className="font-medium text-foreground">
            Diagrama de Gantt Interactivo (Estilo Notion / Lark)
          </span>
          <span>·</span>
          <span>
            Arrastra las barras o usa ◀ / ▶ para mover fechas, cambia estado y delega a cualquier
            agente.
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            data-testid="gantt-window-prev"
            onClick={() => setWindowOffsetDays((d) => d - 7)}
          >
            <ChevronLeft className="size-3.5" />
            -7d
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            data-testid="gantt-window-today"
            onClick={() => setWindowOffsetDays(-2)}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            data-testid="gantt-window-next"
            onClick={() => setWindowOffsetDays((d) => d + 7)}
          >
            +7d
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="xs"
            onClick={() => {
              model.setLocalTasksMode(true)
              model.setLocalTaskComposerOpen(true)
            }}
          >
            <Plus className="size-3.5" />
            Nueva Tarea Local
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/60 bg-card/50 shadow-xs">
        <div className="grid grid-cols-12 border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
          <div className="col-span-5 flex items-center justify-between border-r border-border/60 px-3 py-2">
            <span>Tarea / Proyecto / Arnés Asignado</span>
            <span>Estado & Delegación</span>
          </div>
          <div
            className="col-span-7 grid"
            style={{ gridTemplateColumns: `repeat(${GANTT_WINDOW_DAYS}, minmax(0, 1fr))` }}
          >
            {timelineDays.map((day) => (
              <div
                key={day.iso}
                className={cn(
                  'flex flex-col items-center justify-center border-r border-border/40 py-1.5 font-mono text-[10px]',
                  day.isToday && 'bg-workspace-status-review/15 font-bold text-git-graph-lane-4'
                )}
              >
                <span>{day.label}</span>
                {day.isToday ? <span className="text-[8px] uppercase">Hoy</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 divide-y divide-border/50 overflow-y-auto scrollbar-sleek">
          {cards.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-5 text-git-graph-lane-4" />
              <span>
                No hay tareas en esta vista. Crea una tarea local o selecciona un repositorio.
              </span>
            </div>
          ) : (
            cards.map((card) => {
              const rawStartOffset = diffDaysIsoDate(windowStartIso, card.startDate)
              const rawEndOffset = diffDaysIsoDate(windowStartIso, card.endDate)
              const clampedStart = Math.max(0, Math.min(GANTT_WINDOW_DAYS - 1, rawStartOffset))
              const clampedEnd = Math.max(
                clampedStart,
                Math.min(GANTT_WINDOW_DAYS - 1, Math.max(rawStartOffset, rawEndOffset))
              )
              const spanDays = Math.max(1, clampedEnd - clampedStart + 1)
              const leftPct = (clampedStart / GANTT_WINDOW_DAYS) * 100
              const widthPct = (spanDays / GANTT_WINDOW_DAYS) * 100
              const colMeta =
                TASK_KANBAN_COLUMNS.find((c) => c.id === card.column) ?? TASK_KANBAN_COLUMNS[0]

              return (
                <div
                  key={card.key}
                  data-testid="task-gantt-row"
                  className="grid grid-cols-12 items-center transition-colors hover:bg-muted/25"
                >
                  <div className="col-span-5 flex items-center justify-between gap-2 border-r border-border/60 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                          {card.identifier}
                        </span>
                        {card.repoLabel ? (
                          <span className="inline-flex items-center gap-1 truncate rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            <FolderKanban className="size-2.5" />
                            {card.repoLabel}
                          </span>
                        ) : null}
                        {card.assignedAgentId ? (
                          <span className="rounded border border-workspace-status-review/40 bg-workspace-status-review/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-git-graph-lane-4">
                            {card.assignedAgentId}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={card.onOpenDetail}
                        className="mt-1 line-clamp-1 text-left text-xs font-medium text-foreground hover:text-git-graph-lane-4 hover:underline"
                      >
                        {card.title}
                      </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        data-testid="gantt-cycle-status-btn"
                        title="Cambiar columna Kanban (Todo → In Progress → In Review → Done)"
                        onClick={() => handleCycleColumn(card)}
                        className="rounded border border-border/60 bg-muted/50 px-2 py-1 text-[10px] font-medium text-foreground hover:border-workspace-status-review/50"
                      >
                        {colMeta.label}
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            data-testid="gantt-dispatch-agent-trigger"
                            className="inline-flex h-6 items-center gap-1 rounded border border-workspace-status-review/40 bg-workspace-status-review/10 px-2 text-[10px] font-medium text-git-graph-lane-4 transition hover:bg-workspace-status-review/20"
                          >
                            <Bot className="size-3" />
                            <span>Delegar</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Delegar tarea a agente</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {TASK_DISPATCH_AGENTS.map((agent) => (
                            <DropdownMenuItem
                              key={agent.id}
                              onSelect={() => card.onDispatchAgent(agent.id, card.column)}
                            >
                              <Bot className="mr-2 size-3.5 text-git-graph-lane-4" />
                              <span>{agent.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="relative col-span-7 flex h-12 items-center px-1">
                    <div
                      className="pointer-events-none absolute inset-0 grid"
                      style={{
                        gridTemplateColumns: `repeat(${GANTT_WINDOW_DAYS}, minmax(0, 1fr))`
                      }}
                    >
                      {timelineDays.map((day) => (
                        <div
                          key={day.iso}
                          className={cn(
                            'border-r border-border/30',
                            day.isToday && 'bg-workspace-status-review/10'
                          )}
                        />
                      ))}
                    </div>

                    <div
                      data-testid="task-gantt-bar"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      onMouseDown={(e) => {
                        setDragState({
                          cardKey: card.key,
                          mode: 'move',
                          startX: e.clientX
                        })
                      }}
                      className={cn(
                        'relative z-10 flex h-7 cursor-grab items-center justify-between rounded-md border px-1.5 text-[10px] font-medium shadow-xs transition-all active:cursor-grabbing',
                        getBarColorClasses(card.column)
                      )}
                    >
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          data-testid="gantt-shift-left-btn"
                          title="Mover tarea -1 día"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => card.onShiftDates(-1, 'move')}
                          className="rounded px-1 py-0.5 hover:bg-background/50"
                        >
                          ◀
                        </button>
                        <GripHorizontal className="size-3 opacity-70" />
                      </div>

                      <span className="truncate px-1 font-mono text-[10px]">
                        {card.startDate.slice(5)} → {card.endDate.slice(5)}
                      </span>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          data-testid="gantt-extend-end-btn"
                          title="Extender duración +1 día"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => card.onShiftDates(1, 'resize-end')}
                          className="rounded px-1 py-0.5 font-mono text-[9px] hover:bg-background/50"
                        >
                          +1d
                        </button>
                        <button
                          type="button"
                          data-testid="gantt-shift-right-btn"
                          title="Mover tarea +1 día"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => card.onShiftDates(1, 'move')}
                          className="rounded px-1 py-0.5 hover:bg-background/50"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
