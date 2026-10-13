import type { TaskPageComposerActionsModel } from '../use-task-page-composer-actions'
import type { TuiAgent } from '../../../../shared/tui-agent'
import type { LinkedWorkItemSummary } from '@/lib/new-workspace'
import { findGithubWorkItemWorkspaceAttachment } from '@/lib/github-work-item-workspace-attachment'
import { getWorktreeAttachmentLabel } from '@/lib/worktree-attachment-label'
import { buildLinearIssueLinkedWorkItem } from '@/lib/linear-linked-work-item'
import { getLinearIssueWorkspaceName } from '../../../../shared/workspace-name'
import { bindTaskPageJiraItemSourceContext } from '../task-page-jira-item-source-context'
import {
  getGitHubWorkItemWorkspaceSeed,
  getGitLabWorkItemWorkspaceSeed,
  getJiraIssueWorkspaceSeed,
  getTaskPageRepoSourceContext
} from '../task-page-source-context'
import { useAppStore } from '@/store'
import {
  buildLunarOrcaMultiAgentDispatchPrompt,
  classifyTaskKanbanColumn,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS,
  TASK_KANBAN_DISPATCH_AGENTS,
  type TaskKanbanColumnId,
  type UnifiedKanbanTaskCard
} from './task-kanban-defs'
import {
  loadLocalProjectTasks,
  loadProviderTaskGanttOverrides,
  type LocalProjectTask,
  type ProviderTaskGanttOverride
} from './local-tasks-store'
import { buildLocalTaskCards, decorateProviderCardWithOverrides } from './local-tasks-cards'

export {
  buildLunarOrcaMultiAgentDispatchPrompt,
  classifyTaskKanbanColumn,
  TASK_DISPATCH_AGENTS,
  TASK_KANBAN_COLUMNS,
  TASK_KANBAN_DISPATCH_AGENTS,
  type TaskKanbanColumnId,
  type UnifiedKanbanTaskCard
}

function dispatchToComposer(
  openModal: TaskPageComposerActionsModel['openModal'],
  feature: 'github-tasks' | 'gitlab-tasks' | 'linear-tasks' | 'jira-tasks',
  args: {
    agentId: TuiAgent
    targetCol: TaskKanbanColumnId
    identifier: string
    title: string
    url: string
    repoName: string | null
    linkedWorkItem: LinkedWorkItemSummary
    prefilledName: string
    initialRepoId?: string
    initialGitHubWorkItem?: TaskPageComposerActionsModel['filteredWorkItems'][number]
    taskSourceContext?: unknown
    enableIssueAutomation?: boolean
  }
): void {
  const colMeta = TASK_KANBAN_COLUMNS.find((c) => c.id === args.targetCol) ?? TASK_KANBAN_COLUMNS[1]
  useAppStore.getState().recordFeatureInteraction(feature)
  openModal('new-workspace-composer', {
    linkedWorkItem: args.linkedWorkItem,
    initialGitHubWorkItem: args.initialGitHubWorkItem,
    taskSourceContext: args.taskSourceContext,
    prefilledName: args.prefilledName,
    initialRepoId: args.initialRepoId,
    initialAgentId: args.agentId,
    initialWorkspaceStatus: colMeta.workspaceStatus,
    initialNote: buildLunarOrcaMultiAgentDispatchPrompt({
      agentId: args.agentId,
      identifier: args.identifier,
      title: args.title,
      url: args.url,
      repoName: args.repoName,
      columnLabel: colMeta.label
    }),
    enableIssueAutomation: args.enableIssueAutomation,
    telemetrySource: 'sidebar'
  })
}

