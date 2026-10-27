import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { DashboardAgentRow } from '@/components/dashboard/useDashboardData'
import { normalizeRuntimePathForComparison } from '../../../../shared/cross-platform-path'
import type { HerdrAgentPresence } from '../../../../preload/api-types'
import { getIndexedWorktreeById } from '@/store/worktree-repo-index'
import { applyAgentRowLineage } from '@/components/dashboard/agent-row-lineage'
import { migrationUnsupportedToAgentStatusEntry } from '../../../../shared/migration-unsupported-agent-entry'
import { useAppStore } from '@/store'
import type { AppState } from '@/store/types'
import {
  EMPTY_LIVE_PTY_IDS,
  EMPTY_PANE_FOREGROUND_AGENTS,
  EMPTY_RUNTIME_PANE_TITLES,
  selectLivePtyIdsForWorktree,
  selectPaneForegroundAgentsForWorktree,
  selectRuntimePaneTitlesForWorktree
} from './worktree-card-status-inputs'
import { buildWorktreeAgentRows } from './worktree-agent-rows'
import {
  EMPTY_LIVE_ENTRIES,
  EMPTY_MIGRATION_UNSUPPORTED_ENTRIES,
  EMPTY_RETAINED,
  EMPTY_TERMINAL_LAYOUTS,
  selectLiveAgentStatusEntriesForWorktree,
  selectMigrationUnsupportedEntriesForWorktree,
  selectRuntimeAgentOrchestrationForWorktree,
  selectRetainedAgentEntriesForWorktree,
  selectTerminalLayoutsForWorktree
} from './worktree-agent-row-selectors'
import { EMPTY_WORKTREE_AGENT_ORCHESTRATION } from './worktree-agent-orchestration-index'
import { EMPTY_TABS } from './WorktreeCardHelpers'
import {
  createWorktreeAgentFreshnessSelector,
  EMPTY_WORKTREE_AGENT_FRESHNESS_SIGNATURE
} from './worktree-agent-freshness-selector'

// Why frozen: shared by every inactive card, and callers only read these rows.
// SAFETY: empty readonly tuple is the canonical empty result; no caller mutates or indexes it.
const EMPTY_AGENT_ROWS = Object.freeze([]) as unknown as DashboardAgentRow[]
const subscribeToNothing = (): (() => void) => () => {}

export { buildWorktreeAgentRows } from './worktree-agent-rows'
export {
  selectLiveAgentStatusEntriesForWorktree,
  selectMigrationUnsupportedEntriesForWorktree,
  selectRuntimeAgentOrchestrationForWorktree,
  selectRetainedAgentEntriesForWorktree
} from './worktree-agent-row-selectors'

