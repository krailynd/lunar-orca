import { useEffect } from 'react'
import type { OfficeEngine } from './engine'
import type { PublicOffice } from './types'
import { useAppStore } from '@/store'
import { useWorktreeAgentRows, useHerdrAgentsForWorktree } from '../sidebar/useWorktreeAgentRows'
import { syncDelegatedSubagent, dismissDelegatedSubagent } from './office-subagent-spawner'
import { useHerdrSessions } from '@/lib/useHerdrSessions'

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
  const { getPanesForWorktree, getPiSubagentsForWorktree } = useHerdrSessions()

  useEffect(() => {
    if (!engine || !office) {
      return
    }

    const leadAgent = office.agents.find((a) => a.lead) || office.agents[0]
    const detectedHerdrPanes = getPanesForWorktree(worktree?.path || '', workspaceName)
    const detectedPiSubagents = getPiSubagentsForWorktree(worktree?.path || '')

    // Consideramos subagentes de Pi que estén corriendo o que hayan terminado hace menos de 2 minutos
    const now = Date.now()
    const activePiTasks = detectedPiSubagents.filter((t) => {
      if (t.status === 'running') {
        return true
      }
      if (t.status === 'completed' && now - t.mtime < 120000) {
        return true
      }
      return false
    })

    // 1. Detectar agentes activos en el worktree (Pi, Herdr, subagentes) de forma estricta
    const activeDashboardAgent = liveRows.find(
      (r) => r.state === 'working' || r.state === 'blocked' || r.state === 'waiting'
    )
    const activeHerdrAgent = herdrRows.find((h) => h.status === 'working' || h.status === 'blocked')

    // El pane primario de Herdr representa al orquestador principal si coincide con la ruta
    const primaryHerdrPane = detectedHerdrPanes[0]
    const isPrimaryHerdrWorking = primaryHerdrPane?.agent_status === 'working'

    const isRunning = Boolean(
      activeDashboardAgent || activeHerdrAgent || isPrimaryHerdrWorking || activePiTasks.length > 0
    )
    const isBlocked =
      activeDashboardAgent?.state === 'blocked' || activeHerdrAgent?.status === 'blocked'
    const isWaiting = activeDashboardAgent?.state === 'waiting'

    // 2. Extraer detalles de la tarea, prompt y herramienta
    const currentEntry = activeDashboardAgent?.entry
    const herdrSummary = [primaryHerdrPane?.tokens?.summary, primaryHerdrPane?.tokens?.summary2]
      .filter(Boolean)
      .join(' ')
      .trim()

    const promptText =
      herdrSummary ||
      currentEntry?.prompt ||
      activeDashboardAgent?.tab?.title ||
      activeHerdrAgent?.terminalTitle ||
      primaryHerdrPane?.title ||
      ''
    const toolName = currentEntry?.toolName
    const toolInput = currentEntry?.toolInput
    const lastMessage = currentEntry?.lastAssistantMessage

    // 3. Actualizar la pizarra con la tarea del proyecto si hay actividad real
    if (isRunning && promptText && promptText.trim().length > 0) {
      const displayTask = promptText.length > 55 ? `${promptText.slice(0, 52)}…` : promptText
      const detail = toolName
        ? `Herramienta: ${toolName}`
        : primaryHerdrPane?.tokens?.m_model
          ? `Modelo: ${primaryHerdrPane.tokens.m_model} · ${primaryHerdrPane.tokens.m_cost || ''}`
          : lastMessage
            ? lastMessage.slice(0, 60)
            : 'En ejecución activa'
      engine.handle({
        type: 'board',
        title: `${workspaceName.toUpperCase()} · SPRINT`,
        text: `${displayTask}\n> ${detail}`
      })
    } else {
      engine.handle({
        type: 'board',
        title: `${workspaceName.toUpperCase()} · SPRINT`,
        text: `Sin tareas activas\n> Listo para recibir órdenes`
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
    // Solo cuando el orquestador los llama vía subagent_run o hay un row delegado activo
    const activeSubagentNames = new Set<string>()

    liveRows.forEach((row) => {
      const isSubagent =
        (row.rowSource === 'subagent' ||
          Boolean(row.childRow) ||
          Boolean(row.entry.orchestration)) &&
        (row.state === 'working' || row.state === 'waiting')
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
        activeSubagentNames.add(subagentName)
        syncDelegatedSubagent(engine, workspaceName, subagentName, taskText)
      }
    })

    // 6. Panes de Herdr secundarios (solo si hay más de 1 pane en el proyecto Y está trabajando)
    if (detectedHerdrPanes.length > 1) {
      detectedHerdrPanes.slice(1).forEach((pane) => {
        if (pane.agent_status === 'working') {
          const paneCleanTitle = pane.title.replace(/^π\s*-\s*/, '')
          const subName = `π-${paneCleanTitle}`
          const task =
            [pane.tokens?.summary, pane.tokens?.summary2].filter(Boolean).join(' ') ||
            'Subagente π en ejecución'
          activeSubagentNames.add(subName)
          syncDelegatedSubagent(engine, workspaceName, subName, task)
        }
      })
    }

    // 7. Subagentes de Pi detectados directamente del arnés/filesystem (gentle-agents)
    activePiTasks.forEach((piTask) => {
      const subName = piTask.agent || 'orsod-worker'
      const taskText = piTask.label || piTask.task || 'Ejecutando delegación'
      activeSubagentNames.add(subName)
      syncDelegatedSubagent(engine, workspaceName, subName, taskText)
    })

    // 8. Retirar y despedir a cualquier subagente que ya no esté activo
    for (const char of engine.chars.values()) {
      if (char.agent.seat > 0 && !char.agent.lead && !char.gone) {
        if (!activeSubagentNames.has(char.agent.name)) {
          dismissDelegatedSubagent(engine, workspaceName, char.agent.name)
        }
      }
    }
  }, [
    engine,
    office,
    workspaceName,
    liveRows,
    herdrRows,
    agentStatusEpoch,
    worktreeId,
    getPanesForWorktree,
    getPiSubagentsForWorktree,
    worktree?.path
  ])
}
