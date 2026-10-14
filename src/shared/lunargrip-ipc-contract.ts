import type {
  LocalSqlServerConnection,
  LunarGripConnectionResult,
  LunarGripProviderError,
  LunarGripSchemaSnapshot
} from './lunargrip-provider-types'

export const LUNARGRIP_TEST_CONNECTION_CHANNEL = 'lunarGrip:connection:test'
export const LUNARGRIP_READ_SCHEMA_CHANNEL = 'lunarGrip:schema:read'

export type LunarGripIpcResult<T> = T | { error: LunarGripProviderError }

export type LunarGripIpcApi = {
  testConnection: (
    connection: LocalSqlServerConnection
  ) => Promise<LunarGripIpcResult<LunarGripConnectionResult>>
  readSchema: (
    connection: LocalSqlServerConnection
  ) => Promise<LunarGripIpcResult<LunarGripSchemaSnapshot>>
}
