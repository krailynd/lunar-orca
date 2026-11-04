import React from 'react'
import { FileCode, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParsedDiff } from './quick-git-staging-types'

export const StagingDiffView = React.memo(function StagingDiffView({
  parsedDiff,
  isLoading,
  filePath
}: {
  parsedDiff: ParsedDiff
  isLoading: boolean
  filePath: string
}): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <Loader2 className="size-6 animate-spin text-primary/70" />
        <span className="text-xs">Cargando diff...</span>
      </div>
    )
  }

  if (!filePath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <FileCode className="size-8 opacity-40" />
        <span className="text-xs">Selecciona un archivo para inspeccionar cambios</span>
      </div>
    )
  }

  if (parsedDiff.isBinary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <span className="text-xs font-mono bg-muted/60 px-3 py-1.5 rounded-lg">
          Archivo binario modificado
        </span>
      </div>
    )
  }

  if (parsedDiff.hunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <span className="text-xs italic">Sin diferencias detectadas</span>
      </div>
    )
  }

  return (
    <div className="overflow-auto scrollbar-sleek h-full font-mono text-[11.5px] leading-relaxed selection:bg-primary/30 p-2">
      {parsedDiff.hunks.map((hunk) => (
        <div key={hunk.header} className="mb-4 rounded border border-border/40 overflow-hidden">
          <div className="bg-muted/40 px-3 py-1 text-[10px] text-muted-foreground font-semibold border-b border-border/40">
            {hunk.header}
          </div>
          <div className="divide-y divide-border/10 bg-background/50">
            {hunk.lines.map((line) => {
              const isAdd = line.type === 'add'
              const isDel = line.type === 'del'
              const lineKey = `${line.type}-${line.oldLineNumber ?? 'x'}-${line.newLineNumber ?? 'y'}-${line.content.slice(0, 20)}`
              return (
                <div
                  key={lineKey}
                  className={cn(
                    'flex px-2 py-0.5 items-baseline',
                    isAdd && 'bg-emerald-500/10 text-emerald-300',
                    isDel && 'bg-red-500/10 text-red-300'
                  )}
                >
                  <span className="w-9 shrink-0 select-none text-right pr-2 text-[10px] text-muted-foreground/50">
                    {line.oldLineNumber ?? ''}
                  </span>
                  <span className="w-9 shrink-0 select-none text-right pr-3 text-[10px] text-muted-foreground/50 border-r border-border/30">
                    {line.newLineNumber ?? ''}
                  </span>
                  <span className="w-5 shrink-0 select-none text-center font-bold">
                    {isAdd ? '+' : isDel ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1">{line.content}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
})
