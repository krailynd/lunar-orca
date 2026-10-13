import React from 'react'
import { Clock, Folder, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiVaultSession } from '../../../../shared/ai-vault-types'
import { AI_VAULT_AGENT_LABELS } from '../../../../shared/ai-vault-types'
import { HARNESS_CATEGORIES, formatRelativeTime } from './home-page-types'

export function HomePageSessionCards({
  sessions,
  activeCategory,
  onOpenSession
}: {
  sessions: AiVaultSession[]
  activeCategory: string
  onOpenSession: (session: AiVaultSession) => void
}): React.JSX.Element {
  const sessionsByCategory = React.useMemo(() => {
    const map = new Map<string, AiVaultSession[]>()
    for (const cat of HARNESS_CATEGORIES) {
      map.set(cat.id, [])
    }
    for (const s of sessions) {
      const cat = HARNESS_CATEGORIES.find((c) => c.agents.includes(s.agent))
      if (cat) {
        map.get(cat.id)?.push(s)
      } else {
        map.get('antigravity')?.push(s)
      }
    }
    return map
  }, [sessions])

  const visibleCategories = HARNESS_CATEGORIES.filter(
    (cat) => activeCategory === 'all' || activeCategory === cat.id
  )

  return (
    <div className="flex flex-col gap-8 pb-12">
      {visibleCategories.map((cat) => {
        const catSessions = sessionsByCategory.get(cat.id) ?? []
        if (catSessions.length === 0) {
          return null
        }
        const Icon = cat.icon

        return (
          <div key={cat.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-lg border', cat.bgGlow, cat.borderGlow)}>
                  <Icon className={cn('size-4', cat.color)} />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{cat.name}</h3>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-mono font-medium',
                    cat.badgeBg,
                    cat.badgeText
                  )}
                >
                  {catSessions.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onOpenSession(session)}
                  className={cn(
                    'group relative flex flex-col justify-between p-3.5 rounded-2xl border border-border/60 bg-card/90 shadow-xs hover:bg-card hover:border-workspace-status-review/40 hover:shadow-md cursor-pointer transition-all duration-200 active:scale-[0.99]',
                    cat.borderGlow
                  )}
                  style={{
                    transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={cn(
                          'text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded',
                          cat.badgeBg,
                          cat.badgeText
                        )}
                      >
                        {AI_VAULT_AGENT_LABELS[session.agent] || session.agent}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Clock className="size-3" />
                        <span>{formatRelativeTime(session.updatedAt || session.modifiedAt)}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-foreground tracking-tight line-clamp-2 group-hover:text-workspace-status-review transition-colors">
                      {session.title || 'Sesión sin título'}
                    </h4>

                    {session.previewMessages && session.previewMessages.length > 0 ? (
                      <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mt-1.5 italic bg-muted/30 p-1.5 rounded-lg border border-border/30">
                        &ldquo;{session.previewMessages.at(-1)?.text}&rdquo;
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1 min-w-0 max-w-[70%]">
                      <Folder className="size-3 shrink-0 text-muted-foreground/60" />
                      <span className="truncate font-mono" title={session.cwd || session.filePath}>
                        {session.cwd ? session.cwd.split('/').slice(-2).join('/') : 'Ruta local'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <MessageSquare className="size-3 text-muted-foreground/60" />
                      <span>{session.messageCount} msg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
