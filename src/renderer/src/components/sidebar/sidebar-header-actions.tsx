import React, { useCallback, useState } from 'react'
import { FolderPlus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatOptionalPrimaryShortcutLabel } from '@/hooks/useShortcutLabel'
import { translate } from '@/i18n/i18n'
import { openWorkspaceCreationComposerWithTourHandoff } from '../contextual-tours/workspace-creation-tour-handoff'
import SidebarWorkspaceOptionsMenu from './SidebarWorkspaceOptionsMenu'
import { useSessionHistory } from './session-history-types'
import { SaveSessionModal } from './SaveSessionModal'
import { KillAgentsModal } from './KillAgentsModal'
import { SessionsHistoryDrawer } from './SessionsHistoryDrawer'
import { SidebarMoreMenu } from './SidebarMoreMenu'
import { clearCurrentWorkspace } from './session-restore-manager'

function AddProjectButton({
  preserveWorkspaceBoardOpen
}: {
  preserveWorkspaceBoardOpen: boolean
}): React.JSX.Element {
  const openModal = useAppStore((s) => s.openModal)
  const label = translate('auto.components.sidebar.SidebarHeader.addProject', 'Add project')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          className="text-muted-foreground"
          aria-label={label}
          data-workspace-board-preserve-open={preserveWorkspaceBoardOpen ? '' : undefined}
          onClick={() => openModal('add-repo')}
        >
          <FolderPlus className="size-3.5" strokeWidth={2.25} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function NewWorkspaceButton({
  preserveWorkspaceBoardOpen
}: {
  preserveWorkspaceBoardOpen: boolean
}): React.JSX.Element {
  const keybindings = useAppStore((s) => s.keybindings)
  // Show the primary create shortcut so aliases do not crowd the tooltip.
  const shortcutLabel = formatOptionalPrimaryShortcutLabel('workspace.create', keybindings)
  const label = translate('auto.components.sidebar.SidebarHeader.92154beb7e', 'New workspace')

  const handleCreateWorkspace = useCallback(() => {
    openWorkspaceCreationComposerWithTourHandoff()
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          className="text-muted-foreground"
          aria-label={label}
          data-workspace-board-preserve-open={preserveWorkspaceBoardOpen ? '' : undefined}
          data-contextual-tour-target="workspace-create-control"
          onClick={handleCreateWorkspace}
        >
          <Plus className="size-3.5" strokeWidth={2.25} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
        {shortcutLabel ? <span className="ml-1.5 text-background/60">{shortcutLabel}</span> : null}
      </TooltipContent>
    </Tooltip>
  )
}

export function SidebarHeaderActions({
  onWorkspaceBoardMenuOpenChange,
  agentsViewActive = false,
  activityOptionsTarget
}: {
  onWorkspaceBoardMenuOpenChange: (open: boolean) => void
  agentsViewActive?: boolean
  activityOptionsTarget?: React.Ref<HTMLDivElement>
}): React.JSX.Element {
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [killModalOpen, setKillModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const historyStore = useSessionHistory()

  const handleKillAllAgents = useCallback(async () => {
    try {
      await clearCurrentWorkspace()
      toast.success('Espacio de trabajo y agentes limpiados por completo', {
        description: 'Terminales cerradas y memoria liberada.'
      })
    } catch (e) {
      console.error('Error al limpiar agentes y worktrees:', e)
      toast.error('Ocurrió un error al limpiar el espacio de trabajo')
    }
  }, [])

  return (
    <>
      <div className="flex shrink-0 items-center gap-1" data-sidebar-header-actions="">
        <div ref={activityOptionsTarget} className="flex size-6 shrink-0 items-center">
          {agentsViewActive ? null : (
            <SidebarWorkspaceOptionsMenu
              preserveWorkspaceBoardOpen
              onMenuOpenChange={onWorkspaceBoardMenuOpenChange}
            />
          )}
        </div>
        <AddProjectButton preserveWorkspaceBoardOpen />
        <NewWorkspaceButton preserveWorkspaceBoardOpen />
        <SidebarMoreMenu
          onOpenSaveSession={() => setSaveModalOpen(true)}
          onOpenHistoryDrawer={() => setDrawerOpen(true)}
          onOpenKillAgents={() => setKillModalOpen(true)}
          sessionsCount={historyStore.sessions.length}
        />
      </div>

      {/* Modales y Drawer */}
      <SaveSessionModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={(name, desc, ts, col) => {
          historyStore.saveSession(name, desc, ts, col)
          toast.success('Punto de restauración guardado', {
            description: `Sesión "${name}" registrada en el historial.`
          })
        }}
      />

      <KillAgentsModal
        open={killModalOpen}
        onClose={() => setKillModalOpen(false)}
        onConfirm={handleKillAllAgents}
      />

      <SessionsHistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        history={historyStore}
      />
    </>
  )
}
