import { useCallback, useEffect, useLayoutEffect } from 'react'
import { toast } from 'sonner'
import { subscribeCmdJRowIndexJump } from '@/lib/cmd-j-row-index-jump'
import { openWorkspaceBrowserTab } from '@/lib/workspace-browser-tab-open'
import { translate } from '@/i18n/i18n'
import { useAppStore } from '@/store'
import {
  buildSearchUrl,
  DEFAULT_SEARCH_ENGINE,
  looksLikeSearchQuery,
  normalizeBrowserNavigationUrl
} from '../../../shared/browser-url'
import type { WorktreeJumpPaletteFilter } from './use-worktree-jump-palette-filter'
import type { WorktreeJumpPaletteLocalState } from './use-worktree-jump-palette-local-state'
import type { WorktreeJumpPaletteQuickActions } from './use-worktree-jump-palette-quick-actions'
import type { WorktreeJumpPaletteSections } from './use-worktree-jump-palette-sections'
import type { WorktreeJumpPaletteSelectionActions } from './use-worktree-jump-palette-selection-actions'
import type { WorktreeJumpPaletteSelectionLifecycle } from './use-worktree-jump-palette-selection-lifecycle'
import type { WorktreeJumpPaletteStoreState } from './use-worktree-jump-palette-store-state'
import type { WorktreeJumpPaletteWorktrees } from './use-worktree-jump-palette-worktrees'
import type { WorktreeJumpPaletteTaskUrl } from './use-worktree-jump-palette-task-url'
import { createWorktreeJumpPaletteWorktreeHandler } from './worktree-jump-palette-create-worktree'

type WorktreeJumpPaletteCreateActionInput = WorktreeJumpPaletteStoreState &
  WorktreeJumpPaletteLocalState &
  WorktreeJumpPaletteFilter &
  WorktreeJumpPaletteQuickActions &
  WorktreeJumpPaletteSections &
  WorktreeJumpPaletteSelectionActions &
  WorktreeJumpPaletteSelectionLifecycle &
  WorktreeJumpPaletteTaskUrl &
  Pick<WorktreeJumpPaletteWorktrees, 'hasQuery'>

export function useWorktreeJumpPaletteCreateAction({
  digitShortcutItemsRef,
  paletteSections,
  visible,
  hasQuery,
  query,
  handleSelectItem,
  inputRef,
  setDialogElement,
  ...createWorktreeInput
}: WorktreeJumpPaletteCreateActionInput) {
  useLayoutEffect(() => {
    digitShortcutItemsRef.current = paletteSections.visibleOpenTabItems
  }, [digitShortcutItemsRef, paletteSections])
  useEffect(() => {
    if (!visible || hasQuery || query.length > 0) {
      return
    }
    return subscribeCmdJRowIndexJump((index) => {
      const item = digitShortcutItemsRef.current[index]
      if (item) {
        handleSelectItem(item)
      }
    })
  }, [digitShortcutItemsRef, handleSelectItem, hasQuery, query.length, visible])

  const handleCreateWorktree = createWorktreeJumpPaletteWorktreeHandler(createWorktreeInput)

  const handleWebSearch = useCallback(
    (rawQuery?: string) => {
      const trimmed = (rawQuery ?? createWorktreeInput.liveQueryRef.current ?? query).trim()
      if (!trimmed) {
        return
      }
      const state = useAppStore.getState()
      const workspaceId =
        state.activeWorktreeId ?? createWorktreeInput.previousWorktreeIdRef.current
      if (!workspaceId) {
        toast.error(
          translate('auto.components.WorktreeJumpPalette.2c38630a01', 'Workspace no longer exists')
        )
        return
      }
      const searchEngine = state.browserDefaultSearchEngine ?? DEFAULT_SEARCH_ENGINE
      const kagiSessionLink = state.browserKagiSessionLink
      const explicitUrl = !looksLikeSearchQuery(trimmed)
        ? normalizeBrowserNavigationUrl(trimmed)
        : null
      const url = explicitUrl ?? buildSearchUrl(trimmed, searchEngine, { kagiSessionLink })
      const intent = explicitUrl
        ? ({ kind: 'url' } as const)
        : ({ kind: 'search', engine: searchEngine } as const)
      createWorktreeInput.skipRestoreFocusRef.current = true
      createWorktreeInput.closeModal()
      createWorktreeInput.setSelectedItemId('')
      void openWorkspaceBrowserTab({
        workspaceId,
        url,
        intent,
        focusOnCreate: true
      }).catch((error: Error) => {
        toast.error(
          error?.message ||
            translate(
              'auto.components.WorktreeJumpPalette.webSearchError',
              'Unable to open browser tab'
            )
        )
      })
    },
    [createWorktreeInput, query]
  )

  const handleCloseAutoFocus = useCallback((event: Event) => event.preventDefault(), [])
  const focusPaletteInput = useCallback(() => inputRef.current?.focus(), [inputRef])
  const setDialogElementFromNode = useCallback(
    (node: HTMLDivElement | null) =>
      setDialogElement(node?.closest<HTMLElement>('[role="dialog"]') ?? null),
    [setDialogElement]
  )
  const handleOpenAutoFocus = useCallback((_event: Event) => {}, [])
  return {
    handleCreateWorktree,
    handleWebSearch,
    handleCloseAutoFocus,
    focusPaletteInput,
    setDialogElementFromNode,
    handleOpenAutoFocus
  }
}

export type WorktreeJumpPaletteCreateAction = ReturnType<typeof useWorktreeJumpPaletteCreateAction>
