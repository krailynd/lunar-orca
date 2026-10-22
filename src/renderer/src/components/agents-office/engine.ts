import type { Agent, Layout, OfficeEffect, OfficeEvent, Point, PublicOffice } from './types'
import { characterFrame } from './characters'
import { OfficeRouter } from './office-router'
import type { Pose } from './sprites'
import { type Character, type Snapshot, BODY, BACKREST } from './engine-types'
import { handleOfficeEvent } from './engine-event-handler'
import { stepCharacter, wanderIdleCharacter } from './engine-stepper'

export type { Character, Snapshot } from './engine-types'
export type { Point } from './types'

export class OfficeEngine {
  chars = new Map<string, Character>()
  layout: Layout | null = null
  effects: OfficeEffect[] = []
  boardText = ''
  boardTitle = ''
  now = 0
  allowWander = false
  private wanderClock = 8
  router: OfficeRouter

  constructor() {
    this.router = new OfficeRouter(() => this.layout)
  }

  setOffice(office: PublicOffice): void {
    const isSameOffice =
      this.layout && this.chars.size > 0 && office.agents.every((a) => this.chars.has(a.id))
    if (isSameOffice) {
      // Si la oficina y sus agentes ya están instanciados, no los reseteamos ni los enviamos a caminar de nuevo
      for (const agent of office.agents) {
        const existing = this.chars.get(agent.id)
        if (existing) {
          existing.agent = agent
        }
      }
      return
    }

    const first = !this.layout
    this.layout = office.layout
    const seen = new Set<string>()

    for (const agent of office.agents) {
      seen.add(agent.id)
      const seat = this.seatOf(agent)
      const existing = this.chars.get(agent.id)

      if (!existing) {
        const start = first ? seat : office.layout.entry
        this.chars.set(agent.id, {
          id: agent.id,
          agent,
          x: start.x,
          y: start.y,
          dir: 'down',
          seated: first,
          path: [],
          actions: first ? [{ kind: 'sit' }] : [{ kind: 'walk', to: seat }, { kind: 'sit' }],
          waitLeft: 0,
          t: Math.random() * 10,
          blinkAt: 2 + Math.random() * 4,
          working: false,
          thinking: false,
          bubble: null,
          bubbleUntil: 0,
          gone: false
        })
      } else {
        existing.agent = agent
        if (existing.seated && Math.hypot(existing.x - seat.x, existing.y - seat.y) > 8) {
          existing.seated = false
          existing.actions = [{ kind: 'walk', to: seat }, { kind: 'sit' }]
        }
      }
    }

    for (const [id, c] of this.chars) {
      if (!seen.has(id) && !c.gone) {
        c.actions = [
          { kind: 'say', text: '¡Chau!', ms: 1200 },
          { kind: 'walk', to: office.layout.entry },
          { kind: 'vanish' }
        ]
      }
    }
  }

  seatOf(agent: Agent): Point {
    const seats = this.layout?.seats ?? []
    return (
      seats[Math.max(0, Math.min(seats.length - 1, agent.seat))] ??
      this.layout?.entry ?? { x: 838, y: 915 }
    )
  }

  scaleAt(y: number): number {
    return this.router.scaleAt(y)
  }

  stand(c: Character): void {
    if (!c.seated) {
      return
    }
    c.seated = false
    c.y += 4 * this.scaleAt(c.y)
  }

  sendHome(c: Character): void {
    const seat = this.seatOf(c.agent)
    c.actions.push({ kind: 'walk', to: seat }, { kind: 'sit' })
  }

  say(agentId: string, text: string, secs = 4): void {
    const c = this.chars.get(agentId)
    if (!c) {
      return
    }
    c.bubble = text
    c.bubbleUntil = this.now + secs
  }

  setWorking(agentId: string, working: boolean): void {
    const c = this.chars.get(agentId)
    if (c) {
      c.working = working
    }
  }

  setThinking(agentId: string, thinking: boolean): void {
    const c = this.chars.get(agentId)
    if (c) {
      c.thinking = thinking
    }
  }

  walkTo(agentId: string, target: Point): void {
    const c = this.chars.get(agentId)
    if (!c) {
      return
    }
    this.stand(c)
    c.actions = [{ kind: 'walk', to: target }]
  }

  goToBoardAndExplain(agentId: string, taskTitle: string, taskDetails: string): void {
    const c = this.chars.get(agentId)
    if (!c || !this.layout?.board) {
      return
    }
    this.stand(c)
    this.boardTitle = taskTitle
    this.boardText = taskDetails
    const boardSpot: Point = {
      x: this.layout.board.x + this.layout.board.w / 2,
      y: this.layout.board.y + this.layout.board.h + 50
    }
    c.actions = [
      { kind: 'walk', to: boardSpot },
      { kind: 'say', text: `📋 Tarea: ${taskTitle}`, ms: 4000 },
      { kind: 'wait', ms: 3000 }
    ]
    this.sendHome(c)
  }

  update(dt: number): void {
    this.now += dt
    if (this.allowWander) {
      this.wanderClock -= dt
      if (this.wanderClock <= 0) {
        this.wanderClock = 15 + Math.random() * 20
        wanderIdleCharacter(this)
      }
    }

    for (const [id, c] of this.chars) {
      if (c.gone) {
        this.chars.delete(id)
        continue
      }
      c.t += dt
      if (c.bubble && this.now > c.bubbleUntil) {
        c.bubble = null
      }
      stepCharacter(this, c, dt)
    }
  }

  poseOf(c: Character): Pose {
    const blink = c.t % c.blinkAt < 0.14
    if (c.seated) {
      const typing = c.working ? (Math.floor(c.t * 7) % 2) + 1 : 0
      return { kind: 'sit', typing, blink }
    }
    const moving = c.path.length > 0
    const step = moving ? Math.floor(c.t * 8) % 4 : 0
    return { kind: 'stand', dir: c.dir, step, blink }
  }

  spriteRect(c: Character): {
    x: number
    y: number
    w: number
    h: number
    s: number
    frame: ReturnType<typeof characterFrame>
  } {
    const s = this.scaleAt(c.y)
    const u = s * BODY
    const f = characterFrame(c.agent, this.poseOf(c))
    const w = f.w * u
    const h = f.h * u
    const top = (c.seated ? c.y - BACKREST * s - f.shoulder * h : c.y - h + u) + f.bob * u
    return { x: c.x - w / 2, y: top, w, h, s, frame: f }
  }

  hit(x: number, y: number): string | null {
    let best: string | null = null
    let bestY = -Number.POSITIVE_INFINITY
    for (const c of this.chars.values()) {
      const r = this.spriteRect(c)
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h && c.y > bestY) {
        best = c.id
        bestY = c.y
      }
    }
    return best
  }

  snapshots(): Snapshot[] {
    return [...this.chars.values()].map((c) => {
      const r = this.spriteRect(c)
      const headTop = c.seated ? c.y - 41 * r.s : r.y
      return {
        id: c.id,
        x: c.x,
        y: c.y,
        top: headTop,
        name: c.agent.name,
        role: c.agent.role,
        color: c.agent.appearance.shirt,
        lead: Boolean(c.agent.lead),
        working: c.working,
        thinking: c.thinking,
        bubble: c.bubble
      }
    })
  }

  handle(ev: OfficeEvent): void {
    handleOfficeEvent(this, ev)
  }
}
