import { useSyncExternalStore, useCallback, useMemo } from 'react'
import type {
  HerdrSessionSummary,
  HerdrPaneInfo,
  HerdrApi,
  PiSubagentTask
} from '../../../shared/herdr-types'

type WindowWithHerdr = {
  api?: {
    herdr?: HerdrApi
  }
}

type HerdrStoreState = {
  sessions: HerdrSessionSummary[]
  piSubagents: PiSubagentTask[]
}

let storeState: HerdrStoreState = {
  sessions: [],
  piSubagents: []
}

const listeners = new Set<() => void>()
let pollTimer: ReturnType<typeof setInterval> | null = null

function emitChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

async function fetchHerdrData(): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return
    }
    // SAFETY: window.api.herdr is injected into global scope by Electron preload contextBridge.
    const win = window as unknown as WindowWithHerdr
    const herdr = win.api?.herdr
    if (!herdr) {
      return
    }

    let nextSessions = storeState.sessions
    let nextSubagents = storeState.piSubagents
    let hasChanged = false

    if (herdr.listSessions) {
      const data = await herdr.listSessions()
      if (Array.isArray(data)) {
        nextSessions = data
        hasChanged = true
      }
    }

    if (herdr.listPiSubagents) {
      const subData = await herdr.listPiSubagents()
      if (Array.isArray(subData)) {
        nextSubagents = subData
        hasChanged = true
      }
    }

    if (hasChanged) {
      storeState = {
        sessions: nextSessions,
        piSubagents: nextSubagents
      }
      emitChange()
    }
  } catch {
    // ignore poll error
  }
}

function startPolling(): void {
  if (pollTimer !== null) {
    return
  }
  void fetchHerdrData()
  pollTimer = setInterval(() => {
    void fetchHerdrData()
  }, 2500)
}

function stopPolling(): void {
  if (listeners.size === 0 && pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  if (listeners.size === 1) {
    startPolling()
  }
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0) {
      stopPolling()
    }
  }
}

function getSnapshot(): HerdrStoreState {
  return storeState
}

export function useHerdrSessions(): {
  sessions: HerdrSessionSummary[]
  activeHerdrPanes: HerdrPaneInfo[]
  piSubagents: PiSubagentTask[]
  getPanesForWorktree: (worktreePath: string, worktreeName: string) => HerdrPaneInfo[]
  getPiSubagentsForWorktree: (worktreePath: string) => PiSubagentTask[]
  focusPane: (sessionName: string, paneId: string) => Promise<boolean>
  refresh: () => Promise<void>
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const sessions = state.sessions
  const piSubagents = state.piSubagents

  const activeHerdrPanes = useMemo(() => sessions.flatMap((s) => s.panes), [sessions])

  const focusPane = useCallback(async (sessionName: string, paneId: string) => {
    try {
      if (typeof window !== 'undefined') {
        // SAFETY: window.api.herdr is injected into global scope by Electron preload contextBridge.
        const win = window as unknown as WindowWithHerdr
        const herdr = win.api?.herdr
        if (herdr?.focusPane) {
          const res = await herdr.focusPane(sessionName, paneId)
          return Boolean(res?.success)
        }
      }
    } catch {
      // ignore
    }
    return false
  }, [])

  const getPanesForWorktree = useCallback(
    (worktreePath: string, worktreeName: string): HerdrPaneInfo[] => {
      if (!worktreePath && !worktreeName) {
        return []
      }

      const normalizedPath = worktreePath
        ? worktreePath.toLowerCase().replace(/\\/g, '/').replace(/\/$/, '')
        : ''
      const normalizedName = worktreeName.toLowerCase()

      return activeHerdrPanes.filter((pane) => {
        // 1. Filtrado prioritario y estricto por CWD real del pane
        if (pane.cwd) {
          const paneCwd = pane.cwd.toLowerCase().replace(/\\/g, '/').replace(/\/$/, '')
          if (
            normalizedPath &&
            (paneCwd === normalizedPath || paneCwd.startsWith(`${normalizedPath}/`))
          ) {
            return true
          }
        }

        // 2. Coincidencia por session_path normalizado si no hay cwd exacto
        if (pane.session_path && normalizedPath) {
          const sess = pane.session_path.toLowerCase()
          const sanitizedWtPath = normalizedPath.replace(/[^a-z0-9]/g, '-')
          if (sess.includes(sanitizedWtPath)) {
            return true
          }
        }

        // 3. Fallback estricto por nombre de worktree específico (solo si contiene el nombre completo y no genérico)
        if (pane.title && normalizedName.length > 2) {
          const titleLower = pane.title.toLowerCase()
          if (
            titleLower.includes(`- ${normalizedName}`) ||
            titleLower.endsWith(`/${normalizedName}`)
          ) {
            return true
          }
        }

        return false
      })
    },
    [activeHerdrPanes]
  )

  const getPiSubagentsForWorktree = useCallback(
    (worktreePath: string): PiSubagentTask[] => {
      if (!worktreePath) {
        return piSubagents
      }
      const normTarget = worktreePath.toLowerCase().replace(/\\/g, '/').replace(/\/$/, '')
      return piSubagents.filter((task) => {
        if (!task.cwd) {
          return true
        }
        const taskCwd = task.cwd.toLowerCase().replace(/\\/g, '/').replace(/\/$/, '')
        return taskCwd === normTarget || taskCwd.startsWith(`${normTarget}/`)
      })
    },
    [piSubagents]
  )

  return {
    sessions,
    activeHerdrPanes,
    piSubagents,
    getPanesForWorktree,
    getPiSubagentsForWorktree,
    focusPane,
    refresh: fetchHerdrData
  }
}
