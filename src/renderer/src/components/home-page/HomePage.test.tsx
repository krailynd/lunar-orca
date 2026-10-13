// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import { HARNESS_CATEGORIES, formatRelativeTime } from './home-page-types'
import {
  computeLocalTasksSummaryMetrics,
  formatLocalTaskColumnLabel,
  getNextLocalTaskColumn,
  toDispatchKanbanColumn
} from './HomePageLocalTasksSection'
import {
  addLocalTask,
  moveLocalTaskColumn,
  saveLocalProjectTasks,
  type LocalProjectTask
} from '@/components/task-page/local-tasks-store'
import {
  TASK_DISPATCH_AGENTS,
  buildLunarOrcaMultiAgentDispatchPrompt
} from '@/components/task-page/task-kanban-defs'

describe('HomePage types and helpers', () => {
  it('defines 6 primary harness categories with appropriate agent coverage', () => {
    expect(HARNESS_CATEGORIES).toHaveLength(6)
    const categoryIds = HARNESS_CATEGORIES.map((c) => c.id)
    expect(categoryIds).toEqual(['pi', 'opencode', 'hermes', 'claude', 'codex', 'antigravity'])

    const piCategory = HARNESS_CATEGORIES.find((c) => c.id === 'pi')
    expect(piCategory?.agents).toContain('pi')

    const opencodeCategory = HARNESS_CATEGORIES.find((c) => c.id === 'opencode')
    expect(opencodeCategory?.agents).toContain('opencode')

    const hermesCategory = HARNESS_CATEGORIES.find((c) => c.id === 'hermes')
    expect(hermesCategory?.agents).toContain('hermes')

    const claudeCategory = HARNESS_CATEGORIES.find((c) => c.id === 'claude')
    expect(claudeCategory?.agents).toContain('claude')

    const codexCategory = HARNESS_CATEGORIES.find((c) => c.id === 'codex')
    expect(codexCategory?.agents).toContain('codex')

    const antigravityCategory = HARNESS_CATEGORIES.find((c) => c.id === 'antigravity')
    expect(antigravityCategory?.agents).toContain('antigravity')
  })

  it('formats relative timestamps gracefully', () => {
    expect(formatRelativeTime(null)).toBe('Reciente')
    expect(formatRelativeTime(undefined)).toBe('Reciente')
    expect(formatRelativeTime('invalid-date')).toBe('Reciente')

    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('Hace un momento')
  })

  it('computes local task summary metrics and column transitions for HomePage', () => {
    const sampleTasks: LocalProjectTask[] = [
      {
        id: 't-1',
        title: 'Task Todo',
        description: '',
        projectId: 'global',
        projectLabel: 'Proyecto Local',
        columnId: 'todo',
        priority: 'medium',
        assignedAgentId: null,
        startDate: '2026-04-01',
        endDate: '2026-04-03',
        progress: 10,
        createdAt: 1000,
        updatedAt: 1000
      },
      {
        id: 't-2',
        title: 'Task In Progress',
        description: '',
        projectId: 'repo-1',
        projectLabel: 'Lunar Orca',
        columnId: 'in-progress',
        priority: 'high',
        assignedAgentId: 'pi',
        startDate: '2026-04-02',
        endDate: '2026-04-05',
        progress: 50,
        createdAt: 1000,
        updatedAt: 2000
      },
      {
        id: 't-3',
        title: 'Task In Review',
        description: '',
        projectId: 'repo-1',
        projectLabel: 'Lunar Orca',
        columnId: 'in-review',
        priority: 'high',
        assignedAgentId: 'claude',
        startDate: '2026-04-03',
        endDate: '2026-04-06',
        progress: 80,
        createdAt: 1000,
        updatedAt: 3000
      },
      {
        id: 't-4',
        title: 'Task Completed',
        description: '',
        projectId: 'global',
        projectLabel: 'Proyecto Local',
        columnId: 'completed',
        priority: 'low',
        assignedAgentId: 'opencode',
        startDate: '2026-04-01',
        endDate: '2026-04-02',
        progress: 100,
        createdAt: 1000,
        updatedAt: 4000
      }
    ]

    const metrics = computeLocalTasksSummaryMetrics(sampleTasks)
    expect(metrics).toEqual({
      todo: 1,
      inProgress: 1,
      inReview: 1,
      completed: 1,
      total: 4
    })

    expect(getNextLocalTaskColumn('todo')).toBe('in-progress')
    expect(getNextLocalTaskColumn('in-progress')).toBe('in-review')
    expect(getNextLocalTaskColumn('in-review')).toBe('completed')
    expect(getNextLocalTaskColumn('completed')).toBe('todo')

    expect(formatLocalTaskColumnLabel('todo')).toBe('Pendientes')
    expect(formatLocalTaskColumnLabel('in-progress')).toBe('En Progreso')
    expect(formatLocalTaskColumnLabel('in-review')).toBe('En Revisión')
    expect(formatLocalTaskColumnLabel('completed')).toBe('Completadas')

    expect(toDispatchKanbanColumn('todo')).toBe('todo')
    expect(toDispatchKanbanColumn('in-progress')).toBe('in_progress')
    expect(toDispatchKanbanColumn('in-review')).toBe('in_review')
    expect(toDispatchKanbanColumn('completed')).toBe('done')
  })

  it('supports adding local tasks, moving columns, and building multi-agent dispatch prompts', () => {
    saveLocalProjectTasks([])
    const created = addLocalTask({
      title: 'Integrar panel Kanban en Home',
      projectId: 'repo-lunar',
      projectLabel: 'Lunar Orca',
      priority: 'high'
    })
    expect(created.columnId).toBe('todo')
    expect(created.projectLabel).toBe('Lunar Orca')

    const updated = moveLocalTaskColumn(created.id, 'in-progress', 'pi')
    const found = updated.find((t) => t.id === created.id)
    expect(found?.columnId).toBe('in-progress')
    expect(found?.assignedAgentId).toBe('pi')

    expect(TASK_DISPATCH_AGENTS.map((a) => a.shortLabel)).toEqual([
      'Pi',
      'OpenCode',
      'Agy',
      'Claude',
      'Codex',
      'Hermes'
    ])

    const prompt = buildLunarOrcaMultiAgentDispatchPrompt({
      agentId: 'pi',
      identifier: 'LOCAL-1234',
      title: created.title,
      url: 'local://Lunar Orca/1234',
      repoName: 'Lunar Orca',
      columnLabel: 'In Progress'
    })
    expect(prompt).toContain('Harness: PI')
    expect(prompt).toContain('LOCAL-1234 — Integrar panel Kanban en Home')
  })
})
