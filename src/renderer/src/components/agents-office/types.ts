export type ProviderKind = 'anthropic' | 'openai' | 'demo'

export type Appearance = {
  skin: string
  hair: string
  hairStyle: 'short' | 'long' | 'bun' | 'cap' | 'bald' | 'curly'
  shirt: string
  pants: string
  accessory?: 'none' | 'glasses' | 'headphones'
}

export type Look = {
  src: string
  description: string
  createdAt: number
}

export type Agent = {
  id: string
  name: string
  role: string
  prompt?: string
  providerId?: string
  model?: string
  appearance: Appearance
  seat: number
  lead?: boolean
  tools?: boolean
  look?: Look
}

export type Seat = {
  x: number
  y: number
}

export type Point = Seat

export type Rect = {
  x: number
  y: number
  w: number
  h: number
}

export type Layout = {
  background: string
  width: number
  height: number
  entry: Seat
  seats: Seat[]
  lights?: Seat[]
  board?: Rect
  spots?: Seat[]
}

export type PublicOffice = {
  name: string
  agents: Agent[]
  layout: Layout
}

export type OfficeEffect =
  | { kind: 'sparkle'; x: number; y: number; color: string }
  | { kind: 'paper'; x: number; y: number; tx: number; ty: number; color: string }

export type Assignment = {
  agentId: string
  task: string
}

export type ToolName = string

export type PermissionDecision = 'allow' | 'always' | 'deny'

export type OfficeEvent =
  | { type: 'office'; office: PublicOffice }
  | { type: 'agent_said'; agentId: string; text: string; ms?: number }
  | { type: 'agent_working'; agentId: string; working: boolean }
  | { type: 'agent_thinking'; agentId: string; thinking: boolean }
  | { type: 'board'; title: string; text: string }
  | { type: 'run_start'; runId: string; text: string; target?: string | null }
  | { type: 'routing'; runId?: string; leadId: string }
  | { type: 'route'; runId?: string; leadId: string; note?: string; assignments: Assignment[] }
  | { type: 'agent_start'; runId?: string; agentId: string; task: string; from?: string | null }
  | { type: 'delta'; runId?: string; agentId: string; text: string }
  | { type: 'agent_done'; runId?: string; agentId: string; text?: string; tokens?: number }
  | { type: 'agent_error'; runId?: string; agentId: string; error: string }
  | {
      type: 'tool_call'
      runId?: string
      agentId: string
      callId?: string
      name: ToolName
      args?: Record<string, unknown>
      summary: string
    }
  | {
      type: 'permission_request'
      runId?: string
      agentId: string
      callId?: string
      name?: ToolName
      summary?: string
    }
  | {
      type: 'permission_resolved'
      runId?: string
      agentId: string
      callId?: string
      decision?: PermissionDecision
    }
  | {
      type: 'tool_result'
      runId?: string
      agentId: string
      callId?: string
      ok: boolean
      output?: string
    }
  | { type: 'run_done'; runId?: string }
