import type { TaskPageComposerActionsModel } from '../use-task-page-composer-actions'
import type { TuiAgent } from '../../../../shared/tui-agent'
import { useAppStore } from '@/store'
import { buildOrcaTaskTraceabilityIndicators } from '../../../../shared/orca-task-traceability'
import {
  buildLunarOrcaMultiAgentDispatchPrompt,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS,
  type TaskKanbanColumnId,
  type UnifiedKanbanTaskCard
} from './task-kanban-defs'
import {
  addDaysToIsoDate,
  deleteLocalTask,
  formatIsoDateOffset,
  fromKanbanColumnId,
  moveLocalTaskColumn,
  normalizeLocalAgentId,
  progressForLocalColumn,
  resolveLocalTaskTraceability,
  shiftLocalTaskDates,
  shiftProviderTaskOverrideDates,
  toKanbanColumnId,
  updateLocalTask,
  updateProviderTaskGanttOverride,
  type LocalProjectTask,
  type ProviderTaskGanttOverride
} from './local-tasks-store'

export function dispatchLocalTaskToComposer(
  openModal: TaskPageComposerActionsModel['openModal'],
  task: LocalProjectTask,
  agentId: TuiAgent,
  targetCol: TaskKanbanColumnId,
  fallbackRepoId?: string
): void {
  const normalizedAgent = normalizeLocalAgentId(agentId)
  moveLocalTaskColumn(task.id, 'in-progress', normalizedAgent)
  const dispatchedAgentLabel =
    TASK_DISPATCH_AGENTS.find((agent) => agent.id === agentId)?.label ?? agentId
  const traceability = resolveLocalTaskTraceability(task)
  updateLocalTask(task.id, {
    traceability: {
      ...traceability,
      agent: { id: agentId, label: dispatchedAgentLabel },
      status: 'in_progress',
      startedAt: traceability.startedAt ?? Date.now()
    }
  })
  const colMeta = TASK_KANBAN_COLUMNS.find((c) => c.id === targetCol) ?? TASK_KANBAN_COLUMNS[1]
  const resolvedRepoId =
    task.projectId && task.projectId !== 'global' ? task.projectId : fallbackRepoId
  const slug = task.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
  useAppStore.getState().recordFeatureInteraction('github-tasks')
  openModal('new-workspace-composer', {
    prefilledName: slug ? `local-${slug}` : `local-task-${task.id.slice(-4)}`,
    initialRepoId: resolvedRepoId,
    initialAgentId: agentId,
    initialWorkspaceStatus: colMeta.workspaceStatus,
    initialNote: buildLunarOrcaMultiAgentDispatchPrompt({
      agentId,
      identifier: `LOCAL-${task.id.slice(-4).toUpperCase()}`,
      title: task.title,
      url: task.projectPath ?? `local://${task.projectLabel}/${task.id}`,
      repoName: task.projectLabel,
      columnLabel: colMeta.label
    }),
    telemetrySource: 'sidebar'
  })
}

