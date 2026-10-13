// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import { HARNESS_CATEGORIES, formatRelativeTime } from './home-page-types'

describe('HomePage types and helpers', () => {
  it('defines 6 primary harness categories with appropriate agent coverage', () => {
    expect(HARNESS_CATEGORIES).toHaveLength(6)
    const categoryIds = HARNESS_CATEGORIES.map((c) => c.id)
    expect(categoryIds).toEqual(['pi', 'opencode', 'hermes', 'claude', 'codex', 'antigravity'])

    const piCategory = HARNESS_CATEGORIES.find((c) => c.id === 'pi')
    expect(piCategory?.agents).toContain('pi')

    const opencodeCategory = HARNESS_CATEGORIES.find((c) => c.id === 'opencode')
    expect(opencodeCategory?.agents).toContain('opencode')

    const hermesCategory = HARNESS_CATEGORIES.find((c) => c.id === 'hermes')
    expect(hermesCategory?.agents).toContain('hermes')

    const claudeCategory = HARNESS_CATEGORIES.find((c) => c.id === 'claude')
    expect(claudeCategory?.agents).toContain('claude')

    const codexCategory = HARNESS_CATEGORIES.find((c) => c.id === 'codex')
    expect(codexCategory?.agents).toContain('codex')

    const antigravityCategory = HARNESS_CATEGORIES.find((c) => c.id === 'antigravity')
    expect(antigravityCategory?.agents).toContain('antigravity')
  })

  it('formats relative timestamps gracefully', () => {
    expect(formatRelativeTime(null)).toBe('Reciente')
    expect(formatRelativeTime(undefined)).toBe('Reciente')
    expect(formatRelativeTime('invalid-date')).toBe('Reciente')

    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('Hace un momento')
  })
})
