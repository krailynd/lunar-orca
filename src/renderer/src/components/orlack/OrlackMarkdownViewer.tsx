import type React from 'react'

export function OrlackMarkdownViewer({ content }: { content: string }): React.JSX.Element {
  // Parser simple que divide en bloques seguros sin map de indices ambiguos
  const blocks = content.split('\n\n')

  return (
    <div className="leading-relaxed space-y-2">
      {blocks.map((block) => {
        const text = block.trim()
        if (text.startsWith('```')) {
          const lines = text.split('\n')
          const lang = lines[0].replace('```', '') || 'code'
          const code = lines.slice(1, -1).join('\n')
          return (
            <div
              key={text}
              className="my-2 overflow-hidden rounded-md border border-border bg-card/90 font-mono text-[11px]"
            >
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-3 py-1 text-[10px] text-muted-foreground">
                <span>{lang}</span>
              </div>
              <pre className="overflow-x-auto scrollbar-sleek p-3 leading-relaxed text-foreground/90">
                <code>{code.trim()}</code>
              </pre>
            </div>
          )
        }

        if (text.startsWith('## ')) {
          return (
            <h3
              key={text}
              className="mt-2 text-xs font-bold text-foreground tracking-tight border-b border-border/40 pb-0.5"
            >
              {text.replace('## ', '')}
            </h3>
          )
        }

        if (text.startsWith('# ')) {
          return (
            <h2 key={text} className="mt-2 text-sm font-bold text-foreground">
              {text.replace('# ', '')}
            </h2>
          )
        }

        return (
          <p key={text} className="text-xs text-foreground/90 whitespace-pre-wrap">
            {text}
          </p>
        )
      })}
    </div>
  )
}
