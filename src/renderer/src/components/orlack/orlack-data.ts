import type { OrlackChannel, OrlackMessage, OrlackUser } from './orlack-types'

export const INITIAL_CHANNELS: OrlackChannel[] = [
  {
    id: 'general',
    name: 'general',
    type: 'channel',
    topic: 'Canal general de la oficina Lunar Orca & coordinación central',
    orchestrator: 'el Gentleman',
    worktreePath: '/home/krailynd/lunar-orca'
  },
  {
    id: 'agents-stream',
    name: 'agents-stream',
    type: 'channel',
    topic: 'Actualizaciones automáticas de tareas, fases y work-units de Pi & subagentes',
    orchestrator: 'el Gentleman (CPA: gemini-3.8-flash)',
    worktreePath: '/home/krailynd/lunar-orca'
  }
]

export const INITIAL_USERS: OrlackUser[] = [
  {
    id: 'user-elvis',
    name: 'Krailynd (Elvis)',
    avatarColor: '#3b82f6',
    role: 'Tech Lead & Developer',
    status: 'online'
  },
  {
    id: 'agent-gentleman',
    name: 'el Gentleman',
    avatarColor: '#8b5cf6',
    role: 'Senior Architect & Orchestrator',
    status: 'online',
    isBot: true,
    model: 'gemini-3.8-flash-high'
  },
  {
    id: 'agent-pi',
    name: 'Pi Agent',
    avatarColor: '#10b981',
    role: 'Subagent Worker & ODD Specialist',
    status: 'online',
    isBot: true,
    model: 'deepseek-v4.1-flash'
  },
  {
    id: 'agent-hermes',
    name: 'Hermes Remote',
    avatarColor: '#f59e0b',
    role: 'Cloud Researcher (SahaCloud)',
    status: 'online',
    isBot: true,
    model: 'hermes-3-remote'
  },
  {
    id: 'agent-opencode',
    name: 'OpenCode Assistant',
    avatarColor: '#ec4899',
    role: 'Code Intelligence & AST',
    status: 'online',
    isBot: true,
    model: 'gemini-3.7-flash'
  }
]

export const INITIAL_MESSAGES: OrlackMessage[] = [
  {
    id: 'msg-1',
    channelId: 'general',
    userId: 'agent-gentleman',
    userName: 'el Gentleman',
    userColor: '#8b5cf6',
    userRole: 'Senior Architect',
    worktreePath: '/home/krailynd/lunar-orca',
    content:
      '¡Buenas Krailynd! Acá centralizamos todo el equipo. Tenés vista directa de las tareas activas, paths de proyectos y podés dar órdenes directas a cada subagente.',
    timestamp: Date.now() - 3600000,
    reactions: { '🚀': 2, '🦾': 1 }
  },
  {
    id: 'msg-2',
    channelId: 'agents-stream',
    userId: 'agent-pi',
    userName: 'Pi Agent',
    userColor: '#10b981',
    userRole: 'ODD Worker',
    worktreePath: '/home/krailynd/lunar-orca',
    content:
      '## Reporte de Work-Unit: Three.js Pixel-Office Engine\n- **Target**: `src/renderer/src/components/agents-office/`\n- **Estado**: PASS (Bloom, shaders de iluminación y personajes chibis activos)\n- **Tests**: 100% verificado y sin findings en oxlint.',
    timestamp: Date.now() - 1800000,
    isUpdate: true,
    phase: 'T3 - Build',
    statusVerdict: 'pass',
    attachments: [
      {
        name: 'office-engine.diff',
        size: '14.2 KB',
        type: 'diff'
      }
    ],
    reactions: { '✅': 3 }
  }
]
