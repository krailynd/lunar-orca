import type { CharacterState, OfficeAgent } from './office-types'
import { DEFAULT_DESK_SEATS, DEFAULT_LOUNGE_SEATS } from './office-constants'

export type RenderedEntity = {
  agent: OfficeAgent
  x: number
  y: number
  targetX: number
  targetY: number
  dir: 'left' | 'right' | 'up' | 'down'
  animStep: number
  animTimer: number
  state: CharacterState
  seated: boolean
}

export class OfficeSimulation {
  entities = new Map<string, RenderedEntity>()

  syncAgents(agents: OfficeAgent[]): void {
    const present = new Set<string>()

    agents.forEach((ag, idx) => {
      present.add(ag.id)
      const existing = this.entities.get(ag.id)
      const isResting = ag.status === 'idle' || ag.status === 'resting'

      let targetSeat = DEFAULT_DESK_SEATS[ag.deskIndex % DEFAULT_DESK_SEATS.length]
      if (isResting) {
        targetSeat = DEFAULT_LOUNGE_SEATS[idx % DEFAULT_LOUNGE_SEATS.length]
      }

      if (!existing) {
        this.entities.set(ag.id, {
          agent: ag,
          x: targetSeat.x,
          y: targetSeat.y,
          targetX: targetSeat.x,
          targetY: targetSeat.y,
          dir: 'down',
          animStep: 0,
          animTimer: 0,
          state: ag.status,
          seated: true
        })
      } else {
        existing.agent = ag
        existing.state = ag.status
        existing.targetX = targetSeat.x
        existing.targetY = targetSeat.y
      }
    })

    for (const [id] of this.entities) {
      if (!present.has(id)) {
        this.entities.delete(id)
      }
    }
  }

  update(dt: number): void {
    const speed = 120

    for (const entity of this.entities.values()) {
      const dx = entity.targetX - entity.x
      const dy = entity.targetY - entity.y
      const dist = Math.hypot(dx, dy)

      if (dist > 4) {
        entity.seated = false
        const step = Math.min(dist, speed * dt)
        entity.x += (dx / dist) * step
        entity.y += (dy / dist) * step

        if (Math.abs(dx) > Math.abs(dy)) {
          entity.dir = dx > 0 ? 'right' : 'left'
        } else {
          entity.dir = dy > 0 ? 'down' : 'up'
        }

        entity.animTimer += dt
        if (entity.animTimer > 0.16) {
          entity.animTimer = 0
          entity.animStep = (entity.animStep + 1) % 4
        }
      } else {
        entity.x = entity.targetX
        entity.y = entity.targetY
        entity.seated = true
        entity.animStep = 0
      }
    }
  }
}
