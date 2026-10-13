import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useAppStore } from '@/store'
import { toast } from 'sonner'
import type { AiVaultSession } from '../../../../shared/ai-vault-types'
import {
  activateAndRevealWorktree,
  activateAndRevealFolderWorkspace
} from '@/lib/worktree-activation'
import { HARNESS_CATEGORIES, formatRelativeTime } from './home-page-types'
import { HomePageHeader } from './HomePageHeader'
import { HomePageGitActivitySection, type GitRecentChange } from './HomePageGitActivitySection'
import { HomePageSessionsSection } from './HomePageSessionsSection'
import { HomePageLocalTasksSection, formatLocalTaskColumnLabel } from './HomePageLocalTasksSection'
import {
  addLocalTask,
  moveLocalTaskColumn,
  normalizeLocalAgentId,
  useLocalProjectTasks,
  type LocalProjectTask,
  type LocalTaskColumnId,
  type LocalTaskPriority
} from '@/components/task-page/local-tasks-store'
import {
  TASK_DISPATCH_AGENTS,
  buildLunarOrcaMultiAgentDispatchPrompt
} from '@/components/task-page/task-kanban-defs'
import type { TuiAgent } from '../../../../shared/tui-agent'

export default function HomePage(): React.JSX.Element {
  const repos = useAppStore((s) => s.repos)
  const worktreesByRepo = useAppStore((s) => s.worktreesByRepo)
  const folderWorkspaces = useAppStore((s) => s.folderWorkspaces)
  const openModal = useAppStore((s) => s.openModal)
  const openTaskPage = useAppStore((s) => s.openTaskPage)
  const { tasks: localTasks } = useLocalProjectTasks()

  const [sessions, setSessions] = useState<AiVaultSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [gitRecentChanges, setGitRecentChanges] = useState<GitRecentChange[]>([])

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true)
      const result = await window.api?.aiVault?.listSessions?.({
        limit: 200,
        executionHostScope: 'all'
      })
      if (result && Array.isArray(result.sessions)) {
        setSessions(result.sessions)
      }
    } catch (err) {
      console.error('Failed to load agent sessions:', err)
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  const loadGitActivity = useCallback(async () => {
    if (!window.api?.git?.history || !repos?.length) {
      return
    }
    try {
      const allChanges: GitRecentChange[] = []
      for (const repo of repos.slice(0, 5)) {
        try {
          const res = await window.api.git.history({ worktreePath: repo.path, limit: 2 })
          for (const item of res?.items ?? []) {
            allChanges.push({
              repoName: repo.displayName || 'Repo',
              commitHash: item.id?.slice(0, 7),
              message: item.subject || item.message?.split('\n')[0] || 'Commit',
              author: item.author,
              date: item.timestamp
                ? formatRelativeTime(new Date(item.timestamp).toISOString())
                : 'Reciente'
            })
          }
        } catch {
          // ignore individual repo errors
        }
      }
      setGitRecentChanges(allChanges.slice(0, 6))
    } catch (err) {
      console.error('Failed to load git activity:', err)
    }
  }, [repos])

  useEffect(() => {
    void loadSessions()
    void loadGitActivity()
  }, [loadSessions, loadGitActivity])

  const totalWorktrees = useMemo(() => {
    const wtCount = Object.values(worktreesByRepo).reduce((acc, list) => acc + list.length, 0)
    return wtCount + (folderWorkspaces?.length ?? 0)
  }, [worktreesByRepo, folderWorkspaces])

  const filteredSessions = useMemo(() => {
    const cat =
      activeCategory !== 'all' ? HARNESS_CATEGORIES.find((c) => c.id === activeCategory) : null
    const list = cat ? sessions.filter((s) => cat.agents.includes(s.agent)) : sessions
    const q = searchQuery.trim().toLowerCase()
    if (!q) {
      return list
    }
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.agent.toLowerCase().includes(q) ||
        Boolean(s.cwd?.toLowerCase().includes(q)) ||
        s.previewMessages.some((m) => m.text.toLowerCase().includes(q))
    )
  }, [sessions, activeCategory, searchQuery])

  const handleOpenSession = useCallback(
    (session: AiVaultSession) => {
      const targetPath = session.cwd || session.filePath
      if (targetPath) {
        for (const wtList of Object.values(worktreesByRepo)) {
          const wt = wtList.find(
            (item) => targetPath.startsWith(item.path) || item.path.startsWith(targetPath)
          )
          if (wt) {
            activateAndRevealWorktree(wt.id)
            toast.success(`Abriendo workspace para sesión de ${session.agent.toUpperCase()}`)
            return
          }
        }
        const matchedFolder = folderWorkspaces?.find(
          (f) => targetPath.startsWith(f.folderPath) || f.folderPath.startsWith(targetPath)
        )
        if (matchedFolder) {
          activateAndRevealFolderWorkspace(matchedFolder.id)
          toast.success(`Abriendo carpeta para sesión de ${session.agent.toUpperCase()}`)
          return
        }
      }
      openModal('new-workspace-composer', {
        initialPath: session.cwd || undefined,
        telemetrySource: 'home-session-jump'
      })
      toast.info(`Configurando nuevo workspace para la ruta: ${session.cwd || 'de la sesión'}`)
    },
    [worktreesByRepo, folderWorkspaces, openModal]
  )

  const handleAddQuickLocalTask = useCallback(
    (input: {
      title: string
      projectId: string
      projectLabel: string
      projectPath?: string
      priority: LocalTaskPriority
    }) => {
      const created = addLocalTask(input)
      toast.success(`Tarea local agregada: ${created.title}`)
    },
    []
  )

  const handleToggleLocalTaskColumn = useCallback(
    (task: LocalProjectTask, nextColumn: LocalTaskColumnId) => {
      moveLocalTaskColumn(task.id, nextColumn)
      toast.success(`Estado actualizado a ${formatLocalTaskColumnLabel(nextColumn)}`)
    },
    []
  )

  const handleDelegateLocalTaskToAgent = useCallback(
    (task: LocalProjectTask, agentId: TuiAgent) => {
      moveLocalTaskColumn(task.id, 'in-progress', normalizeLocalAgentId(agentId))
      const agentMeta = TASK_DISPATCH_AGENTS.find((a) => a.id === agentId)
      const resolvedRepoId =
        task.projectId && task.projectId !== 'global' ? task.projectId : repos[0]?.id
      const slug = task.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 32)
      openModal('new-workspace-composer', {
        prefilledName: slug ? `local-${slug}` : `local-task-${task.id.slice(-4)}`,
        initialRepoId: resolvedRepoId,
        initialAgentId: agentId,
        initialWorkspaceStatus: 'in_progress',
        initialNote: buildLunarOrcaMultiAgentDispatchPrompt({
          agentId,
          identifier: `LOCAL-${task.id.slice(-4).toUpperCase()}`,
          title: task.title,
          url: task.projectPath ?? `local://${task.projectLabel}/${task.id}`,
          repoName: task.projectLabel || null,
          columnLabel: 'In Progress'
        }),
        telemetrySource: 'home-local-task-dispatch'
      })
      toast.success(
        `Delegando tarea a ${agentMeta?.shortLabel ?? agentId.toUpperCase()} en Worktree Composer`
      )
    },
    [openModal, repos]
  )

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto scrollbar-sleek bg-background/95 text-foreground select-none">
      <div className="relative min-h-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[130px] rounded-full"
          aria-hidden="true"
        />

        {/* Central Logo & Header Subcomponent */}
        <HomePageHeader
          reposCount={repos.length}
          worktreesCount={totalWorktrees}
          sessionsCount={sessions.length}
          onNewWorkspace={() => {
            openModal('new-workspace-composer', { telemetrySource: 'home-header' })
          }}
        />

        {/* Git Recent Changes Banner Subcomponent */}
        <HomePageGitActivitySection gitRecentChanges={gitRecentChanges} />

        {/* Tareas Locales & Cronograma (Kanban / Gantt) */}
        <HomePageLocalTasksSection
          tasks={localTasks}
          repos={repos}
          onOpenTaskPage={() => openTaskPage()}
          onAddQuickTask={handleAddQuickLocalTask}
          onToggleTaskColumn={handleToggleLocalTaskColumn}
          onDelegateTaskToAgent={handleDelegateLocalTaskToAgent}
        />

        {/* Harness Categories & Session Explorer */}
        <HomePageSessionsSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loadingSessions={loadingSessions}
          onRefreshSessions={() => void loadSessions()}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sessions={sessions}
          filteredSessions={filteredSessions}
          onOpenSession={handleOpenSession}
        />
      </div>
    </div>
  )
}
