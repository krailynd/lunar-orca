import { ipcRenderer } from 'electron'
import type { PreloadApi } from '../api-types'
import {
  LUNARGRIP_EXECUTE_SQL_CHANNEL,
  LUNARGRIP_LIST_DATABASES_CHANNEL,
  LUNARGRIP_READ_SCHEMA_CHANNEL,
  LUNARGRIP_TEST_CONNECTION_CHANNEL
} from '../../shared/lunargrip-ipc-contract'

export const lunarGripApi = {
  testConnection: (connection) => ipcRenderer.invoke(LUNARGRIP_TEST_CONNECTION_CHANNEL, connection),
  readSchema: (connection) => ipcRenderer.invoke(LUNARGRIP_READ_SCHEMA_CHANNEL, connection),
  listDatabases: (connection) => ipcRenderer.invoke(LUNARGRIP_LIST_DATABASES_CHANNEL, connection),
  executeSql: (connection, sql, database) =>
    ipcRenderer.invoke(LUNARGRIP_EXECUTE_SQL_CHANNEL, { connection, sql, database })
} satisfies PreloadApi['lunarGrip']
