import { ImeInput } from '@/lib/ime-text-field'
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { LoaderCircle, RefreshCw, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AiVaultAgent, AiVaultGroup, AiVaultScope } from '../../../../shared/ai-vault-types'
import type { ExecutionHostScope } from '../../../../shared/execution-host'
import { VaultHostScopeMenu, VaultScopeSwitch, VaultViewMenu } from './AiVaultPanelControls'
import type { AiVaultHostScopeOption } from './ai-vault-host-scope'
import type { AiVaultSessionLimit } from './ai-vault-session-limit'

type AiVaultPanelHeaderProps = {
  searching?: boolean
  query: string
  loading: boolean
  hasScanResult: boolean
  activeWorktreePath: string | null
  activeProjectKey: string | null
  activeProjectLabel?: string | null
  scope: AiVaultScope
  executionHostScope: ExecutionHostScope
  hostScopeOptions: readonly AiVaultHostScopeOption[]
  agents: readonly AiVaultAgent[]
  group: AiVaultGroup
  hideEmptySessions: boolean
  sessionLimit: AiVaultSessionLimit
  adjustmentCount: number
  /** Bumped by a caller that sent the user here, e.g. Settings; focuses the search box once. */
  focusSearchRequestId?: number
  headerAction?: ReactNode
  /** Sees search keys first; a handled key is default-prevented. */
  onSearchKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onQueryChange: (query: string) => void
  onScopeChange: (scope: AiVaultScope) => void
  onExecutionHostScopeChange: (scope: ExecutionHostScope) => void
  onAgentEnabledChange: (agent: AiVaultAgent, enabled: boolean) => void
  onAllAgentsEnabledChange: (enabled: boolean) => void
  onGroupChange: (group: AiVaultGroup) => void
  onHideEmptySessionsChange: (hideEmptySessions: boolean) => void
  onSessionLimitChange: (limit: AiVaultSessionLimit) => void
  onReset: () => void
  onRefresh: () => void
}

export function AiVaultPanelHeader({
  query,
  searching = false,
  loading,
  hasScanResult,
  activeWorktreePath,
  activeProjectKey,
  activeProjectLabel = null,
  scope,
  executionHostScope,
  hostScopeOptions,
  agents,
  group,
  hideEmptySessions,
  sessionLimit,
  adjustmentCount,
  focusSearchRequestId = 0,
  headerAction,
  onSearchKeyDown,
  onQueryChange,
  onScopeChange,
  onExecutionHostScopeChange,
  onAgentEnabledChange,
  onAllAgentsEnabledChange,
  onGroupChange,
  onHideEmptySessionsChange,
  onSessionLimitChange,
  onReset,
  onRefresh
}: AiVaultPanelHeaderProps): React.JSX.Element {
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (focusSearchRequestId > 0) {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    }
  }, [focusSearchRequestId])
  return (
    <div className="shrink-0 border-b border-sidebar-border px-3 py-2.5 bg-sidebar/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="truncate text-xs font-semibold text-foreground tracking-tight">
              {translate(
                'auto.components.right.sidebar.AiVaultPanel.sessionHistory',
                'Historial de Agentes'
              )}
            </span>
            {activeProjectLabel ? (
              <span
                className="inline-flex items-center gap-1 shrink-0 truncate max-w-[150px] rounded-full border border-workspace-status-review/30 bg-workspace-status-review/10 px-2 py-0.5 text-[10px] font-medium text-workspace-status-review shadow-xs"
                title={`Proyecto: ${activeProjectLabel}`}
              >
                <span className="size-1.5 rounded-full bg-workspace-status-review" />
                <span className="truncate">{activeProjectLabel}</span>
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 truncate text-[10px] text-muted-foreground/75 font-mono">
            {searching || hasScanResult
              ? translate('sessionSearch.panel.indexedHistory', 'Historial indexado')
              : translate(
                  'auto.components.right.sidebar.AiVaultPanel.resumePastSessions',
                  'Reanudar sesiones activas o pasadas'
                )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <VaultHostScopeMenu
            executionHostScope={executionHostScope}
            hostOptions={hostScopeOptions}
            onExecutionHostScopeChange={onExecutionHostScopeChange}
          />
          <VaultViewMenu
            searching={searching}
            agents={agents}
            group={group}
            hideEmptySessions={hideEmptySessions}
            sessionLimit={sessionLimit}
            adjustmentCount={adjustmentCount}
            onAgentEnabledChange={onAgentEnabledChange}
            onAllAgentsEnabledChange={onAllAgentsEnabledChange}
            onGroupChange={onGroupChange}
            onHideEmptySessionsChange={onHideEmptySessionsChange}
            onSessionLimitChange={onSessionLimitChange}
            onReset={onReset}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={translate(
              'auto.components.right.sidebar.AiVaultPanel.refreshSessionHistory',
              'Refresh Session History'
            )}
            onClick={onRefresh}
            disabled={searching && loading}
            aria-busy={loading}
            className="size-6"
          >
            {loading ? (
              <LoaderCircle className="size-3 animate-spin text-primary" />
            ) : (
              <RefreshCw className="size-3" />
            )}
          </Button>
          {headerAction}
        </div>
      </div>

      <div className="mt-2.5">
        <VaultScopeSwitch
          scope={scope}
          workspaceAvailable={Boolean(activeWorktreePath)}
          projectAvailable={Boolean(activeProjectKey)}
          onScopeChange={onScopeChange}
        />
      </div>

      <div className="mt-2 flex h-7 items-center gap-1.5 rounded-md border border-sidebar-border bg-input/40 px-2 transition-colors focus-within:border-primary/50 focus-within:bg-input/70">
        <Search className="size-3 shrink-0 text-muted-foreground" />
        <ImeInput
          ref={searchInputRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={translate(
            'auto.components.right.sidebar.AiVaultPanel.searchSessions',
            'Buscar sesiones de agentes...'
          )}
          className="min-w-0 flex-1 bg-transparent py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
          aria-label={translate(
            'auto.components.right.sidebar.AiVaultPanel.searchSessions',
            'Search sessions'
          )}
          onKeyDown={(event) => {
            onSearchKeyDown?.(event)
            // A dialog host clears the search itself before this runs, and prevents its own close.
            if (event.key === 'Escape' && !event.defaultPrevented) {
              event.stopPropagation()
              onQueryChange('')
            }
          }}
          spellCheck={false}
        />
        {loading ? <LoaderCircle className="size-3 animate-spin text-muted-foreground" /> : null}
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-4.5"
            onClick={() => onQueryChange('')}
            aria-label={translate(
              'auto.components.right.sidebar.AiVaultPanel.clearSearch',
              'Clear search'
            )}
          >
            <X className="size-3" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
