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

export const ORCA_TASK_MISSING_EVIDENCE = {
  execution: 'No hay ejecuciones registradas.',
  pullRequest: 'No hay PR vinculada.',
  artifacts: 'No hay artefactos.',
  agent: 'No hay agente asignado.'
} as const

export function getOrcaTaskTraceabilityEmptyStates(
  traceability: OrcaTaskTraceability
): readonly string[] {
  const emptyStates: string[] = []
  if (!traceability.execution) {
    emptyStates.push(ORCA_TASK_MISSING_EVIDENCE.execution)
  }
  if (!traceability.pullRequest) {
    emptyStates.push(ORCA_TASK_MISSING_EVIDENCE.pullRequest)
  }
  if (traceability.artifacts.length === 0) {
    emptyStates.push(ORCA_TASK_MISSING_EVIDENCE.artifacts)
  }
  if (!traceability.agent) {
    emptyStates.push(ORCA_TASK_MISSING_EVIDENCE.agent)
  }
  return emptyStates
}

const ORCA_TASK_LIFECYCLE_STATUS_LABELS: Record<OrcaTaskLifecycleStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  blocked: 'Bloqueada',
  awaiting_approval: 'Esperando aprobación',
  completed: 'Completada',
  failed: 'Fallida',
  cancelled: 'Cancelada'
}

export function getOrcaTaskLifecycleStatusLabel(status: OrcaTaskLifecycleStatus): string {
  return ORCA_TASK_LIFECYCLE_STATUS_LABELS[status]
}

function referenceLabel(reference: OrcaTaskReference): string {
  return reference.label ?? reference.id
}

export const ORCA_TASK_MISSING_EVIDENCE_INDICATORS = {
  execution: 'Sin ejecución registrada',
  pullRequest: 'Sin PR vinculada',
  artifacts: 'Sin artefactos',
  agent: 'Sin agente asignado'
} as const

function shortCommitId(id: string): string {
  return id.length > 7 ? id.slice(0, 7) : id
}

/**
 * Derives the visible traceability chips. Missing evidence is stated explicitly so the UI never
 * implies an execution, PR, agent, or artifact that was not actually recorded.
 */
export function buildOrcaTaskTraceabilityIndicators(
  traceability: OrcaTaskTraceability
): readonly string[] {
  const indicators: string[] = [
    traceability.agent
      ? `Agente: ${referenceLabel(traceability.agent)}`
      : ORCA_TASK_MISSING_EVIDENCE_INDICATORS.agent,
    traceability.execution
      ? `Ejecución: ${referenceLabel(traceability.execution)}`
      : ORCA_TASK_MISSING_EVIDENCE_INDICATORS.execution
  ]

  if (traceability.worktree) {
    indicators.push(`Worktree: ${referenceLabel(traceability.worktree)}`)
  }
  if (traceability.commit) {
    indicators.push(`Commit: ${shortCommitId(traceability.commit.id)}`)
  }

  indicators.push(
    traceability.pullRequest
      ? `PR: ${traceability.pullRequest.url ?? referenceLabel(traceability.pullRequest)}`
      : ORCA_TASK_MISSING_EVIDENCE_INDICATORS.pullRequest
  )
  indicators.push(
    traceability.artifacts.length > 0
      ? `Artefactos: ${traceability.artifacts.length}`
      : ORCA_TASK_MISSING_EVIDENCE_INDICATORS.artifacts
  )

  return indicators
}
