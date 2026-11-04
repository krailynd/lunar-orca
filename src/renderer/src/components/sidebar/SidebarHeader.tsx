import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store'
import { translate } from '@/i18n/i18n'
import { SidebarHeaderActions } from './sidebar-header-actions'

type SidebarHeaderProps = {
  onWorkspaceBoardMenuOpenChange: (open: boolean) => void
  activityOptionsTarget?: React.Ref<HTMLDivElement>
}

const SidebarHeader = React.memo(function SidebarHeader({
  onWorkspaceBoardMenuOpenChange,
  activityOptionsTarget
}: SidebarHeaderProps) {
  // Subscribe this memoized header to locale changes before using translate().
  useTranslation()
  const sidebarBody = useAppStore((s) => s.sidebarBody ?? 'workspaces')
  const groupBy = useAppStore((s) => s.groupBy)
  const agentsViewActive = sidebarBody === 'agents'

  const sidebarTitle =
    groupBy === 'repo'
      ? translate('dashboard.sidebar.projects', 'Projects')
      : translate('dashboard.sidebar.workspaces', 'Workspaces')

  return (
    <div className="mt-2 flex h-8 min-w-0 shrink-0 items-center justify-between gap-1.5 px-2">
      <div className="flex min-w-0 items-center gap-1">
        <span
          className="min-w-0 truncate select-none pl-2 pr-0.5 text-xs font-semibold text-muted-foreground/80"
          data-sidebar-section-title={groupBy === 'repo' ? 'projects' : 'workspaces'}
        >
          {sidebarTitle}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <SidebarHeaderActions
          onWorkspaceBoardMenuOpenChange={onWorkspaceBoardMenuOpenChange}
          agentsViewActive={agentsViewActive}
          activityOptionsTarget={activityOptionsTarget}
        />
      </div>
    </div>
  )
})

export default SidebarHeader
