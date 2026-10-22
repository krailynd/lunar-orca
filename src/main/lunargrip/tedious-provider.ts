import { Connection, Request, type ConnectionConfiguration } from 'tedious'
import type {
  LocalSqlServerConnection,
  LunarGripConnectionResult,
  LunarGripDatabaseList,
  LunarGripProvider,
  LunarGripProviderError,
  LunarGripQueryResult,
  LunarGripSchemaColumn,
  LunarGripSchemaSnapshot,
  LunarGripSchemaTable
} from '../../shared/lunargrip-provider-types'
import { LunarGripProviderAbortError } from './lunargrip-provider'

const CONNECT_TIMEOUT_MS = 8000

// Why: a runaway result set must not exhaust renderer memory through IPC.
const MAX_RESULT_ROWS = 1000

// Why: keep the schema query aligned with INFORMATION_SCHEMA so it works against
// SQL Server 2012+ without relying on sys catalog views filtered by permissions.
const SCHEMA_QUERY = `SELECT t.TABLE_SCHEMA AS [schema], t.TABLE_NAME AS [name],
       c.COLUMN_NAME AS columnName, c.DATA_TYPE AS dataType,
       CASE WHEN c.IS_NULLABLE = 'YES' THEN 1 ELSE 0 END AS isNullable,
       CASE WHEN kcu.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS isPrimaryKey
FROM INFORMATION_SCHEMA.TABLES t
JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA AND c.TABLE_NAME = kcu.TABLE_NAME AND c.COLUMN_NAME = kcu.COLUMN_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME, c.ORDINAL_POSITION;`

const LIST_DATABASES_QUERY = 'SELECT name FROM sys.databases WHERE state = 0 ORDER BY name;'

type RequestColumn = { metadata: { colName: string }; value: unknown }

type RequestOutcome = {
  columns: string[]
  rows: Record<string, unknown>[]
  messages: string[]
  rowCount: number
  elapsedMs: number
  truncated: boolean
  error?: LunarGripProviderError
}

