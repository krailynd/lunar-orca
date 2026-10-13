import React, { useState } from 'react'
import { Bot, CalendarRange, FolderKanban, Plus, Sparkles, Trash2, X } from 'lucide-react'
import type { TaskPageComposerActionsModel } from '../use-task-page-composer-actions'
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
  addLocalTask,
  formatIsoDateOffset,
  parseLocalTaskAgentChoice,
  parseLocalTaskColumnId,
  parseLocalTaskPriority,
  useLocalProjectTasks,
  type LocalTaskAgentId,
  type LocalTaskColumnId,
  type LocalTaskPriority
} from './local-tasks-store'
import {
  buildKanbanCardsFromTaskPageModel,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS
} from './task-kanban-model'

export function LocalTaskCreatorBar({
  model
}: {
  model: TaskPageComposerActionsModel
}): React.JSX.Element | null {
  const {
    eligibleRepos,
    selectedRepos,
    localTasksMode,
    localTaskComposerOpen,
    setLocalTaskComposerOpen
  } = model
  const defaultProject = selectedRepos[0] ?? eligibleRepos[0] ?? null
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string>(defaultProject?.id ?? 'global')
  const [priority, setPriority] = useState<LocalTaskPriority>('high')
  const [columnId, setColumnId] = useState<LocalTaskColumnId>('todo')
  const [assignedAgentId, setAssignedAgentId] = useState<LocalTaskAgentId | 'none'>('pi')
  const [startDate, setStartDate] = useState<string>(() => formatIsoDateOffset(new Date(), 0))
  const [endDate, setEndDate] = useState<string>(() =>
    addDaysToIsoDate(formatIsoDateOffset(new Date(), 0), 3)
  )

  if (!localTasksMode && !localTaskComposerOpen) {
    return null
  }

  const handleCreate = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!title.trim()) {
      return
    }
    const chosenRepo = eligibleRepos.find((r) => r.id === projectId) ?? null
    addLocalTask({
      title: title.trim(),
      description: description.trim(),
      projectId: chosenRepo ? chosenRepo.id : 'global',
      projectLabel: chosenRepo ? chosenRepo.displayName : 'lunar-orca (Local)',
      projectPath: chosenRepo?.path,
      columnId,
      priority,
      assignedAgentId: assignedAgentId === 'none' ? null : assignedAgentId,
      startDate,
      endDate
    })
    setTitle('')
    setDescription('')
    setLocalTaskComposerOpen(false)
  }

  return (
    <div
      data-testid="local-task-creator-bar"
      className="rounded-md border border-workspace-status-review/35 bg-card/85 p-3 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-workspace-status-review/40 bg-workspace-status-review/15 px-2 py-0.5 text-xs font-semibold text-git-graph-lane-4">
            <Sparkles className="size-3.5" />
            Proyectos Locales · Motor ODD
          </span>
          <span className="text-xs text-muted-foreground">
            Crea tareas personalizadas por proyecto, muévelas en Kanban o Gantt y delégalas a Pi,
            OpenCode, Agy, Claude, Codex o Hermes.
          </span>
        </div>
        <Button
          type="button"
          size="xs"
          variant={localTaskComposerOpen ? 'outline' : 'default'}
          data-testid="toggle-local-task-form-btn"
          onClick={() => setLocalTaskComposerOpen(!localTaskComposerOpen)}
        >
          {localTaskComposerOpen ? (
            <>
              <X className="size-3.5" />
              Cerrar formulario
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              Nueva Tarea Local
            </>
          )}
        </Button>
      </div>

      {localTaskComposerOpen ? (
        <form onSubmit={handleCreate} className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Título de la tarea
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Implementar vista Gantt y delegar a Agy..."
                data-testid="local-task-title-input"
                className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2.5 text-xs text-foreground focus:border-workspace-status-review focus:outline-none"
              />
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Proyecto local
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
              >
                <option value="global">Global / Todos los proyectos</option>
                {eligibleRepos.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.displayName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Arnés / Agente
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(parseLocalTaskAgentChoice(e.target.value))}
                className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
              >
                <option value="pi">Pi Agent (pi)</option>
                <option value="opencode">OpenCode</option>
                <option value="antigravity">Antigravity (Agy)</option>
                <option value="claude">Claude Code</option>
                <option value="codex">Codex</option>
                <option value="hermes">Hermes</option>
                <option value="none">Sin asignar</option>
              </select>
            </label>
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Prioridad
              <select
                value={priority}
                onChange={(e) => setPriority(parseLocalTaskPriority(e.target.value))}
                className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </label>
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Columna
              <select
                value={columnId}
                onChange={(e) => setColumnId(parseLocalTaskColumnId(e.target.value))}
                className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="completed">Done</option>
              </select>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Inicio → Fin (Gantt)
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-1/2 rounded-md border border-border/60 bg-background px-1.5 text-[11px] text-foreground"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-1/2 rounded-md border border-border/60 bg-background px-1.5 text-[11px] text-foreground"
                />
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 md:col-span-12">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional, notas de arquitectura o criterios de aceptación para el agente..."
              className="h-8 flex-1 rounded-md border border-border/60 bg-background px-2.5 text-xs text-foreground"
            />
            <Button type="submit" size="sm" data-testid="submit-local-task-btn">
              <Plus className="size-3.5" />
              Guardar Tarea Local
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

export function TaskPageLocalListView({
  model
}: {
  model: TaskPageComposerActionsModel
}): React.JSX.Element {
  const { tasks, overrides } = useLocalProjectTasks()
  const cards = buildKanbanCardsFromTaskPageModel(model, { localTasks: tasks, overrides })

  return (
    <div
      data-testid="local-tasks-list-view"
      className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/60 bg-card/60 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-4 text-git-graph-lane-4" />
          <span className="text-xs font-semibold text-foreground">
            Tareas Personalizadas de Proyectos Locales ({cards.length})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => model.setTaskPageViewMode('kanban')}
          >
            Ver en Kanban
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => model.setTaskPageViewMode('gantt')}
          >
            <CalendarRange className="size-3.5" />
            Ver en Gantt
          </Button>
        </div>
      </div>

      <div className="flex-1 divide-y divide-border/50 overflow-y-auto scrollbar-sleek">
        {cards.map((card) => (
          <div
            key={card.key}
            data-testid="local-task-list-row"
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                  {card.identifier}
                </span>
                {card.repoLabel ? (
                  <span className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                    {card.repoLabel}
                  </span>
                ) : null}
                <span className="rounded border border-workspace-status-review/40 bg-workspace-status-review/15 px-1.5 py-0.5 font-mono text-[10px] text-git-graph-lane-4">
                  {card.startDate} → {card.endDate}
                </span>
                {card.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs font-medium text-foreground">{card.title}</p>
              {card.description ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{card.description}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5">
              {TASK_KANBAN_COLUMNS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => card.onMoveColumn(col.id)}
                  className={
                    card.column === col.id
                      ? 'rounded border border-workspace-status-review/50 bg-workspace-status-review/20 px-2 py-1 text-[10px] font-semibold text-git-graph-lane-4'
                      : 'rounded border border-border/50 bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground'
                  }
                >
                  {col.label}
                </button>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="local-task-dispatch-dropdown"
                    className="inline-flex h-7 items-center gap-1.5 rounded-md border border-workspace-status-review/40 bg-workspace-status-review/10 px-2.5 text-[11px] font-medium text-git-graph-lane-4 transition hover:bg-workspace-status-review/20"
                  >
                    <Bot className="size-3.5" />
                    <span>Delegar a Agente</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Seleccionar Agente del Entorno</DropdownMenuLabel>
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

              {card.onDeleteLocalTask ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  title="Eliminar tarea local"
                  onClick={card.onDeleteLocalTask}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
