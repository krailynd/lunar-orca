import type { OfficeEngine } from './engine'
import type { Character } from './engine-types'
import { SPEED } from './engine-types'

export function stepCharacter(engine: OfficeEngine, c: Character, dt: number): void {
  if (c.path.length > 0) {
    const target = c.path[0]
    const dx = target.x - c.x
    const dy = target.y - c.y
    const dist = Math.hypot(dx, dy)
    const sp = SPEED * (engine.scaleAt(c.y) / 4) * dt

    if (Math.abs(dx) > Math.abs(dy)) {
      c.dir = dx > 0 ? 'right' : 'left'
    } else if (Math.abs(dy) > 0.5) {
      c.dir = dy > 0 ? 'down' : 'up'
    }

    if (dist <= sp) {
      c.x = target.x
      c.y = target.y
      c.path.shift()
    } else {
      c.x += (dx / dist) * sp
      c.y += (dy / dist) * sp
    }
    return
  }

  if (c.waitLeft > 0) {
    c.waitLeft -= dt
    return
  }

  const next = c.actions.shift()
  if (!next) {
    return
  }

  if (next.kind === 'walk') {
    engine.stand(c)
    c.path = engine.router.route({ x: c.x, y: c.y }, next.to)
  } else if (next.kind === 'wait') {
    c.waitLeft = next.ms / 1000
  } else if (next.kind === 'say') {
    engine.say(c.id, next.text, next.ms / 1000)
    c.dir = 'down'
    c.waitLeft = next.ms / 1000
  } else if (next.kind === 'sit') {
    const seat = engine.seatOf(c.agent)
    c.x = seat.x
    c.y = seat.y
    c.seated = true
    c.dir = 'up'
  } else if (next.kind === 'fx') {
    engine.effects.push(next.fx)
  } else if (next.kind === 'vanish') {
    engine.chars.delete(c.id)
  }
}

export function wanderIdleCharacter(engine: OfficeEngine): void {
  const idle = [...engine.chars.values()].filter(
    (c) => c.seated && !c.working && !c.thinking && !c.actions.length && !c.gone
  )
  if (!idle.length || !engine.layout) {
    return
  }
  const c = idle[Math.floor(Math.random() * idle.length)]
  const spots = engine.layout.spots?.length ? engine.layout.spots : [engine.layout.entry]
  const spot = spots[Math.floor(Math.random() * spots.length)]
  const lines = ['☕', '🌿', '🤔', '💡', '🎵', '📋']
  engine.stand(c)
  c.actions.push(
    { kind: 'walk', to: spot },
    { kind: 'say', text: lines[Math.floor(Math.random() * lines.length)], ms: 3500 },
    { kind: 'wait', ms: 3000 }
  )
  engine.sendHome(c)
}
