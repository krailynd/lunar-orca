import type { Appearance } from './types'
import { type Dir, type Pose, shade } from './sprites'
import { CHIBI_H, CHIBI_W, HEAD_Y, headShape, P, face } from './chibi-core'
import { hairFront, hairBack } from './chibi-hair'

function sideHead(p: P, a: Appearance, blink: boolean): void {
  const skin = a.skin
  headShape(p, skin, 6, 13)
  p.set(5, HEAD_Y + 9, skin)
  p.set(5, HEAD_Y + 10, shade(skin, -0.16))
  const h = a.hair
  const h2 = shade(h, -0.28)
  if (a.hairStyle !== 'bald') {
    for (let j = 0; j < 5; j++) {
      p.row(HEAD_Y + j, 6 + (j === 0 ? 3 : j === 1 ? 1 : 0), 18 - (j === 0 ? 2 : 0), h)
    }
    p.rect(12, HEAD_Y + 4, 7, 8, h)
    p.rect(16, HEAD_Y + 6, 3, 6, h2)
    p.row(HEAD_Y + 1, 9, 12, shade(h, 0.28))
    if (a.hairStyle === 'long') {
      p.rect(13, HEAD_Y + 11, 6, 7, h2)
    }
    if (a.hairStyle === 'bun') {
      p.rect(16, HEAD_Y - 1, 4, 4, h2)
    }
    if (a.hairStyle === 'cap') {
      p.row(HEAD_Y + 5, 3, 11, shade(h, -0.4))
    }
  }
  p.rect(13, HEAD_Y + 8, 2, 3, skin)
  p.set(13, HEAD_Y + 9, shade(skin, -0.3))
  if (blink) {
    p.row(HEAD_Y + 9, 8, 9, shade(skin, -0.45))
  } else {
    p.rect(8, HEAD_Y + 7, 2, 3, '#2a1d2e')
    p.set(8, HEAD_Y + 7, '#ffffff')
  }
  p.set(9, HEAD_Y + 11, '#ef8f86')
}

function accessory(p: P, a: Appearance, view: 'front' | 'back' | 'side'): void {
  if (a.accessory === 'headphones') {
    const band = '#2a2735'
    const cup = '#e0564d'
    if (view === 'side') {
      p.row(HEAD_Y - 1, 8, 16, band)
      p.rect(13, HEAD_Y + 6, 3, 4, cup)
    } else {
      p.row(HEAD_Y - 1, 6, 17, band)
      p.rect(3, HEAD_Y + 6, 2, 4, cup)
      p.rect(19, HEAD_Y + 6, 2, 4, cup)
    }
  } else if (a.accessory === 'glasses' && (view === 'front' || view === 'side')) {
    const frame = '#1a1824'
    if (view === 'front') {
      p.rect(6, HEAD_Y + 6, 5, 4, frame)
      p.rect(13, HEAD_Y + 6, 5, 4, frame)
      p.row(HEAD_Y + 7, 11, 12, frame)
      p.rect(7, HEAD_Y + 7, 3, 2, null)
      p.rect(14, HEAD_Y + 7, 3, 2, null)
    } else {
      p.rect(6, HEAD_Y + 6, 5, 4, frame)
      p.row(HEAD_Y + 7, 11, 15, frame)
      p.rect(7, HEAD_Y + 7, 3, 2, null)
    }
  }
}

function torso(p: P, a: Appearance, view: 'front' | 'back' | 'side', armL = 0, armR = 0): void {
  const shirt = a.shirt
  const s2 = shade(shirt, -0.22)
  const skin = a.skin
  const Y = 17

  p.rect(8, Y, 8, 9, shirt)
  p.rect(14, Y + 1, 2, 8, s2)
  p.row(Y + 8, 8, 15, s2)

  if (view === 'front') {
    p.row(Y, 11, 12, skin)
  }

  // Left arm
  p.rect(5, Y + 1 + armL, 3, 6, shirt)
  p.rect(5, Y + 7 + armL, 3, 2, skin)

  // Right arm
  p.rect(16, Y + 1 + armR, 3, 6, s2)
  p.rect(16, Y + 7 + armR, 3, 2, shade(skin, -0.16))
}

function legs(p: P, a: Appearance, _view: 'front' | 'back' | 'side', step: number): void {
  const pants = a.pants
  const p2 = shade(pants, -0.25)
  const Y = 26
  const offL = step === 1 ? -2 : step === 3 ? 2 : 0
  const offR = step === 1 ? 2 : step === 3 ? -2 : 0

  p.rect(7, Y + offL, 4, 8, pants)
  p.rect(13, Y + offR, 4, 8, p2)

  // Shoes
  p.rect(6, Y + 8 + offL, 5, 2, '#181622')
  p.rect(13, Y + 8 + offR, 5, 2, '#0f0e17')
}

function shifted(out: P, layer: P, dy: number): void {
  for (let y = 0; y < CHIBI_H; y++) {
    const sy = y - dy
    if (sy < 0 || sy >= CHIBI_H) {
      continue
    }
    for (let x = 0; x < CHIBI_W; x++) {
      const c = layer.px[sy][x]
      if (c) {
        out.px[y][x] = c
      }
    }
  }
}

export function paintChibi(a: Appearance, pose: Pose): (string | null)[][] {
  if (pose.kind === 'sit') {
    const out = new P(false)
    const t = pose.typing ?? 0
    const head = new P(false)
    hairBack(head, a)
    accessory(head, a, 'back')
    const body = new P(false)
    torso(body, a, 'back', t === 1 ? -1 : 0, t === 2 ? -1 : 0)
    shifted(out, body, 0)
    shifted(out, head, t === 2 ? 1 : 0)
    out.outline()
    return out.px
  }

  const dir: Dir = pose.dir
  const view = dir === 'up' ? 'back' : dir === 'down' ? 'front' : 'side'
  const flip = dir === 'right'
  const out = new P(flip)
  const step = pose.step ?? 0
  const bob = step === 1 || step === 3 ? -1 : 0
  const lower = new P(flip)
  legs(lower, a, view, step)
  const upper = new P(flip)
  const swing = step === 1 ? 1 : step === 3 ? -1 : 0
  torso(upper, a, view, swing, -swing)

  if (view === 'front') {
    face(upper, a, Boolean(pose.blink))
    hairFront(upper, a)
  } else if (view === 'back') {
    hairBack(upper, a)
  } else {
    sideHead(upper, a, Boolean(pose.blink))
  }
  accessory(upper, a, view)
  shifted(out, lower, 0)
  shifted(out, upper, bob)
  out.outline()
  return out.px
}

const cache = new Map<string, HTMLCanvasElement>()

export function chibiCanvas(a: Appearance, pose: Pose): HTMLCanvasElement {
  const key = JSON.stringify([a.skin, a.hair, a.hairStyle, a.shirt, a.pants, a.accessory, pose])
  const hit = cache.get(key)
  if (hit) {
    return hit
  }
  const c = document.createElement('canvas')
  c.width = CHIBI_W
  c.height = CHIBI_H
  const ctx = c.getContext('2d')
  if (!ctx) {
    return c
  }
  paintChibi(a, pose).forEach((row, y) => {
    row.forEach((col, x) => {
      if (!col) {
        return
      }
      ctx.fillStyle = col
      ctx.fillRect(x, y, 1, 1)
    })
  })
  if (cache.size > 2000) {
    cache.clear()
  }
  cache.set(key, c)
  return c
}