export function buildKanbanCardsFromTaskPageModel(
  model: TaskPageComposerActionsModel,
  options?: {
    localTasks?: LocalProjectTask[]
    overrides?: Record<string, ProviderTaskGanttOverride>
  }
): UnifiedKanbanTaskCard[] {
  const localTasks = options?.localTasks ?? loadLocalProjectTasks()
  const overrides = options?.overrides ?? loadProviderTaskGanttOverrides()

  if (model.localTasksMode) {
    return buildLocalTaskCards(model, localTasks)
  }

  if (model.taskSource === 'github') {
    return model.filteredWorkItems.map((item, idx) => {
      const itemRepo = model.repoMap.get(item.repoId) ?? null
      const attached = findGithubWorkItemWorkspaceAttachment(
        model.allWorktrees,
        item.repoId,
        item.type,
        item.number,
        item.url
      )
      const identifier = `#${item.number}`
      const linkedWorkItem: LinkedWorkItemSummary = {
        provider: 'github',
        type: item.type,
        number: item.number,
        title: item.title,
        url: item.url
      }
      if (item.repoId) {
        linkedWorkItem.repoId = item.repoId
      }
      return decorateProviderCardWithOverrides(
        {
          key: `gh:${item.repoId}:${item.type}:${item.id}`,
          identifier,
          title: item.title,
          url: item.url,
          column: classifyTaskKanbanColumn({
            rawState: item.state,
            isReviewOrPR: item.type === 'pr',
            labels: item.labels,
            hasAttachedWorkspace: Boolean(attached)
          }),
          statusLabel: item.state,
          repoLabel: itemRepo?.displayName ?? null,
          repoId: item.repoId,
          updatedAt: item.updatedAt,
          labels: item.labels.slice(0, 3),
          attachedWorkspaceLabel: attached ? getWorktreeAttachmentLabel(attached) : null,
          onOpenDetail: () => model.openGitHubDetailPage(item),
          onDispatchAgent: (agentId, targetCol) =>
            dispatchToComposer(model.openModal, 'github-tasks', {
              agentId,
              targetCol,
              identifier,
              title: item.title,
              url: item.url,
              repoName: itemRepo?.displayName ?? null,
              linkedWorkItem,
              initialGitHubWorkItem: item,
              taskSourceContext: getTaskPageRepoSourceContext(itemRepo ?? undefined, 'github'),
              prefilledName: getGitHubWorkItemWorkspaceSeed(item),
              initialRepoId: item.repoId,
              enableIssueAutomation: item.type === 'issue'
            })
        },
        idx,
        overrides
      )
    })
  }

  if (model.taskSource === 'gitlab') {
    return model.displayedGitLabItems.map((item, idx) => {
      const itemRepo = model.repoMap.get(item.repoId) ?? null
      const identifier = item.type === 'mr' ? `!${item.number}` : `#${item.number}`
      const linkedWorkItem: LinkedWorkItemSummary = {
        provider: 'gitlab',
        type: item.type,
        number: item.number,
        title: item.title,
        url: item.url
      }
      if (item.repoId) {
        linkedWorkItem.repoId = item.repoId
      }
      return decorateProviderCardWithOverrides(
        {
          key: `gl:${item.repoId}:${item.type}:${item.id}`,
          identifier,
          title: item.title,
          url: item.url,
          column: classifyTaskKanbanColumn({
            rawState: item.state,
            isReviewOrPR: item.type === 'mr',
            labels: item.labels
          }),
          statusLabel: item.state,
          repoLabel: itemRepo?.displayName ?? null,
          repoId: item.repoId,
          updatedAt: item.updatedAt,
          labels: item.labels.slice(0, 3),
          attachedWorkspaceLabel: null,
          onOpenDetail: () => model.openGitLabDetailPage(item),
          onDispatchAgent: (agentId, targetCol) =>
            dispatchToComposer(model.openModal, 'gitlab-tasks', {
              agentId,
              targetCol,
              identifier,
              title: item.title,
              url: item.url,
              repoName: itemRepo?.displayName ?? null,
              linkedWorkItem,
              taskSourceContext: getTaskPageRepoSourceContext(
                itemRepo ?? undefined,
                'gitlab',
                item.projectRef
              ),
              prefilledName: getGitLabWorkItemWorkspaceSeed(item),
              initialRepoId: item.repoId
            })
        },
        idx,
        overrides
      )
    })
  }

  if (model.taskSource === 'linear') {
    return model.pagedLinearIssues.map((issue, idx) =>
      decorateProviderCardWithOverrides(
        {
          key: `linear:${issue.id}`,
          identifier: issue.identifier,
          title: issue.title,
          url: issue.url,
          column: classifyTaskKanbanColumn({
            rawState: `${issue.state.type} ${issue.state.name}`,
            labels: issue.labels
          }),
          statusLabel: issue.state.name,
          repoLabel: issue.team.name,
          updatedAt: issue.updatedAt,
          labels: issue.labels.slice(0, 3),
          attachedWorkspaceLabel: null,
          onOpenDetail: () => model.openLinearDetailPage(issue),
          onDispatchAgent: (agentId, targetCol) =>
            dispatchToComposer(model.openModal, 'linear-tasks', {
              agentId,
              targetCol,
              identifier: issue.identifier,
              title: issue.title,
              url: issue.url,
              repoName: issue.team.name,
              linkedWorkItem: buildLinearIssueLinkedWorkItem(issue),
              taskSourceContext: model.linearTaskSourceContext,
              prefilledName: getLinearIssueWorkspaceName(issue)
            })
        },
        idx,
        overrides
      )
    )
  }

  return model.displayedJiraIssues.map((issue, idx) =>
    decorateProviderCardWithOverrides(
      {
        key: `jira:${issue.id}`,
        identifier: issue.key,
        title: issue.title,
        url: issue.url,
        column: classifyTaskKanbanColumn({
          rawState: `${issue.status.categoryKey} ${issue.status.name}`,
          labels: issue.labels
        }),
        statusLabel: issue.status.name,
        repoLabel: issue.project.name,
        updatedAt: issue.updatedAt,
        labels: issue.labels.slice(0, 3),
        attachedWorkspaceLabel: null,
        onOpenDetail: () => model.openJiraDetailPage(issue),
        onDispatchAgent: (agentId, targetCol) =>
          dispatchToComposer(model.openModal, 'jira-tasks', {
            agentId,
            targetCol,
            identifier: issue.key,
            title: issue.title,
            url: issue.url,
            repoName: issue.project.name,
            linkedWorkItem: {
              type: 'issue',
              provider: 'jira',
              number: 0,
              title: `${issue.key} ${issue.title}`,
              url: issue.url,
              jiraIdentifier: issue.key
            },
            taskSourceContext: bindTaskPageJiraItemSourceContext({
              issue,
              sites: model.jiraSites,
              sourceContext: model.jiraTaskSourceContext
            }),
            prefilledName: getJiraIssueWorkspaceSeed(issue)
          })
      },
      idx,
      overrides
    )
  )
}
