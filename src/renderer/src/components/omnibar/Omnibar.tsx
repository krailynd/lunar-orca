import React, { useCallback, useMemo, useState } from 'react'
import { FolderGit2, Terminal, Bot, Layers, FileCode2, Cpu } from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/components/ui/command'
import { useAppStore } from '@/store'
import { useActiveWorktree, useAllWorktrees } from '@/store/selectors'
import { useHerdrSessions } from '@/lib/useHerdrSessions'
import { useRuntimeFileListForWorktree } from '@/components/quick-open-file-list'
import { openQuickOpenFile } from '@/components/quick-open-file-navigation'
import { activateAndRevealWorkspace } from '@/lib/worktree-activation'
import { FileTypeIcon } from '@/components/FileTypeIcon'
import type { OmnibarCategory } from './omnibar-types'
import { useOmnibarCommands } from './use-omnibar-commands'

const CATEGORIES: { id: OmnibarCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todos', icon: <Layers className="size-3.5" /> },
  { id: 'workspaces', label: 'Workspaces', icon: <FolderGit2 className="size-3.5" /> },
  { id: 'files', label: 'Archivos', icon: <FileCode2 className="size-3.5" /> },
  { id: 'commands', label: 'Comandos', icon: <Terminal className="size-3.5" /> },
  { id: 'agents', label: 'Agentes / π', icon: <Bot className="size-3.5" /> }
]

