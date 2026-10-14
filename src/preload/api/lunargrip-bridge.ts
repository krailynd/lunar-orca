import { ipcRenderer } from 'electron'
import type { PreloadApi } from '../api-types'
import {
  LUNARGRIP_READ_SCHEMA_CHANNEL,
  LUNARGRIP_TEST_CONNECTION_CHANNEL
} from '../../shared/lunargrip-ipc-contract'

export const lunarGripApi = {
  testConnection: (connection) => ipcRenderer.invoke(LUNARGRIP_TEST_CONNECTION_CHANNEL, connection),
  readSchema: (connection) => ipcRenderer.invoke(LUNARGRIP_READ_SCHEMA_CHANNEL, connection)
} satisfies PreloadApi['lunarGrip']
