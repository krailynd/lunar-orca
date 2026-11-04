import type { GitStatusEntry } from '../../../../shared/git-status-types'

export type ParsedHunkLine = {
  type: 'add' | 'del' | 'normal'
  oldLineNumber?: number
  newLineNumber?: number
  content: string
}

export type ParsedHunk = {
  header: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: ParsedHunkLine[]
}

export type ParsedDiff = {
  hunks: ParsedHunk[]
  totalAdded: number
  totalRemoved: number
  isBinary?: boolean
  binaryType?: string
}

export type QuickGitStagingProps = {
  open: boolean
  onClose: () => void
  initialSelectedEntry?: GitStatusEntry | null
}
