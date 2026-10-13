import React from 'react'
import { Bot, FolderGit2, Layers, Plus } from 'lucide-react'
import logo from '../../../../../resources/logo.svg'

export type HomePageHeaderProps = {
  reposCount: number
  worktreesCount: number
  sessionsCount: number
  onNewWorkspace: () => void
}

export function HomePageHeader({
  reposCount,
  worktreesCount,
  sessionsCount,
  onNewWorkspace
}: HomePageHeaderProps): React.JSX.Element {
  return (
    <header className="relative flex flex-col items-center text-center gap-3 pt-4">
      <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
        <div className="relative size-14 rounded-2xl bg-card/90 border border-border/60 shadow-xs flex items-center justify-center p-2.5 backdrop-blur-md">
          <img
            src={logo}
            alt="Lunar Orca"
            className="size-full object-contain filter drop-shadow dark:invert dark:brightness-105 transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-workspace-status-review/10 text-workspace-status-review border border-workspace-status-review/25 mb-1">
          <span className="size-1.5 rounded-full bg-workspace-status-review animate-pulse" />
          Centro de Mando Integral
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          Lunar Orca
        </h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">
          Plataforma multi-arnés para orquestar agentes IA, gestionar repositorios, sesiones y
          actividad git.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card/90 border border-border/60 shadow-xs text-muted-foreground">
          <FolderGit2 className="size-3.5 text-workspace-status-review" />
          <span>
            <strong className="text-foreground">{reposCount}</strong> repositorios
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card/90 border border-border/60 shadow-xs text-muted-foreground">
          <Layers className="size-3.5 text-workspace-status-review" />
          <span>
            <strong className="text-foreground">{worktreesCount}</strong> workspaces
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card/90 border border-border/60 shadow-xs text-muted-foreground">
          <Bot className="size-3.5 text-workspace-status-review" />
          <span>
            <strong className="text-foreground">{sessionsCount}</strong> sesiones
          </span>
        </div>
        <button
          type="button"
          onClick={onNewWorkspace}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-workspace-status-review/15 hover:bg-workspace-status-review/25 text-workspace-status-review border border-workspace-status-review/30 transition-colors shadow-xs cursor-pointer ml-1"
        >
          <Plus className="size-3" />
          Nuevo Workspace
        </button>
      </div>
    </header>
  )
}
