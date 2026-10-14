import type {
  LocalSqlServerConnection,
  LunarGripConnectionResult,
  LunarGripProvider,
  LunarGripProviderError,
  LunarGripSchemaSnapshot
} from '../../shared/lunargrip-provider-types'

const DEMO_PROVIDER_ERROR: LunarGripProviderError = {
  code: 'provider_unavailable',
  message: 'The real database provider is not implemented.',
  retryable: false
}

export class LunarGripProviderAbortError extends Error {
  readonly code = 'cancelled' as const
  readonly retryable = false

  constructor() {
    super('The LunarGrip request was cancelled.')
  }
}

/**
 * Fase 1A provider: validates the contract without opening a database connection.
 */
export class DemoLunarGripProvider implements LunarGripProvider {
  async testConnection(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripConnectionResult> {
    throwIfAborted(signal)
    return {
      status: 'failed',
      connectionId: connection.connectionId,
      error: { ...DEMO_PROVIDER_ERROR }
    }
  }

  async readSchema(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripSchemaSnapshot> {
    throwIfAborted(signal)
    return {
      status: 'stale',
      connectionId: connection.connectionId,
      database: connection.database,
      generatedAt: Date.now(),
      tables: [],
      error: { ...DEMO_PROVIDER_ERROR }
    }
  }
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new LunarGripProviderAbortError()
  }
}
