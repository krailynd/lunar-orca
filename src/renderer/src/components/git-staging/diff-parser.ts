import { structuredPatch } from 'diff'
import type { GitDiffResult } from '../../../../shared/git-diff-compare-types'
import type { ParsedDiff, ParsedHunk, ParsedHunkLine } from './quick-git-staging-types'

export function parseGitDiff(
  diffResult: GitDiffResult | null | undefined,
  filePath: string
): ParsedDiff {
  if (!diffResult) {
    return { hunks: [], totalAdded: 0, totalRemoved: 0 }
  }

  if (diffResult.kind === 'binary') {
    return {
      hunks: [],
      totalAdded: 0,
      totalRemoved: 0,
      isBinary: true,
      binaryType: diffResult.mimeType ?? 'Archivo binario'
    }
  }

  const { originalContent = '', modifiedContent = '' } = diffResult

  const patch = structuredPatch(filePath, filePath, originalContent, modifiedContent, '', '', {
    context: 3
  })

  let totalAdded = 0
  let totalRemoved = 0

  const hunks: ParsedHunk[] = patch.hunks.map((hunk) => {
    let oldLine = hunk.oldStart
    let newLine = hunk.newStart

    const lines: ParsedHunkLine[] = hunk.lines.map((rawLine) => {
      const marker = rawLine[0]
      const content = rawLine.slice(1)

      if (marker === '+') {
        totalAdded += 1
        const lineObj: ParsedHunkLine = {
          type: 'add',
          newLineNumber: newLine,
          content
        }
        newLine += 1
        return lineObj
      }

      if (marker === '-') {
        totalRemoved += 1
        const lineObj: ParsedHunkLine = {
          type: 'del',
          oldLineNumber: oldLine,
          content
        }
        oldLine += 1
        return lineObj
      }

      const lineObj: ParsedHunkLine = {
        type: 'normal',
        oldLineNumber: oldLine,
        newLineNumber: newLine,
        content
      }
      oldLine += 1
      newLine += 1
      return lineObj
    })

    return {
      header: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
      oldStart: hunk.oldStart,
      oldLines: hunk.oldLines,
      newStart: hunk.newStart,
      newLines: hunk.newLines,
      lines
    }
  })

  return {
    hunks,
    totalAdded,
    totalRemoved
  }
}
