import React, { useMemo, useState } from 'react'
import { isImeOwnedKeyboardEvent } from '@/lib/ime-composition-keyboard-event'
import {
  Bot,
  Clock,
  Code2,
  Command,
  Cpu,
  FolderGit2,
  FolderPlus,
  Layers,
  Plus,
  Sparkles,
  Terminal,
  ExternalLink,
  Github,
  Mail
} from 'lucide-react'
import logo from '../../../../../resources/logo.svg'
import creationHandsImage from '@/assets/lunar-creation-hands.jpg'
import { HomeSessionSearchOmnibar } from './HomeSessionSearchOmnibar'

import {
  type HomeQuickAction,
  type RecentProject,
  type HomeAgentUsage,
  type HomePageHeaderProps,
  AGENT_OPTIONS,
  MODE_OPTIONS,
  EMPTY_PROJECTS,
  EMPTY_USAGE,
  isAgentOption,
  isModeOption,
  greetingForHour,
  formatClock
} from './home-page-header-types'
import { QuickActionRow } from './QuickActionRow'

export type { HomeQuickAction, RecentProject, HomeAgentUsage, HomePageHeaderProps }

export function HomePageHeader({
  reposCount,
  worktreesCount,
  sessionsCount,
  onNewWorkspace,
  userName = 'Krailynd',
  recentProjects = EMPTY_PROJECTS,
  agentUsage = EMPTY_USAGE,
  onQuickAction,
  onSubmitPrompt,
  onOpenProject
}: HomePageHeaderProps): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [agent, setAgent] = useState<(typeof AGENT_OPTIONS)[number]>('Pi')
  const [mode, setMode] = useState<(typeof MODE_OPTIONS)[number]>('Tarea')
  const [projectId, setProjectId] = useState('')

  const [now] = useState(() => new Date())
  const { day, time } = useMemo(() => formatClock(now), [now])
  const greeting = useMemo(() => greetingForHour(now.getHours()), [now])

  const fireQuickAction = (action: HomeQuickAction): void => {
    if (onQuickAction) {
      onQuickAction(action)
      return
    }
    if (action === 'new-workspace') {
      onNewWorkspace()
    }
  }

  const submitPrompt = (): void => {
    const trimmed = prompt.trim()
    if (!trimmed) {
      return
    }
    onSubmitPrompt?.(trimmed)
    setPrompt('')
  }

  return (
    <header className="flex flex-col gap-7 pt-2 text-left">
      <div className="home-hero-banner">
        <img src={creationHandsImage} alt="" aria-hidden="true" className="home-hero-banner-art" />
        <div className="home-hero flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="home-hero-logo transition-transform hover:scale-105 duration-300">
              <img src={logo} alt="Lunar Orca" className="size-full object-contain" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="home-hero-date">
                <Clock className="size-3" /> {day} · {time}
              </p>
              <h1 className="home-hero-greeting">
                {greeting}, <span className="home-hero-name">{userName}</span>
              </h1>
              <p className="home-hero-sub">
                Orquestá agentes IA, repositorios y sesiones desde un solo lugar.
              </p>
            </div>
          </div>

          {/* Botones directos de Acceso y Contacto */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://github.com/CinloDev"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 shadow-sm backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              <Github className="size-3.5" />
              <span>Mis Mods</span>
              <ExternalLink className="size-3 opacity-60" />
            </a>
            <a
              href="mailto:contact@cinlodev.local"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 shadow-sm backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              <Mail className="size-3.5" />
              <span>Contacto</span>
            </a>
          </div>
        </div>
      </div>

      {/* Omnibar Inteligente de Búsqueda de Sesiones y Worktrees */}
      <HomeSessionSearchOmnibar />

      <div className="home-terminal-card">
        <div className="home-terminal-bar">
          <div className="flex items-center gap-2">
            <span className="home-mac-dot bg-[#ff5f57]" />
            <span className="home-mac-dot bg-[#febc2e]" />
            <span className="home-mac-dot bg-[#28c840]" />
          </div>
          <span className="home-terminal-title">
            <Terminal className="size-3.5" />
            lunar@workspace:~
          </span>
          <span className="home-terminal-spacer" />
        </div>

        <div className="home-terminal-body">
          <label className="home-terminal-input">
            <span className="home-terminal-caret">&gt;</span>
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (isImeOwnedKeyboardEvent(event)) {
                  return
                }
                if (event.key === 'Enter') {
                  event.preventDefault()
                  submitPrompt()
                }
              }}
              placeholder="¿Qué querés construir hoy?"
              className="home-terminal-field"
            />
            <button
              type="button"
              onClick={submitPrompt}
              className="home-terminal-submit"
              aria-label="Crear workspace con este prompt"
            >
              <Sparkles className="size-3.5" />
              Crear
            </button>
          </label>

          <div className="home-terminal-controls">
            <label className="home-select">
              <Bot className="size-3" />
              <select
                value={agent}
                onChange={(event) => {
                  if (isAgentOption(event.target.value)) {
                    setAgent(event.target.value)
                  }
                }}
                aria-label="Agente"
              >
                {AGENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="home-select">
              <Layers className="size-3" />
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                aria-label="Proyecto destino"
              >
                <option value="">Proyecto destino</option>
                {recentProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="home-select">
              <Cpu className="size-3" />
              <select
                value={mode}
                onChange={(event) => {
                  if (isModeOption(event.target.value)) {
                    setMode(event.target.value)
                  }
                }}
                aria-label="Modo"
              >
                {MODE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="home-terminal-actions">
            <button
              type="button"
              onClick={() => fireQuickAction('new-terminal')}
              className="home-pill-button"
            >
              <Terminal className="size-3.5" /> Nuevo Terminal
            </button>
            <button
              type="button"
              onClick={() => fireQuickAction('new-project')}
              className="home-pill-button"
            >
              <FolderPlus className="size-3.5" /> Nuevo Proyecto
            </button>
            <button
              type="button"
              onClick={() => fireQuickAction('new-workspace')}
              className="home-pill-button is-accent"
            >
              <Plus className="size-3.5" /> Nuevo Workspace
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="home-stat-card">
          <FolderGit2 className="size-4 home-text-faint" />
          <strong className="text-lg home-text-strong">{reposCount}</strong>
          <span className="text-[11px] home-text-faint">repositorios</span>
        </div>
        <div className="home-stat-card">
          <Layers className="size-4 home-text-faint" />
          <strong className="text-lg home-text-strong">{worktreesCount}</strong>
          <span className="text-[11px] home-text-faint">workspaces</span>
        </div>
        <div className="home-stat-card">
          <Bot className="size-4 home-text-faint" />
          <strong className="text-lg home-text-strong">{sessionsCount}</strong>
          <span className="text-[11px] home-text-faint">sesiones</span>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="home-section-label">Proyectos recientes</div>
        {recentProjects.length === 0 ? (
          <div className="home-empty">Todavía no hay proyectos. Creá tu primer workspace.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpenProject?.(project)}
                className="home-project-card group"
              >
                <span className="home-project-icon">
                  <FolderGit2 className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="truncate text-[13px] font-semibold home-text-strong">
                    {project.name}
                  </span>
                  <span className="truncate text-[10px] home-text-faint">{project.path}</span>
                </span>
                <span className="home-project-meta">
                  <span>{project.worktreeCount} wt</span>
                  <span>{project.lastActiveLabel}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="home-section-label">Start something</div>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionRow
            icon={Terminal}
            label="Nuevo Terminal"
            shortcut="Ctrl+T"
            onClick={() => fireQuickAction('new-terminal')}
          />
          <QuickActionRow
            icon={Command}
            label="Paleta de comandos"
            shortcut="Ctrl+Shift+P"
            onClick={() => fireQuickAction('new-project')}
          />
          <QuickActionRow
            icon={Layers}
            label="Nuevo Workspace"
            shortcut="Ctrl+Shift+G"
            onClick={() => fireQuickAction('new-workspace')}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="home-section-label">Uso &amp; actividad</div>
        {agentUsage.length === 0 ? (
          <div className="home-empty">Sin actividad de agentes registrada.</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {agentUsage.map((usage) => (
              <div key={usage.id} className="home-usage-card">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold home-text-strong">
                    {usage.id === 'claude' ? (
                      <Bot className="size-3.5 text-[#f97316]" />
                    ) : usage.id === 'codex' ? (
                      <Terminal className="size-3.5 text-[#60a5fa]" />
                    ) : (
                      <Code2 className="size-3.5 text-[#a78bfa]" />
                    )}
                    {usage.name}
                  </span>
                  <span className={usage.status === 'live' ? 'home-live-badge' : 'home-idle-badge'}>
                    <span className="home-live-dot" />
                    {usage.status === 'live' ? 'live' : 'idle'}
                  </span>
                </div>
                <span className="truncate text-[10px] home-text-faint">{usage.model}</span>
                <div className="home-usage-track">
                  <span style={{ width: `${Math.min(100, Math.max(0, usage.percent))}%` }} />
                </div>
                <span className="text-[10px] tabular-nums home-text-muted">
                  {usage.percent}% de cuota
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </header>
  )
}