export class TediousLunarGripProvider implements LunarGripProvider {
  testConnection(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripConnectionResult> {
    return withConnection<LunarGripConnectionResult>(
      connection,
      signal,
      async () => ({ status: 'connected', connectionId: connection.connectionId }),
      (error) => ({
        status: 'failed',
        connectionId: connection.connectionId,
        error: toConnectionError(error)
      })
    )
  }

  readSchema(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripSchemaSnapshot> {
    return withConnection(
      connection,
      signal,
      async (client) => {
        const outcome = await runRequest(client, SCHEMA_QUERY, signal)
        if (outcome.error) {
          return staleSnapshot(connection, outcome.error)
        }
        return {
          status: 'connected',
          connectionId: connection.connectionId,
          database: connection.database,
          generatedAt: Date.now(),
          tables: mapSchemaRows(outcome.rows)
        }
      },
      (error) => staleSnapshot(connection, toConnectionError(error))
    )
  }

  listDatabases(
    connection: LocalSqlServerConnection,
    signal: AbortSignal
  ): Promise<LunarGripDatabaseList> {
    return withConnection(connection, signal, async (client) => {
      const outcome = await runRequest(client, LIST_DATABASES_QUERY, signal)
      const key = outcome.columns[0] ?? 'name'
      const databases = outcome.rows
        .map((row) => asString(row[key]))
        .filter((name) => name.length > 0)
      return { databases }
    })
  }

  executeSql(
    connection: LocalSqlServerConnection,
    sql: string,
    database: string,
    signal: AbortSignal
  ): Promise<LunarGripQueryResult> {
    // Why: pick the target database at connect time; USE cannot run inside a prepared batch.
    const target: LocalSqlServerConnection = {
      ...connection,
      database: database.length > 0 ? database : connection.database
    }
    return withConnection<LunarGripQueryResult>(
      target,
      signal,
      async (client) => {
        const outcome = await runRequest(client, sql, signal)
        const messages = outcome.truncated
          ? [...outcome.messages, `Resultado limitado a ${MAX_RESULT_ROWS} filas.`]
          : outcome.messages
        return {
          columns: outcome.columns,
          rows: outcome.rows,
          rowCount: outcome.rowCount,
          elapsedMs: outcome.elapsedMs,
          messages,
          ...(outcome.error ? { error: outcome.error } : {})
        }
      },
      (error) => emptyQueryResult(toConnectionError(error))
    )
  }
}

async function withConnection<T>(
  connection: LocalSqlServerConnection,
  signal: AbortSignal,
  operation: (client: Connection) => Promise<T>,
  onError?: (error: unknown) => T
): Promise<T> {
  throwIfAborted(signal)
  let client: Connection | undefined
  try {
    client = await openConnection(connection, signal)
    return await operation(client)
  } catch (error: unknown) {
    if (error instanceof LunarGripProviderAbortError || !onError) {
      throw error
    }
    return onError(error)
  } finally {
    client?.close()
  }
}

function buildConfiguration(connection: LocalSqlServerConnection): ConnectionConfiguration {
  return {
    server: connection.host,
    options: {
      port: connection.port,
      database: connection.database.length > 0 ? connection.database : undefined,
      encrypt: connection.encrypt ?? true,
      trustServerCertificate: connection.trustServerCertificate ?? false,
      connectTimeout: CONNECT_TIMEOUT_MS
    },
    authentication: {
      type: 'default',
      options: { userName: connection.username, password: connection.password ?? '' }
    }
  }
}

function openConnection(
  connection: LocalSqlServerConnection,
  signal: AbortSignal
): Promise<Connection> {
  return new Promise<Connection>((resolve, reject) => {
    if (signal.aborted) {
      reject(new LunarGripProviderAbortError())
      return
    }

    const client = new Connection(buildConfiguration(connection))
    const onAbort = (): void => {
      try {
        client.close()
      } catch {
        // Why: the connection may already be closing; abort wins regardless.
      }
      reject(new LunarGripProviderAbortError())
    }

    signal.addEventListener('abort', onAbort, { once: true })
    client.on('error', (error) => {
      reject(error)
    })
    client.connect((error) => {
      signal.removeEventListener('abort', onAbort)
      if (error) {
        try {
          client.close()
        } catch {
          // Why: requesters only need the original connect error.
        }
        reject(error)
        return
      }
      resolve(client)
    })
  })
}

function runRequest(client: Connection, sql: string, signal: AbortSignal): Promise<RequestOutcome> {
  return new Promise<RequestOutcome>((resolve, reject) => {
    if (signal.aborted) {
      reject(new LunarGripProviderAbortError())
      return
    }

    const startedAt = Date.now()
    const outcome: RequestOutcome = {
      columns: [],
      rows: [],
      messages: [],
      rowCount: 0,
      elapsedMs: 0,
      truncated: false
    }
    let settled = false
    const onAbort = (): void => {
      if (settled) {
        return
      }
      try {
        request.cancel()
      } catch {
        // Why: cancelling a finished request is harmless.
      }
      settle(() => reject(new LunarGripProviderAbortError()))
    }
    const settle = (action: () => void): void => {
      if (settled) {
        return
      }
      settled = true
      signal.removeEventListener('abort', onAbort)
      action()
    }

    const request = new Request(sql, (error, rowCount) => {
      if (error) {
        outcome.error = toQueryError(error.message)
        outcome.messages.push(error.message)
      }
      outcome.rowCount = outcome.rows.length > 0 ? outcome.rows.length : Math.max(rowCount ?? 0, 0)
      outcome.elapsedMs = Date.now() - startedAt
      settle(() => resolve(outcome))
    })
    request.on('columnMetadata', (metadata) => {
      const list = Array.isArray(metadata) ? metadata : Object.values(metadata)
      for (const column of list) {
        outcome.columns.push(column.colName)
      }
    })
    request.on('row', (columns: RequestColumn[]) => {
      if (outcome.rows.length >= MAX_RESULT_ROWS) {
        outcome.truncated = true
        return
      }
      const row: Record<string, unknown> = {}
      for (const column of columns) {
        row[column.metadata.colName] = column.value
      }
      outcome.rows.push(row)
    })
    client.on('infoMessage', (info) => {
      outcome.messages.push(info.message)
    })
    client.on('errorMessage', (info) => {
      outcome.messages.push(info.message)
      outcome.error = toQueryError(info.message)
    })

    signal.addEventListener('abort', onAbort, { once: true })
    client.execSql(request)
  })
}

function mapSchemaRows(rows: Record<string, unknown>[]): LunarGripSchemaTable[] {
  const tables = new Map<string, LunarGripSchemaTable>()
  for (const row of rows) {
    const schema = asString(row.schema)
    const name = asString(row.name)
    const columnName = asString(row.columnName)
    if (schema.length === 0 || name.length === 0 || columnName.length === 0) {
      continue
    }
    const key = `${schema}.${name}`
    const table = tables.get(key) ?? { schema, name, columns: [] }
    tables.set(key, table)
    const column: LunarGripSchemaColumn = {
      name: columnName,
      type: asString(row.dataType),
      nullable: Boolean(row.isNullable),
      isPrimaryKey: Boolean(row.isPrimaryKey)
    }
    table.columns.push(column)
  }
  return [...tables.values()]
}

function emptyQueryResult(error: LunarGripProviderError): LunarGripQueryResult {
  return { columns: [], rows: [], rowCount: 0, elapsedMs: 0, messages: [], error }
}

function staleSnapshot(
  connection: LocalSqlServerConnection,
  error: LunarGripProviderError
): LunarGripSchemaSnapshot {
  return {
    status: 'stale',
    connectionId: connection.connectionId,
    database: connection.database,
    generatedAt: Date.now(),
    tables: [],
    error
  }
}

function toConnectionError(error: unknown): LunarGripProviderError {
  return {
    code: 'provider_unavailable',
    message: error instanceof Error ? error.message : String(error),
    retryable: true
  }
}

function toQueryError(message: string): LunarGripProviderError {
  return { code: 'invalid_request', message, retryable: false }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new LunarGripProviderAbortError()
  }
}
