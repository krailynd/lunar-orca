import type { TuiAgent } from '../../../../shared/tui-agent'
import type { TaskKanbanColumnId } from './task-kanban-defs'

export type LocalTaskColumnId = 'todo' | 'in-progress' | 'in-review' | 'completed'
export type LocalTaskPriority = 'low' | 'medium' | 'high'
export type LocalTaskAgentId = 'pi' | 'opencode' | 'antigravity' | 'claude' | 'codex' | 'hermes'
export type LocalTaskDateShiftMode = 'move' | 'resize-start' | 'resize-end'

export type LocalProjectTask = {
  id: string
  title: string
  description: string
  projectId: string
  projectLabel: string
  projectPath?: string
  columnId: LocalTaskColumnId
  priority: LocalTaskPriority
  assignedAgentId: LocalTaskAgentId | null
  startDate: string
  endDate: string
  progress: number
  createdAt: number
  updatedAt: number
}

export type ProviderTaskGanttOverride = {
  columnId?: LocalTaskColumnId
  assignedAgentId?: LocalTaskAgentId | null
  startDate?: string
  endDate?: string
  progress?: number
  updatedAt: number
}

export const LOCAL_PROJECT_TASKS_STORAGE_KEY = 'lunar-orca:local-project-tasks:v1'
export const PROVIDER_TASK_GANTT_OVERRIDES_KEY = 'lunar-orca:provider-task-gantt-overrides:v1'
export const LOCAL_TASKS_UPDATED_EVENT = 'lunar-orca-local-tasks-updated'

export function formatIsoDateOffset(baseDate: Date, offsetDays: number): string {
  const next = new Date(
    Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate() + offsetDays)
  )
  return next.toISOString().slice(0, 10)
}

export function addDaysToIsoDate(isoDate: string, deltaDays: number): string {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!parsed) {
    return formatIsoDateOffset(new Date(), deltaDays)
  }
  const year = Number(parsed[1])
  const month = Number(parsed[2]) - 1
  const day = Number(parsed[3])
  const next = new Date(Date.UTC(year, month, day + deltaDays))
  return next.toISOString().slice(0, 10)
}

export function diffDaysIsoDate(startIso: string, endIso: string): number {
  const parseUtc = (iso: string): number => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
    if (!m) {
      return Date.now()
    }
    return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  return Math.round((parseUtc(endIso) - parseUtc(startIso)) / 86_400_000)
}

export function toKanbanColumnId(columnId: LocalTaskColumnId): TaskKanbanColumnId {
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

export function fromKanbanColumnId(column: TaskKanbanColumnId): LocalTaskColumnId {
  if (column === 'in_progress') {
    return 'in-progress'
  }
  if (column === 'in_review') {
    return 'in-review'
  }
  if (column === 'done') {
    return 'completed'
  }
  return 'todo'
}

export function progressForLocalColumn(columnId: LocalTaskColumnId, fallback = 0): number {
  if (columnId === 'completed') {
    return 100
  }
  if (columnId === 'in-review') {
    return Math.max(fallback, 80)
  }
  if (columnId === 'in-progress') {
    return Math.max(fallback, 45)
  }
  return fallback > 0 && fallback < 100 ? fallback : 15
}

export function normalizeLocalAgentId(
  agentId: TuiAgent | null | undefined
): LocalTaskAgentId | null {
  if (
    agentId === 'pi' ||
    agentId === 'opencode' ||
    agentId === 'antigravity' ||
    agentId === 'claude' ||
    agentId === 'codex' ||
    agentId === 'hermes'
  ) {
    return agentId
  }
  return null
}

export function isLocalProjectTaskList(val: unknown): val is LocalProjectTask[] {
  return Array.isArray(val)
}

export function isProviderTaskOverrideMap(
  val: unknown
): val is Record<string, ProviderTaskGanttOverride> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val)
}

export function parseLocalTaskPriority(val: string): LocalTaskPriority {
  if (val === 'high' || val === 'medium' || val === 'low') {
    return val
  }
  return 'medium'
}

export function parseLocalTaskColumnId(val: string): LocalTaskColumnId {
  if (val === 'todo' || val === 'in-progress' || val === 'in-review' || val === 'completed') {
    return val
  }
  return 'todo'
}

export function parseLocalTaskAgentChoice(val: string): LocalTaskAgentId | 'none' {
  if (
    val === 'pi' ||
    val === 'opencode' ||
    val === 'antigravity' ||
    val === 'claude' ||
    val === 'codex' ||
    val === 'hermes'
  ) {
    return val
  }
  return 'none'
}

export function buildDefaultSeedLocalTasks(now = new Date()): LocalProjectTask[] {
  const ts = now.getTime()
  return [
    {
      id: 'local-task-odd-arch',
      title: 'Arquitectura ODD & Sincronización Multi-Agente en Worktrees',
      description:
        'Coordinar contratos de ejecución local entre Pi, OpenCode y Antigravity (Agy) con tablero Kanban y Gantt compartido.',
      projectId: 'global',
      projectLabel: 'lunar-orca',
      columnId: 'in-progress',
      priority: 'high',
      assignedAgentId: 'pi',
      startDate: formatIsoDateOffset(now, -1),
      endDate: formatIsoDateOffset(now, 3),
      progress: 55,
      createdAt: ts - 7_200_000,
      updatedAt: ts - 1_800_000
    },
    {
      id: 'local-task-ui-gantt',
      title: 'Refinamiento UI Kanban + Diagrama de Gantt Interactivo (Notion/Lark)',
      description:
        'Permitir arrastrar y ajustar fechas de tareas locales y de GitHub directamente sobre la línea de tiempo y delegar a agentes.',
      projectId: 'global',
      projectLabel: 'lunar-orca',
      columnId: 'todo',
      priority: 'high',
      assignedAgentId: 'antigravity',
      startDate: formatIsoDateOffset(now, 0),
      endDate: formatIsoDateOffset(now, 4),
      progress: 20,
      createdAt: ts - 5_400_000,
      updatedAt: ts - 900_000
    },
    {
      id: 'local-task-intercom-sync',
      title: 'Validación E2E de Delegación a Arneses (Pi, OpenCode, Agy, Claude, Codex, Hermes)',
      description:
        'Verificar despacho directo al compositor de worktrees con prompt de coordinación Intercom y estado sincronizado.',
      projectId: 'global',
      projectLabel: 'lunar-orca',
      columnId: 'in-review',
      priority: 'medium',
      assignedAgentId: 'opencode',
      startDate: formatIsoDateOffset(now, 1),
      endDate: formatIsoDateOffset(now, 5),
      progress: 85,
      createdAt: ts - 3_600_000,
      updatedAt: ts - 300_000
    }
  ]
}
