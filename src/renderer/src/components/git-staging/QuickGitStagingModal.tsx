import React from 'react'
import { GitBranch, X, Search, CheckCheck, Undo2, RefreshCw, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuickGitStaging } from './use-quick-git-staging'
import { StagingFileList } from './StagingFileList'
import { StagingDiffView } from './StagingDiffView'

export default function QuickGitStagingModal(): React.JSX.Element | null {
  const {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    selectedEntry,
    setSelectedEntry,
    parsedDiff,
    isLoadingDiff,
    isMutating,
    filteredStaged,
    filteredUnstaged,
    stagedCount,
    unstagedCount,
    handleStage,
    handleUnstage,
    handleStageAll,
    handleUnstageAll,
    handleOpenInEditor,
    refreshStatus,
    worktreeName
  } = useQuickGitStaging()

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md animate-in fade-in-50">
      <div className="relative flex flex-col w-[92vw] max-w-5xl h-[82vh] rounded-2xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitBranch className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Quick Git Staging & Diff Inspector
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">
                  {worktreeName}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                [Espacio] Stage/Unstage · [Enter] Abrir en Editor · [↑/↓] Navegar · [Esc] Cerrar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isMutating}
              onClick={() => void refreshStatus()}
              title="Refrescar estado"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
            >
              <RefreshCw className={cn('size-4', isMutating && 'animate-spin')} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View */}
        <div className="flex flex-1 min-h-0 divide-x divide-border/60">
          {/* Left: Files Pane */}
          <div className="w-80 flex flex-col shrink-0 bg-background/40">
            {/* Search Input */}
            <div className="p-3 border-b border-border/40">
              <div className="relative flex items-center">
                <Search className="size-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar archivos cambiados..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border/50 bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 transition"
                />
              </div>
            </div>

            {/* Global Actions */}
            <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between text-xs bg-muted/10">
              <span className="text-[11px] font-medium text-muted-foreground">
                {unstagedCount} sin stage · {stagedCount} en stage
              </span>
              <div className="flex items-center gap-1">
                {unstagedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleStageAll()}
                    disabled={isMutating}
                    title="Stage all changes"
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition text-[11px] font-medium"
                  >
                    <Plus className="size-3" />
                    <span>Stage Todo</span>
                  </button>
                )}
                {stagedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleUnstageAll()}
                    disabled={isMutating}
                    title="Unstage all changes"
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition text-[11px] font-medium"
                  >
                    <Minus className="size-3" />
                    <span>Unstage Todo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Lists Scroll Area */}
            <div className="flex-1 overflow-auto scrollbar-sleek divide-y divide-border/30 p-1">
              <div className="py-1">
                <StagingFileList
                  title="Unstaged & Untracked"
                  entries={filteredUnstaged}
                  selectedEntry={selectedEntry}
                  onSelect={setSelectedEntry}
                  onAction={(entry) => void handleStage(entry)}
                  actionType="stage"
                  onOpenInEditor={handleOpenInEditor}
                />
              </div>
              <div className="py-1">
                <StagingFileList
                  title="Staged"
                  entries={filteredStaged}
                  selectedEntry={selectedEntry}
                  onSelect={setSelectedEntry}
                  onAction={(entry) => void handleUnstage(entry)}
                  actionType="unstage"
                  onOpenInEditor={handleOpenInEditor}
                />
              </div>
            </div>
          </div>

          {/* Right: Unified Diff Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-background/20">
            {selectedEntry && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-mono font-medium text-foreground truncate">
                    {selectedEntry.path}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold',
                      selectedEntry.area === 'staged'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {selectedEntry.area}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenInEditor(selectedEntry)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-border/60 hover:bg-muted text-foreground transition font-medium"
                  >
                    <span>Abrir en Editor</span>
                  </button>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => {
                      if (selectedEntry.area === 'staged') {
                        void handleUnstage(selectedEntry)
                      } else {
                        void handleStage(selectedEntry)
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition font-medium',
                      selectedEntry.area === 'staged'
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    )}
                  >
                    {selectedEntry.area === 'staged' ? (
                      <>
                        <Undo2 className="size-3" />
                        <span>Unstage</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="size-3" />
                        <span>Stage</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0">
              <StagingDiffView
                parsedDiff={parsedDiff}
                isLoading={isLoadingDiff}
                filePath={selectedEntry?.path ?? ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