/** Share indexed worktree inputs across cards; derive live/retained row freshness from the available evidence. */
export function useWorktreeAgentRows(worktreeId: string, active = true): DashboardAgentRow[] {
  const selectInputs = useMemo(() => {
    const selectAgentFreshness = createWorktreeAgentFreshnessSelector(worktreeId)
    const readInputs = (state: AppState) =>
      [
        active ? state.tabsByWorktree[worktreeId] : EMPTY_TABS,
        active ? selectLiveAgentStatusEntriesForWorktree(state, worktreeId) : EMPTY_LIVE_ENTRIES,
        active
          ? selectMigrationUnsupportedEntriesForWorktree(state, worktreeId)
          : EMPTY_MIGRATION_UNSUPPORTED_ENTRIES,
        active ? selectRetainedAgentEntriesForWorktree(state, worktreeId) : EMPTY_RETAINED,
        active ? selectRuntimePaneTitlesForWorktree(state, worktreeId) : EMPTY_RUNTIME_PANE_TITLES,
        active ? selectLivePtyIdsForWorktree(state, worktreeId) : EMPTY_LIVE_PTY_IDS,
        active ? selectTerminalLayoutsForWorktree(state, worktreeId) : EMPTY_TERMINAL_LAYOUTS,
        active
          ? selectRuntimeAgentOrchestrationForWorktree(state, worktreeId)
          : EMPTY_WORKTREE_AGENT_ORCHESTRATION,
        active
          ? selectPaneForegroundAgentsForWorktree(state, worktreeId)
          : EMPTY_PANE_FOREGROUND_AGENTS,
        active ? selectAgentFreshness(state) : EMPTY_WORKTREE_AGENT_FRESHNESS_SIGNATURE
      ] as const
    let previous: ReturnType<typeof readInputs> | undefined
    return (state: AppState) => {
      if (!active && previous) {
        return previous
      }
      const next = readInputs(state)
      // The indexed selectors preserve equal records; compare references without allocating shallow-comparison maps.
      if (previous && next.every((value, index) => Object.is(value, previous?.[index]))) {
        return previous
      }
      previous = next
      return next
    }
  }, [worktreeId, active])
  const getInputs = useCallback(() => selectInputs(useAppStore.getState()), [selectInputs])
  const [
    tabs,
    liveEntries,
    migrationUnsupported,
    retained,
    runtimePaneTitlesByTabId,
    ptyIdsByTabId,
    terminalLayoutsByTabId,
    runtimeAgentOrchestrationByPaneKey,
    paneForegroundAgentByPaneKey,
    agentFreshnessSignature
  ] = useSyncExternalStore(
    active ? useAppStore.subscribe : subscribeToNothing,
    getInputs,
    getInputs
  )

  return useMemo<DashboardAgentRow[]>(() => {
    if (!active) {
      return EMPTY_AGENT_ROWS
    }
    // Read time inside the freshness-keyed memo so rows expire without new PTY data.
    const now = Date.now()
    const entries =
      migrationUnsupported.length > 0
        ? [
            ...liveEntries,
            ...migrationUnsupported.flatMap((unsupported) => {
              const entry = migrationUnsupportedToAgentStatusEntry(unsupported)
              return entry ? [entry] : []
            })
          ]
        : liveEntries
    return applyAgentRowLineage(
      buildWorktreeAgentRows({
        tabs: tabs ?? EMPTY_TABS,
        entries,
        retained,
        runtimePaneTitlesByTabId,
        ptyIdsByTabId,
        terminalLayoutsByTabId,
        runtimeAgentOrchestrationByPaneKey,
        paneForegroundAgentByPaneKey,
        now
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    tabs,
    liveEntries,
    migrationUnsupported,
    retained,
    runtimePaneTitlesByTabId,
    ptyIdsByTabId,
    terminalLayoutsByTabId,
    runtimeAgentOrchestrationByPaneKey,
    paneForegroundAgentByPaneKey,
    agentFreshnessSignature
  ])
}

const HERDR_AGENT_POLL_INTERVAL_MS = 4_000

/** A Herdr agent attributed to one worktree, with the local first-seen clock used for its age. */
export type HerdrAgentRow = HerdrAgentPresence & { firstSeenAt: number }

const EMPTY_HERDR_AGENT_ROWS: HerdrAgentRow[] = []

function herdrAgentIdentity(agent: HerdrAgentPresence): string {
  return agent.paneId ?? agent.workspaceId ?? `${agent.agent}::${agent.cwd}`
}

function compareHerdrAgentRows(left: HerdrAgentRow, right: HerdrAgentRow): number {
  if (left.firstSeenAt !== right.firstSeenAt) {
    return left.firstSeenAt - right.firstSeenAt
  }
  return herdrAgentIdentity(left).localeCompare(herdrAgentIdentity(right))
}

/**
 * Read-only Herdr agent rows for one worktree. Herdr runs agents outside Orca
 * PTYs, so main polls `herdr agent list`; this hook pulls that snapshot and
 * attributes a row to the worktree whose path equals the agent's `cwd`.
 */
export function useHerdrAgentsForWorktree(worktreeId: string, active = true): HerdrAgentRow[] {
  const worktreePath = useAppStore((s) =>
    active ? (getIndexedWorktreeById(s.worktreesByRepo, worktreeId)?.path ?? null) : null
  )
  const [rows, setRows] = useState<HerdrAgentRow[]>(EMPTY_HERDR_AGENT_ROWS)
  const firstSeenRef = useRef(new Map<string, number>())
  const signatureRef = useRef('')

  useEffect(() => {
    if (!active || worktreePath === null) {
      firstSeenRef.current = new Map()
      signatureRef.current = ''
      setRows(EMPTY_HERDR_AGENT_ROWS)
      return
    }
    const worktreePathKey = normalizeRuntimePathForComparison(worktreePath)
    let cancelled = false
    const poll = async (): Promise<void> => {
      const fetchHerdrAgents = window.api.agentStatus.getHerdrAgents
      if (fetchHerdrAgents === undefined) {
        return
      }
      let snapshot: HerdrAgentPresence[]
      try {
        snapshot = await fetchHerdrAgents()
      } catch {
        snapshot = []
      }
      if (cancelled) {
        return
      }
      const now = Date.now()
      const nextFirstSeen = new Map<string, number>()
      const nextRows: HerdrAgentRow[] = []
      for (const agent of snapshot) {
        const agentCwd = normalizeRuntimePathForComparison(agent.cwd)
        // Only match if the agent is inside this worktree path, NOT the reverse!
        // Previously `worktreePathKey.startsWith(agentCwd)` caused any agent running in
        // parent dirs like `/home/krailynd` to leak into every single worktree below it.
        const isMatch =
          agentCwd === worktreePathKey ||
          agentCwd.startsWith(`${worktreePathKey}/`) ||
          (agent.workspaceId && worktreeId.includes(agent.workspaceId))

        if (!isMatch) {
          continue
        }
        const identity = herdrAgentIdentity(agent)
        const firstSeenAt = firstSeenRef.current.get(identity) ?? now
        nextFirstSeen.set(identity, firstSeenAt)
        nextRows.push({ ...agent, firstSeenAt })
      }
      nextRows.sort(compareHerdrAgentRows)
      firstSeenRef.current = nextFirstSeen
      const signature = nextRows
        .map((row) => `${herdrAgentIdentity(row)}:${row.status}:${row.firstSeenAt}`)
        .join('|')
      if (signature === signatureRef.current) {
        return
      }
      signatureRef.current = signature
      setRows(nextRows.length === 0 ? EMPTY_HERDR_AGENT_ROWS : nextRows)
    }
    void poll()
    const timer = window.setInterval(() => {
      void poll()
    }, HERDR_AGENT_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [active, worktreeId, worktreePath])

  return rows
}
