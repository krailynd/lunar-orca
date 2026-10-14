export type OrcaTaskLifecycleStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type OrcaTaskReference = {
  id: string
  label?: string
  url?: string
}

export type OrcaTaskTraceability = {
  project: OrcaTaskReference | null
  agent: OrcaTaskReference | null
  execution: OrcaTaskReference | null
  worktree: OrcaTaskReference | null
  commit: OrcaTaskReference | null
  pullRequest: OrcaTaskReference | null
  artifacts: readonly OrcaTaskReference[]
  dependencies: readonly OrcaTaskReference[]
  status: OrcaTaskLifecycleStatus
  blockedReason: string | null
  startedAt: number | null
  completedAt: number | null
}

export function createEmptyOrcaTaskTraceability(
  status: OrcaTaskLifecycleStatus = 'pending'
): OrcaTaskTraceability {
  return {
    project: null,
    agent: null,
    execution: null,
    worktree: null,
    commit: null,
    pullRequest: null,
    artifacts: [],
    dependencies: [],
    status,
    blockedReason: null,
    startedAt: null,
    completedAt: null
  }
}

export function getOrcaTaskTraceabilityEmptyStates(
  traceability: OrcaTaskTraceability
): readonly string[] {
  const emptyStates: string[] = []
  if (!traceability.execution) {
    emptyStates.push('No hay ejecuciones registradas.')
  }
  if (!traceability.pullRequest) {
    emptyStates.push('No hay PR vinculada.')
  }
  if (traceability.artifacts.length === 0) {
    emptyStates.push('No hay artefactos.')
  }
  if (!traceability.agent) {
    emptyStates.push('No hay agente asignado.')
  }
  return emptyStates
}
