export type PiSubagentTask = {
  id: string
  agent: string
  label: string
  task: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt?: number
  finishedAt?: number
  cwd?: string
  mtime: number
}

export type HerdrPaneInfo = {
  pane_id: string
  workspace_id: string
  terminal_id: string
  title: string
  agent: string
  agent_status: string
  cwd: string
  foreground_cwd?: string
  focused: boolean
  model?: string
  tokens?: Record<string, string>
  session_path?: string
}

export type HerdrSessionSummary = {
  sessionName: string
  socketPath: string
  isRunning: boolean
  panes: HerdrPaneInfo[]
}

export type HerdrApi = {
  listSessions: () => Promise<HerdrSessionSummary[]>
  focusPane: (sessionName: string, paneId: string) => Promise<{ success: boolean; error?: string }>
  listPiSubagents: (targetCwd?: string) => Promise<PiSubagentTask[]>
}
