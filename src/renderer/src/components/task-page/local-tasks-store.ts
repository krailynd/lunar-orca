import { useSyncExternalStore } from 'react'
import {
  addDaysToIsoDate,
  buildDefaultSeedLocalTasks,
  diffDaysIsoDate,
  formatIsoDateOffset,
  isLocalProjectTaskList,
  isProviderTaskOverrideMap,
  LOCAL_PROJECT_TASKS_STORAGE_KEY,
  LOCAL_TASKS_UPDATED_EVENT,
  progressForLocalColumn,
  PROVIDER_TASK_GANTT_OVERRIDES_KEY,
  type LocalProjectTask,
  type LocalTaskAgentId,
  type LocalTaskColumnId,
  type LocalTaskDateShiftMode,
  type LocalTaskPriority,
  type ProviderTaskGanttOverride
} from './local-tasks-types'

export * from './local-tasks-types'

let cachedTasksRaw: string | null = null
let cachedTasksList: LocalProjectTask[] = []
let cachedOverridesRaw: string | null = null
let cachedOverridesMap: Record<string, ProviderTaskGanttOverride> = {}

function emitLocalTasksUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOCAL_TASKS_UPDATED_EVENT))
  }
}

export function loadLocalProjectTasks(): LocalProjectTask[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (cachedTasksRaw !== null) {
      return cachedTasksList
    }
    const seeded = buildDefaultSeedLocalTasks()
    cachedTasksRaw = JSON.stringify(seeded)
    cachedTasksList = seeded
    return cachedTasksList
  }
  const raw = window.localStorage.getItem(LOCAL_PROJECT_TASKS_STORAGE_KEY)
  if (raw !== null && raw === cachedTasksRaw) {
    return cachedTasksList
  }
  if (!raw) {
    const seeded = buildDefaultSeedLocalTasks()
    const serialized = JSON.stringify(seeded)
    window.localStorage.setItem(LOCAL_PROJECT_TASKS_STORAGE_KEY, serialized)
    cachedTasksRaw = serialized
    cachedTasksList = seeded
    return seeded
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isLocalProjectTaskList(parsed)) {
      cachedTasksRaw = raw
      cachedTasksList = parsed
      return parsed
    }
  } catch {
    // Fallback to seed on malformed JSON
  }
  const fallback = buildDefaultSeedLocalTasks()
  cachedTasksRaw = JSON.stringify(fallback)
  cachedTasksList = fallback
  return fallback
}

export function saveLocalProjectTasks(tasks: LocalProjectTask[]): LocalProjectTask[] {
  const serialized = JSON.stringify(tasks)
  cachedTasksRaw = serialized
  cachedTasksList = tasks
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(LOCAL_PROJECT_TASKS_STORAGE_KEY, serialized)
  }
  emitLocalTasksUpdated()
  return tasks
}

