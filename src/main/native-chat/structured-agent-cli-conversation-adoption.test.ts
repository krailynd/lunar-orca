import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLI_CONVERSATION_ADOPTING_AGENTS } from '../../shared/structured-agent-cli-conversation-adoption'
import {
  STRUCTURED_AGENT_RUNTIME_REGISTRATIONS,
  structuredAgentRuntimeRegistration
} from '../runtime/structured-agent-runtime-registrations'
import { resolveStructuredAgentSessionAdoptionForCreate } from '../runtime/structured-agent-session-create-adoption'
import { prepareLegacyTranscriptImport } from './agent-session-journal/journal-legacy-import'
import type { AgentSessionAccountHome } from '../../shared/agent-session-account-home'
import { writeOpenCodeSqliteDatabase } from '../ai-vault/session-scanner-opencode-sqlite-fixture'

// The OpenCode reader's worker, run in process.
vi.mock('../ai-vault/session-scanner-opencode-sqlite-worker-spawn', async (importOriginal) => {
  const query = await import('./transcript-opencode-sqlite-query')
  return {
    ...(await importOriginal<object>()),
    readOpenCodeTranscriptPageViaWorker: async (
      args: Parameters<typeof query.readOpenCodeTranscriptPage>[0]
    ) => query.readOpenCodeTranscriptPage(args),
    readOpenCodeTranscriptSignalViaWorker: async (args: { dbPath: string; sessionId: string }) =>
      query.readOpenCodeTranscriptSignal(args.dbPath, args.sessionId)
  }
})

const SESSION_ID = '0198c2a4-7d1e-7c3a-9a4b-1f2e3d4c5b6a'
let root: string | null = null

beforeEach(() => {
  // Grok and Pi also look where Session History lists them from; keep that off the real home.
  vi.stubEnv('GROK_HOME', join(tmpdir(), 'orca-adopt-no-grok-home'))
  vi.stubEnv('PI_CODING_AGENT_DIR', join(tmpdir(), 'orca-adopt-no-pi-home'))
})

afterEach(async () => {
  vi.unstubAllEnvs()
  if (root) {
    await rm(root, { recursive: true, force: true })
  }
  root = null
})

