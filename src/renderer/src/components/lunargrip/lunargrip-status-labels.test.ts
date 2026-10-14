import { describe, expect, it } from 'vitest'
import { LUNARGRIP_STATUS_LABELS } from './lunargrip-status-labels'

describe('LunarGrip status labels', () => {
  it('defines an explicit label for every state', () => {
    expect(Object.values(LUNARGRIP_STATUS_LABELS)).toHaveLength(9)
    expect(Object.values(LUNARGRIP_STATUS_LABELS)).not.toContain('Conectado')
  })

  it('keeps demo visibly separate from real connection states', () => {
    expect(LUNARGRIP_STATUS_LABELS.demo).toBe('DEMO · Sin conexión real')
    expect(LUNARGRIP_STATUS_LABELS.connected).toBe('Conectada')
  })
})
