import { describe, expect, it } from 'vitest'
import {
  buildOrcaTaskTraceabilityIndicators,
  createEmptyOrcaTaskTraceability,
  getOrcaTaskLifecycleStatusLabel,
  getOrcaTaskTraceabilityEmptyStates,
  type OrcaTaskTraceability
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

describe('Orca task traceability indicators', () => {
  it('renders honest missing-evidence chips without inventing records', () => {
    expect(buildOrcaTaskTraceabilityIndicators(createEmptyOrcaTaskTraceability())).toEqual([
      'Sin agente asignado',
      'Sin ejecución registrada',
      'Sin PR vinculada',
      'Sin artefactos'
    ])
  })

  it('renders recorded references and a short commit hash', () => {
    const traceability: OrcaTaskTraceability = {
      ...createEmptyOrcaTaskTraceability('completed'),
      agent: { id: 'pi', label: 'Pi Agent' },
      execution: { id: 'exec-1', label: 'Run #1' },
      worktree: { id: 'wt-1', label: 'local-tasks-ui' },
      commit: { id: 'c304764cd0a1b2c3d4e5f60718293a4b5c6d7e8f' },
      pullRequest: { id: 'pr-42', label: 'PR #42', url: 'https://example.test/pr/42' },
      artifacts: [{ id: 'artifact-1' }, { id: 'artifact-2' }]
    }

    expect(buildOrcaTaskTraceabilityIndicators(traceability)).toEqual([
      'Agente: Pi Agent',
      'Ejecución: Run #1',
      'Worktree: local-tasks-ui',
      'Commit: c304764',
      'PR: https://example.test/pr/42',
      'Artefactos: 2'
    ])
  })

  it('labels every lifecycle status in Spanish', () => {
    expect(getOrcaTaskLifecycleStatusLabel('pending')).toBe('Pendiente')
    expect(getOrcaTaskLifecycleStatusLabel('in_progress')).toBe('En progreso')
    expect(getOrcaTaskLifecycleStatusLabel('blocked')).toBe('Bloqueada')
    expect(getOrcaTaskLifecycleStatusLabel('awaiting_approval')).toBe('Esperando aprobación')
    expect(getOrcaTaskLifecycleStatusLabel('completed')).toBe('Completada')
    expect(getOrcaTaskLifecycleStatusLabel('failed')).toBe('Fallida')
    expect(getOrcaTaskLifecycleStatusLabel('cancelled')).toBe('Cancelada')
  })
})
