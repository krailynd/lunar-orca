import type { TaskPageSourceAvailabilityModel } from './use-task-page-source-availability'
import { useRef, useState, useEffect, useMemo } from 'react'
import { resolveVisibleTaskProvider } from '../../../shared/task-providers'
import type { GitLabTaskFilter, GitLabIssueFilter } from '@/components/task-page-localized-options'
import type { GitLabWorkItem, GitLabTodo } from '../../../shared/gitlab-types'
import { getRepoBackedTaskEmptyState } from '@/components/task-page-empty-state'
import { isGitLabIssueFilter, isGitLabMRFilter } from './task-page-source-context'
export function useTaskPageProviderState(model: TaskPageSourceAvailabilityModel) {
  const {
    settings,
    pageData,
    selectedRepos,
    visibleTaskProviders,
    preferredTaskSource,
    taskSource,
    setTaskSource
  } = model
  const taskSourceManuallyChangedRef = useRef(false)
  const lastPageTaskSourceRef = useRef(pageData.taskSource)
  const taskResumeAppliedRef = useRef(false)
  const githubSearchPersistReadyRef = useRef(false)
  const linearSearchPersistReadyRef = useRef(false)
  const linearViewPersistReadyRef = useRef(false)
  const jiraSearchPersistReadyRef = useRef(false)
  const [taskResumeApplied, setTaskResumeApplied] = useState(false)

  // Why: useState only inits once, so sync taskSource from the store when a sidebar source-icon click changes pageData.taskSource.
  useEffect(() => {
    const pageTaskSourceChanged = lastPageTaskSourceRef.current !== pageData.taskSource
    lastPageTaskSourceRef.current = pageData.taskSource
    if (pageData.taskSource) {
      if (pageTaskSourceChanged) {
        taskSourceManuallyChangedRef.current = false
      } else if (taskSourceManuallyChangedRef.current) {
        return
      }
      setTaskSource(resolveVisibleTaskProvider(pageData.taskSource, visibleTaskProviders))
    }
  }, [pageData.taskSource, visibleTaskProviders, setTaskSource])
  useEffect(() => {
    if (taskSourceManuallyChangedRef.current) {
      return
    }
    // Why: GitLab/Linear availability hydrates after mount; restore the saved default once its provider check proves it can be shown.
    if (visibleTaskProviders.includes(preferredTaskSource) && taskSource !== preferredTaskSource) {
      setTaskSource(preferredTaskSource)
    }
  }, [preferredTaskSource, taskSource, visibleTaskProviders, setTaskSource])
  useEffect(() => {
    if (!visibleTaskProviders.includes(taskSource)) {
      setTaskSource(resolveVisibleTaskProvider(settings?.defaultTaskSource, visibleTaskProviders))
    }
  }, [settings?.defaultTaskSource, taskSource, visibleTaskProviders, setTaskSource])

  // Why: Project mode is a GitHub sub-tab — visible on the GitHub source, but actual entry is gated on a non-null activeProject.
  const projectModeVisible = taskSource === 'github'
  const [githubMode, setGithubMode] = useState<'items' | 'project'>('items')
  const [taskPageViewMode, setTaskPageViewMode] = useState<'list' | 'kanban' | 'gantt'>('list')
  const [localTasksMode, setLocalTasksMode] = useState(false)
  const [localTaskComposerOpen, setLocalTaskComposerOpen] = useState(false)

  // ── GitLab task-source state ──────────────────────────────────────
  // Why: parallel to Linear's slim per-source state — skips workItemsCache and cross-repo aggregation; fetches directly via window.api.gl for the primary repo.
  const [gitlabFilter, setGitlabFilter] = useState<GitLabTaskFilter | GitLabIssueFilter>('opened')
  const [gitlabItems, setGitlabItems] = useState<GitLabWorkItem[]>([])
  const [gitlabLoading, setGitlabLoading] = useState(false)
  const [gitlabError, setGitlabError] = useState<string | null>(null)
  const [gitlabRefreshNonce, setGitlabRefreshNonce] = useState(0)
  // Why: separate from gitlabItems so the dialog target survives a list refresh that removes the item from the visible filter (e.g. closing an MR).
  const [gitlabDialogItem, setGitlabDialogItem] = useState<GitLabWorkItem | null>(null)

  // Why: GitLab tab has two sub-views — the project MR/issue list and the user's cross-project Todos (a separate stream).
  const [gitlabView, setGitlabView] = useState<'issues' | 'mrs' | 'todos'>('mrs')
  const [gitlabTodos, setGitlabTodos] = useState<GitLabTodo[]>([])
  const [gitlabTodosLoading, setGitlabTodosLoading] = useState(false)
  const gitlabEmptyState = useMemo(
    () =>
      getRepoBackedTaskEmptyState({
        provider: 'gitlab',
        selectedRepoCount: selectedRepos.length,
        gitlabView
      }),
    [gitlabView, selectedRepos.length]
  )
  const gitlabFilterIsValid =
    gitlabView === 'issues'
      ? isGitLabIssueFilter(gitlabFilter)
      : gitlabView === 'mrs'
        ? isGitLabMRFilter(gitlabFilter)
        : true
  const activeGitlabFilter = gitlabFilterIsValid ? gitlabFilter : 'opened'
  // Why: Issues and MRs expose different filter sets; repair in effect so fetch effects never run glab with a stale filter from the other view, without triggering React #185 during render.
  useEffect(() => {
    if (!gitlabFilterIsValid) {
      setGitlabFilter('opened')
    }
  }, [gitlabFilterIsValid])
  const displayedGitLabItems = useMemo(() => {
    if (gitlabView === 'issues') {
      return gitlabItems.filter((item) => item.type === 'issue')
    }
    if (gitlabView === 'mrs') {
      return gitlabItems.filter((item) => item.type === 'mr')
    }
    return gitlabItems
  }, [gitlabItems, gitlabView])
  return Object.assign(model, {
    taskSourceManuallyChangedRef,
    lastPageTaskSourceRef,
    taskResumeAppliedRef,
    githubSearchPersistReadyRef,
    linearSearchPersistReadyRef,
    linearViewPersistReadyRef,
    jiraSearchPersistReadyRef,
    taskResumeApplied,
    setTaskResumeApplied,
    projectModeVisible,
    githubMode,
    setGithubMode,
    taskPageViewMode,
    setTaskPageViewMode,
    localTasksMode,
    setLocalTasksMode,
    localTaskComposerOpen,
    setLocalTaskComposerOpen,
    gitlabFilter,
    setGitlabFilter,
    gitlabItems,
    setGitlabItems,
    gitlabLoading,
    setGitlabLoading,
    gitlabError,
    setGitlabError,
    gitlabRefreshNonce,
    setGitlabRefreshNonce,
    gitlabDialogItem,
    setGitlabDialogItem,
    gitlabView,
    setGitlabView,
    gitlabTodos,
    setGitlabTodos,
    gitlabTodosLoading,
    setGitlabTodosLoading,
    gitlabEmptyState,
    gitlabFilterIsValid,
    activeGitlabFilter,
    displayedGitLabItems
  })
}
export type TaskPageProviderStateModel = ReturnType<typeof useTaskPageProviderState>
