import { describe, expect, it } from 'vitest'
import { getAutomationTemplates } from '../automations/automation-templates'
import {
  buildLunarOrcaMultiAgentDispatchPrompt,
  classifyTaskKanbanColumn,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS
} from './task-kanban-defs'

describe('Harness cron automation templates & Task Kanban multi-agent dispatch', () => {
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

  it('defines 4 Kanban columns and multi-agent dispatch targets', () => {
    expect(TASK_KANBAN_COLUMNS.map((c) => c.id)).toEqual([
      'todo',
      'in_progress',
      'in_review',
      'done'
    ])
    expect(TASK_DISPATCH_AGENTS.map((a) => a.id)).toEqual([
      'pi',
      'opencode',
      'claude',
      'codex',
      'hermes'
    ])
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

  it('builds a Lunar Orca Multi-Agent Intercom prompt with project and board context', () => {
    const prompt = buildLunarOrcaMultiAgentDispatchPrompt({
      agentId: 'pi',
      identifier: '#42',
      title: 'Sync Workspace Board with Tasks',
      url: 'https://github.com/org/lunar-orca/issues/42',
      repoName: 'lunar-orca',
      columnLabel: 'In Progress'
    })
    expect(prompt).toContain('Lunar Orca Multi-Agent Intercom')
    expect(prompt).toContain('Harness: PI')
    expect(prompt).toContain('lunar-orca')
    expect(prompt).toContain('#42')
    expect(prompt).toContain('In Progress')
  })
})
