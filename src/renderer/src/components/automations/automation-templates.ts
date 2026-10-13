import type { AutomationSchedulePreset } from '../../../../shared/automations-types'
import type { TuiAgent } from '../../../../shared/tui-agent'
import { translate } from '@/i18n/i18n'
import { createLocalizedCatalog } from '@/i18n/localized-catalog'

export type AutomationTemplate = {
  id: string
  category: string
  label: string
  description: string
  name: string
  prompt: string
  preset: AutomationSchedulePreset
  time?: string
  dayOfWeek?: string
  customSchedule?: string
  agentId?: TuiAgent
  createTarget?: 'orca' | 'hermes'
  missedRunGraceMinutes?: string
}

export const getAutomationTemplates = createLocalizedCatalog((): AutomationTemplate[] => [
  {
    id: 'pi-odd-daily-sync',
    category: translate(
      'auto.components.automations.automation.templates.piOddDaily.category',
      'Pi Harness · Cron Daily'
    ),
    label: translate(
      'auto.components.automations.automation.templates.piOddDaily.label',
      'Pi ODD Daily Sync & Engram Audit'
    ),
    description: translate(
      'auto.components.automations.automation.templates.piOddDaily.description',
      'Runs pi agent daily via cron (0 9 * * *) to audit ODD tasks, verify ledger, and sync Engram memory.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.piOddDaily.name',
      'Pi ODD Daily Sync & Engram Audit'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.piOddDaily.prompt',
      'Audit active ODD tasks in odd/tasks/, verify odd/ledger-reads.jsonl integrity, reconcile unfinished work items with the Lunar Orca Workspace Board, and sync verified architectural decisions to Engram memory.'
    ),
    preset: 'daily',
    time: '09:00',
    customSchedule: '0 9 * * *',
    agentId: 'pi',
    createTarget: 'orca',
    missedRunGraceMinutes: '360'
  },
  {
    id: 'hermes-remote-intel-recon',
    category: translate(
      'auto.components.automations.automation.templates.hermesRecon.category',
      'Hermes Harness · Cron 6h'
    ),
    label: translate(
      'auto.components.automations.automation.templates.hermesRecon.label',
      'Hermes Remote Intelligence & Security Recon'
    ),
    description: translate(
      'auto.components.automations.automation.templates.hermesRecon.description',
      'Connects with hermes / SahaCloud every 6h (0 */6 * * *) to gather project updates and passive security checks.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.hermesRecon.name',
      'Hermes Remote Intelligence & Security Recon'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.hermesRecon.prompt',
      'Connect with Hermes / SahaCloud to gather project updates, service health telemetry, and passive security checks within the authorized whitelist. Summarize actionable findings for the Lunar Orca team.'
    ),
    preset: 'custom',
    time: '06:00',
    customSchedule: '0 */6 * * *',
    agentId: 'hermes',
    createTarget: 'orca',
    missedRunGraceMinutes: '180'
  },
  {
    id: 'opencode-multi-harness-triage',
    category: translate(
      'auto.components.automations.automation.templates.opencodeTriage.category',
      'OpenCode Harness · Cron Hourly'
    ),
    label: translate(
      'auto.components.automations.automation.templates.opencodeTriage.label',
      'OpenCode & Multi-Harness PR / Issue Triage'
    ),
    description: translate(
      'auto.components.automations.automation.templates.opencodeTriage.description',
      'Hourly cron (0 * * * *) that scans open issues, syncs Kanban tasks, and prepares isolated worktree fixes.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.opencodeTriage.name',
      'OpenCode & Multi-Harness PR / Issue Triage'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.opencodeTriage.prompt',
      'Scan open issues and PRs, synchronize task status across the Lunar Orca Kanban board, classify priority items for pi/opencode/claude/codex harnesses, and prepare isolated worktree fix plans.'
    ),
    preset: 'hourly',
    time: '00:00',
    customSchedule: '0 * * * *',
    agentId: 'opencode',
    createTarget: 'orca',
    missedRunGraceMinutes: '45'
  },
  {
    id: 'repo-health-weekday',
    category: translate(
      'auto.components.automations.automation.templates.repoHealth.category',
      'Repo health'
    ),
    label: translate(
      'auto.components.automations.automation.templates.b84757677d',
      'Weekday repo audit'
    ),
    description: translate(
      'auto.components.automations.automation.templates.a7fbd32ddb',
      'Check dependencies, failing tests, and risky open changes each weekday.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.repoHealth.name',
      'Weekday repo audit'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.repoHealth.prompt',
      'Review the repository health. Check dependency updates, failing tests, lint/typecheck status, and risky open changes. Summarize findings and suggest the next action.'
    ),
    preset: 'weekdays',
    time: '09:00',
    missedRunGraceMinutes: '720'
  },
  {
    id: 'release-prep-weekly',
    category: translate(
      'auto.components.automations.automation.templates.releasePrep.category',
      'Release prep'
    ),
    label: translate(
      'auto.components.automations.automation.templates.39ed39280a',
      'Release readiness'
    ),
    description: translate(
      'auto.components.automations.automation.templates.513401db93',
      'Prepare a weekly release risk summary from the current project state.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.releasePrep.name',
      'Release readiness review'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.releasePrep.prompt',
      'Prepare a release readiness summary. Look for blockers, unmerged risky changes, missing validation, and documentation gaps. End with a concise release/no-release recommendation.'
    ),
    preset: 'weekly',
    time: '14:00',
    dayOfWeek: '4',
    missedRunGraceMinutes: '1440'
  },
  {
    id: 'recurring-review-daily',
    category: translate(
      'auto.components.automations.automation.templates.recurringReview.category',
      'Recurring review'
    ),
    label: translate(
      'auto.components.automations.automation.templates.6023075b27',
      'Daily change review'
    ),
    description: translate(
      'auto.components.automations.automation.templates.3b7281c75f',
      'Scan recent work and call out correctness, UX, and test coverage risks.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.recurringReview.name',
      'Daily change review'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.recurringReview.prompt',
      'Review recent changes in this workspace. Focus on correctness risks, UX regressions, missing tests, and follow-up tasks. Keep the report short and actionable.'
    ),
    preset: 'daily',
    time: '16:30',
    missedRunGraceMinutes: '180'
  },
  {
    id: 'maintenance-hourly',
    category: translate(
      'auto.components.automations.automation.templates.maintenance.category',
      'Maintenance'
    ),
    label: translate(
      'auto.components.automations.automation.templates.8a0228bea3',
      'Hourly queue check'
    ),
    description: translate(
      'auto.components.automations.automation.templates.37571fcb16',
      'Look for stuck work, stale generated files, and failed local validation.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.maintenance.name',
      'Hourly maintenance check'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.maintenance.prompt',
      'Check for stuck work, stale generated files, failing validation, and anything that needs human attention. Report only actionable issues.'
    ),
    preset: 'hourly',
    time: '00:15',
    missedRunGraceMinutes: '30'
  }
])
