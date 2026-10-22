import type { AiVaultSession } from '../../../../shared/ai-vault-types'
import { orlackStore } from './orlack-store'
import { officeEventBus } from '../agents-office/office-event-bus'

function extractText(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }
  if (Array.isArray(content)) {
    const textParts = content
      .filter((c) => c && typeof c === 'object' && c.type === 'text' && typeof c.text === 'string')
      .map((c) => c.text)
    return textParts.join('\n')
  }
  return ''
}

function decodeBase64Utf8(base64: string): string {
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return atob(base64)
  }
}

const loadedSessionFilePaths = new Set<string>()

export async function loadPiSessionsForChannel(
  channelId: string,
  worktreePath?: string
): Promise<void> {
  if (!window.api?.aiVault?.listSessions) {
    return
  }

  try {
    const result = await window.api.aiVault.listSessions({ executionHostScope: 'local' })
    if (!result?.sessions || result.sessions.length === 0) {
      return
    }

    const normPath = (worktreePath || '').toLowerCase().trim()
    const normChannel = channelId.toLowerCase().trim()

    // Encontrar sesiones de Pi pertenecientes al proyecto/canal actual
    const matchingSessions = result.sessions.filter((s: AiVaultSession) => {
      const sCwd = (s.cwd || '').toLowerCase().trim()
      const sFile = (s.filePath || '').toLowerCase().trim()
      const sTitle = (s.title || '').toLowerCase().trim()

      if (normPath && sCwd && (sCwd.includes(normPath) || normPath.includes(sCwd))) {
        return true
      }
      if (
        sFile.includes(normChannel) ||
        sCwd.includes(normChannel) ||
        sTitle.includes(normChannel)
      ) {
        return true
      }
      return false
    })

    if (matchingSessions.length === 0) {
      return
    }

    for (const session of matchingSessions) {
      const filePath = session.filePath
      if (!filePath || loadedSessionFilePaths.has(filePath)) {
        continue
      }

      loadedSessionFilePaths.add(filePath)

      // 1. Si tenemos previewMessages, cargamos de inmediato
      const shortSessionId = (session.sessionId || session.id || '').slice(0, 8)
      if (session.previewMessages && session.previewMessages.length > 0) {
        for (let idx = 0; idx < session.previewMessages.length; idx++) {
          const prev = session.previewMessages[idx]
          const isUser = prev.role === 'user'
          const previewMsgId = `prev-${shortSessionId}-${idx}`

          orlackStore.addMessage({
            id: previewMsgId,
            channelId,
            userId: isUser ? 'elvis' : 'mate',
            userName: isUser ? 'Krailynd' : 'Mate (el Gentleman)',
            userColor: isUser ? '#0ea5e9' : '#8b5cf6',
            userRole: isUser ? 'Lead Developer' : 'Líder Orquestador',
            content: prev.text,
            timestamp: session.modifiedAt ? new Date(session.modifiedAt).getTime() : Date.now(),
            worktreePath: session.cwd || worktreePath,
            sessionId: shortSessionId
          })
        }
      }

      // 2. Leer el transcript completo del archivo .jsonl vía readLocalLogTail si está disponible
      if (window.api?.fs?.readLocalLogTail) {
        try {
          const tailResult = await window.api.fs.readLocalLogTail({
            filePath,
            fromByteOffset: 0
          })

          if (tailResult?.contentBase64) {
            const rawText = decodeBase64Utf8(tailResult.contentBase64)
            const lines = rawText.trim().split('\n')
            let currentSessionId = shortSessionId

            for (let i = 0; i < lines.length; i++) {
              try {
                const record = JSON.parse(lines[i])
                if (record.type === 'session' && record.id) {
                  currentSessionId = String(record.id).slice(0, 8)
                }

                if (record.type === 'message') {
                  const msg = record.message
                  if (!msg) {
                    continue
                  }

                  const ts = record.timestamp ? new Date(record.timestamp).getTime() : Date.now()

                  if (msg.role === 'user') {
                    const text = extractText(msg.content)
                    if (text && text.trim()) {
                      orlackStore.addMessage({
                        id: `pi-usr-${record.id || i}-${currentSessionId}`,
                        channelId,
                        userId: 'elvis',
                        userName: 'Krailynd',
                        userColor: '#0ea5e9',
                        userRole: 'Lead Developer',
                        content: text.trim(),
                        timestamp: ts,
                        worktreePath: session.cwd || worktreePath,
                        sessionId: currentSessionId
                      })
                    }
                  } else if (msg.role === 'assistant') {
                    // Verificar si delegó a un subagente
                    const toolCalls = Array.isArray(msg.content)
                      ? msg.content.filter((c) => c && c.type === 'toolCall')
                      : []
                    const subagentRun = toolCalls.find((tc) => tc.name === 'subagent_run')

                    if (subagentRun) {
                      const args = subagentRun.arguments || {}
                      const agentName = args.agent || 'subagente'
                      const label = args.label || 'Ejecución ODD'
                      const task = args.task || ''

                      orlackStore.addMessage({
                        id: `pi-del-${subagentRun.id || i}-${currentSessionId}`,
                        channelId,
                        userId: 'mate',
                        userName: 'Mate (el Gentleman)',
                        userColor: '#8b5cf6',
                        userRole: 'Líder Orquestador',
                        content: `🚀 **Delegación a Subagente:** \`@${agentName}\`\n**Tarea:** ${label}\n\n${task ? `> ${task.slice(0, 240)}…` : ''}`,
                        timestamp: ts,
                        worktreePath: session.cwd || worktreePath,
                        sessionId: currentSessionId,
                        isUpdate: true,
                        phase: 'Delegación'
                      })

                      // Emitir evento al bus de oficina para que el subagente ingrese caminando
                      officeEventBus.emit({
                        type: 'route',
                        leadId: 'mate',
                        note: `Asignando ${label} a @${agentName}`,
                        assignments: [
                          {
                            agentId: `sub-${agentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                            task
                          }
                        ]
                      })
                    }

                    const text = extractText(msg.content)
                    if (text && text.trim()) {
                      orlackStore.addMessage({
                        id: `pi-ast-${record.id || i}-${currentSessionId}`,
                        channelId,
                        userId: 'mate',
                        userName: 'Mate (el Gentleman)',
                        userColor: '#8b5cf6',
                        userRole: 'Líder Orquestador',
                        content: text.trim(),
                        timestamp: ts,
                        worktreePath: session.cwd || worktreePath,
                        sessionId: currentSessionId
                      })
                    }
                  }
                } else if (record.type === 'custom' && record.customType === 'subagent-badge') {
                  const d = record.data || {}
                  const agentName = d.agent || 'Subagente'
                  const ts = record.timestamp ? new Date(record.timestamp).getTime() : Date.now()

                  orlackStore.addMessage({
                    id: `pi-badge-${record.id || i}-${currentSessionId}`,
                    channelId,
                    userId: `sub-${agentName}`,
                    userName: `${agentName} (Delegado)`,
                    userColor: '#10b981',
                    userRole: 'Subagent Worker',
                    content: `⚡ **Subagente Finalizado:** \`@${agentName}\`\n- **Modelo:** \`${d.model || 'Auto'}\`\n- **Duración:** ${d.durationSec ? `${d.durationSec}s` : '0s'}\n- **Estado:** ${d.error ? '❌ Error' : '✅ Completado'}`,
                    timestamp: ts,
                    worktreePath: session.cwd || worktreePath,
                    sessionId: currentSessionId,
                    isUpdate: true,
                    phase: 'Completado',
                    statusVerdict: d.error ? 'fail' : 'pass'
                  })

                  // Emitir evento de subagente finalizado a la oficina para que celebre con sparkles y se retire
                  officeEventBus.emit({
                    type: 'agent_done',
                    agentId: `sub-${agentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    text: `✓ @${agentName} finalizó su tarea`
                  })
                }
              } catch {
                // Registro parcial ignorado
              }
            }
          }
        } catch (readErr) {
          console.warn('[orlack] Could not tail session log:', readErr)
        }
      }
    }
  } catch (err) {
    console.warn('[orlack] Error scanning Pi sessions:', err)
  }
}
