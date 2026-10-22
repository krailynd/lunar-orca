import type { OfficeSeat } from './office-types'

export const DEFAULT_OFFICE_WIDTH = 1672
export const DEFAULT_OFFICE_HEIGHT = 940

export const DEFAULT_DESK_SEATS: OfficeSeat[] = [
  { x: 440, y: 432, zone: 'desk' },
  { x: 844, y: 432, zone: 'desk' },
  { x: 1249, y: 432, zone: 'desk' },
  { x: 397, y: 690, zone: 'desk' },
  { x: 844, y: 690, zone: 'desk' },
  { x: 1288, y: 690, zone: 'desk' }
]

export const DEFAULT_LOUNGE_SEATS: OfficeSeat[] = [
  { x: 857, y: 265, zone: 'meeting' },
  { x: 1440, y: 330, zone: 'coffee' },
  { x: 230, y: 560, zone: 'lounge' },
  { x: 1180, y: 820, zone: 'lounge' }
]

export const AGENT_PALETTES = [
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#14b8a6'
]