export function buildLocalTaskCards(
  model: TaskPageComposerActionsModel,
  localTasks: LocalProjectTask[]
): UnifiedKanbanTaskCard[] {
  const { openModal, selectedRepos, eligibleRepos } = model
  const fallbackRepoId = selectedRepos[0]?.id ?? eligibleRepos[0]?.id
  const selectedIds = new Set(selectedRepos.map((r) => r.id))

  return localTasks
    .filter((task) => {
      if (task.projectId === 'global' || selectedIds.size === 0) {
        return true
      }
      return selectedIds.has(task.projectId)
    })
    .map((task, idx) => {
      const column = toKanbanColumnId(task.columnId)
      const colMeta = TASK_KANBAN_COLUMNS.find((c) => c.id === column) ?? TASK_KANBAN_COLUMNS[0]
      const priorityLabel =
        task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'
      const traceability = resolveLocalTaskTraceability(task)
      const labels = [
        `Prioridad: ${priorityLabel}`,
        ...buildOrcaTaskTraceabilityIndicators(traceability)
      ]
      return {
        key: `local:${task.id}`,
        identifier: `LOC-${idx + 1}`,
        title: task.title,
        description: task.description,
        url: task.projectPath ?? `local://${task.projectLabel}`,
        column,
        statusLabel: colMeta.label,
        repoLabel: task.projectLabel,
        repoId: task.projectId !== 'global' ? task.projectId : fallbackRepoId,
        updatedAt: new Date(task.updatedAt).toISOString(),
        labels,
        attachedWorkspaceLabel: task.assignedAgentId
          ? `Harness: ${task.assignedAgentId.toUpperCase()}`
          : null,
        isLocalTask: true,
        localTaskId: task.id,
        priority: task.priority,
        assignedAgentId: task.assignedAgentId,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: task.progress,
        onOpenDetail: () => {
          const nextCol: TaskKanbanColumnId =
            column === 'todo'
              ? 'in_progress'
              : column === 'in_progress'
                ? 'in_review'
                : column === 'in_review'
                  ? 'done'
                  : 'todo'
          moveLocalTaskColumn(task.id, fromKanbanColumnId(nextCol))
        },
        onDispatchAgent: (agentId, targetCol) =>
          dispatchLocalTaskToComposer(openModal, task, agentId, targetCol, fallbackRepoId),
        onMoveColumn: (nextColumn) => {
          moveLocalTaskColumn(task.id, fromKanbanColumnId(nextColumn))
        },
        onShiftDates: (deltaDays, mode = 'move') => {
          shiftLocalTaskDates(task.id, deltaDays, mode)
        },
        onDeleteLocalTask: () => {
          deleteLocalTask(task.id)
        }
      }
    })
}

export function decorateProviderCardWithOverrides(
  card: Omit<
    UnifiedKanbanTaskCard,
    'startDate' | 'endDate' | 'progress' | 'onMoveColumn' | 'onShiftDates'
  >,
  index: number,
  overrides: Record<string, ProviderTaskGanttOverride>
): UnifiedKanbanTaskCard {
  const override = overrides[card.key]
  const resolvedColumn = override?.columnId ? toKanbanColumnId(override.columnId) : card.column
  const colMeta = TASK_KANBAN_COLUMNS.find((c) => c.id === resolvedColumn) ?? TASK_KANBAN_COLUMNS[0]
  const baseOffset = (index % 5) - 1
  const defaultStart = formatIsoDateOffset(new Date(), baseOffset)
  const defaultEnd = addDaysToIsoDate(defaultStart, 3)
  const startDate = override?.startDate ?? defaultStart
  const endDate = override?.endDate ?? defaultEnd
  const localCol = fromKanbanColumnId(resolvedColumn)
  const progress = override?.progress ?? progressForLocalColumn(localCol)
  const assignedAgentId = override?.assignedAgentId ?? null
  const labels = assignedAgentId
    ? [...card.labels, `Agente: ${assignedAgentId.toUpperCase()}`]
    : card.labels

  return {
    ...card,
    column: resolvedColumn,
    statusLabel: override?.columnId ? colMeta.label : card.statusLabel,
    labels,
    assignedAgentId,
    startDate,
    endDate,
    progress,
    onDispatchAgent: (agentId, targetCol) => {
      updateProviderTaskGanttOverride(card.key, {
        columnId: 'in-progress',
        assignedAgentId: normalizeLocalAgentId(agentId)
      })
      card.onDispatchAgent(agentId, targetCol)
    },
    onMoveColumn: (nextColumn) => {
      updateProviderTaskGanttOverride(card.key, {
        columnId: fromKanbanColumnId(nextColumn)
      })
    },
    onShiftDates: (deltaDays, mode = 'move') => {
      shiftProviderTaskOverrideDates(card.key, startDate, endDate, deltaDays, mode)
    }
  }
}
