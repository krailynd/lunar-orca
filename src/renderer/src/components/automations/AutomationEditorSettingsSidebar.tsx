import AgentCombobox from '@/components/agent/AgentCombobox'
import { cn } from '@/lib/utils'
import { translate } from '@/i18n/i18n'
import { buildAutomationCronSchedule } from '../../../../shared/automation-schedule-occurrences'
import {
  isValidAutomationCronSchedule,
  isValidAutomationSchedule
} from '../../../../shared/automation-schedule-parsing'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import type { OrcaHooks } from '../../../../shared/orca-yaml-hook-types'
import type { ProjectHostSetup } from '../../../../shared/project-types'
import type { Repo } from '../../../../shared/repo-types'
import type { Worktree } from '../../../../shared/worktree/types'
import type { AgentCatalogEntry } from '@/lib/agent-catalog'
import { AUTOMATION_EDITOR_SECTION_LABEL_CLASS, Field } from './automation-page-parts'
import { AutomationMissedRunGraceField } from './AutomationMissedRunGraceField'
import { AutomationPrecheckFields } from './AutomationPrecheckFields'
import AutomationProjectCombobox from './AutomationProjectCombobox'
import { AutomationSchedulePicker } from './AutomationSchedulePicker'
import { parseAutomationTime } from './AutomationTimeField'
import { AutomationSessionField } from './AutomationSessionField'
import { AutomationSetupDecisionField } from './AutomationSetupDecisionField'
import { AutomationWorkspaceField } from './AutomationWorkspaceField'
import { AutomationDestinationField } from './AutomationDestinationField'
import { AutomationExtraAgentArgsField } from './AutomationExtraAgentArgsField'
import type { AutomationCreateDestinationControl } from './use-automation-create-destination'
import type { AutomationDraft } from './AutomationEditorDialog'

type AutomationEditorSettingsSidebarProps = {
  /** The host picker: where a create lands, or the host an edit can move the record to. */
  destination?: AutomationCreateDestinationControl
  isHermesTarget: boolean
  isHermesCreate: boolean
  repos: readonly Repo[]
  projectHostSetups: readonly ProjectHostSetup[]
  automationYamlHooksByRepoKey: Record<string, OrcaHooks | null>
  getAutomationHooksCacheKey: (repoId: string) => string
  repoMap: Map<string, Repo>
  worktrees: Worktree[]
  settings: GlobalSettings | null
  draft: AutomationDraft
  visibleAgents: AgentCatalogEntry[]
  pickerTriggerClassName: string
  segmentedGroupClassName: string
  segmentedItemClassName: string
  onProjectChange: (projectId: string) => void
  getRepoHostLabel?: (repo: Repo) => string | null | undefined
  allowAddProject?: boolean
  onDraftChange: (updater: (current: AutomationDraft) => AutomationDraft) => void
  onSetupDecisionTouched: () => void
}

