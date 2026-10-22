import type {
  LocalSqlServerConnection,
  LunarGripConnectionResult,
  LunarGripDatabaseList,
  LunarGripProviderError,
  LunarGripQueryResult,
  LunarGripSchemaSnapshot
} from './lunargrip-provider-types'

export const LUNARGRIP_TEST_CONNECTION_CHANNEL = 'lunarGrip:connection:test'
export const LUNARGRIP_READ_SCHEMA_CHANNEL = 'lunarGrip:schema:read'
export const LUNARGRIP_LIST_DATABASES_CHANNEL = 'lunarGrip:databases:list'
export const LUNARGRIP_EXECUTE_SQL_CHANNEL = 'lunarGrip:sql:execute'

export type LunarGripIpcResult<T> = T | { error: LunarGripProviderError }

export type LunarGripIpcApi = {
  testConnection: (
    connection: LocalSqlServerConnection
  ) => Promise<LunarGripIpcResult<LunarGripConnectionResult>>
  readSchema: (
    connection: LocalSqlServerConnection
  ) => Promise<LunarGripIpcResult<LunarGripSchemaSnapshot>>
  listDatabases: (
    connection: LocalSqlServerConnection
  ) => Promise<LunarGripIpcResult<LunarGripDatabaseList>>
  executeSql: (
    connection: LocalSqlServerConnection,
    sql: string,
    database: string
  ) => Promise<LunarGripIpcResult<LunarGripQueryResult>>
}
