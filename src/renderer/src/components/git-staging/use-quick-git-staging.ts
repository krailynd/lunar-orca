import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/store'
import { useActiveWorktree } from '@/store/selectors'
import { getConnectionId } from '@/lib/connection-context'
import type { GitStatusEntry } from '../../../../shared/git-status-types'
import type { GitDiffResult } from '../../../../shared/git-diff-compare-types'
import type { RuntimeGitContext } from '@/runtime/runtime-git-client-context'
import {
  stageRuntimeGitPath,
  unstageRuntimeGitPath,
  bulkStageRuntimeGitPaths,
  bulkUnstageRuntimeGitPaths
} from '@/runtime/runtime-git-working-tree-client'
import { getRuntimeGitDiff } from '@/runtime/runtime-git-diff-client'
import { getRuntimeGitStatus } from '@/runtime/runtime-git-status-client'
import {
  useWorktreeGitOwnerTarget,
  requireGitOwnerTarget
} from '@/components/right-sidebar/worktree-git-owner-target'
import { openUncommittedEntry } from '@/components/right-sidebar/source-control/listing/open-uncommitted-entry'
import { parseGitDiff } from './diff-parser'
import type { ParsedDiff } from './quick-git-staging-types'
import { useQuickGitStagingKeyboard } from './use-quick-git-staging-keyboard'

