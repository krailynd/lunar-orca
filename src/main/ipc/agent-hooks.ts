import { ipcMain } from 'electron'
import { runProcess } from '../../shared/child-process/run-process'
import type {
  AgentStatusIpcPayload,
  MigrationUnsupportedPtyEntry
} from '../../shared/agent-status-types'
import type { AgentInterruptInferenceRequest } from '../../shared/agent-interrupt-intent'
import type { AgentQuestionAnsweredInferenceRequest } from '../../shared/agent-question-answered-intent'
import { agentHookServer } from '../agent-hooks/server'
import { getMigrationUnsupportedPtySnapshot } from '../agent-hooks/migration-unsupported-pty-state'
import { registerAgentPaneAuthorityIpcHandlers } from './agent-pane-authority-ipc'
import { registerAgentStatusRowTeardownIpcHandlers } from './agent-status-row-teardown-ipc'
import { createAgentPaneAuthorityOwnership } from './agent-pane-authority-ownership'
import {
  enrichAgentStatusIpcPayload,
  type AgentStatusRuntimeEnrichment
} from './agent-status-ipc-boundary'

type AgentHookHandlerDependencies = {
  getPtyIdForPaneKey?: (paneKey: string) => string | undefined
}

// ─── Herdr agent presence sync ───────────────────────────────────────────────
// Herdr is an external terminal multiplexer that manages its own agents outside
// Orca PTYs. It cannot deliver Orca hook events, so its presence is polled from
// `herdr agent list` and surfaced read-only. Every field is validated at the
// boundary because the payload is untrusted external output.

const HERDR_AGENT_POLL_INTERVAL_MS = 4_000
const HERDR_AGENT_LIST_TIMEOUT_MS = 3_000
const HERDR_AGENT_OUTPUT_MAX_BYTES = 256 * 1024

export type HerdrAgentStatus = 'working' | 'blocked' | 'waiting' | 'done' | 'idle' | 'unknown'

