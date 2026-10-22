import { useEffect } from 'react'
import type { OfficeEngine } from './engine'
import type { PublicOffice } from './types'
import { useAppStore } from '@/store'
import { useWorktreeAgentRows, useHerdrAgentsForWorktree } from '../sidebar/useWorktreeAgentRows'
import { syncDelegatedSubagent } from './office-subagent-spawner'

/**
 * Sincroniza en tiempo real los eventos de agentes, herramientas y estados de Pi
 * con los personajes y la pizarra de Agents Office.
 */
export function useOfficeRealtimeSync(
  engine: OfficeEngine,
  office: PublicOffice,
  workspaceName: string
): void {
  const allWorktrees = useAppStore((s) => s.worktreesByRepo)
  const worktree = Object.values(allWorktrees)
    .flat()
    .find((wt) => wt.displayName.toLowerCase() === workspaceName.toLowerCase())

  const worktreeId = worktree?.id ?? ''
  const liveRows = useWorktreeAgentRows(worktreeId, Boolean(worktreeId))
  const herdrRows = useHerdrAgentsForWorktree(worktreeId, Boolean(worktreeId))
  const agentStatusEpoch = useAppStore((s) => s.agentStatusEpoch)

  useEffect(() => {
    if (!engine || !office) {
      return
    }

    const leadAgent = office.agents.find((a) => a.lead) || office.agents[0]

    // 1. Detectar agentes activos en el worktree (Pi, Herdr, subagentes)
    const activeDashboardAgent = liveRows.find(
      (r) => r.state === 'working' || r.state === 'blocked' || r.state === 'waiting'
    )
    const activeHerdrAgent = herdrRows.find((h) => h.status === 'working' || h.status === 'blocked')

    const isRunning = Boolean(activeDashboardAgent || activeHerdrAgent)
    const isBlocked =
      activeDashboardAgent?.state === 'blocked' || activeHerdrAgent?.status === 'blocked'
    const isWaiting = activeDashboardAgent?.state === 'waiting'

    // 2. Extraer detalles de la tarea, prompt y herramienta
    const currentEntry = activeDashboardAgent?.entry
    const promptText =
      currentEntry?.prompt ||
      activeDashboardAgent?.tab?.title ||
      activeHerdrAgent?.terminalTitle ||
      ''
    const toolName = currentEntry?.toolName
    const toolInput = currentEntry?.toolInput
    const lastMessage = currentEntry?.lastAssistantMessage

    // 3. Actualizar la pizarra con la tarea del proyecto si hay actividad
    if (promptText && promptText.trim().length > 0) {
      const displayTask = promptText.length > 50 ? `${promptText.slice(0, 47)}…` : promptText
      const detail = toolName
        ? `Herramienta: ${toolName}`
        : lastMessage
          ? lastMessage.slice(0, 60)
          : 'En ejecución'
      engine.handle({
        type: 'board',
        title: `${workspaceName.toUpperCase()} · SPRINT`,
        text: `${displayTask}\n> ${detail}`
      })
    }

    // 4. Si el orquestador principal (leadAgent) está asignado:
    if (leadAgent) {
      if (isRunning) {
        engine.setWorking(leadAgent.id, true)
        engine.setThinking(leadAgent.id, false)

        if (isBlocked) {
          engine.say(leadAgent.id, '🔐 Esperando permiso...', 60)
        } else if (toolName) {
          const icon =
            toolName === 'bash'
              ? '⌨'
              : toolName.includes('edit')
                ? '✎'
                : toolName.includes('read')
                  ? '📖'
                  : '🔍'
          const summary = toolInput ? `${toolName}: ${toolInput.slice(0, 25)}` : toolName
          engine.say(leadAgent.id, `${icon} ${summary}`, 4)
        } else if (promptText) {
          const shortPrompt = promptText.length > 32 ? `${promptText.slice(0, 30)}…` : promptText
          engine.say(leadAgent.id, `💻 ${shortPrompt}`, 4)
        }
      } else {
        engine.setWorking(leadAgent.id, false)
        if (isWaiting) {
          engine.setThinking(leadAgent.id, true)
        }
      }
    }

    // 5. Detectar subagentes delegados dinámicamente:
    // Si se invoca subagent_run o hay un row con orchestration/subagent, el subagente entra por la puerta
    liveRows.forEach((row) => {
      const isSubagent =
        row.rowSource === 'subagent' || Boolean(row.childRow) || Boolean(row.entry.orchestration)
      if (isSubagent) {
        const subagentName =
          row.childRow?.name || row.entry.orchestration?.displayName || row.agentType || 'Subagente'
        const childDetail = row.childRow?.detail
        const detailText =
          childDetail &&
          childDetail.kind === 'message' &&
          'text' in childDetail &&
          typeof childDetail.text === 'string'
            ? childDetail.text
            : ''
        const taskText = row.entry.prompt || detailText
        syncDelegatedSubagent(engine, workspaceName, subagentName, taskText)
      }
    })
  }, [engine, office, workspaceName, liveRows, herdrRows, agentStatusEpoch, worktreeId])
}
