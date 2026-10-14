import { describe, expect, it } from 'vitest'
import {
  createEmptyOrcaTaskTraceability,
  getOrcaTaskTraceabilityEmptyStates
} from './orca-task-traceability'

describe('Orca task traceability contract', () => {
  it('creates an honest pending state without invented references or metrics', () => {
    const traceability = createEmptyOrcaTaskTraceability()

    expect(traceability).toEqual({
      project: null,
      agent: null,
      execution: null,
      worktree: null,
      commit: null,
      pullRequest: null,
      artifacts: [],
      dependencies: [],
      status: 'pending',
      blockedReason: null,
      startedAt: null,
      completedAt: null
    })
  })

  it('reports missing evidence explicitly', () => {
    const states = getOrcaTaskTraceabilityEmptyStates(
      createEmptyOrcaTaskTraceability('awaiting_approval')
    )

    expect(states).toEqual([
      'No hay ejecuciones registradas.',
      'No hay PR vinculada.',
      'No hay artefactos.',
      'No hay agente asignado.'
    ])
  })
})
