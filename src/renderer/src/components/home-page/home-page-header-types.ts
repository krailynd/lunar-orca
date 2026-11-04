export type HomeQuickAction = 'new-terminal' | 'new-project' | 'new-workspace' | 'launch' | 'mode'

export type RecentProject = {
  id: string
  name: string
  path: string
  terminalCount: number
  worktreeCount: number
  lastActiveLabel: string
}

export type HomeAgentUsage = {
  id: string
  name: string
  model: string
  percent: number
  status: 'live' | 'idle'
}

export type HomePageHeaderProps = {
  reposCount: number
  worktreesCount: number
  sessionsCount: number
  onNewWorkspace: () => void
  userName?: string
  recentProjects?: RecentProject[]
  agentUsage?: HomeAgentUsage[]
  onQuickAction?: (action: HomeQuickAction) => void
  onSubmitPrompt?: (prompt: string) => void
  onOpenProject?: (project: RecentProject) => void
}

export const AGENT_OPTIONS = ['Pi', 'Claude', 'Codex', 'OpenCode', 'Agy'] as const
export const MODE_OPTIONS = ['Chat', 'Tarea', 'Autónomo'] as const

export type AgentOption = (typeof AGENT_OPTIONS)[number]
export type ModeOption = (typeof MODE_OPTIONS)[number]

export function isAgentOption(value: string): value is AgentOption {
  return AGENT_OPTIONS.some((option) => option === value)
}

export function isModeOption(value: string): value is ModeOption {
  return MODE_OPTIONS.some((option) => option === value)
}

export function greetingForHour(hour: number): string {
  if (hour < 6) {
    return 'Buenas noches'
  }
  if (hour < 13) {
    return 'Buenos días'
  }
  if (hour < 20) {
    return 'Buenas tardes'
  }
  return 'Buenas noches'
}

export const EMPTY_PROJECTS: RecentProject[] = []
export const EMPTY_USAGE: HomeAgentUsage[] = []

export function formatClock(date: Date): { day: string; time: string } {
  const day = new Intl.DateTimeFormat('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
    .format(date)
    .replace(/\./g, '')
  const time = new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
  return { day, time }
}