export function useQuickGitStaging() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<GitStatusEntry | null>(null)
  const [diffResult, setDiffResult] = useState<GitDiffResult | null>(null)
  const [isLoadingDiff, setIsLoadingDiff] = useState(false)
  const [isMutating, setIsMutating] = useState(false)

  const activeWorktreeId = useAppStore((s) => s.activeWorktreeId)
  const activeWorktree = useActiveWorktree()
  const worktreePath = activeWorktree?.path ?? ''
  const activeRepoTarget = useWorktreeGitOwnerTarget(activeWorktreeId)

  const gitStatusEntries = useAppStore((s) =>
    activeWorktreeId ? (s.gitStatusByWorktree[activeWorktreeId] ?? null) : null
  )

  const entries: GitStatusEntry[] = useMemo(() => {
    return Array.isArray(gitStatusEntries) ? gitStatusEntries : []
  }, [gitStatusEntries])

  const stagedEntries = useMemo(() => entries.filter((e) => e.area === 'staged'), [entries])
  const unstagedEntries = useMemo(
    () => entries.filter((e) => e.area === 'unstaged' || e.area === 'untracked'),
    [entries]
  )

  const filteredStaged = useMemo(() => {
    if (!searchQuery.trim()) {
      return stagedEntries
    }
    const q = searchQuery.toLowerCase()
    return stagedEntries.filter((e) => e.path.toLowerCase().includes(q))
  }, [stagedEntries, searchQuery])

  const filteredUnstaged = useMemo(() => {
    if (!searchQuery.trim()) {
      return unstagedEntries
    }
    const q = searchQuery.toLowerCase()
    return unstagedEntries.filter((e) => e.path.toLowerCase().includes(q))
  }, [unstagedEntries, searchQuery])

  const allFilteredEntries = useMemo(
    () => [...filteredUnstaged, ...filteredStaged],
    [filteredUnstaged, filteredStaged]
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }
    if (selectedEntry) {
      const exists = entries.find(
        (e) => e.path === selectedEntry.path && e.area === selectedEntry.area
      )
      if (exists) {
        return
      }
    }
    if (allFilteredEntries.length > 0) {
      setSelectedEntry(allFilteredEntries[0])
    } else {
      setSelectedEntry(null)
      setDiffResult(null)
    }
  }, [isOpen, entries, selectedEntry, allFilteredEntries])

  const getContext = useCallback((): RuntimeGitContext | null => {
    if (!activeWorktreeId || !worktreePath || !activeRepoTarget) {
      return null
    }
    const connectionId = getConnectionId(activeWorktreeId) ?? undefined
    return {
      target: requireGitOwnerTarget(activeRepoTarget),
      worktreeId: activeWorktreeId,
      worktreePath,
      connectionId
    }
  }, [activeWorktreeId, worktreePath, activeRepoTarget])

  const refreshStatus = useCallback(async () => {
    const context = getContext()
    if (!context || !activeWorktreeId) {
      return
    }
    try {
      const status = await getRuntimeGitStatus(context)
      useAppStore.getState().setGitStatus(activeWorktreeId, status)
    } catch (err) {
      console.warn('[QuickGitStaging] status refresh failed', err)
    }
  }, [getContext, activeWorktreeId])

  useEffect(() => {
    if (!isOpen || !selectedEntry) {
      setDiffResult(null)
      return
    }
    const context = getContext()
    if (!context) {
      return
    }

    let canceled = false
    setIsLoadingDiff(true)

    getRuntimeGitDiff(context, {
      filePath: selectedEntry.path,
      staged: selectedEntry.area === 'staged',
      compareAgainstHead: false
    })
      .then((res) => {
        if (!canceled) {
          setDiffResult(res)
        }
      })
      .catch((err) => {
        if (!canceled) {
          console.warn('[QuickGitStaging] diff failed', err)
          setDiffResult(null)
        }
      })
      .finally(() => {
        if (!canceled) {
          setIsLoadingDiff(false)
        }
      })

    return () => {
      canceled = true
    }
  }, [isOpen, selectedEntry, getContext])

  const parsedDiff: ParsedDiff = useMemo(
    () => parseGitDiff(diffResult, selectedEntry?.path ?? ''),
    [diffResult, selectedEntry]
  )

  const handleStage = useCallback(
    async (entry: GitStatusEntry) => {
      const context = getContext()
      if (!context) {
        return
      }
      setIsMutating(true)
      try {
        await stageRuntimeGitPath(context, entry.path)
        await refreshStatus()
      } finally {
        setIsMutating(false)
      }
    },
    [getContext, refreshStatus]
  )

  const handleUnstage = useCallback(
    async (entry: GitStatusEntry) => {
      const context = getContext()
      if (!context) {
        return
      }
      setIsMutating(true)
      try {
        await unstageRuntimeGitPath(context, entry.path)
        await refreshStatus()
      } finally {
        setIsMutating(false)
      }
    },
    [getContext, refreshStatus]
  )

  const handleStageAll = useCallback(async () => {
    const context = getContext()
    if (!context || unstagedEntries.length === 0) {
      return
    }
    setIsMutating(true)
    try {
      await bulkStageRuntimeGitPaths(
        context,
        unstagedEntries.map((e) => e.path)
      )
      await refreshStatus()
    } finally {
      setIsMutating(false)
    }
  }, [getContext, unstagedEntries, refreshStatus])

  const handleUnstageAll = useCallback(async () => {
    const context = getContext()
    if (!context || stagedEntries.length === 0) {
      return
    }
    setIsMutating(true)
    try {
      await bulkUnstageRuntimeGitPaths(
        context,
        stagedEntries.map((e) => e.path)
      )
      await refreshStatus()
    } finally {
      setIsMutating(false)
    }
  }, [getContext, stagedEntries, refreshStatus])

  const handleOpenInEditor = useCallback(
    (entry: GitStatusEntry) => {
      if (!activeWorktreeId || !worktreePath) {
        return
      }
      openUncommittedEntry(useAppStore.getState(), activeWorktreeId, worktreePath, entry)
      setIsOpen(false)
    },
    [activeWorktreeId, worktreePath]
  )

  const toggleStageSelected = useCallback(() => {
    if (!selectedEntry) {
      return
    }
    if (selectedEntry.area === 'staged') {
      void handleUnstage(selectedEntry)
    } else {
      void handleStage(selectedEntry)
    }
  }, [selectedEntry, handleStage, handleUnstage])

  useQuickGitStagingKeyboard({
    isOpen,
    setIsOpen,
    allFilteredEntries,
    selectedEntry,
    setSelectedEntry,
    toggleStageSelected,
    handleOpenInEditor
  })

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev)
    }
    window.addEventListener('lunar-orca:toggle-git-staging', handleToggle)
    return () => window.removeEventListener('lunar-orca:toggle-git-staging', handleToggle)
  }, [])

  return {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    selectedEntry,
    setSelectedEntry,
    diffResult,
    parsedDiff,
    isLoadingDiff,
    isMutating,
    filteredStaged,
    filteredUnstaged,
    stagedCount: stagedEntries.length,
    unstagedCount: unstagedEntries.length,
    handleStage,
    handleUnstage,
    handleStageAll,
    handleUnstageAll,
    handleOpenInEditor,
    toggleStageSelected,
    refreshStatus,
    worktreeName: activeWorktree?.displayName ?? activeWorktree?.path ?? ''
  }
}
