import type { TaskPageComposerActionsModel } from '../use-task-page-composer-actions'
import { cn } from '@/lib/utils'
import { TaskPageSourceBar } from './SourceBar'
import { AlertCircle, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskPageGitHubModeControls } from './github/ModeControls'
import { TaskPageProviderFilters } from './ProviderFilters'
import { LocalTaskCreatorBar } from './LocalTaskCreatorBar'
export function TaskPageListChrome({
  model
}: {
  model: TaskPageComposerActionsModel
}): React.JSX.Element | null {
  const { taskSourceAvailabilityNotice, taskPageListChromeHidden, localTasksMode } = model
  return (
    <div className={cn('flex-none flex flex-col gap-2', taskPageListChromeHidden && 'hidden')}>
      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <TaskPageSourceBar model={model} />

          <LocalTaskCreatorBar model={model} />

          {!localTasksMode && taskSourceAvailabilityNotice ? (
            <div
              role="status"
              className="flex max-w-3xl items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
              title={taskSourceAvailabilityNotice.title}
            >
              <AlertCircle className="size-3.5 flex-none" />
              <span className="min-w-0 truncate">{taskSourceAvailabilityNotice.label}</span>
            </div>
          ) : null}

          {/* Banner sugerido cuando el repositorio activo no tiene remoto GitHub o está en modo local */}
          {!localTasksMode &&
          model.taskSource === 'github' &&
          model.selectedRepos.length > 0 &&
          model.unresolvedSourceRepos?.length > 0 ? (
            <div
              role="region"
              aria-label="Sugerencia de tareas locales"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-workspace-status-review/30 bg-workspace-status-review/10 px-3.5 py-2.5 text-xs text-foreground"
            >
              <div className="flex items-center gap-2">
                <FolderKanban className="size-4 text-workspace-status-review shrink-0" />
                <span className="font-medium">
                  Este proyecto es local. Podés gestionar sus tareas locales con Kanban y Diagrama
                  de Gantt.
                </span>
              </div>
              <Button variant="default" size="xs" onClick={() => model.setLocalTasksMode(true)}>
                Cambiar a Tareas Locales / Proyectos Locales
              </Button>
            </div>
          ) : null}

          {!localTasksMode ? <TaskPageGitHubModeControls model={model} /> : null}

          {!localTasksMode ? <TaskPageProviderFilters model={model} /> : null}
        </div>
      </section>
    </div>
  )
}
