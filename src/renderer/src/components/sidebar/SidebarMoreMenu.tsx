import React from 'react'
import { MoreHorizontal, Bell, Bookmark, History, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AgentQuestionIcon } from '@/components/AgentQuestionIcon'
import { useAgentBucketCounts } from '@/components/dashboard/useAgentBucketCounts'
import { useAppStore } from '@/store'
import { translate } from '@/i18n/i18n'

export type SidebarMoreMenuProps = {
  onOpenSaveSession: () => void
  onOpenHistoryDrawer: () => void
  onOpenKillAgents: () => void
  sessionsCount: number
}

export const SidebarMoreMenu = React.memo(function SidebarMoreMenu({
  onOpenSaveSession,
  onOpenHistoryDrawer,
  onOpenKillAgents,
  sessionsCount
}: SidebarMoreMenuProps): React.JSX.Element {
  const sidebarBody = useAppStore((s) => s.sidebarBody ?? 'workspaces')
  const setSidebarBody = useAppStore((s) => s.setSidebarBody)
  const agentsViewActive = sidebarBody === 'agents'

  const counts = useAgentBucketCounts()
  const activityCount = counts.attention || counts.working
  const hasAttention = counts.attention > 0

  const activityLabel = translate(
    agentsViewActive ? 'dashboard.sidebar.closeActivity' : 'dashboard.sidebar.openActivity',
    agentsViewActive ? 'Ver workspaces' : 'Ver actividad y notificaciones'
  )

  const handleToggleActivity = (): void => {
    setSidebarBody?.(agentsViewActive ? 'workspaces' : 'agents')
  }

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              className={cn(
                'relative text-muted-foreground transition-colors hover:text-foreground',
                (hasAttention || agentsViewActive) && 'text-foreground'
              )}
              aria-label="Más opciones"
            >
              <MoreHorizontal className="size-3.5" />
              {/* Badge dot discreto si hay agentes trabajando o requiriendo atención */}
              {activityCount > 0 ? (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 flex size-2 items-center justify-center rounded-full',
                    hasAttention ? 'bg-destructive animate-pulse' : 'bg-(--status-warning)'
                  )}
                />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          Más opciones
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={10}
        alignOffset={-4}
        className="w-64 rounded-2xl border border-border/60 bg-popover/85 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in-50 zoom-in-95 data-[side=right]:slide-in-from-left-2 duration-150"
      >
        {/* Notificaciones / Actividad de Agentes */}
        <DropdownMenuItem
          onClick={handleToggleActivity}
          className={cn(
            'flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors',
            agentsViewActive
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-foreground hover:bg-muted/80'
          )}
        >
          <div className="flex items-center gap-2.5">
            <Bell className="size-3.5 shrink-0 text-primary/80" />
            <span>{activityLabel}</span>
          </div>
          {activityCount > 0 ? (
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                hasAttention
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              )}
            >
              {hasAttention ? <AgentQuestionIcon className="size-2.5" /> : null}
              <span>{activityCount}</span>
            </span>
          ) : null}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 opacity-40" />

        {/* Guardar Estado de Sesión */}
        <DropdownMenuItem
          onClick={onOpenSaveSession}
          className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-foreground hover:bg-muted/80 transition-colors"
        >
          <Bookmark className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Guardar punto de sesión...</span>
        </DropdownMenuItem>

        {/* Historial de Sesiones */}
        <DropdownMenuItem
          onClick={onOpenHistoryDrawer}
          className="flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-xs text-foreground hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <History className="size-3.5 shrink-0 text-muted-foreground" />
            <span>Historial de sesiones</span>
          </div>
          {sessionsCount > 0 ? (
            <span className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {sessionsCount}
            </span>
          ) : null}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 opacity-40" />

        {/* Detener y Limpiar Agentes Activos */}
        <DropdownMenuItem
          onClick={onOpenKillAgents}
          className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors"
        >
          <Trash2 className="size-3.5 shrink-0" />
          <span>Detener y limpiar agentes...</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
