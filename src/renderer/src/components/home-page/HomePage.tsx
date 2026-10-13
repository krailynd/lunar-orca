import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Bot,
  FolderGit2,
  GitBranch,
  GitCommit,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import logo from '../../../../../resources/logo.svg'
import type { AiVaultSession } from '../../../../shared/ai-vault-types'
import {
  activateAndRevealWorktree,
  activateAndRevealFolderWorkspace
} from '@/lib/worktree-activation'
import { HARNESS_CATEGORIES, formatRelativeTime } from './home-page-types'
import { HomePageSessionCards } from './HomePageSessionCards'
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
  const [gitRecentChanges, setGitRecentChanges] = useState<
    { repoName: string; commitHash?: string; message: string; author?: string; date: string }[]
  >([])

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
      const allChanges: {
        repoName: string
        commitHash?: string
        message: string
        author?: string
        date: string
      }[] = []
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

        {/* Central Logo & Header */}
        <header className="relative flex flex-col items-center text-center gap-3 pt-4">
          <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative size-14 rounded-2xl bg-card/90 border border-border/60 shadow-xs flex items-center justify-center p-2.5 backdrop-blur-md">
              <img
                src={logo}
                alt="Lunar Orca"
                className="size-full object-contain filter drop-shadow"
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-workspace-status-review/10 text-workspace-status-review border border-workspace-status-review/25 mb-1">
              <span className="size-1.5 rounded-full bg-workspace-status-review animate-pulse" />
              Centro de Mando Integral
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Lunar Orca
            </h1>
            <p className="text-xs text-muted-foreground/80 max-w-md mt-0.5">
              Panel central de desarrollo y explorador unificado de arneses de IA, sesiones y
              actividad git.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-border/60 bg-card/90 shadow-xs text-xs backdrop-blur-sm">
              <FolderGit2 className="size-3.5 text-workspace-status-review" />
              <span className="font-semibold">{repos.length}</span>
              <span className="text-muted-foreground">Proyectos</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-border/60 bg-card/90 shadow-xs text-xs backdrop-blur-sm">
              <Layers className="size-3.5 text-status-success" />
              <span className="font-semibold">{totalWorktrees}</span>
              <span className="text-muted-foreground">Workspaces</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-border/60 bg-card/90 shadow-xs text-xs backdrop-blur-sm">
              <Bot className="size-3.5 text-callout-important" />
              <span className="font-semibold">{sessions.length}</span>
              <span className="text-muted-foreground">Sesiones Registradas</span>
            </div>
            <button
              type="button"
              onClick={() =>
                openModal('new-workspace-composer', { telemetrySource: 'home-header' })
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-workspace-status-review/15 hover:bg-workspace-status-review/25 border border-workspace-status-review/30 text-workspace-status-review text-xs font-medium transition-all duration-200 active:scale-95 shadow-xs"
            >
              <Plus className="size-3.5" />
              Nuevo Workspace
            </button>
          </div>
        </header>

        {/* Git Recent Changes Banner */}
        {gitRecentChanges.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <GitCommit className="size-3.5 text-workspace-status-review" />
                Actividad Git Reciente
              </div>
              <span className="text-[11px] text-muted-foreground/60">
                Últimos commits en proyectos locales
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {gitRecentChanges.map((change) => (
                <div
                  key={`${change.repoName}-${change.commitHash ?? change.message}`}
                  className="flex items-start gap-2.5 p-3 rounded-2xl border border-border/60 bg-card/90 shadow-xs hover:border-workspace-status-review/35 transition-all duration-200 group"
                >
                  <div className="p-1.5 rounded-lg bg-workspace-status-review/10 text-workspace-status-review shrink-0 mt-0.5">
                    <GitBranch className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold truncate group-hover:text-workspace-status-review transition-colors">
                        {change.repoName}
                      </span>
                      {change.commitHash ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground">
                          {change.commitHash}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-foreground/80 line-clamp-1 mt-0.5 font-normal">
                      {change.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/60">
                      <span>{change.author}</span>
                      <span>•</span>
                      <span>{change.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
                <Sparkles className="size-4 text-workspace-status-review" />
                Historial de Sesiones por Arnés
              </h2>
              <p className="text-xs text-muted-foreground">
                Sesiones indexadas y agrupadas por entorno (Pi, OpenCode, Hermes, Claude, Codex y
                otros).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Buscar en sesiones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-60 h-8 pl-8 pr-3 text-xs rounded-full bg-card/90 border border-border/60 shadow-xs focus:outline-none focus:border-workspace-status-review/50 focus:ring-1 focus:ring-workspace-status-review/30 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
              <button
                type="button"
                onClick={() => void loadSessions()}
                disabled={loadingSessions}
                className="size-8 rounded-full bg-card/90 border border-border/60 shadow-xs flex items-center justify-center hover:bg-accent/60 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                title="Actualizar sesiones"
              >
                <RefreshCw
                  className={cn(
                    'size-3.5',
                    loadingSessions && 'animate-spin text-workspace-status-review'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 duration-200 border',
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                  : 'bg-card/90 text-muted-foreground hover:bg-accent/60 hover:text-foreground border-border/60 shadow-xs'
              )}
            >
              Todos ({sessions.length})
            </button>
            {HARNESS_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const count = sessions.filter((s) => cat.agents.includes(s.agent)).length
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 duration-200 border',
                    isActive
                      ? 'bg-card border-border/80 text-foreground font-semibold shadow-xs'
                      : 'bg-card/90 border-border/60 text-muted-foreground hover:bg-accent/60 hover:text-foreground shadow-xs'
                  )}
                >
                  <Icon className={cn('size-3.5', cat.color)} />
                  <span>{cat.name}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                      cat.badgeBg,
                      cat.badgeText
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Session Cards Render */}
          {loadingSessions && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground/60">
              <RefreshCw className="size-6 animate-spin text-workspace-status-review" />
              <p className="text-xs">Escaneando historial de sesiones...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 rounded-2xl border border-border/60 bg-card/90 shadow-xs text-muted-foreground">
              <Bot className="size-8 stroke-[1.25] text-muted-foreground/40" />
              <p className="text-xs font-medium">No se encontraron sesiones para este filtro</p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all')
                  setSearchQuery('')
                }}
                className="text-xs text-primary hover:underline mt-1"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <HomePageSessionCards
              sessions={filteredSessions}
              activeCategory={activeCategory}
              onOpenSession={handleOpenSession}
            />
          )}
        </section>
      </div>
    </div>
  )
}
