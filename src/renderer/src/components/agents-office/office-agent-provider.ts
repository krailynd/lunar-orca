import type { CharacterState, OfficeAgent } from './office-types'
import { AGENT_PALETTES } from './office-constants'

export function deriveOfficeAgentsFromStatus(
  liveAgents: {
    id: string
    name: string
    status: string
    currentTask?: string
    tool?: string
  }[]
): OfficeAgent[] {
  if (liveAgents.length === 0) {
    return [
      {
        id: 'agent-orchestrator',
        name: 'el Gentleman',
        role: 'Orchestrator',
        status: 'working',
        currentTask: 'Supervising Lunar Orca workspace',
        deskIndex: 0,
        color: AGENT_PALETTES[0],
        bubble: 'Trabajando en el entorno...',
        avatarType: 0,
        updatedAt: Date.now()
      },
      {
        id: 'agent-pi',
        name: 'Pi Agent',
        role: 'Subagent Worker',
        status: 'working',
        currentTask: 'Running ODD lifecycle & checks',
        deskIndex: 1,
        color: AGENT_PALETTES[1],
        avatarType: 1,
        updatedAt: Date.now()
      },
      {
        id: 'agent-hermes',
        name: 'Hermes Remote',
        role: 'Researcher',
        status: 'resting',
        currentTask: 'Idle in SahaCloud',
        deskIndex: 2,
        color: AGENT_PALETTES[2],
        avatarType: 2,
        updatedAt: Date.now()
      },
      {
        id: 'agent-opencode',
        name: 'OpenCode Specialist',
        role: 'Code Intelligence',
        status: 'idle',
        deskIndex: 3,
        color: AGENT_PALETTES[3],
        avatarType: 3,
        updatedAt: Date.now()
      }
    ]
  }

  return liveAgents.map((ag, index) => {
    let charState: CharacterState = 'idle'
    if (ag.status === 'working') {
      charState = 'working'
    } else if (ag.status === 'blocked') {
      charState = 'blocked'
    } else if (ag.status === 'waiting') {
      charState = 'waiting'
    } else if (ag.status === 'idle' || ag.status === 'done') {
      charState = 'resting'
    }

    return {
      id: ag.id || `agent-${index}`,
      name: ag.name || `Agent ${index + 1}`,
      role: ag.tool || 'Agent',
      status: charState,
      currentTask: ag.currentTask,
      deskIndex: index,
      color: AGENT_PALETTES[index % AGENT_PALETTES.length],
      avatarType: index % 6,
      updatedAt: Date.now()
    }
  })
}
