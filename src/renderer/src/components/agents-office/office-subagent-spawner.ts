import type { OfficeEngine } from './engine'
import type { Agent } from './types'
import { getAppearanceForIndex } from './office-dynamic-generator'

const activeSubagentsByWorkspace = new Map<string, Map<string, Agent>>()

export function getCleanSubagentId(subagentName: string): string {
  return `sub-${subagentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
}

export function syncDelegatedSubagent(
  engine: OfficeEngine,
  workspaceKey: string,
  subagentName: string,
  taskDescription?: string
): void {
  if (!engine.layout) {
    return
  }

  let wsMap = activeSubagentsByWorkspace.get(workspaceKey)
  if (!wsMap) {
    wsMap = new Map()
    activeSubagentsByWorkspace.set(workspaceKey, wsMap)
  }

  const cleanId = getCleanSubagentId(subagentName)
  const existing = wsMap.get(cleanId) || engine.chars.get(cleanId)

  if (!existing) {
    // Asignar el siguiente escritorio libre disponible (del 1 al 5)
    const takenSeats = new Set<number>()
    for (const c of engine.chars.values()) {
      takenSeats.add(c.agent.seat)
    }

    let assignedSeat = 1
    for (let s = 1; s < (engine.layout.seats?.length ?? 6); s++) {
      if (!takenSeats.has(s)) {
        assignedSeat = s
        break
      }
    }

    const newSubagent: Agent = {
      id: cleanId,
      name: subagentName,
      role: `Subagent (${subagentName})`,
      seat: assignedSeat,
      appearance: getAppearanceForIndex(assignedSeat)
    }

    wsMap.set(cleanId, newSubagent)

    // El subagente entra por la puerta de la oficina caminando hacia su escritorio asignado
    const entrySpot = engine.layout.entry ?? { x: 838, y: 915 }
    const seatSpot = engine.seatOf(newSubagent)

    engine.chars.set(cleanId, {
      id: cleanId,
      agent: newSubagent,
      x: entrySpot.x,
      y: entrySpot.y,
      dir: 'up',
      seated: false,
      path: [],
      actions: [
        { kind: 'say', text: `¡Presente! Soy ${subagentName}`, ms: 2200 },
        { kind: 'walk', to: seatSpot },
        { kind: 'sit' },
        {
          kind: 'say',
          text: taskDescription
            ? `Trabajando en: ${taskDescription.slice(0, 32)}…`
            : 'Ejecutando tarea asignada',
          ms: 2800
        }
      ],
      waitLeft: 0,
      t: Math.random() * 10,
      blinkAt: 2 + Math.random() * 4,
      working: true,
      thinking: false,
      bubble: `¡Entrando! (${subagentName})`,
      bubbleUntil: engine.now + 3,
      gone: false
    })

    // El orquestador principal (asiento 0) se levanta y le asigna la tarea con animación de papel y mensaje
    const lead = [...engine.chars.values()].find((c) => c.agent.seat === 0 || c.agent.lead)
    if (lead) {
      engine.stand(lead)
      const s = engine.scaleAt(seatSpot.y)
      lead.actions.push(
        { kind: 'say', text: `Asignando a @${subagentName}...`, ms: 1800 },
        { kind: 'walk', to: { x: seatSpot.x + 15 * s, y: seatSpot.y + 3 * s } },
        {
          kind: 'fx',
          fx: {
            kind: 'paper',
            x: lead.x,
            y: lead.y,
            tx: seatSpot.x,
            ty: seatSpot.y - 30 * s,
            color: lead.agent.appearance.shirt
          }
        },
        { kind: 'say', text: `📄 @${subagentName}, concentrate en esta tarea`, ms: 2200 }
      )
      engine.sendHome(lead)
    }
  } else {
    // Si ya existe en la oficina, ponerlo a trabajar y mostrar su tarea
    engine.setWorking(cleanId, true)
    if (taskDescription) {
      engine.say(cleanId, `⚡ ${taskDescription.slice(0, 32)}…`, 4)
    }
  }
}

export function dismissDelegatedSubagent(
  engine: OfficeEngine,
  workspaceKey: string,
  subagentName: string
): void {
  if (!engine.layout) {
    return
  }
  const cleanId = getCleanSubagentId(subagentName)
  const char = engine.chars.get(cleanId)
  if (!char || char.gone) {
    return
  }

  const entrySpot = engine.layout.entry ?? { x: 838, y: 915 }
  engine.stand(char)
  char.working = false
  char.thinking = false

  // Animación de celebración sparkle antes de retirarse
  const r = engine.spriteRect(char)
  engine.effects.push({
    kind: 'sparkle',
    x: char.x,
    y: r.y + r.h * 0.3,
    color: char.agent.appearance.shirt
  })

  char.actions = [
    { kind: 'say', text: `✓ ¡Tarea cumplida! Nos vemos.`, ms: 2000 },
    { kind: 'walk', to: entrySpot },
    { kind: 'say', text: `👋 Hasta la próxima`, ms: 1000 },
    { kind: 'vanish' }
  ]

  const wsMap = activeSubagentsByWorkspace.get(workspaceKey)
  if (wsMap) {
    wsMap.delete(cleanId)
  }
}