export function AutomationEditorSettingsSidebar({
  destination,
  isHermesTarget,
  isHermesCreate,
  repos,
  projectHostSetups,
  automationYamlHooksByRepoKey,
  getAutomationHooksCacheKey,
  repoMap,
  worktrees,
  settings,
  draft,
  visibleAgents,
  pickerTriggerClassName,
  segmentedGroupClassName,
  segmentedItemClassName,
  onProjectChange,
  getRepoHostLabel,
  allowAddProject,
  onDraftChange,
  onSetupDecisionTouched
}: AutomationEditorSettingsSidebarProps): React.JSX.Element {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col overflow-auto border-l border-border/50 bg-muted/20 px-5 py-5 scrollbar-sleek">
      <div className="flex flex-col">
        {/* Why: Hermes keeps project/workspace/schedule only. Collapse the
            Orca-only knobs so switching the create target does not jump. */}
        <div
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows,margin] duration-200 ease-out',
            isHermesTarget ? 'mb-0 grid-rows-[0fr]' : 'mb-4 grid-rows-[1fr]'
          )}
          aria-hidden={isHermesTarget}
          inert={isHermesTarget}
        >
          <div className="min-h-0">
            <div
              className={cn(
                'flex flex-col gap-5 transition-[opacity,transform] duration-150 ease-out',
                isHermesTarget
                  ? '-translate-y-1 opacity-0 delay-0'
                  : 'translate-y-0 opacity-100 delay-200'
              )}
            >
              <Field
                labelClassName={AUTOMATION_EDITOR_SECTION_LABEL_CLASS}
                label={translate(
                  'auto.components.automations.AutomationEditorDialog.57b722cbba',
                  'Agent'
                )}
              >
                <div
                  className="mb-1.5 flex flex-wrap items-center gap-1"
                  data-testid="automation-harness-quick-select"
                >
                  {(['pi', 'hermes', 'opencode', 'claude', 'codex'] as const).map((harnessId) => {
                    const isSelected = draft.agentId === harnessId
                    return (
                      <button
                        key={harnessId}
                        type="button"
                        onClick={() =>
                          onDraftChange((current) => ({ ...current, agentId: harnessId }))
                        }
                        className={cn(
                          'rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase transition-colors',
                          isSelected
                            ? 'border-workspace-status-review/70 bg-workspace-status-review/20 text-git-graph-lane-4 shadow-xs'
                            : 'border-border/60 bg-background/60 text-muted-foreground hover:border-workspace-status-review/40 hover:text-foreground'
                        )}
                      >
                        {harnessId}
                      </button>
                    )
                  })}
                </div>
                <AgentCombobox
                  agents={visibleAgents}
                  value={draft.agentId}
                  onValueChange={(agentId) =>
                    agentId && onDraftChange((current) => ({ ...current, agentId }))
                  }
                  defaultAgent={settings?.defaultTuiAgent ?? null}
                  triggerClassName={`h-9 w-full min-w-0 ${pickerTriggerClassName}`}
                  allowNarrowTrigger
                />
              </Field>
              <AutomationExtraAgentArgsField draft={draft} onDraftChange={onDraftChange} />
            </div>
          </div>
        </div>
        {destination && !isHermesTarget ? (
          <div className="mb-4">
            <AutomationDestinationField
              control={destination}
              labelClassName={AUTOMATION_EDITOR_SECTION_LABEL_CLASS}
            />
          </div>
        ) : null}
        <Field
          className="mb-4"
          labelClassName={AUTOMATION_EDITOR_SECTION_LABEL_CLASS}
          label={translate(
            'auto.components.automations.AutomationEditorDialog.02d351877e',
            'Project'
          )}
        >
          <AutomationProjectCombobox
            repos={repos}
            value={draft.projectId}
            onValueChange={onProjectChange}
            placeholder={translate(
              'auto.components.automations.AutomationEditorDialog.0d17f4ca8f',
              'Select project'
            )}
            triggerClassName={`h-9 w-full min-w-0 ${pickerTriggerClassName}`}
            getRepoHostLabel={getRepoHostLabel}
            allowAddProject={allowAddProject}
          />
        </Field>
        <div className="mb-4">
          <AutomationWorkspaceField
            draft={draft}
            isHermesTarget={isHermesTarget}
            worktrees={worktrees}
            repoMap={repoMap}
            pickerTriggerClassName={pickerTriggerClassName}
            segmentedGroupClassName={segmentedGroupClassName}
            segmentedItemClassName={segmentedItemClassName}
            onDraftChange={onDraftChange}
          />
        </div>
        <div
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows,margin] duration-200 ease-out',
            isHermesTarget ? 'mb-0 grid-rows-[0fr]' : 'mb-4 grid-rows-[1fr]'
          )}
          aria-hidden={isHermesTarget}
          inert={isHermesTarget}
        >
          <div className="min-h-0">
            <AutomationSessionField
              draft={draft}
              toggleGroupClassName={segmentedGroupClassName}
              toggleItemClassName={segmentedItemClassName}
              onDraftChange={onDraftChange}
            />
          </div>
        </div>
        <Field
          className="mb-4"
          labelClassName={AUTOMATION_EDITOR_SECTION_LABEL_CLASS}
          label={translate(
            'auto.components.automations.AutomationEditorDialog.c4b19094c2',
            'Schedule'
          )}
        >
          <AutomationSchedulePicker
            draft={draft}
            validateAdvancedSchedule={
              isHermesTarget ? isValidAutomationCronSchedule : isValidAutomationSchedule
            }
            onDraftChange={onDraftChange}
          />
          <div
            data-testid="automation-cron-schedule-preview"
            className="mt-2 flex items-center justify-between gap-2 rounded-md border border-workspace-status-review/30 bg-workspace-status-review/10 px-2.5 py-1.5 text-[11px] text-git-graph-lane-4"
          >
            <span className="font-medium uppercase tracking-wider text-git-graph-lane-4/90">
              Cron · {draft.agentId}
            </span>
            <code className="font-mono text-[11px] font-semibold text-foreground">
              {draft.preset === 'custom'
                ? draft.customSchedule.trim() || '0 * * * *'
                : buildAutomationCronSchedule({
                    preset: draft.preset,
                    ...parseAutomationTime(draft.time),
                    dayOfWeek: Number(draft.dayOfWeek)
                  })}
            </code>
          </div>
        </Field>
        <div
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows,margin] duration-200 ease-out',
            isHermesTarget ? 'mb-0 grid-rows-[0fr]' : 'mb-4 grid-rows-[1fr]'
          )}
          aria-hidden={isHermesTarget}
          inert={isHermesTarget}
        >
          <div className="min-h-0">
            <AutomationMissedRunGraceField
              draft={draft}
              disabled={isHermesTarget}
              pickerTriggerClassName={pickerTriggerClassName}
              onDraftChange={onDraftChange}
            />
          </div>
        </div>
        <div
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows,margin] duration-200 ease-out',
            isHermesCreate ? 'mb-0 grid-rows-[0fr]' : 'mb-4 grid-rows-[1fr]'
          )}
          aria-hidden={isHermesCreate}
          inert={isHermesCreate}
        >
          <div className="min-h-0">
            <div className="flex flex-col gap-5">
              <AutomationPrecheckFields
                draft={draft}
                disabled={isHermesCreate}
                pickerTriggerClassName={pickerTriggerClassName}
                onDraftChange={onDraftChange}
              />
            </div>
          </div>
        </div>
        <AutomationSetupDecisionField
          createTarget={isHermesTarget ? 'hermes' : 'orca'}
          draft={draft}
          repos={repos}
          projectHostSetups={projectHostSetups}
          yamlHooks={automationYamlHooksByRepoKey[getAutomationHooksCacheKey(draft.projectId)]}
          onDraftChange={onDraftChange}
          onSetupDecisionTouched={onSetupDecisionTouched}
        />
      </div>
    </aside>
  )
}
