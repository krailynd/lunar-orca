import React, { useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  FolderGit2,
  Kanban,
  Plus,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TuiAgent } from '../../../../shared/tui-agent'
import {
  TASK_DISPATCH_AGENTS,
  type TaskKanbanColumnId
} from '@/components/task-page/task-kanban-defs'
import type {
  LocalProjectTask,
  LocalTaskColumnId,
  LocalTaskPriority
} from '@/components/task-page/local-tasks-store'

export type LocalTasksSummaryMetrics = {
  todo: number
  inProgress: number
  inReview: number
  completed: number
  total: number
}

export function computeLocalTasksSummaryMetrics(
  tasks: readonly LocalProjectTask[]
): LocalTasksSummaryMetrics {
  let todo = 0
  let inProgress = 0
  let inReview = 0
  let completed = 0

  for (const task of tasks) {
    if (task.columnId === 'todo') {
      todo += 1
    } else if (task.columnId === 'in-progress') {
      inProgress += 1
    } else if (task.columnId === 'in-review') {
      inReview += 1
    } else if (task.columnId === 'completed') {
      completed += 1
    }
  }

  return {
    todo,
    inProgress,
    inReview,
    completed,
    total: tasks.length
  }
}

export function getNextLocalTaskColumn(current: LocalTaskColumnId): LocalTaskColumnId {
  if (current === 'todo') {
    return 'in-progress'
  }
  if (current === 'in-progress') {
    return 'in-review'
  }
  if (current === 'in-review') {
    return 'completed'
  }
  return 'todo'
}

export function formatLocalTaskColumnLabel(columnId: LocalTaskColumnId): string {
  if (columnId === 'todo') {
    return 'Pendientes'
  }
  if (columnId === 'in-progress') {
    return 'En Progreso'
  }
  if (columnId === 'in-review') {
    return 'En Revisión'
  }
  return 'Completadas'
}

export function toDispatchKanbanColumn(columnId: LocalTaskColumnId): TaskKanbanColumnId {
  if (columnId === 'in-progress') {
    return 'in_progress'
  }
  if (columnId === 'in-review') {
    return 'in_review'
  }
  if (columnId === 'completed') {
    return 'done'
  }
  return 'todo'
}

