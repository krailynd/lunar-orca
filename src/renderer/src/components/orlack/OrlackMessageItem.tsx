import type React from 'react'
import { CheckCircle2, FileCode, Terminal } from 'lucide-react'
import type { OrlackMessage } from './orlack-types'
import { OrlackMarkdownViewer } from './OrlackMarkdownViewer'

export function OrlackMessageItem({ msg }: { msg: OrlackMessage }): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 group">
      <div
        className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-white shadow shrink-0"
        style={{ backgroundColor: msg.userColor }}
      >
        {msg.userName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground">{msg.userName}</span>
          {msg.userRole ? (
            <span className="text-[10px] text-muted-foreground/80 bg-muted/60 px-1.5 py-0.2 rounded">
              {msg.userRole}
            </span>
          ) : null}
          <span className="text-[10px] text-muted-foreground">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {msg.sessionId ? (
            <span className="inline-flex items-center gap-1 rounded bg-muted/70 px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
              <Terminal className="h-2.5 w-2.5" />
              <span>{msg.sessionId}</span>
            </span>
          ) : null}
          {msg.isUpdate ? (
            <span className="inline-flex items-center gap-1 rounded bg-workspace-status-review/10 px-1.5 py-0.2 text-[9px] font-medium text-workspace-status-review">
              <CheckCircle2 className="h-2.5 w-2.5" /> Work Unit ({msg.phase || 'Done'})
            </span>
          ) : null}
        </div>

        <div className="mt-1 text-xs text-foreground/90 font-sans">
          <OrlackMarkdownViewer content={msg.content} />
        </div>

        {msg.attachments && msg.attachments.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.attachments.map((att) => (
              <div
                key={att.name}
                className="flex items-center gap-1.5 rounded border border-border bg-card/80 px-2.5 py-1 text-[11px] font-mono text-muted-foreground"
              >
                <FileCode className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{att.name}</span>
                <span className="text-[9px] opacity-70">({att.size})</span>
              </div>
            ))}
          </div>
        ) : null}

        {msg.reactions ? (
          <div className="mt-2 flex gap-1.5">
            {Object.entries(msg.reactions).map(([emoji, count]) => (
              <span
                key={emoji}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {emoji} {count}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