export function addLocalTask(input: {
  title: string
  description?: string
  projectId?: string
  projectLabel?: string
  projectPath?: string
  columnId?: LocalTaskColumnId
  priority?: LocalTaskPriority
  assignedAgentId?: LocalTaskAgentId | null
  startDate?: string
  endDate?: string
}): LocalProjectTask {
  const now = new Date()
  const columnId = input.columnId ?? 'todo'
  const startDate = input.startDate ?? formatIsoDateOffset(now, 0)
  const endDate = input.endDate ?? addDaysToIsoDate(startDate, 3)
  const created: LocalProjectTask = {
    id: `local-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title.trim() || 'Nueva tarea local',
    description: (input.description ?? '').trim(),
    projectId: input.projectId ?? 'global',
    projectLabel: input.projectLabel ?? 'Proyecto Local',
    projectPath: input.projectPath,
    columnId,
    priority: input.priority ?? 'medium',
    assignedAgentId: input.assignedAgentId ?? null,
    startDate,
    endDate: diffDaysIsoDate(startDate, endDate) < 0 ? startDate : endDate,
    progress: progressForLocalColumn(columnId),
    createdAt: now.getTime(),
    updatedAt: now.getTime()
  }
  saveLocalProjectTasks([created, ...loadLocalProjectTasks()])
  return created
}

export function updateLocalTask(
  id: string,
  patch: Partial<Omit<LocalProjectTask, 'id' | 'createdAt'>>
): LocalProjectTask[] {
  const now = Date.now()
  const next = loadLocalProjectTasks().map((task) => {
    if (task.id !== id) {
      return task
    }
    const nextCol = patch.columnId ?? task.columnId
    return {
      ...task,
      ...patch,
      columnId: nextCol,
      progress:
        patch.progress !== undefined
          ? patch.progress
          : patch.columnId
            ? progressForLocalColumn(nextCol, task.progress)
            : task.progress,
      updatedAt: now
    }
  })
  return saveLocalProjectTasks(next)
}

export function deleteLocalTask(id: string): LocalProjectTask[] {
  return saveLocalProjectTasks(loadLocalProjectTasks().filter((task) => task.id !== id))
}

export function moveLocalTaskColumn(
  id: string,
  columnId: LocalTaskColumnId,
  assignedAgentId?: LocalTaskAgentId | null
): LocalProjectTask[] {
  const patch: Partial<Omit<LocalProjectTask, 'id' | 'createdAt'>> = { columnId }
  if (assignedAgentId !== undefined) {
    patch.assignedAgentId = assignedAgentId
  }
  return updateLocalTask(id, patch)
}

function computeShiftedDates(
  currentStart: string,
  currentEnd: string,
  deltaDays: number,
  mode: LocalTaskDateShiftMode
): { startDate: string; endDate: string } {
  if (mode === 'move') {
    return {
      startDate: addDaysToIsoDate(currentStart, deltaDays),
      endDate: addDaysToIsoDate(currentEnd, deltaDays)
    }
  }
  if (mode === 'resize-start') {
    const candidate = addDaysToIsoDate(currentStart, deltaDays)
    return {
      startDate: diffDaysIsoDate(candidate, currentEnd) < 0 ? currentEnd : candidate,
      endDate: currentEnd
    }
  }
  const candidate = addDaysToIsoDate(currentEnd, deltaDays)
  return {
    startDate: currentStart,
    endDate: diffDaysIsoDate(currentStart, candidate) < 0 ? currentStart : candidate
  }
}

export function shiftLocalTaskDates(
  id: string,
  deltaDays: number,
  mode: LocalTaskDateShiftMode = 'move'
): LocalProjectTask[] {
  if (deltaDays === 0) {
    return loadLocalProjectTasks()
  }
  const now = Date.now()
  const next = loadLocalProjectTasks().map((task) => {
    if (task.id !== id) {
      return task
    }
    const shifted = computeShiftedDates(task.startDate, task.endDate, deltaDays, mode)
    return { ...task, ...shifted, updatedAt: now }
  })
  return saveLocalProjectTasks(next)
}

export function loadProviderTaskGanttOverrides(): Record<string, ProviderTaskGanttOverride> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return cachedOverridesMap
  }
  const raw = window.localStorage.getItem(PROVIDER_TASK_GANTT_OVERRIDES_KEY)
  if (raw !== null && raw === cachedOverridesRaw) {
    return cachedOverridesMap
  }
  if (!raw) {
    cachedOverridesRaw = null
    cachedOverridesMap = {}
    return cachedOverridesMap
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isProviderTaskOverrideMap(parsed)) {
      cachedOverridesRaw = raw
      cachedOverridesMap = parsed
      return parsed
    }
  } catch {
    // ignore malformed json
  }
  return {}
}

export function updateProviderTaskGanttOverride(
  taskKey: string,
  patch: Partial<Omit<ProviderTaskGanttOverride, 'updatedAt'>>
): Record<string, ProviderTaskGanttOverride> {
  const current = loadProviderTaskGanttOverrides()
  const existing = current[taskKey] ?? { updatedAt: Date.now() }
  const next: Record<string, ProviderTaskGanttOverride> = {
    ...current,
    [taskKey]: { ...existing, ...patch, updatedAt: Date.now() }
  }
  const serialized = JSON.stringify(next)
  cachedOverridesRaw = serialized
  cachedOverridesMap = next
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(PROVIDER_TASK_GANTT_OVERRIDES_KEY, serialized)
  }
  emitLocalTasksUpdated()
  return next
}

export function shiftProviderTaskOverrideDates(
  taskKey: string,
  currentStart: string,
  currentEnd: string,
  deltaDays: number,
  mode: LocalTaskDateShiftMode = 'move'
): Record<string, ProviderTaskGanttOverride> {
  return updateProviderTaskGanttOverride(
    taskKey,
    computeShiftedDates(currentStart, currentEnd, deltaDays, mode)
  )
}

function subscribeToLocalTasks(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }
  const handler = (): void => callback()
  window.addEventListener(LOCAL_TASKS_UPDATED_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(LOCAL_TASKS_UPDATED_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

export function useLocalProjectTasks(): {
  tasks: LocalProjectTask[]
  overrides: Record<string, ProviderTaskGanttOverride>
} {
  const tasks = useSyncExternalStore(
    subscribeToLocalTasks,
    loadLocalProjectTasks,
    buildDefaultSeedLocalTasks
  )
  const overrides = useSyncExternalStore(
    subscribeToLocalTasks,
    loadProviderTaskGanttOverrides,
    () => ({})
  )
  return { tasks, overrides }
}
