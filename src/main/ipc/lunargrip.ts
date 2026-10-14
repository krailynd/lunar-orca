import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import {
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
import { DemoLunarGripProvider } from '../lunargrip/lunargrip-provider'
import {
  isProviderError,
  validateLocalSqlServerConnection
} from '../lunargrip/lunargrip-validation'

export function registerLunarGripHandlers(
  provider: LunarGripProvider = new DemoLunarGripProvider()
): void {
  ipcMain.removeHandler(LUNARGRIP_TEST_CONNECTION_CHANNEL)
  ipcMain.removeHandler(LUNARGRIP_READ_SCHEMA_CHANNEL)

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
