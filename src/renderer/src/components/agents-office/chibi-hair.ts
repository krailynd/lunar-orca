import type { Appearance } from './types'
import { shade } from './sprites'
import { HEAD_Y, headShape, type P } from './chibi-core'

export function hairFront(p: P, a: Appearance): void {
  const h = a.hair
  const h2 = shade(h, -0.28)
  const h3 = shade(h, 0.28)
  const top = (rows: number) => {
    for (let j = 0; j < rows; j++) {
      const inset = j === 0 ? 3 : j === 1 ? 1 : 0
      p.row(HEAD_Y + j, 5 + inset, 18 - inset, h)
    }
    p.row(HEAD_Y + 1, 8, 11, h3)
    p.set(7, HEAD_Y + 2, h3)
    p.row(HEAD_Y + rows - 1, 15, 18, h2)
  }

  switch (a.hairStyle) {
    case 'bald':
      p.row(HEAD_Y + 1, 8, 10, shade(a.skin, 0.25))
      return
    case 'cap':
      top(5)
      p.row(HEAD_Y + 5, 4, 19, h2)
      p.row(HEAD_Y + 6, 3, 13, shade(h, -0.4))
      p.set(11, HEAD_Y + 2, '#ffffff')
      p.set(12, HEAD_Y + 2, '#ffffff')
      p.rect(5, HEAD_Y + 7, 1, 2, shade(a.skin, -0.5))
      return
    case 'long':
      top(5)
      p.rect(4, HEAD_Y + 3, 2, 15, h)
      p.rect(18, HEAD_Y + 3, 2, 15, h2)
      p.rect(3, HEAD_Y + 8, 1, 9, h2)
      p.rect(20, HEAD_Y + 8, 1, 9, h2)
      for (let x = 6; x <= 17; x += 3) {
        p.set(x, HEAD_Y + 5, h)
      }
      return
    case 'bun':
      p.rect(9, HEAD_Y - 2, 6, 3, h)
      p.row(HEAD_Y - 2, 10, 11, h3)
      top(4)
      p.rect(5, HEAD_Y + 4, 1, 4, h)
      p.rect(18, HEAD_Y + 4, 1, 4, h2)
      return
    case 'curly':
      for (let j = -1; j < 6; j++) {
        p.row(HEAD_Y + j, 4, 19, h)
      }
      for (let x = 4; x <= 19; x++) {
        if (x % 3 !== 0) {
          p.set(x, HEAD_Y - 2, h)
        }
        if (x % 3 === 1) {
          p.set(x, HEAD_Y + 6, h2)
        }
      }
      for (let j = 0; j < 8; j++) {
        p.set(j % 2 ? 3 : 4, HEAD_Y + j, h)
        p.set(j % 2 ? 20 : 19, HEAD_Y + j, h2)
      }
      p.rect(4, HEAD_Y + 6, 1, 3, h)
      p.rect(19, HEAD_Y + 6, 1, 3, h2)
      return
    case 'short':
      top(5)
      p.set(6, HEAD_Y + 5, h)
      p.set(9, HEAD_Y + 5, h)
      p.set(10, HEAD_Y + 5, h)
      p.set(14, HEAD_Y + 5, h2)
      p.rect(5, HEAD_Y + 5, 1, 3, h)
      p.rect(18, HEAD_Y + 5, 1, 3, h2)
  }
}

export function hairBack(p: P, a: Appearance): void {
  const h = a.hair
  const h2 = shade(h, -0.28)
  const h3 = shade(h, 0.25)
  if (a.hairStyle === 'bald') {
    headShape(p, a.skin)
    p.rect(15, HEAD_Y + 3, 3, 10, shade(a.skin, -0.16))
    p.row(HEAD_Y + 2, 8, 10, shade(a.skin, 0.25))
    return
  }
  headShape(p, h)
  p.rect(15, HEAD_Y + 4, 3, 9, h2)
  p.row(HEAD_Y + 12, 7, 16, h2)
  p.row(HEAD_Y + 2, 8, 11, h3)
  p.set(7, HEAD_Y + 3, h3)
  p.rect(10, HEAD_Y + 13, 4, 1, shade(a.skin, -0.2))
  if (a.hairStyle === 'long') {
    p.rect(5, HEAD_Y + 12, 14, 6, h)
    p.rect(15, HEAD_Y + 12, 4, 6, h2)
  }
  if (a.hairStyle === 'bun') {
    p.rect(9, HEAD_Y - 2, 6, 4, h2)
    p.row(HEAD_Y - 2, 10, 12, h)
  }
}
