export type LunarGripConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'loading'
  | 'partial'
  | 'stale'
  | 'failed'

export type LunarGripProviderErrorCode =
  | 'invalid_request'
  | 'remote_host_rejected'
  | 'provider_unavailable'
  | 'cancelled'

export type LocalSqlServerConnection = {
  connectionId: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  encrypt?: boolean
  trustServerCertificate?: boolean
}

export type LunarGripProviderError = {
  code: LunarGripProviderErrorCode
  message: string
  retryable: boolean
}

export type LunarGripConnectionResult = {
  status: LunarGripConnectionStatus
  connectionId: string
  error?: LunarGripProviderError
}

export type LunarGripSchemaColumn = {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
}

export type LunarGripSchemaTable = {
  schema: string
  name: string
  columns: LunarGripSchemaColumn[]
}

export type LunarGripSchemaSnapshot = {
  status: Extract<LunarGripConnectionStatus, 'connected' | 'partial' | 'stale'>
  connectionId: string
  database: string
  generatedAt: number
  tables: LunarGripSchemaTable[]
  error?: LunarGripProviderError
}

export type LunarGripDatabaseList = {
  databases: string[]
}

export type LunarGripQueryResult = {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  elapsedMs: number
  messages: string[]
  error?: LunarGripProviderError
}

export type LunarGripProvider = {
  testConnection(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripConnectionResult>
  readSchema(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripSchemaSnapshot>
  listDatabases(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripDatabaseList>
  executeSql(
    connection: LocalSqlServerConnection,
    sql: string,
    database: string,
    signal: AbortSignal
  ): Promise<LunarGripQueryResult>
}
