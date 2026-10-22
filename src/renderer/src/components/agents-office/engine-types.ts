import type { Agent, OfficeEffect, Point } from './types'

export type Action =
  | { kind: 'walk'; to: Point }
  | { kind: 'wait'; ms: number }
  | { kind: 'sit' }
  | { kind: 'say'; text: string; ms: number }
  | { kind: 'vanish' }
  | { kind: 'fx'; fx: OfficeEffect }

export type Character = {
  id: string
  agent: Agent
  x: number
  y: number
  dir: 'down' | 'up' | 'left' | 'right'
  seated: boolean
  path: Point[]
  actions: Action[]
  waitLeft: number
  t: number
  blinkAt: number
  working: boolean
  thinking: boolean
  bubble: string | null
  bubbleUntil: number
  gone: boolean
}

export type Snapshot = {
  id: string
  x: number
  y: number
  top: number
  name: string
  role: string
  color: string
  lead: boolean
  working: boolean
  thinking: boolean
  bubble: string | null
}

export const SPEED = 150
export const BODY = 0.95
export const BACKREST = 12.4
