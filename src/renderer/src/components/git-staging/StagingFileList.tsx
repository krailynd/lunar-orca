import React from 'react'
import { Plus, Minus, ExternalLink } from 'lucide-react'
import { FileTypeIcon } from '@/components/FileTypeIcon'
import { cn } from '@/lib/utils'
import type { GitStatusEntry } from '../../../../shared/git-status-types'

function getStatusLetter(status: GitStatusEntry['status']): string {
  switch (status) {
    case 'added':
    case 'untracked':
      return 'U'
    case 'deleted':
      return 'D'
    default:
      return 'M'
  }
}

function getStatusColor(status: GitStatusEntry['status']): string {
  switch (status) {
    case 'added':
    case 'untracked':
      return 'text-emerald-400'
    case 'deleted':
      return 'text-red-400'
    default:
      return 'text-amber-400'
  }
}

export const StagingFileList = React.memo(function StagingFileList({
  title,
  entries,
  selectedEntry,
  onSelect,
  onAction,
  actionType,
  onOpenInEditor
}: {
  title: string
  entries: GitStatusEntry[]
  selectedEntry: GitStatusEntry | null
  onSelect: (entry: GitStatusEntry) => void
  onAction: (entry: GitStatusEntry) => void
  actionType: 'stage' | 'unstage'
  onOpenInEditor: (entry: GitStatusEntry) => void
}): React.JSX.Element {
  if (entries.length === 0) {
    return <div className="p-3 text-xs text-muted-foreground/60 italic">Sin archivos</div>
  }

  return (
    <div className="space-y-0.5">
      <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase flex items-center justify-between">
        <span>{title}</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/60">{entries.length}</span>
      </div>
      {entries.map((entry) => {
        const isSelected = selectedEntry?.path === entry.path && selectedEntry?.area === entry.area
        const statusLetter = getStatusLetter(entry.status)
        const statusColor = getStatusColor(entry.status)

        return (
          <div
            key={`${entry.area}:${entry.path}`}
            onClick={() => onSelect(entry)}
            className={cn(
              'group flex items-center justify-between px-3 py-1.5 text-xs rounded-lg cursor-pointer transition',
              isSelected
                ? 'bg-primary/15 text-primary-foreground font-medium'
                : 'text-foreground/80 hover:bg-muted/40 hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
              <FileTypeIcon filePath={entry.path} className="size-3.5 shrink-0 opacity-80" />
              <span className="truncate">{entry.path}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn('text-[10px] font-mono font-bold', statusColor)}>
                {statusLetter}
              </span>
              <button
                type="button"
                title="Abrir en Editor (Enter)"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenInEditor(entry)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background/80 rounded transition"
              >
                <ExternalLink className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
              <button
                type="button"
                title={actionType === 'stage' ? 'Stage change' : 'Unstage change'}
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(entry)
                }}
                className={cn(
                  'p-1 rounded transition opacity-0 group-hover:opacity-100',
                  actionType === 'stage'
                    ? 'hover:bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-amber-500/20 text-amber-400'
                )}
              >
                {actionType === 'stage' ? (
                  <Plus className="size-3.5" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
})
