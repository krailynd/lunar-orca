import type { OfficeEngine } from './engine'
import type { OfficeEvent } from './types'

export function handleOfficeEvent(engine: OfficeEngine, ev: OfficeEvent): void {
  switch (ev.type) {
    case 'board':
      engine.boardTitle = ev.title
      engine.boardText = ev.text
      break
    case 'agent_said':
      engine.say(ev.agentId, ev.text, ev.ms ? ev.ms / 1000 : 4)
      break
    case 'agent_working':
      engine.setWorking(ev.agentId, ev.working)
      break
    case 'agent_thinking':
      engine.setThinking(ev.agentId, ev.thinking)
      break
    case 'office':
      engine.setOffice(ev.office)
      break
    case 'run_start':
      engine.boardTitle = ev.target
        ? `→ ${engine.chars.get(ev.target)?.agent.name ?? ''}`
        : 'TAREA ACTIVA'
      engine.boardText = ev.text
      break
    case 'routing': {
      const lead = engine.chars.get(ev.leadId)
      if (lead) {
        lead.thinking = true
      }
      break
    }
    case 'route': {
      const lead = engine.chars.get(ev.leadId)
      if (lead) {
        lead.thinking = false
        if (ev.note) {
          engine.say(lead.id, ev.note, 5)
        }
        if (ev.assignments?.length) {
          for (const a of ev.assignments) {
            const target = engine.chars.get(a.agentId)
            if (!target) {
              continue
            }
            const seat = engine.seatOf(target.agent)
            const s = engine.scaleAt(seat.y)
            lead.actions.push(
              { kind: 'walk', to: { x: seat.x + 15 * s, y: seat.y + 3 * s } },
              {
                kind: 'fx',
                fx: {
                  kind: 'paper',
                  x: lead.x,
                  y: lead.y,
                  tx: seat.x,
                  ty: seat.y - 30 * s,
                  color: lead.agent.appearance.shirt
                }
              },
              { kind: 'say', text: `📄 ${target.agent.name}, esto es tuyo`, ms: 1400 }
            )
          }
          engine.sendHome(lead)
        }
      }
      break
    }
    case 'agent_start': {
      const c = engine.chars.get(ev.agentId)
      if (c) {
        c.working = true
        c.thinking = false
        c.bubble = null
      }
      break
    }
    case 'delta': {
      const c = engine.chars.get(ev.agentId)
      if (c) {
        c.working = true
      }
      break
    }
    case 'agent_done': {
      const c = engine.chars.get(ev.agentId)
      if (c) {
        c.working = false
        c.thinking = false
        engine.say(c.id, ev.text || '✓ ¡Listo!', 4)
        const r = engine.spriteRect(c)
        engine.effects.push({
          kind: 'sparkle',
          x: c.x,
          y: r.y + r.h * 0.3,
          color: c.agent.appearance.shirt
        })

        // Si es un subagente delegado, tras reportar su tarea se levanta y se retira por la puerta
        if (ev.agentId.startsWith('sub-') && engine.layout) {
          engine.stand(c)
          c.actions.push(
            { kind: 'say', text: '✓ Tarea cumplida, me retiro.', ms: 2200 },
            { kind: 'walk', to: engine.layout.entry },
            { kind: 'say', text: '👋 ¡Hasta luego!', ms: 1200 },
            { kind: 'vanish' }
          )
        }
      }
      break
    }
    case 'agent_error': {
      const c = engine.chars.get(ev.agentId)
      if (c) {
        c.working = false
        c.thinking = false
        engine.say(c.id, ev.error || '⚠ Algo falló', 6)
      }
      break
    }
    case 'tool_call': {
      const icon =
        ev.name === 'run_command' || ev.name === 'bash'
          ? '⌨'
          : ev.name === 'write_file' || ev.name === 'edit_file' || ev.name === 'edit'
            ? '✎'
            : ev.name === 'read' || ev.name === 'read_file'
              ? '📖'
              : '🔍'
      const text = ev.summary.length > 34 ? `${ev.summary.slice(0, 33)}…` : ev.summary
      engine.say(ev.agentId, `${icon} ${text}`, 3.5)
      engine.setWorking(ev.agentId, true)
      break
    }
    case 'permission_request': {
      engine.say(ev.agentId, '🔐 Necesito confirmación...', 30)
      engine.setWorking(ev.agentId, false)
      engine.setThinking(ev.agentId, true)
      break
    }
    case 'permission_resolved': {
      engine.setThinking(ev.agentId, false)
      engine.say(ev.agentId, ev.decision === 'deny' ? '😕 Cancelado' : '👍 ¡Aprobado!', 2.5)
      break
    }
    case 'tool_result': {
      if (!ev.ok && ev.output) {
        engine.say(ev.agentId, `⚠ ${ev.output.slice(0, 25)}`, 3)
      }
      break
    }
    case 'run_done': {
      for (const c of engine.chars.values()) {
        c.thinking = false
      }
      break
    }
  }
}
