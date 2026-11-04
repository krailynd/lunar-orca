import net from 'node:net'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { ipcMain } from 'electron'

import type { HerdrPaneInfo, HerdrSessionSummary, PiSubagentTask } from '../../shared/herdr-types'
export type { HerdrPaneInfo, HerdrSessionSummary, PiSubagentTask }

export function getPiSubagents(targetCwd?: string): PiSubagentTask[] {
  const homeDir = os.homedir()
  const dir = path.join(homeDir, '.pi/agent/gentle-agents/tasks')
  if (!fs.existsSync(dir)) {
    return []
  }
  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    const stats = files
      .map((f) => {
        try {
          const s = fs.statSync(path.join(dir, f))
          return { f, mtime: s.mtimeMs }
        } catch {
          return null
        }
      })
      .filter((s): s is { f: string; mtime: number } => s !== null)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 30)

    const normTarget = targetCwd ? path.resolve(targetCwd).toLowerCase() : ''
    const tasks: PiSubagentTask[] = []

    for (const item of stats) {
      try {
        const content = fs.readFileSync(path.join(dir, item.f), 'utf8')
        const data = JSON.parse(content) as { task?: Record<string, unknown> }
        const t = data?.task
        if (!t || !t.id) {
          continue
        }
        const taskCwd = t.cwd ? path.resolve(String(t.cwd)).toLowerCase() : ''
        if (
          normTarget &&
          taskCwd &&
          taskCwd !== normTarget &&
          !taskCwd.startsWith(`${normTarget}${path.sep}`)
        ) {
          continue
        }
        tasks.push({
          id: String(t.id),
          agent: String(t.agent || 'subagent'),
          label: String(t.label || t.prompt || ''),
          task: String(t.prompt || ''),
          status: (t.status as PiSubagentTask['status']) || 'running',
          startedAt: typeof t.startedAt === 'number' ? t.startedAt : undefined,
          finishedAt: typeof t.finishedAt === 'number' ? t.finishedAt : undefined,
          cwd: t.cwd ? String(t.cwd) : undefined,
          mtime: item.mtime
        })
      } catch {
        // ignore parse error
      }
    }
    return tasks
  } catch {
    return []
  }
}

function queryHerdrSocket(
  socketPath: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(socketPath, () => {
      const payload = `${JSON.stringify({ id: `orca-${Date.now()}`, method, params })}\n`
      client.write(payload)
    })

    let buf = ''
    client.on('data', (data) => {
      buf += data.toString()
    })

    client.on('end', () => {
      try {
        const parsed = JSON.parse(buf)
        if (parsed.error) {
          reject(new Error(parsed.error.message || 'Herdr socket error'))
        } else {
          resolve(parsed.result)
        }
      } catch (err) {
        reject(err)
      }
    })

    client.on('error', (err) => {
      reject(err)
    })

    client.setTimeout(1200, () => {
      client.destroy()
      reject(new Error('Herdr socket timeout'))
    })
  })
}

export async function getHerdrSessions(): Promise<HerdrSessionSummary[]> {
  const homeDir = os.homedir()
  const sessionsBase = path.join(homeDir, '.config/herdr/sessions')
  const results: HerdrSessionSummary[] = []

  // Check default socket
  const defaultSocket = path.join(homeDir, '.config/herdr/herdr.sock')
  if (fs.existsSync(defaultSocket)) {
    try {
      const res = (await queryHerdrSocket(defaultSocket, 'pane.list')) as {
        panes?: unknown[]
      } | null
      results.push({
        sessionName: 'default',
        socketPath: defaultSocket,
        isRunning: true,
        panes: formatHerdrPanes(res?.panes || [])
      })
    } catch {
      // socket exists but not listening
    }
  }

  if (fs.existsSync(sessionsBase)) {
    try {
      const entries = fs.readdirSync(sessionsBase, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue
        }
        const sessionSocket = path.join(sessionsBase, entry.name, 'herdr.sock')
        if (fs.existsSync(sessionSocket)) {
          try {
            const res = (await queryHerdrSocket(sessionSocket, 'pane.list')) as {
              panes?: unknown[]
            } | null
            results.push({
              sessionName: entry.name,
              socketPath: sessionSocket,
              isRunning: true,
              panes: formatHerdrPanes(res?.panes || [])
            })
          } catch {
            // inactive session
          }
        }
      }
    } catch {
      // ignore read error
    }
  }

  return results
}

function formatHerdrPanes(panes: unknown[]): HerdrPaneInfo[] {
  return panes.map((raw) => {
    const p = raw as Record<string, unknown>
    const tokens = (p.tokens as Record<string, string>) || {}
    const agentSession = p.agent_session as { value?: string } | undefined

    return {
      pane_id: String(p.pane_id || ''),
      workspace_id: String(p.workspace_id || ''),
      terminal_id: String(p.terminal_id || ''),
      title: String(p.terminal_title || p.terminal_title_stripped || p.title || 'Agent'),
      agent: String(p.agent || 'pi'),
      agent_status: String(p.agent_status || 'idle'),
      cwd: String(p.cwd || ''),
      foreground_cwd: p.foreground_cwd ? String(p.foreground_cwd) : undefined,
      focused: Boolean(p.focused),
      model: tokens.m_model || 'pi-agent',
      tokens,
      session_path: agentSession?.value
    }
  })
}

export function registerHerdrIpcHandlers(): void {
  ipcMain.removeHandler('herdr:listSessions')
  ipcMain.handle('herdr:listSessions', async () => {
    return await getHerdrSessions()
  })

  ipcMain.removeHandler('herdr:focusPane')
  ipcMain.handle('herdr:focusPane', async (_event, sessionName: string, paneId: string) => {
    const homeDir = os.homedir()
    const socketPath =
      sessionName === 'default'
        ? path.join(homeDir, '.config/herdr/herdr.sock')
        : path.join(homeDir, '.config/herdr/sessions', sessionName, 'herdr.sock')
    if (fs.existsSync(socketPath)) {
      try {
        await queryHerdrSocket(socketPath, 'pane.focus', { pane_id: paneId })

        // Activar la ventana de terminal (Alacritty / terminal emulator) vía Hyprland si aplica
        try {
          const { exec } = await import('node:child_process')
          exec('hyprctl repl <<< "hl.dispatch(hl.dsp.focus({ window = \'class:Alacritty\' }))"')
        } catch {
          // ignore window focus error
        }

        return { success: true }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        return { success: false, error: message }
      }
    }
    return { success: false, error: 'Socket not found' }
  })

  ipcMain.removeHandler('herdr:listPiSubagents')
  ipcMain.handle('herdr:listPiSubagents', async (_event, targetCwd?: string) => {
    return getPiSubagents(targetCwd)
  })
}
