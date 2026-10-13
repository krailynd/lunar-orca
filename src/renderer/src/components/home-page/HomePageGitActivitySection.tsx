import React from 'react'
import { GitBranch, GitCommit } from 'lucide-react'

export type GitRecentChange = {
  repoName: string
  commitHash?: string
  message: string
  author?: string
  date: string
}

export type HomePageGitActivitySectionProps = {
  gitRecentChanges: GitRecentChange[]
}

export function HomePageGitActivitySection({
  gitRecentChanges
}: HomePageGitActivitySectionProps): React.JSX.Element | null {
  if (gitRecentChanges.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <GitCommit className="size-3.5 text-workspace-status-review" />
          Actividad Git Reciente
        </h2>
        <span className="text-[11px] text-muted-foreground/70">
          Últimos commits en repositorios activos
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {gitRecentChanges.map((change) => (
          <div
            key={`${change.repoName}-${change.commitHash ?? change.message}`}
            className="flex items-start gap-2.5 p-3 rounded-2xl border border-border/60 bg-card/90 shadow-xs hover:border-workspace-status-review/35 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-lg bg-workspace-status-review/10 text-workspace-status-review shrink-0 mt-0.5">
              <GitBranch className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold truncate group-hover:text-workspace-status-review transition-colors">
                  {change.repoName}
                </span>
                {change.commitHash ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground">
                    {change.commitHash}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-foreground/80 line-clamp-1 mt-0.5 font-normal">
                {change.message}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/60">
                <span>{change.author}</span>
                <span>•</span>
                <span>{change.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
