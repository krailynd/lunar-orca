import { beforeEach, describe, expect, it } from 'vitest'
import { getAutomationTemplates } from '../automations/automation-templates'
import {
  buildLunarOrcaMultiAgentDispatchPrompt,
  classifyTaskKanbanColumn,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS,
  TASK_KANBAN_DISPATCH_AGENTS
} from './task-kanban-defs'
import {
  addDaysToIsoDate,
  addLocalTask,
  deleteLocalTask,
  diffDaysIsoDate,
  loadLocalProjectTasks,
  moveLocalTaskColumn,
  saveLocalProjectTasks,
  shiftLocalTaskDates,
  shiftProviderTaskOverrideDates,
  updateLocalTask,
  updateProviderTaskGanttOverride
} from './local-tasks-store'

describe('Harness cron automation templates & Task Kanban multi-agent dispatch', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
  })

  it('includes Pi, Hermes, and OpenCode cron templates in getAutomationTemplates', () => {
    const templates = getAutomationTemplates()
    const ids = templates.map((t) => t.id)
    expect(ids).toContain('pi-odd-daily-sync')
    expect(ids).toContain('hermes-remote-intel-recon')
    expect(ids).toContain('opencode-multi-harness-triage')

    const piTemplate = templates.find((t) => t.id === 'pi-odd-daily-sync')
    expect(piTemplate?.agentId).toBe('pi')
    expect(piTemplate?.customSchedule).toBe('0 9 * * *')

    const hermesTemplate = templates.find((t) => t.id === 'hermes-remote-intel-recon')
    expect(hermesTemplate?.agentId).toBe('hermes')
    expect(hermesTemplate?.customSchedule).toBe('0 */6 * * *')

    const opencodeTemplate = templates.find((t) => t.id === 'opencode-multi-harness-triage')
    expect(opencodeTemplate?.agentId).toBe('opencode')
    expect(opencodeTemplate?.customSchedule).toBe('0 * * * *')
  })

  it('defines 4 Kanban columns and all 6 multi-agent dispatch targets including Antigravity (Agy)', () => {
    expect(TASK_KANBAN_COLUMNS.map((c) => c.id)).toEqual([
      'todo',
      'in_progress',
      'in_review',
      'done'
    ])
    expect(TASK_DISPATCH_AGENTS.map((a) => a.id)).toEqual([
      'pi',
      'opencode',
      'antigravity',
      'claude',
      'codex',
      'hermes'
    ])
    expect(TASK_KANBAN_DISPATCH_AGENTS.map((a) => a.id)).toContain('antigravity')
  })

  it('classifies task states into Todo, In Progress, In Review, and Done', () => {
    expect(classifyTaskKanbanColumn({ rawState: 'open' })).toBe('todo')
    expect(classifyTaskKanbanColumn({ rawState: 'open', hasAttachedWorkspace: true })).toBe(
      'in_progress'
    )
    expect(classifyTaskKanbanColumn({ rawState: 'open', isReviewOrPR: true })).toBe('in_review')
    expect(classifyTaskKanbanColumn({ rawState: 'merged' })).toBe('done')
    expect(classifyTaskKanbanColumn({ rawState: 'closed' })).toBe('done')
  })

  it('builds a Lunar Orca Multi-Agent Intercom prompt with project and board context for Pi and Agy', () => {
    const prompt = buildLunarOrcaMultiAgentDispatchPrompt({
      agentId: 'antigravity',
      identifier: '#42',
      title: 'Sync Workspace Board with Tasks',
      url: 'https://github.com/org/lunar-orca/issues/42',
      repoName: 'lunar-orca',
      columnLabel: 'In Progress'
    })
    expect(prompt).toContain('Lunar Orca Multi-Agent Intercom')
    expect(prompt).toContain('Harness: ANTIGRAVITY')
    expect(prompt).toContain('lunar-orca')
    expect(prompt).toContain('#42')
    expect(prompt).toContain('In Progress')
  })

  it('supports Local Project Tasks CRUD, Kanban column movement, and Gantt date shifting', () => {
    saveLocalProjectTasks([])
    const created = addLocalTask({
      title: 'Implement Notion/Lark Gantt for Local Projects',
      description: 'Allow dragging tasks and delegating to Agy/Pi/OpenCode',
      projectId: 'repo-1',
      projectLabel: 'lunar-orca',
      columnId: 'todo',
      priority: 'high',
      assignedAgentId: 'antigravity',
      startDate: '2026-04-10',
      endDate: '2026-04-14'
    })

    expect(created.title).toBe('Implement Notion/Lark Gantt for Local Projects')
    expect(created.assignedAgentId).toBe('antigravity')
    expect(diffDaysIsoDate(created.startDate, created.endDate)).toBe(4)

    moveLocalTaskColumn(created.id, 'in-progress', 'pi')
    const afterMove = loadLocalProjectTasks().find((t) => t.id === created.id)
    expect(afterMove?.columnId).toBe('in-progress')
    expect(afterMove?.assignedAgentId).toBe('pi')
    expect(afterMove?.progress).toBeGreaterThanOrEqual(45)

    shiftLocalTaskDates(created.id, 2, 'move')
    const afterShift = loadLocalProjectTasks().find((t) => t.id === created.id)
    expect(afterShift?.startDate).toBe(addDaysToIsoDate('2026-04-10', 2))
    expect(afterShift?.endDate).toBe(addDaysToIsoDate('2026-04-14', 2))

    shiftLocalTaskDates(created.id, 3, 'resize-end')
    const afterResize = loadLocalProjectTasks().find((t) => t.id === created.id)
    expect(afterResize?.endDate).toBe(addDaysToIsoDate('2026-04-16', 3))

    updateLocalTask(created.id, { columnId: 'completed' })
    const afterComplete = loadLocalProjectTasks().find((t) => t.id === created.id)
    expect(afterComplete?.progress).toBe(100)

    deleteLocalTask(created.id)
    expect(loadLocalProjectTasks().find((t) => t.id === created.id)).toBeUndefined()
  })

  it('persists provider task Kanban and Gantt overrides', () => {
    const updated = updateProviderTaskGanttOverride('gh:repo1:issue:99', {
      columnId: 'in-review',
      assignedAgentId: 'opencode'
    })
    expect(updated['gh:repo1:issue:99']?.columnId).toBe('in-review')
    expect(updated['gh:repo1:issue:99']?.assignedAgentId).toBe('opencode')

    const shifted = shiftProviderTaskOverrideDates(
      'gh:repo1:issue:99',
      '2026-04-10',
      '2026-04-12',
      -1,
      'move'
    )
    expect(shifted['gh:repo1:issue:99']?.startDate).toBe('2026-04-09')
    expect(shifted['gh:repo1:issue:99']?.endDate).toBe('2026-04-11')
  })
})