/** One Herdr-managed agent, normalized from an untrusted `herdr agent list` payload. */
export type HerdrAgentPresence = {
  agent: string
  status: HerdrAgentStatus
  cwd: string
  workspaceId: string | null
  paneId: string | null
  terminalTitle: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readTrimmedString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function normalizeHerdrAgentStatus(value: unknown): HerdrAgentStatus {
  switch (value) {
    case 'working':
    case 'blocked':
    case 'waiting':
    case 'done':
    case 'idle':
      return value
    default:
      return 'unknown'
  }
}

/** Pure parser for the `herdr agent list` envelope. Malformed entries are dropped, never thrown. */
export function parseHerdrAgentList(raw: unknown): HerdrAgentPresence[] {
  if (!isRecord(raw) || !isRecord(raw.result) || !Array.isArray(raw.result.agents)) {
    return []
  }
  const agents: HerdrAgentPresence[] = []
  for (const entry of raw.result.agents) {
    if (!isRecord(entry)) {
      continue
    }
    const agent = readTrimmedString(entry.agent)
    const cwd = readTrimmedString(entry.cwd)
    if (agent === null || cwd === null) {
      continue
    }
    agents.push({
      agent,
      status: normalizeHerdrAgentStatus(entry.agent_status),
      cwd,
      workspaceId: readTrimmedString(entry.workspace_id),
      paneId: readTrimmedString(entry.pane_id),
      terminalTitle: readTrimmedString(entry.terminal_title_stripped)
    })
  }
  return agents
}

let herdrAgents: HerdrAgentPresence[] = []
let herdrPollTimer: ReturnType<typeof setInterval> | null = null
let herdrPollInFlight = false
let herdrUnavailable = false

/** Latest Herdr presence snapshot. Empty until the first successful poll. */
export function getHerdrAgentSnapshot(): HerdrAgentPresence[] {
  return herdrAgents
}

async function pollHerdrAgentsOnce(): Promise<void> {
  if (herdrPollInFlight || herdrUnavailable) {
    return
  }
  herdrPollInFlight = true
  try {
    const result = await runProcess(
      {
        program: 'herdr',
        args: ['pane', 'list'],
        timeoutMs: HERDR_AGENT_LIST_TIMEOUT_MS,
        maxOutputBytes: HERDR_AGENT_OUTPUT_MAX_BYTES
      },
      'tail'
    )
    if (result.code !== 0) {
      herdrAgents = []
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(result.stdout)
    } catch {
      herdrAgents = []
      return
    }
    if (isRecord(parsed) && isRecord(parsed.result) && Array.isArray(parsed.result.panes)) {
      const panes = parsed.result.panes
      const extracted: HerdrAgentPresence[] = []
      for (const p of panes) {
        if (!isRecord(p)) {
          continue
        }
        const agent = readTrimmedString(p.agent)
        const cwd = readTrimmedString(p.cwd)
        if (agent && cwd) {
          extracted.push({
            agent,
            status: normalizeHerdrAgentStatus(p.agent_status),
            cwd,
            workspaceId: readTrimmedString(p.workspace_id),
            paneId: readTrimmedString(p.pane_id),
            terminalTitle: readTrimmedString(p.terminal_title_stripped)
          })
        }
      }
      herdrAgents = extracted
    } else {
      herdrAgents = parseHerdrAgentList(parsed)
    }
  } catch {
    // Why: a missing `herdr` binary rejects on spawn; stop polling instead of
    // retrying a guaranteed failure every interval.
    herdrUnavailable = true
    herdrAgents = []
  } finally {
    herdrPollInFlight = false
  }
}

/** Starts the Herdr presence poller once. Safe to call on every handler registration. */
export function startHerdrAgentPolling(): void {
  if (herdrPollTimer !== null) {
    return
  }
  herdrPollTimer = setInterval(() => {
    void pollHerdrAgentsOnce()
  }, HERDR_AGENT_POLL_INTERVAL_MS)
  // Why: never hold the process open on a background sync poll.
  herdrPollTimer.unref?.()
  void pollHerdrAgentsOnce()
}

/** Stops the poller and clears the snapshot. */
export function stopHerdrAgentPolling(): void {
  if (herdrPollTimer !== null) {
    clearInterval(herdrPollTimer)
    herdrPollTimer = null
  }
  herdrAgents = []
}

// Why: install/remove are intentionally not exposed to the renderer. Orca
// auto-installs managed hooks at app startup (see src/main/index.ts), so a
// renderer-triggered remove would be silently reverted on the next launch
// and mislead the user.
export function registerAgentHookHandlers(
  runtime?: AgentStatusRuntimeEnrichment,
  dependencies: AgentHookHandlerDependencies = {}
): void {
  // Why: matches the defensive pattern in src/main/ipc/pty.ts so re-registration
  // never throws "Attempted to register a second handler..." if this function is
  // ever invoked more than once (e.g. the macOS app re-activation path that
  // recreates the main window). Today the module-level `registered` guard in
  // register-core-handlers.ts prevents re-entry, but decoupling from that guard
  // future-proofs this file.
  ipcMain.removeHandler('agentStatus:getSnapshot')
  ipcMain.removeHandler('agentStatus:inferInterrupt')
  ipcMain.removeHandler('agentStatus:inferQuestionAnswered')
  ipcMain.removeHandler('agentStatus:hasVerifiableAgentProcess')
  ipcMain.removeHandler('agentStatus:getMigrationUnsupportedSnapshot')
  registerAgentStatusRowTeardownIpcHandlers()
  registerAgentPaneAuthorityIpcHandlers({
    ownsPty: createAgentPaneAuthorityOwnership({
      getPtyIdForPaneKey: dependencies.getPtyIdForPaneKey,
      getRuntimeTerminalHandleForPaneKey: (paneKey) =>
        runtime?.getAgentStatusTerminalHandleForPaneKey(paneKey)
    })
  })
  ipcMain.handle('agentStatus:getSnapshot', (): AgentStatusIpcPayload[] => {
    // Why: the renderer pulls this after workspace hydration, so startup cannot
    // lose replayed statuses while its local store is still empty. Match the
    // live push enrichment in main/index.ts so parent/child rows survive replay.
    return (
      agentHookServer
        .getStatusSnapshot()
        // Same rule as the live push: the renderer's feed bridge owns structured rows for now.
        .filter((entry) => entry.structuredHost === undefined)
        .map((entry) => enrichAgentStatusIpcPayload(entry, runtime))
    )
  })
  ipcMain.handle('agentStatus:inferInterrupt', (_event, request: unknown): boolean => {
    if (typeof request !== 'object' || request === null) {
      return false
    }
    return agentHookServer.inferInterrupt(request as AgentInterruptInferenceRequest)
  })
  ipcMain.handle('agentStatus:inferQuestionAnswered', (_event, request: unknown): boolean => {
    if (typeof request !== 'object' || request === null) {
      return false
    }
    return agentHookServer.inferQuestionAnswered(request as AgentQuestionAnsweredInferenceRequest)
  })
  ipcMain.handle('agentStatus:hasVerifiableAgentProcess', (_event, paneKey: unknown): boolean =>
    typeof paneKey === 'string' ? agentHookServer.hasVerifiableAgentProcess(paneKey) : false
  )
  ipcMain.handle(
    'agentStatus:getMigrationUnsupportedSnapshot',
    (): MigrationUnsupportedPtyEntry[] => getMigrationUnsupportedPtySnapshot()
  )
  ipcMain.removeHandler('agentStatus:getHerdrAgents')
  ipcMain.handle('agentStatus:getHerdrAgents', (): HerdrAgentPresence[] => getHerdrAgentSnapshot())
  startHerdrAgentPolling()
}