export function HomePageLocalTasksSection({
  tasks,
  repos,
  onOpenTaskPage,
  onAddQuickTask,
  onToggleTaskColumn,
  onDelegateTaskToAgent
}: {
  tasks: readonly LocalProjectTask[]
  repos: readonly { id: string; displayName: string; path: string }[]
  onOpenTaskPage: () => void
  onAddQuickTask: (input: {
    title: string
    projectId: string
    projectLabel: string
    projectPath?: string
    priority: LocalTaskPriority
  }) => void
  onToggleTaskColumn: (task: LocalProjectTask, nextColumn: LocalTaskColumnId) => void
  onDelegateTaskToAgent: (task: LocalProjectTask, agentId: TuiAgent) => void
}): React.JSX.Element {
  const [quickTitle, setQuickTitle] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('global')
  const [selectedPriority, setSelectedPriority] = useState<LocalTaskPriority>('medium')
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  const metrics = useMemo(() => computeLocalTasksSummaryMetrics(tasks), [tasks])

  const visibleTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.columnId === 'completed' && b.columnId !== 'completed') {
        return 1
      }
      if (a.columnId !== 'completed' && b.columnId === 'completed') {
        return -1
      }
      return b.updatedAt - a.updatedAt
    })
  }, [tasks])

  const handleQuickSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const trimmed = quickTitle.trim()
    if (!trimmed) {
      titleInputRef.current?.focus()
      return
    }
    const matchedRepo = repos.find((r) => r.id === selectedProjectId)
    onAddQuickTask({
      title: trimmed,
      projectId: matchedRepo ? matchedRepo.id : 'global',
      projectLabel: matchedRepo ? matchedRepo.displayName : 'Proyecto Local',
      projectPath: matchedRepo?.path,
      priority: selectedPriority
    })
    setQuickTitle('')
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-workspace-status-review/10 border border-workspace-status-review/25">
            <Kanban className="size-3.5 text-workspace-status-review" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tareas Locales & Cronograma (Kanban / Gantt)
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-mono">
            {metrics.total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => titleInputRef.current?.focus()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-border/60 bg-card/90 hover:bg-accent/50 text-foreground shadow-xs transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="size-3 text-workspace-status-review" />
            <span>+ Agregar tarea rápida</span>
          </button>
          <button
            type="button"
            onClick={onOpenTaskPage}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-workspace-status-review/15 hover:bg-workspace-status-review/25 text-workspace-status-review border border-workspace-status-review/30 shadow-xs transition-all duration-150 active:scale-[0.98]"
          >
            <span>Ver en Kanban / Gantt</span>
            <ArrowUpRight className="size-3" />
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-2xl border border-border/60 bg-card/90 shadow-xs px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground">Pendientes</span>
            <span className="text-base font-bold text-foreground font-mono">{metrics.todo}</span>
          </div>
          <Clock className="size-4 text-muted-foreground/70" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/90 shadow-xs px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-workspace-status-review">
              En Progreso
            </span>
            <span className="text-base font-bold text-workspace-status-review font-mono">
              {metrics.inProgress}
            </span>
          </div>
          <Sparkles className="size-4 text-workspace-status-review/80" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/90 shadow-xs px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-status-warning">En Revisión</span>
            <span className="text-base font-bold text-status-warning font-mono">
              {metrics.inReview}
            </span>
          </div>
          <Bot className="size-4 text-status-warning/80" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/90 shadow-xs px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-status-success">Completadas</span>
            <span className="text-base font-bold text-status-success font-mono">
              {metrics.completed}
            </span>
          </div>
          <CheckCircle2 className="size-4 text-status-success/80" />
        </div>
      </div>

      {/* Quick Inline Task Creator */}
      <form
        onSubmit={handleQuickSubmit}
        className="rounded-2xl border border-border/60 bg-card/90 shadow-xs p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <input
          ref={titleInputRef}
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Escribir nueva tarea local para Kanban / Gantt..."
          className="flex-1 bg-background/70 border border-border/50 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-workspace-status-review/60"
        />
        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            aria-label="Proyecto de tarea local"
            className="bg-background/70 border border-border/50 rounded-xl px-2.5 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-workspace-status-review/60 max-w-[150px] truncate"
          >
            <option value="global">Proyecto Local</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.displayName}
              </option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => {
              const val = e.target.value
              if (val === 'high' || val === 'medium' || val === 'low') {
                setSelectedPriority(val)
              }
            }}
            aria-label="Prioridad de tarea local"
            className="bg-background/70 border border-border/50 rounded-xl px-2.5 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-workspace-status-review/60"
          >
            <option value="high">Prioridad Alta</option>
            <option value="medium">Prioridad Media</option>
            <option value="low">Prioridad Baja</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium shadow-xs transition-all duration-150 active:scale-[0.98] shrink-0"
          >
            <Plus className="size-3.5" />
            <span>+ Agregar tarea rápida</span>
          </button>
        </div>
      </form>

      {/* Active Local Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleTasks.slice(0, 6).map((task) => {
          const nextCol = getNextLocalTaskColumn(task.columnId)
          const statusLabel = formatLocalTaskColumnLabel(task.columnId)

          return (
            <div
              key={task.id}
              className="rounded-2xl border border-border/60 bg-card/90 shadow-xs hover:shadow-md hover:border-workspace-status-review/40 p-3.5 flex flex-col justify-between gap-3 transition-all duration-200"
              style={{
                transition: 'all 220ms cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-foreground text-[10px] font-medium truncate max-w-[60%]">
                    <FolderGit2 className="size-3 text-workspace-status-review shrink-0" />
                    <span className="truncate">{task.projectLabel}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleTaskColumn(task, nextCol)}
                    title="Cambiar estado de la tarea"
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors',
                      task.columnId === 'completed'
                        ? 'bg-status-success-background text-status-success border-status-success-border'
                        : task.columnId === 'in-review'
                          ? 'bg-status-warning-background text-status-warning border-status-warning-border'
                          : task.columnId === 'in-progress'
                            ? 'bg-workspace-status-review/15 text-workspace-status-review border-workspace-status-review/30'
                            : 'bg-muted/60 text-muted-foreground border-border/60'
                    )}
                  >
                    {statusLabel}
                  </button>
                </div>

                <h3 className="text-xs font-semibold text-foreground tracking-tight line-clamp-2">
                  {task.title}
                </h3>

                {/* Gantt Date Range + Progress Bar */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      <span>
                        {task.startDate} → {task.endDate}
                      </span>
                    </span>
                    <span className="font-semibold text-foreground">{task.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-workspace-status-review transition-all duration-300"
                      style={{ width: `${Math.max(4, Math.min(100, task.progress))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Agent Quick Delegation & Kanban Link */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Delegar a Agente:
                  </span>
                  <button
                    type="button"
                    onClick={onOpenTaskPage}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium text-workspace-status-review hover:underline"
                  >
                    <span>Ver en Kanban / Gantt</span>
                    <ArrowUpRight className="size-2.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {TASK_DISPATCH_AGENTS.map((agent) => {
                    const isAssigned = task.assignedAgentId === agent.id
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => onDelegateTaskToAgent(task, agent.id)}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all duration-150 active:scale-95',
                          isAssigned
                            ? 'bg-workspace-status-review text-primary-foreground border-workspace-status-review shadow-xs'
                            : 'bg-background/80 hover:bg-accent/60 text-muted-foreground hover:text-foreground border-border/60'
                        )}
                      >
                        {agent.shortLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
