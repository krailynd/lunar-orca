import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import {
  LUNARGRIP_EXECUTE_SQL_CHANNEL,
  LUNARGRIP_LIST_DATABASES_CHANNEL,
  LUNARGRIP_READ_SCHEMA_CHANNEL,
  LUNARGRIP_TEST_CONNECTION_CHANNEL
} from '../../shared/lunargrip-ipc-contract'
import type {
  LocalSqlServerConnection,
  LunarGripProvider,
  LunarGripProviderError
} from '../../shared/lunargrip-provider-types'
import { abortWhenRendererGone } from './renderer-lifetime-abort'
import { toSafeLunarGripProviderError } from '../lunargrip/lunargrip-errors'
import { TediousLunarGripProvider } from '../lunargrip/tedious-provider'
import {
  isProviderError,
  validateLocalSqlServerConnection
} from '../lunargrip/lunargrip-validation'

const SQL_MAX_LENGTH = 100_000
const DATABASE_NAME_MAX_LENGTH = 128

type ExecuteSqlPayload = {
  connection: unknown
  sql: string
  database: string
}

export function registerLunarGripHandlers(
  provider: LunarGripProvider = new TediousLunarGripProvider()
): void {
  ipcMain.removeHandler(LUNARGRIP_TEST_CONNECTION_CHANNEL)
  ipcMain.removeHandler(LUNARGRIP_READ_SCHEMA_CHANNEL)
  ipcMain.removeHandler(LUNARGRIP_LIST_DATABASES_CHANNEL)
  ipcMain.removeHandler(LUNARGRIP_EXECUTE_SQL_CHANNEL)

  ipcMain.handle(LUNARGRIP_TEST_CONNECTION_CHANNEL, (event, value: unknown) =>
    withLunarGripRequest(event, value, (connection, signal) =>
      provider.testConnection(connection, signal)
    )
  )
  ipcMain.handle(LUNARGRIP_READ_SCHEMA_CHANNEL, (event, value: unknown) =>
    withLunarGripRequest(event, value, (connection, signal) =>
      provider.readSchema(connection, signal)
    )
  )
  ipcMain.handle(LUNARGRIP_LIST_DATABASES_CHANNEL, (event, value: unknown) =>
    withLunarGripRequest(event, value, (connection, signal) =>
      provider.listDatabases(connection, signal)
    )
  )
  ipcMain.handle(LUNARGRIP_EXECUTE_SQL_CHANNEL, (event, value: unknown) => {
    const payload = validateExecuteSqlRequest(value)
    if ('code' in payload) {
      return { error: payload }
    }
    return withLunarGripRequest(event, payload.connection, (connection, signal) =>
      provider.executeSql(connection, payload.sql, payload.database, signal)
    )
  })
}

async function withLunarGripRequest<T>(
  event: IpcMainInvokeEvent,
  value: unknown,
  operation: (connection: LocalSqlServerConnection, signal: AbortSignal) => Promise<T>
): Promise<T | { error: LunarGripProviderError }> {
  const connection = validateLocalSqlServerConnection(value)
  if (isProviderError(connection)) {
    return { error: connection }
  }

  const lifetime = abortWhenRendererGone(event.sender)
  try {
    return await operation(connection, lifetime.signal)
  } catch (error: unknown) {
    return { error: toSafeLunarGripProviderError(error) }
  } finally {
    lifetime.dispose()
  }
}

function validateExecuteSqlRequest(value: unknown): ExecuteSqlPayload | LunarGripProviderError {
  if (!isRecord(value)) {
    return invalidRequest('A SQL execution request is required.')
  }

  const { connection, sql, database } = value
  if (typeof sql !== 'string' || sql.length === 0 || sql.length > SQL_MAX_LENGTH) {
    return invalidRequest('The SQL statement is required and must be within the size limit.')
  }
  if (typeof database !== 'string' || database.length > DATABASE_NAME_MAX_LENGTH) {
    return invalidRequest('The target database name is invalid.')
  }

  return { connection, sql, database }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function invalidRequest(message: string): LunarGripProviderError {
  return { code: 'invalid_request', message, retryable: false }
}
