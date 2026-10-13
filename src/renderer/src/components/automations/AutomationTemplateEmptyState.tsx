import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { getAutomationTemplates, type AutomationTemplate } from './automation-templates'

type AutomationTemplateEmptyStateProps = {
  onOpenCreate: (template?: AutomationTemplate) => void
}

export function AutomationTemplateEmptyState({
  onOpenCreate
}: AutomationTemplateEmptyStateProps): React.JSX.Element {
  return (
    <div className="mx-auto grid max-w-2xl gap-2 p-4">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-sm font-medium">
          {translate(
            'auto.components.automations.AutomationsPage.d207ab4c25',
            'Start from a template'
          )}
        </span>
        <span className="rounded-full border border-workspace-status-review/35 bg-workspace-status-review/10 px-2 py-0.5 font-mono text-[10px] font-medium text-git-graph-lane-4">
          pi · hermes · opencode · claude · codex
        </span>
      </div>
      {getAutomationTemplates().map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onOpenCreate(template)}
          className="rounded-md border border-border/70 bg-background px-3 py-2 text-left shadow-xs transition-colors hover:border-workspace-status-review/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-medium uppercase text-muted-foreground">
              {template.category}
            </div>
            <div className="flex items-center gap-1.5">
              {template.agentId ? (
                <span className="rounded border border-workspace-status-review/35 bg-workspace-status-review/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-git-graph-lane-4">
                  {template.agentId}
                </span>
              ) : null}
              {template.customSchedule ? (
                <span className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {template.customSchedule}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-1 text-sm font-medium">{template.label}</div>
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {template.description}
          </div>
        </button>
      ))}
      <Button
        type="button"
        variant="outline"
        className="mt-1 w-full justify-start"
        onClick={() => onOpenCreate()}
      >
        <Plus className="size-4" />
        {translate('auto.components.automations.AutomationsPage.25060635c6', 'Add new')}
      </Button>
    </div>
  )
}
