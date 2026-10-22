import type { Appearance } from './types'
import { shade } from './sprites'

export const CHIBI_W = 26
export const CHIBI_H = 38
export const HEAD_Y = 2

export type Px = (string | null)[][]

export class P {
  px: Px = Array.from({ length: CHIBI_H }, () => Array.from({ length: CHIBI_W }, () => null))
  constructor(public flip = false) {}

  set(x: number, y: number, c: string | null): void {
    const xx = this.flip ? CHIBI_W - 1 - (x + 1) : x + 1
    const yy = y + 1
    if (yy >= 0 && yy < CHIBI_H && xx >= 0 && xx < CHIBI_W) {
      this.px[yy][xx] = c
    }
  }

  rect(x: number, y: number, w: number, h: number, c: string | null): void {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        this.set(i, j, c)
      }
    }
  }

  row(y: number, x0: number, x1: number, c: string): void {
    for (let x = x0; x <= x1; x++) {
      this.set(x, y, c)
    }
  }

  outline(): void {
    const src = this.px.map((r) => r.slice())
    for (let y = 0; y < CHIBI_H; y++) {
      for (let x = 0; x < CHIBI_W; x++) {
        if (src[y][x]) {
          continue
        }
        const n = src[y + 1]?.[x] ?? src[y]?.[x - 1] ?? src[y]?.[x + 1] ?? src[y - 1]?.[x]
        if (n) {
          this.px[y][x] = shade(n, -0.62)
        }
      }
    }
  }
}

export function headShape(p: P, c: string, x0 = 5, w = 14, h = 14): void {
  for (let j = 0; j < h; j++) {
    const inset = j === 0 ? 3 : j === 1 ? 1 : j === h - 1 ? 2 : j === h - 2 ? 1 : 0
    p.row(HEAD_Y + j, x0 + inset, x0 + w - 1 - inset, c)
  }
}

export function face(p: P, a: Appearance, blink: boolean): void {
  const skin = a.skin
  const sk2 = shade(skin, -0.16)
  headShape(p, skin)
  p.rect(16, HEAD_Y + 5, 2, 8, sk2)
  p.row(HEAD_Y + 13, 8, 15, sk2)
  p.set(4, HEAD_Y + 8, skin)
  p.set(4, HEAD_Y + 9, sk2)
  p.set(19, HEAD_Y + 8, sk2)
  p.set(19, HEAD_Y + 9, sk2)
  const ink = '#2a1d2e'
  if (blink) {
    p.row(HEAD_Y + 9, 7, 9, shade(skin, -0.45))
    p.row(HEAD_Y + 9, 14, 16, shade(skin, -0.45))
  } else {
    p.rect(8, HEAD_Y + 7, 2, 3, ink)
    p.rect(14, HEAD_Y + 7, 2, 3, ink)
    p.set(9, HEAD_Y + 7, '#ffffff')
    p.set(15, HEAD_Y + 7, '#ffffff')
    p.set(8, HEAD_Y + 9, '#4b3a5c')
    p.set(14, HEAD_Y + 9, '#4b3a5c')
  }
  const blush = '#ef8f86'
  p.set(7, HEAD_Y + 10, blush)
  p.set(16, HEAD_Y + 10, blush)
  p.row(HEAD_Y + 11, 11, 12, shade(skin, -0.4))
}
