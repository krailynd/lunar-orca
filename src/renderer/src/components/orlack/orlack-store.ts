import type { OrlackChannel, OrlackMessage } from './orlack-types'
import { INITIAL_MESSAGES } from './orlack-data'

type Listener = (messages: OrlackMessage[]) => void

class OrlackStore {
  private messages: OrlackMessage[] = [...INITIAL_MESSAGES]
  private listeners = new Set<Listener>()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('lunar-orca:orlack:messages')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messages = parsed
        }
      }
    } catch {
      // Ignorar errores de parseo
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('lunar-orca:orlack:messages', JSON.stringify(this.messages.slice(-200)))
    } catch {
      // Ignorar quota errors
    }
  }

  getMessages(): OrlackMessage[] {
    return this.messages
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    this.saveToStorage()
    for (const l of this.listeners) {
      l(this.messages)
    }
  }

  addMessage(msg: OrlackMessage): void {
    this.messages = [...this.messages, msg]
    this.notify()
  }

  addWorkUnitReport(args: {
    channelId: string
    agentId: string
    agentName: string
    agentColor: string
    agentRole?: string
    worktreePath: string
    sessionId?: string
    taskTitle: string
    summary: string
    filesModified?: string[]
    verdict?: 'pass' | 'fail' | 'working'
    phase?: string
  }): void {
    const content = [
      `### 📋 Reporte de Finalización: ${args.taskTitle}`,
      `- **Agente**: ${args.agentName} (\`${args.agentRole || 'Worker'}\`)`,
      `- **Proyecto / Worktree**: \`${args.worktreePath}\``,
      args.sessionId ? `- **Sesión Pi**: \`${args.sessionId}\`` : '',
      `- **Veredicto ODD**: **${(args.verdict || 'PASS').toUpperCase()}**`,
      '',
      `#### Resumen de Ejecución`,
      args.summary,
      '',
      args.filesModified && args.filesModified.length > 0
        ? `#### Archivos Verificados\n${args.filesModified.map((f) => `- \`${f}\``).join('\n')}`
        : ''
    ]
      .filter(Boolean)
      .join('\n')

    const message: OrlackMessage = {
      id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channelId: args.channelId,
      userId: args.agentId,
      userName: args.agentName,
      userColor: args.agentColor,
      userRole: args.agentRole || 'Worker',
      content,
      timestamp: Date.now(),
      worktreePath: args.worktreePath,
      sessionId: args.sessionId,
      isUpdate: true,
      phase: args.phase || 'Work Unit',
      statusVerdict: args.verdict || 'pass',
      reactions: { '✅': 1, '🚀': 1 }
    }

    this.addMessage(message)
  }
}

export const orlackStore = new OrlackStore()

export function resolveChannelForWorktree(
  channels: OrlackChannel[],
  worktreeNameOrPath: string
): OrlackChannel {
  const norm = worktreeNameOrPath.toLowerCase()
  if (norm.includes('sis_venta') || norm.includes('venta')) {
    return channels.find((c) => c.id === 'sis-ventas-2.0') || channels[0]
  }
  if (norm.includes('htb') || norm.includes('hack')) {
    return channels.find((c) => c.id === 'htb-workspace') || channels[0]
  }
  return channels.find((c) => c.id === 'general') || channels[0]
}