export default function Omnibar(): React.JSX.Element | null {
  const visible = useAppStore((state) => state.activeModal === 'omnibar')
  const closeModal = useAppStore((state) => state.closeModal)
  const activeWorktree = useActiveWorktree()
  const activeWorktreeId = useAppStore((state) => state.activeWorktreeId)
  const worktrees = useAllWorktrees()
  const { sessions, piSubagents, focusPane } = useHerdrSessions()

  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<OmnibarCategory>('all')

  const worktreePath = activeWorktree?.path ?? null
  const shouldSearchFiles =
    visible && (activeCategory === 'all' || activeCategory === 'files') && query.trim().length > 0

  const { files } = useRuntimeFileListForWorktree({
    enabled: shouldSearchFiles,
    worktreeId: activeWorktreeId,
    query: query.trim()
  })

  const commandsList = useOmnibarCommands(query, activeCategory, closeModal, activeWorktreeId)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal()
        setQuery('')
      }
    },
    [closeModal]
  )

  const handleSelectFile = useCallback(
    async (file: string) => {
      if (!activeWorktreeId || !worktreePath) {
        return
      }
      try {
        await openQuickOpenFile(file, activeWorktreeId, worktreePath, { pathQuery: file })
        closeModal()
      } catch (err) {
        console.error('Failed to open file from omnibar:', err)
      }
    },
    [activeWorktreeId, worktreePath, closeModal]
  )

  const filteredWorkspaces = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'workspaces') {
      return []
    }
    const q = query.toLowerCase().trim()
    return worktrees.filter((wt) => {
      if (!q) {
        return true
      }
      const title = (wt.displayName || wt.path || '').toLowerCase()
      const branch = (wt.branch || '').toLowerCase()
      return title.includes(q) || branch.includes(q)
    })
  }, [worktrees, query, activeCategory])

  const filteredHerdrPanes = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'agents') {
      return []
    }
    const q = query.toLowerCase().trim()
    const list: {
      id: string
      sessionName: string
      paneId: string
      title: string
      subtitle: string
      badge: string
    }[] = []

    for (const session of sessions) {
      for (const pane of session.panes) {
        const title = `${session.sessionName} — ${pane.title || 'Terminal'}`
        const subtitle = `${pane.agent ? `Agente: ${pane.agent} · ` : ''}${pane.cwd}`
        if (!q || title.toLowerCase().includes(q) || subtitle.toLowerCase().includes(q)) {
          list.push({
            id: `herdr-${session.sessionName}-${pane.pane_id}`,
            sessionName: session.sessionName,
            paneId: pane.pane_id,
            title,
            subtitle,
            badge: pane.agent || 'Herdr'
          })
        }
      }
    }
    return list
  }, [sessions, query, activeCategory])

  const filteredPiSubagents = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'agents') {
      return []
    }
    const q = query.toLowerCase().trim()
    return piSubagents.filter((task) => {
      if (!q) {
        return true
      }
      const target = `${task.agent} ${task.label} ${task.task} ${task.cwd || ''}`.toLowerCase()
      return target.includes(q)
    })
  }, [piSubagents, query, activeCategory])

  if (!visible) {
    return null
  }

  return (
    <CommandDialog
      open={visible}
      onOpenChange={handleOpenChange}
      title="Lunar Omnibar"
      description="Navegación global rápida, comandos y agentes"
      overlayClassName="bg-black/60 backdrop-blur-[4px]"
      contentClassName="top-[12%] w-[820px] max-w-[94vw] max-h-[82vh] overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-0 gap-0"
    >
      <div className="flex flex-col border-b border-border/60 p-3 bg-muted/20">
        <CommandInput
          placeholder="Escribí para buscar workspaces, archivos, comandos o agentes..."
          value={query}
          onValueChange={setQuery}
          className="h-11 text-sm bg-transparent border-none focus:ring-0 focus:outline-none"
        />
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/40 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <CommandList className="max-h-[50vh] overflow-y-auto scrollbar-sleek p-2 scroll-smooth">
        <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
          No se encontraron resultados para &ldquo;{query}&rdquo;
        </CommandEmpty>

        {filteredWorkspaces.length > 0 && (
          <CommandGroup heading="Espacios de Trabajo (Workspaces)">
            {filteredWorkspaces.map((wt) => (
              <CommandItem
                key={wt.id}
                onSelect={() => {
                  activateAndRevealWorkspace(wt.id)
                  closeModal()
                }}
                className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-muted/60 data-[selected=true]:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-(--status-success) shrink-0">
                    <FolderGit2 className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {wt.displayName || wt.path}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {wt.branch ? `Rama: ${wt.branch}` : wt.path}
                    </span>
                  </div>
                </div>
                {wt.id === activeWorktreeId && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-(--status-success) shrink-0">
                    Activo
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredHerdrPanes.length > 0 && (
          <CommandGroup heading="Sesiones y Terminales Externas (Herdr)">
            {filteredHerdrPanes.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  void focusPane(item.sessionName, item.paneId)
                  closeModal()
                }}
                className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-muted/60 data-[selected=true]:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 animate-pulse">
                    <Bot className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">
                  {item.badge}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredPiSubagents.length > 0 && (
          <CommandGroup heading="Subagentes Delegados de Pi (gentle-agents)">
            {filteredPiSubagents.map((task) => (
              <CommandItem
                key={`pi-${task.id}`}
                onSelect={() => closeModal()}
                className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-muted/60 data-[selected=true]:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
                    <Cpu className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {task.label || task.agent}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {task.task.slice(0, 80)}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    task.status === 'running'
                      ? 'bg-amber-500/15 text-amber-400 animate-pulse'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {task.status}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {commandsList.length > 0 && (
          <CommandGroup heading="Comandos Rápidos">
            {commandsList.map((cmd) => (
              <CommandItem
                key={cmd.id}
                onSelect={cmd.action}
                className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-muted/60 data-[selected=true]:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-muted/60 text-foreground shrink-0">
                    {cmd.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {cmd.title}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{cmd.subtitle}</span>
                  </div>
                </div>
                {cmd.shortcut && (
                  <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/70 text-muted-foreground border border-border/40 shrink-0">
                    {cmd.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {files.length > 0 && (
          <CommandGroup heading={`Archivos en Workspace (${files.length})`}>
            {files.slice(0, 25).map((file) => {
              const segments = file.split('/')
              const fileName = segments.at(-1) || file
              const dir = segments.slice(0, -1).join('/')
              return (
                <CommandItem
                  key={file}
                  onSelect={() => handleSelectFile(file)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-muted/60 data-[selected=true]:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileTypeIcon filePath={file} className="size-4 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {fileName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {dir || 'raíz'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/70 shrink-0">Abrir</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}
      </CommandList>

      <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5 bg-muted/15 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/80 border border-border/60 font-mono text-[10px]">
              ↑↓
            </kbd>{' '}
            Navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/80 border border-border/60 font-mono text-[10px]">
              ↵
            </kbd>{' '}
            Ejecutar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/80 border border-border/60 font-mono text-[10px]">
              Esc
            </kbd>{' '}
            Cerrar
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-(--status-success) font-medium">
          <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Lunar-Orca Omnibar</span>
        </div>
      </div>
    </CommandDialog>
  )
}