/** Each agent's CLI conversation as its own CLI lays it out under an account home. */
const RECORDED: Record<'grok' | 'omp' | 'pi', (home: string, text: string) => Promise<string>> = {
  grok: async (home, text) => {
    const dir = join(home, 'sessions', encodeURIComponent('/repo/orca'), SESSION_ID)
    await mkdir(dir, { recursive: true })
    const file = join(dir, 'chat_history.jsonl')
    await writeFile(
      file,
      `${JSON.stringify({ type: 'user', content: [{ type: 'text', text }], timestamp: '2026-10-12T00:00:00.000Z' })}\n`
    )
    return file
  },
  omp: async (home, text) => {
    const dir = join(home, 'sessions', '--repo-orca--')
    await mkdir(dir, { recursive: true })
    const file = join(dir, `2026-10-12T00-00-00-000Z_${SESSION_ID}.jsonl`)
    await writeFile(
      file,
      [
        {
          type: 'session',
          id: SESSION_ID,
          cwd: '/repo/orca',
          timestamp: '2026-10-12T00:00:00.000Z'
        },
        {
          type: 'message',
          id: 'rec-1',
          parentId: null,
          timestamp: '2026-10-12T00:00:01.000Z',
          message: { role: 'user', content: [{ type: 'text', text }] }
        }
      ]
        .map((record) => JSON.stringify(record))
        .join('\n')
    )
    return file
  },
  // Pi's documented format: a system message carries the prompt in `sections`, its content empty.
  pi: async (home, text) => {
    const dir = join(home, 'sessions', '--repo-orca--')
    await mkdir(dir, { recursive: true })
    const file = join(dir, `2026-10-12T00-00-00-000Z_${SESSION_ID}.jsonl`)
    const records = [
      { type: 'session', version: 3, id: SESSION_ID, cwd: '/repo/orca' },
      {
        type: 'message',
        id: 'a0b1c2d3',
        parentId: null,
        message: { role: 'system', content: '', sections: { preamble: 'You are Pi' } }
      },
      {
        type: 'message',
        id: 'a1b2c3d4',
        parentId: 'a0b1c2d3',
        message: { role: 'user', content: text, timestamp: 1_791_763_201_000 }
      },
      {
        type: 'message',
        id: 'b2c3d4e5',
        parentId: 'a1b2c3d4',
        message: { role: 'assistant', content: [{ type: 'text', text: 'Hi!' }], stopReason: 'stop' }
      }
    ]
    await writeFile(file, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
    return file
  }
}

const ACCOUNT_VARIABLE = {
  grok: 'GROK_HOME',
  omp: 'PI_CODING_AGENT_DIR',
  pi: 'PI_CODING_AGENT_DIR'
}

function adopt(
  agent: 'grok' | 'omp' | 'opencode' | 'pi',
  selectedAccountHome: AgentSessionAccountHome,
  providerSessionId = SESSION_ID
) {
  const transcriptImport = structuredAgentRuntimeRegistration(agent)?.transcriptImport
  if (!transcriptImport) {
    throw new Error(`${agent} registers no transcript import`)
  }
  return resolveStructuredAgentSessionAdoptionForCreate({
    host: null,
    settings: {},
    agent,
    transcriptImport,
    providerSessionId,
    selfSessionId: 'chat-1',
    selectedAccountHome
  })
}

describe('which chats can take over a CLI conversation', () => {
  it('maps exactly the row agents of the agents the host registers a transcript import for', () => {
    expect(
      Object.fromEntries(
        STRUCTURED_AGENT_RUNTIME_REGISTRATIONS.filter(
          (registration) => registration.transcriptImport
        ).flatMap((registration) =>
          registration.sessionHistory.rowAgents.map((row) => [row, registration.definition.agent])
        )
      )
    ).toEqual(CLI_CONVERSATION_ADOPTING_AGENTS)
  })
})

describe.each(['grok', 'omp', 'pi'] as const)('adopting a %s CLI conversation', (agent) => {
  it('finds the conversation under the chat account and imports its history', async () => {
    root = await mkdtemp(join(tmpdir(), `orca-${agent}-adopt-`))
    const recorded = await RECORDED[agent](root, `ORCA-${agent}-ADOPT`)

    const accountHome = { variable: ACCOUNT_VARIABLE[agent], path: root }
    const adoption = await adopt(agent, accountHome)

    expect(adoption).toEqual({ accountHome, transcriptPath: recorded })
    const imported = await prepareLegacyTranscriptImport({
      agent,
      sessionId: SESSION_ID,
      options: { filePath: adoption.transcriptPath }
    })
    expect(imported.ok && JSON.stringify(imported.items)).toContain(`ORCA-${agent}-ADOPT`)
  })

  it('refuses a conversation the account does not hold, rather than opening a blank chat', async () => {
    root = await mkdtemp(join(tmpdir(), `orca-${agent}-adopt-missing-`))
    await expect(
      adopt(agent, { variable: ACCOUNT_VARIABLE[agent], path: root })
    ).rejects.toMatchObject({
      refusal: { code: 'agent_session_identity_required' }
    })
  })
})

describe('adopting a Pi CLI conversation', () => {
  it("imports the conversation's turns, not the system prompt Pi records", async () => {
    root = await mkdtemp(join(tmpdir(), 'orca-pi-adopt-turns-'))
    const recorded = await RECORDED.pi(root, 'ORCA-pi-TURN')

    const imported = await prepareLegacyTranscriptImport({
      agent: 'pi',
      sessionId: SESSION_ID,
      options: { filePath: recorded }
    })

    expect(imported.ok && imported.items.map((item) => item.body)).toEqual([
      { kind: 'message', role: 'user', blocks: [{ type: 'text', text: 'ORCA-pi-TURN' }] },
      { kind: 'message', role: 'assistant', blocks: [{ type: 'text', text: 'Hi!' }] }
    ])
  })
})

describe('adopting an OpenCode CLI conversation', () => {
  const OPENCODE_SESSION = 'ses_orca_adopt'
  const unmanaged: AgentSessionAccountHome = { kind: 'opencode', locator: { kind: 'unmanaged' } }

  function openCodeData(home: string): string {
    vi.stubEnv('HOME', home)
    vi.stubEnv('USERPROFILE', home)
    vi.stubEnv('XDG_DATA_HOME', join(home, 'data'))
    vi.stubEnv('OPENCODE_DB', '')
    return join(home, 'data', 'opencode', 'opencode.db')
  }

  it("finds the conversation in the account's database and imports its history", async () => {
    root = await mkdtemp(join(tmpdir(), 'orca-opencode-adopt-'))
    const dbPath = openCodeData(root)
    writeOpenCodeSqliteDatabase(dbPath, [
      { id: OPENCODE_SESSION, turns: [{ role: 'user', parts: ['ORCA-opencode-ADOPT'] }] }
    ])

    const adoption = await adopt('opencode', unmanaged, OPENCODE_SESSION)

    expect(adoption).toEqual({ accountHome: unmanaged, transcriptPath: dbPath })
    const imported = await prepareLegacyTranscriptImport({
      agent: 'opencode',
      sessionId: OPENCODE_SESSION,
      options: { filePath: adoption.transcriptPath }
    })
    expect(imported.ok && JSON.stringify(imported.items)).toContain('ORCA-opencode-ADOPT')
  })

  it('refuses a conversation the database does not hold, or a missing database', async () => {
    root = await mkdtemp(join(tmpdir(), 'orca-opencode-adopt-missing-'))
    const dbPath = openCodeData(root)
    await expect(adopt('opencode', unmanaged, OPENCODE_SESSION)).rejects.toMatchObject({
      refusal: { code: 'agent_session_identity_required' }
    })

    writeOpenCodeSqliteDatabase(dbPath, [
      { id: 'ses_other', turns: [{ role: 'user', parts: ['another conversation'] }] }
    ])
    await expect(adopt('opencode', unmanaged, OPENCODE_SESSION)).rejects.toMatchObject({
      refusal: { code: 'agent_session_identity_required' }
    })
  })
})
