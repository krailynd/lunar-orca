import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { DashboardAgentRow } from '@/components/dashboard/useDashboardData'
import { normalizeRuntimePathForComparison } from '../../../../shared/cross-platform-path'
import type { HerdrAgentPresence } from '../../../../preload/api-types'
import { getIndexedWorktreeById } from '@/store/worktree-repo-index'
import { applyAgentRowLineage } from '@/components/dashboard/agent-row-lineage'
import { migrationUnsupportedToAgentStatusEntry } from '@/lib/migration-unsupported-agent-entry'
import { useAppStore } from '@/store'
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

export { buildWorktreeAgentRows } from './worktree-agent-rows'
export {
  selectLiveAgentStatusEntriesForWorktree,
  selectMigrationUnsupportedEntriesForWorktree,
  selectRuntimeAgentOrchestrationForWorktree,
  selectRetainedAgentEntriesForWorktree
} from './worktree-agent-row-selectors'

/**
 * Narrow per-worktree agent row hook used by the WorktreeCard inline agents
 * list. Produces live hook-reported agents plus retained "done" snapshots,
 * stale-decayed to 'idle' when the hook stream has gone quiet.
 *
 * Uses indexed per-worktree selectors rather than reusing useDashboardData's
 * cross-worktree aggregate. The index is rebuilt once per relevant immutable
 * store slice and then shared by every visible card, avoiding O(cards × agents)
 * selector work on high-frequency agent status pings.
 */
export function useWorktreeAgentRows(worktreeId: string, active = true): DashboardAgentRow[] {
  const selectAgentFreshness = useMemo(
    () => createWorktreeAgentFreshnessSelector(worktreeId),
    [worktreeId]
  )
  const tabs = useAppStore((s) => (active ? s.tabsByWorktree[worktreeId] : EMPTY_TABS))
  // Why: narrow the subscriptions to only THIS worktree's entries via
  // useShallow. Subscribing to the whole agentStatusByPaneKey map would make
  // every on-screen card re-render on any agent-status update anywhere —
  // O(worktrees²) render amplification. Pre-filtering here means the card
  // only re-renders when something relevant to THIS worktree changes.
  const liveEntries = useAppStore(
    useShallow((s) =>
      active ? selectLiveAgentStatusEntriesForWorktree(s, worktreeId) : EMPTY_LIVE_ENTRIES
    )
  )
  // Why: keep the store selector limited to stable raw records. Converting
  // migration entries creates fresh objects with Date.now(), which breaks
  // useSyncExternalStore's cached-snapshot contract and can blank Electron.
  const migrationUnsupported = useAppStore(
    useShallow((s) =>
      active
        ? selectMigrationUnsupportedEntriesForWorktree(s, worktreeId)
        : EMPTY_MIGRATION_UNSUPPORTED_ENTRIES
    )
  )
  const retained = useAppStore(
    useShallow((s) =>
      active ? selectRetainedAgentEntriesForWorktree(s, worktreeId) : EMPTY_RETAINED
    )
  )
  const runtimePaneTitlesByTabId = useAppStore(
    useShallow((s) =>
      active ? selectRuntimePaneTitlesForWorktree(s, worktreeId) : EMPTY_RUNTIME_PANE_TITLES
    )
  )
  const ptyIdsByTabId = useAppStore(
    useShallow((s) => (active ? selectLivePtyIdsForWorktree(s, worktreeId) : EMPTY_LIVE_PTY_IDS))
  )
  const terminalLayoutsByTabId = useAppStore(
    useShallow((s) =>
      active ? selectTerminalLayoutsForWorktree(s, worktreeId) : EMPTY_TERMINAL_LAYOUTS
    )
  )
  const runtimeAgentOrchestrationByPaneKey = useAppStore(
    useShallow((s) =>
      active
        ? selectRuntimeAgentOrchestrationForWorktree(s, worktreeId)
        : EMPTY_WORKTREE_AGENT_ORCHESTRATION
    )
  )
  const paneForegroundAgentByPaneKey = useAppStore(
    useShallow((s) =>
      active ? selectPaneForegroundAgentsForWorktree(s, worktreeId) : EMPTY_PANE_FOREGROUND_AGENTS
    )
  )
  const agentFreshnessSignature = useAppStore((s) =>
    active ? selectAgentFreshness(s) : EMPTY_WORKTREE_AGENT_FRESHNESS_SIGNATURE
  )

  return useMemo<DashboardAgentRow[]>(() => {
    if (!active) {
      return EMPTY_AGENT_ROWS
    }
    // Why: Date.now() is read inside the memo so stale-decay recalculates when
    // this worktree's freshness signature changes, even without new PTY data.
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
