import type { TuiAgent } from '../../../../shared/tui-agent'
import type { WorkspaceStatus } from '../../../../shared/worktree/types'

export type TaskKanbanColumnId = 'todo' | 'in_progress' | 'in_review' | 'done'

export const TASK_KANBAN_COLUMNS: readonly {
  id: TaskKanbanColumnId
  label: string
  workspaceStatus: WorkspaceStatus
  accentClass: string
}[] = [
  { id: 'todo', label: 'Todo', workspaceStatus: 'todo', accentClass: 'border-t-border' },
  {
    id: 'in_progress',
    label: 'In Progress',
    workspaceStatus: 'in_progress',
    accentClass: 'border-t-workspace-status-review'
  },
  {
    id: 'in_review',
    label: 'In Review',
    workspaceStatus: 'needs_review',
    accentClass: 'border-t-git-graph-lane-4'
  },
  {
    id: 'done',
    label: 'Done',
    workspaceStatus: 'completed',
    accentClass: 'border-t-ring'
  }
]

export const TASK_DISPATCH_AGENTS: readonly {
  id: TuiAgent
  label: string
  shortLabel: string
}[] = [
  { id: 'pi', label: 'Pi Agent', shortLabel: 'Pi' },
  { id: 'opencode', label: 'OpenCode', shortLabel: 'OpenCode' },
  { id: 'antigravity', label: 'Antigravity (Agy)', shortLabel: 'Agy' },
  { id: 'claude', label: 'Claude Code', shortLabel: 'Claude' },
  { id: 'codex', label: 'Codex', shortLabel: 'Codex' },
  { id: 'hermes', label: 'Hermes', shortLabel: 'Hermes' }
]

export const TASK_KANBAN_DISPATCH_AGENTS = TASK_DISPATCH_AGENTS

export type UnifiedKanbanTaskCard = {
  key: string
  identifier: string
  title: string
  description?: string
  url: string
  column: TaskKanbanColumnId
  statusLabel: string
  repoLabel: string | null
  repoId?: string
  updatedAt?: string
  labels: string[]
  attachedWorkspaceLabel: string | null
  isLocalTask?: boolean
  localTaskId?: string
  priority?: 'low' | 'medium' | 'high'
  assignedAgentId?: TuiAgent | null
  startDate: string
  endDate: string
  progress: number
  onOpenDetail: () => void
  onDispatchAgent: (agentId: TuiAgent, column: TaskKanbanColumnId) => void
  onMoveColumn: (nextColumn: TaskKanbanColumnId) => void
  onShiftDates: (deltaDays: number, mode?: 'move' | 'resize-start' | 'resize-end') => void
  onDeleteLocalTask?: () => void
}

export function buildLunarOrcaMultiAgentDispatchPrompt(args: {
  agentId: TuiAgent
  identifier: string
  title: string
  url: string
  repoName: string | null
  columnLabel: string
}): string {
  const projectLabel = args.repoName ?? 'current project'
  return [
    `[Lunar Orca Multi-Agent Intercom · Harness: ${args.agentId.toUpperCase()}]`,
    `You are operating inside Lunar Orca as an autonomous engineering employee in project "${projectLabel}".`,
    `Task: ${args.identifier} — ${args.title} (${args.url})`,
    `Current Kanban Column: ${args.columnLabel}`,
    `Coordination Protocol:`,
    `1. Inspect the repository worktree and coordinate with peer agents via Lunar Orca Workspace Board / Intercom.`,
    `2. Implement and verify the task changes in this isolated worktree.`,
    `3. Keep the Workspace Board & Task status synchronized (Todo -> In Progress -> In Review -> Done).`
  ].join('\n')
}

export function classifyTaskKanbanColumn(args: {
  rawState: string
  isReviewOrPR?: boolean
  labels?: readonly string[]
  hasAttachedWorkspace?: boolean
}): TaskKanbanColumnId {
  const state = args.rawState.toLowerCase()
  const labelText = (args.labels ?? []).join(' ').toLowerCase()
  if (/closed|merged|completed|done|cancel/.test(state)) {
    return 'done'
  }
  if (
    state.includes('review') ||
    labelText.includes('review') ||
    (args.isReviewOrPR && state !== 'draft')
  ) {
    return 'in_review'
  }
  if (
    /started|progress|doing|draft/.test(state) ||
    /in progress|wip/.test(labelText) ||
    args.hasAttachedWorkspace
  ) {
    return 'in_progress'
  }
  return 'todo'
}
