import { useEffect } from 'react'
import type { GitStatusEntry } from '../../../../shared/git-status-types'

export function useQuickGitStagingKeyboard({
  isOpen,
  setIsOpen,
  allFilteredEntries,
  selectedEntry,
  setSelectedEntry,
  toggleStageSelected,
  handleOpenInEditor
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  allFilteredEntries: GitStatusEntry[]
  selectedEntry: GitStatusEntry | null
  setSelectedEntry: (entry: GitStatusEntry | null) => void
  toggleStageSelected: () => void
  handleOpenInEditor: (entry: GitStatusEntry) => void
}) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (allFilteredEntries.length === 0) {
          return
        }
        const currentIndex = selectedEntry
          ? allFilteredEntries.findIndex(
              (item) => item.path === selectedEntry.path && item.area === selectedEntry.area
            )
          : -1
        const nextIndex = (currentIndex + 1) % allFilteredEntries.length
        setSelectedEntry(allFilteredEntries[nextIndex])
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (allFilteredEntries.length === 0) {
          return
        }
        const currentIndex = selectedEntry
          ? allFilteredEntries.findIndex(
              (item) => item.path === selectedEntry.path && item.area === selectedEntry.area
            )
          : 0
        const prevIndex = currentIndex <= 0 ? allFilteredEntries.length - 1 : currentIndex - 1
        setSelectedEntry(allFilteredEntries[prevIndex])
        return
      }

      if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault()
        toggleStageSelected()
        return
      }

      if (e.key === 'Enter' && selectedEntry && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault()
        handleOpenInEditor(selectedEntry)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    setIsOpen,
    allFilteredEntries,
    selectedEntry,
    setSelectedEntry,
    toggleStageSelected,
    handleOpenInEditor
  ])
}
