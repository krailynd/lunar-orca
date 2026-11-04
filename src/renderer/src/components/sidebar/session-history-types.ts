import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'

export type SavedRepoItem = {
  id: string
  path: string
  displayName: string
  kind?: 'git' | 'folder'
  hostId?: string | null
}

export type SavedWorktreeItem = {
  id: string
  repoId: string
  displayName: string
  path: string
  branch?: string
  isMainWorktree?: boolean
  hostId?: string | null
  terminals: {
    id: string
    title?: string
    customTitle?: string | null
  }[]
}

export type SavedSessionSnapshot = {
  id: string
  name: string
  description?: string
  timestamp: string
  createdAt: number
  color: string
  worktreesCount: number
  terminalsCount: number
  activeWorktreeName?: string
  worktreeNames: string[]
  reposData?: SavedRepoItem[]
  worktreesData?: SavedWorktreeItem[]
}

const STORAGE_KEY = 'lunar_orca_saved_sessions_history'

export const COLOR_OPTIONS = [
  { name: 'Azul Espacial', value: '#3b82f6' },
  { name: 'Esmeralda', value: '#10b981' },
  { name: 'Violeta Neón', value: '#8b5cf6' },
  { name: 'Ámbar', value: '#f59e0b' },
  { name: 'Rosa Fucsia', value: '#ec4899' },
  { name: 'Cian Glacial', value: '#06b6d4' }
]

export function useSessionHistory() {
  const [sessions, setSessions] = useState<SavedSessionSnapshot[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch (e) {
      console.error('Error saving session history to storage', e)
    }
  }, [sessions])

  const saveSession = (
    name: string,
    description: string,
    customTimestamp?: string,
    color?: string
  ) => {
    const reposList = useAppStore.getState().repos
    const allWorktrees = useAppStore.getState().worktreesByRepo
    const worktreeList = Object.values(allWorktrees).flat()
    const tabsMap = useAppStore.getState().tabsByWorktree
    const totalTerminals = Object.values(tabsMap).reduce((acc, tabs) => acc + tabs.length, 0)
    const activeWorktreeId = useAppStore.getState().activeWorktreeId
    const activeWt = worktreeList.find((w) => w.id === activeWorktreeId)

    const now = new Date()
    const autoTimestamp =
      customTimestamp?.trim() ||
      new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(now)

    const reposData: SavedRepoItem[] = reposList.map((r) => ({
      id: r.id,
      path: r.path,
      displayName: r.displayName,
      kind: r.kind,
      hostId: r.executionHostId ?? r.connectionId ?? null
    }))

    const worktreesData: SavedWorktreeItem[] = worktreeList.map((wt) => {
      const tabs = tabsMap[wt.id] ?? []
      return {
        id: wt.id,
        repoId: wt.repoId,
        displayName: wt.displayName,
        path: wt.path,
        branch: wt.branch,
        isMainWorktree: wt.isMainWorktree,
        hostId: wt.hostId ?? null,
        terminals: tabs.map((t) => ({
          id: t.id,
          title: t.title,
          customTitle: t.customTitle
        }))
      }
    })

    const newSnapshot: SavedSessionSnapshot = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || `Sesión de Trabajo #${sessions.length + 1}`,
      description: description.trim(),
      timestamp: autoTimestamp,
      createdAt: Date.now(),
      color: color || COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].value,
      worktreesCount: worktreeList.length,
      terminalsCount: totalTerminals,
      activeWorktreeName: activeWt?.displayName,
      worktreeNames: worktreeList.map((w) => w.displayName),
      reposData,
      worktreesData
    }

    setSessions((prev) => [newSnapshot, ...prev])
    return newSnapshot
  }

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const renameSession = (id: string, newName: string, newTimestamp?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) {
          return s
        }
        return {
          ...s,
          name: newName.trim() || s.name,
          timestamp: newTimestamp !== undefined ? newTimestamp : s.timestamp
        }
      })
    )
  }

  const updateSessionColor = (id: string, color: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)))
  }

  return {
    sessions,
    saveSession,
    deleteSession,
    renameSession,
    updateSessionColor
  }
}
