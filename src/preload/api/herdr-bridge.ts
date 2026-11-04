import { ipcRenderer } from 'electron'
import type { HerdrSessionSummary, HerdrApi, PiSubagentTask } from '../../shared/herdr-types'

export const herdrApi: HerdrApi = {
  listSessions: (): Promise<HerdrSessionSummary[]> => ipcRenderer.invoke('herdr:listSessions'),
  focusPane: (sessionName: string, paneId: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('herdr:focusPane', sessionName, paneId),
  listPiSubagents: (targetCwd?: string): Promise<PiSubagentTask[]> =>
    ipcRenderer.invoke('herdr:listPiSubagents', targetCwd)
}

export type { HerdrApi }
