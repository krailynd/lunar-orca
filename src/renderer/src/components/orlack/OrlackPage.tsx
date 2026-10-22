import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Hash,
  Send,
  Smile,
  Bot,
  Paperclip,
  FolderGit2,
  Cpu,
  ChevronRight,
  FileCode,
  Sparkles,
  Code2
} from 'lucide-react'
import type { OrlackAttachment, OrlackMessage } from './orlack-types'
import { OrlackSidebar } from './OrlackSidebar'
import { OrlackMessageItem } from './OrlackMessageItem'
import { officeEventBus } from '../agents-office/office-event-bus'
import { buildDynamicChannels, buildUsersForChannel } from './orlack-dynamic-channels'
import { orlackStore } from './orlack-store'
import { loadPiSessionsForChannel } from './orlack-pi-session-loader'
import { useAppStore } from '@/store'
import { useActiveWorktree, useAllWorktrees } from '@/store/selectors'
import { useWorktreeAgentRows } from '../sidebar/useWorktreeAgentRows'

export default function OrlackPage(): React.JSX.Element {
  const worktrees = useAllWorktrees()
  const activeWorktree = useActiveWorktree()
  const channels = useMemo(() => buildDynamicChannels(worktrees), [worktrees])
  const [activeChannelId, setActiveChannelId] = useState<string>('sis-ventas-2.0')
  const [messages, setMessages] = useState<OrlackMessage[]>(() => orlackStore.getMessages())
  const [inputText, setInputText] = useState('')
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<OrlackAttachment[]>([])

  const openAgentsOffice = useAppStore((state) => state.openAgentsOfficePage)

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0]

  // Equipo dinámico de agentes según el canal y proyecto seleccionado
  const users = useMemo(() => {
    return buildUsersForChannel(activeChannel)
  }, [activeChannel])

  // Sincronizar reactivamente con el store persistente de Orlack
  useEffect(() => {
    const unsub = orlackStore.subscribe((nextMessages) => {
      setMessages(nextMessages)
    })
    return unsub
  }, [])

  // Cargar automáticamente las sesiones reales de Pi asociadas a este canal
  useEffect(() => {
    if (activeChannelId) {
      void loadPiSessionsForChannel(activeChannelId, activeChannel.worktreePath)
    }
  }, [activeChannelId, activeChannel.worktreePath])

  const lastAutoSyncedWorktreeRef = useRef<string | null>(null)

  // Auto-seleccionar el canal correspondiente SOLO en el arranque inicial si coincide con un proyecto
  useEffect(() => {
    if (activeWorktree?.displayName && lastAutoSyncedWorktreeRef.current === null) {
      lastAutoSyncedWorktreeRef.current = activeWorktree.displayName
      const targetId = activeWorktree.displayName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      const matched = channels.find((c) => c.id.includes(targetId) || targetId.includes(c.id))
      if (matched) {
        setActiveChannelId(matched.id)
      }
    }
  }, [activeWorktree?.displayName, channels])

  // Observar actividad real de agentes para el canal activo
  const targetWorktree = Object.values(useAppStore.getState().worktreesByRepo)
    .flat()
    .find((wt) => {
      const chName = activeChannel.name.toLowerCase()
      const wtName = wt.displayName.toLowerCase()
      return wtName.includes(chName) || chName.includes(wtName)
    })
  const targetWorktreeId = targetWorktree?.id ?? ''
  const liveRows = useWorktreeAgentRows(targetWorktreeId, Boolean(targetWorktreeId))

  // Sincronizar automáticamente reportes al terminar tareas en el canal del proyecto
  useEffect(() => {
    if (!liveRows || liveRows.length === 0) {
      return
    }
    const doneAgent = liveRows.find((r) => r.state === 'done')
    if (doneAgent && doneAgent.entry.prompt) {
      const existing = messages.some(
        (m) => m.channelId === activeChannelId && m.content.includes(doneAgent.entry.prompt)
      )
      if (!existing) {
        orlackStore.addWorkUnitReport({
          channelId: activeChannelId,
          agentId: doneAgent.agentType || 'pi-worker',
          agentName: doneAgent.agentType === 'pi' ? 'Pi Agent (Worker)' : 'el Gentleman (Lead)',
          agentColor: doneAgent.agentType === 'pi' ? '#10b981' : '#8b5cf6',
          agentRole: doneAgent.entry.toolName
            ? `Worker (${doneAgent.entry.toolName})`
            : 'ODD Specialist',
          worktreePath: targetWorktree?.path || activeChannel.worktreePath || '',
          sessionId: doneAgent.tab?.id,
          taskTitle: doneAgent.entry.prompt,
          summary:
            doneAgent.entry.lastAssistantMessage ||
            'Tarea completada exitosamente bajo ciclo ODD verificado.',
          verdict: 'pass',
          phase: 'T2 - Done'
        })
      }
    }
  }, [liveRows, activeChannelId, messages, targetWorktree?.path, activeChannel.worktreePath])

  const channelMessages = messages.filter((m) => {
    if (m.channelId !== activeChannelId) {
      return false
    }
    if (selectedAgentFilter) {
      return m.userId === selectedAgentFilter
    }
    return true
  })

  // Sincronizar eventos desde el bus de oficina hacia Orlack
  useEffect(() => {
    const unsub = officeEventBus.subscribe((ev) => {
      if (ev.type === 'agent_said') {
        const matchingUser = users.find((u) => u.id === ev.agentId) || users[1]
        orlackStore.addMessage({
          id: `bus-msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          channelId: activeChannelId,
          userId: ev.agentId,
          userName: matchingUser.name,
          userColor: matchingUser.avatarColor,
          userRole: matchingUser.role,
          content: ev.text,
          timestamp: Date.now()
        })
      }
    })
    return unsub
  }, [users, activeChannelId])

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim() && pendingAttachments.length === 0) {
      return
    }

    const trimmed = inputText.trim()
    const activeWt =
      targetWorktree?.path || activeChannel.worktreePath || '/home/krailynd/lunar-orca'

    const userMessage: OrlackMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      userId: 'user-elvis',
      userName: 'Krailynd (Elvis)',
      userColor: '#3b82f6',
      userRole: 'Tech Lead',
      worktreePath: activeWt,
      content: trimmed,
      timestamp: Date.now(),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    }

    orlackStore.addMessage(userMessage)
    setInputText('')
    setPendingAttachments([])

    // Notificar en la oficina 3D que el usuario habló
    officeEventBus.emit({
      type: 'agent_said',
      agentId: 'mate',
      text: 'Recibiendo orden de Krailynd...'
    })

    // Respuestas orquestadas inteligentes en Buzz: SOLO responde el Orquestador salvo que se mencione explícitamente a un subagente con @
    setTimeout(() => {
      let replyContent = ''
      let responderId = 'mate'
      let responderName = 'Mate (el Gentleman)'
      let responderRole = 'Senior Architect & Orchestrator'
      let responderColor = '#2e7d5b'
      let isTaskUpdate = false

      const lower = trimmed.toLowerCase()

      if (lower.startsWith('@coda') || lower.includes('@coda')) {
        responderId = 'coda'
        responderName = 'Coda (Pi Frontend)'
        responderRole = 'Frontend Specialist'
        responderColor = '#4f6bed'
        replyContent = `Recibido, Krailynd. Me enfoco en la UI/UX del proyecto activo (\`${activeWt}\`). Ya aplico los estilos respetando el Design System.`
        isTaskUpdate = true
      } else if (lower.startsWith('@bruno') || lower.includes('@bruno')) {
        responderId = 'bruno'
        responderName = 'Bruno (Pi Backend)'
        responderRole = 'Backend Specialist'
        responderColor = '#d35400'
        replyContent = `Tomado. Ejecutando la lógica de backend y endpoints en \`${activeWt}\`.`
        isTaskUpdate = true
      } else if (lower.startsWith('@reva') || lower.includes('@reva')) {
        responderId = 'reva'
        responderName = 'Reva (QA Tester)'
        responderRole = 'QA & Security'
        responderColor = '#8e44ad'
        replyContent = `Iniciando suite de verificación: \`pnpm check:code-quality:changed\` y tests unitarios en \`${activeWt}\`.`
        isTaskUpdate = true
      } else if (lower.startsWith('@indu') || lower.includes('@indu')) {
        responderId = 'indu'
        responderName = 'Indu (Hermes Research)'
        responderRole = 'Cloud Researcher'
        responderColor = '#16a085'
        replyContent = `Conectando con SahaCloud vía SSH. Buscando fuentes primarias y extrayendo evidencia estructurada.`
      } else {
        // Respuesta exclusiva del Orquestador (el Gentleman)
        responderId = 'mate'
        responderName = 'Mate (el Gentleman)'
        responderRole = 'Senior Architect & Orchestrator'
        responderColor = '#2e7d5b'
        replyContent = `Entendido, Krailynd. Como **Orquestador Principal**, tomo el control del canal y la tarea en \`${activeWt}\`.\n\n### Estado del Flujo ODD\n- **Workspace**: \`${activeWt}\`\n- **Supervisión**: Activa y centralizada.\n- **Subagentes**: En reposo en sus escritorios, esperando delegación formal.`
      }

      // Animación en vivo en Pixel Office: el orquestador va a la pizarra a explicar o el subagente trabaja
      if (responderId === 'mate') {
        officeEventBus.emit({
          type: 'board',
          title: 'SPRINT / TAREA',
          text: trimmed
        })
      } else {
        officeEventBus.emit({
          type: 'agent_working',
          agentId: responderId,
          working: true
        })
        setTimeout(() => {
          officeEventBus.emit({
            type: 'agent_working',
            agentId: responderId,
            working: false
          })
        }, 8000)
      }

      const agentReply: OrlackMessage = {
        id: `reply-${Date.now()}`,
        channelId: activeChannelId,
        userId: responderId,
        userName: responderName,
        userColor: responderColor,
        userRole: responderRole,
        worktreePath: activeWt,
        content: replyContent,
        timestamp: Date.now(),
        isUpdate: isTaskUpdate,
        phase: isTaskUpdate ? 'T2 - Build' : undefined,
        statusVerdict: isTaskUpdate ? 'working' : undefined
      }

      setMessages((prev) => [...prev, agentReply])

      // Reflejar la burbuja de habla en Pixel Office
      officeEventBus.emit({
        type: 'agent_said',
        agentId: responderId,
        text: `${replyContent.slice(0, 32)}...`
      })
    }, 600)
  }, [
    activeChannel.worktreePath,
    activeChannelId,
    inputText,
    pendingAttachments,
    targetWorktree?.path
  ])

  const addCodeSnippet = () => {
    setPendingAttachments((prev) => [
      ...prev,
      {
        name: 'task-patch.diff',
        size: '4.8 KB',
        type: 'diff',
        content: '<<<<<<< SEARCH\n// old code\n=======\n// new code\n>>>>>>> REPLACE'
      }
    ])
  }

  return (
    <div className="flex h-full w-full bg-background text-foreground select-none">
      <OrlackSidebar
        channels={channels}
        users={users}
        activeChannelId={activeChannelId}
        selectedAgentFilter={selectedAgentFilter}
        onSelectChannel={(id) => {
          setActiveChannelId(id)
          setSelectedAgentFilter(null)
        }}
        onSelectAgentFilter={setSelectedAgentFilter}
        onOpenOffice={openAgentsOffice}
      />

      {/* Main Chat Stream */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Channel Top Header with Project Directory & Orchestrator */}
        <div className="flex h-14 items-center justify-between border-b border-border px-6 bg-card/30">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                {activeChannel.name}
              </h2>
              {selectedAgentFilter ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">
                  Filtrado por agente
                </span>
              ) : null}
            </div>

            {/* Context Breadcrumbs: Path & Active Orchestrator */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 font-mono text-[10px] bg-muted/50 px-1.5 py-0.2 rounded border border-border/50">
                <FolderGit2 className="h-3 w-3" />
                {activeChannel.worktreePath || '/home/krailynd/lunar-orca'}
              </span>
              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/40" />
              <span className="flex items-center gap-1 text-[10px] text-annotation-highlight font-medium">
                <Cpu className="h-3 w-3" />
                Orquestador: {activeChannel.orchestrator || 'el Gentleman'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAgentsOffice()}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Ver en Oficina 3D</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-auto scrollbar-sleek p-6 space-y-4">
          {channelMessages.map((msg) => (
            <OrlackMessageItem key={msg.id} msg={msg} />
          ))}
        </div>

        {/* Composer Bar */}
        <div className="p-4 border-t border-border bg-card/40">
          {pendingAttachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {pendingAttachments.map((att, i) => (
                <div
                  key={att.name + i}
                  className="flex items-center gap-1.5 rounded bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                >
                  <FileCode className="h-3 w-3" />
                  <span>{att.name}</span>
                  <button
                    onClick={() =>
                      setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="ml-1 opacity-70 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col rounded-lg border border-border bg-background p-2 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={`Enviar mensaje o instrucción a #${activeChannel.name}... (ej: "Coda, ajustá el header" o "Reva, corré los tests")`}
              className="w-full resize-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60 min-h-[44px]"
            />
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button
                  type="button"
                  onClick={addCodeSnippet}
                  className="rounded p-1 hover:bg-muted hover:text-foreground transition"
                  title="Adjuntar diff / código"
                >
                  <Code2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-muted hover:text-foreground transition"
                  title="Adjuntar archivo"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-muted hover:text-foreground transition"
                  title="Emojis"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-muted hover:text-foreground transition"
                  title="Instrucción de Agente"
                >
                  <Bot className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputText.trim() && pendingAttachments.length === 0}
                className="flex items-center gap-1 rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <span>Enviar</span>
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
