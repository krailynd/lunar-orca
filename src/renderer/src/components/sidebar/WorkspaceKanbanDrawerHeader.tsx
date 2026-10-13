import React from 'react'
import { Bot, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { WorkspaceStatusDefinition } from '../../../../shared/worktree/types'
import SidebarFilter from './SidebarFilter'
import WorkspaceKanbanSearchField from './WorkspaceKanbanSearchField'
import WorkspaceKanbanSettingsMenu from './WorkspaceKanbanSettingsMenu'
import { translate } from '@/i18n/i18n'

type WorkspaceKanbanDrawerHeaderProps = {
  selectedCount: number
  query: string
  isFiltering: boolean
  isTooLarge: boolean
  matchCount: number
  totalCount: number
  onQueryChange: (query: string) => void
  onClearQuery: () => void
  workspaceStatuses: readonly WorkspaceStatusDefinition[]
  activeAgentCountByStatus?: ReadonlyMap<string, number>
  syncTaskStatusFromWorkspaceBoard: boolean
  onSyncTaskStatusFromWorkspaceBoardChange: (enabled: boolean) => void
  onRenameStatus: (statusId: string, label: string) => void
  onChangeStatusColor: (statusId: string, color: string) => void
  onChangeStatusIcon: (statusId: string, icon: string) => void
  onMoveStatus: (statusId: string, direction: -1 | 1) => void
  onRemoveStatus: (statusId: string) => void
  onAddStatus: () => void
  onFilterMenuOpenChange: (open: boolean) => void
  onClose: () => void
}

export default function WorkspaceKanbanDrawerHeader({
  selectedCount,
  query,
  isFiltering,
  isTooLarge,
  matchCount,
  totalCount,
  onQueryChange,
  onClearQuery,
  workspaceStatuses,
  activeAgentCountByStatus,
  syncTaskStatusFromWorkspaceBoard,
  onSyncTaskStatusFromWorkspaceBoardChange,
  onRenameStatus,
  onChangeStatusColor,
  onChangeStatusIcon,
  onMoveStatus,
  onRemoveStatus,
  onAddStatus,
  onFilterMenuOpenChange,
  onClose
}: WorkspaceKanbanDrawerHeaderProps): React.JSX.Element {
  return (
    <>
      <SheetHeader className="border-b border-worktree-sidebar-border px-4 py-3 pr-32">
        {/* Why: SheetTitle is the sheet's aria-labelledby target and renders an
            <h2>, so the field must be its sibling, not a descendant. */}
        <div className="flex items-center gap-2">
          <SheetTitle className="flex shrink-0 items-center gap-2 text-sm">
            <span>
              {translate(
                'auto.components.sidebar.WorkspaceKanbanDrawerHeader.c6a77ab0f4',
                'Workspace board'
              )}
            </span>
            <span
              data-testid="workspace-board-multi-agent-hub-badge"
              className="inline-flex items-center gap-1 rounded-full border border-workspace-status-review/35 bg-workspace-status-review/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-git-graph-lane-4"
            >
              <Bot className="size-3" />
              Lunar Orca Multi-Agent Hub
            </span>
            {selectedCount > 1 ? (
              <span className="rounded-full bg-worktree-sidebar-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {selectedCount}{' '}
                {translate(
                  'auto.components.sidebar.WorkspaceKanbanDrawerHeader.81870af08f',
                  'selected'
                )}
              </span>
            ) : null}
          </SheetTitle>
          <WorkspaceKanbanSearchField
            query={query}
            isFiltering={isFiltering}
            isTooLarge={isTooLarge}
            matchCount={matchCount}
            totalCount={totalCount}
            onQueryChange={onQueryChange}
            onClear={onClearQuery}
            onClose={onClose}
          />
        </div>
        <div
          data-testid="workspace-board-multi-agent-status-bar"
          className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {workspaceStatuses.map((status) => {
              const count = activeAgentCountByStatus?.get(status.id) ?? 0
              return (
                <span
                  key={status.id}
                  data-testid={`workspace-board-column-agent-count-${status.id}`}
                  className="inline-flex items-center gap-1 rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px]"
                >
                  <span className="font-medium text-foreground/85">{status.label}:</span>
                  <span className="font-mono font-semibold text-git-graph-lane-4">{count}</span>
                  <span>agents</span>
                </span>
              )
            })}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={syncTaskStatusFromWorkspaceBoard}
            data-testid="workspace-board-quick-sync-toggle"
            onClick={() =>
              onSyncTaskStatusFromWorkspaceBoardChange(!syncTaskStatusFromWorkspaceBoard)
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors',
              syncTaskStatusFromWorkspaceBoard
                ? 'border-workspace-status-review/45 bg-workspace-status-review/15 text-git-graph-lane-4'
                : 'border-border/60 bg-background/60 text-muted-foreground hover:text-foreground'
            )}
          >
            <RefreshCw className="size-2.5" />
            <span>Sync Status with Tasks</span>
            <span className="font-mono uppercase">
              {syncTaskStatusFromWorkspaceBoard ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
        <SheetDescription className="sr-only">
          {translate(
            'auto.components.sidebar.WorkspaceKanbanDrawerHeader.e1a34450fc',
            'Organize workspaces by status and open workspace cards.'
          )}
        </SheetDescription>
      </SheetHeader>

      <div className="absolute right-3 top-2.5 flex items-center gap-1">
        <SidebarFilter
          preserveWorkspaceBoardOpen
          tooltipSide="top"
          contentSide="bottom"
          onMenuOpenChange={onFilterMenuOpenChange}
        />
        <WorkspaceKanbanSettingsMenu
          workspaceStatuses={workspaceStatuses}
          syncTaskStatusFromWorkspaceBoard={syncTaskStatusFromWorkspaceBoard}
          onSyncTaskStatusFromWorkspaceBoardChange={onSyncTaskStatusFromWorkspaceBoardChange}
          onRenameStatus={onRenameStatus}
          onChangeStatusColor={onChangeStatusColor}
          onChangeStatusIcon={onChangeStatusIcon}
          onMoveStatus={onMoveStatus}
          onRemoveStatus={onRemoveStatus}
          onAddStatus={onAddStatus}
        />
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={translate(
            'auto.components.sidebar.WorkspaceKanbanDrawerHeader.f369f5c5a3',
            'Close'
          )}
          onClick={onClose}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </>
  )
}
