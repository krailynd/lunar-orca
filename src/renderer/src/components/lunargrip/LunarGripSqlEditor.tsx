import React, { useState } from 'react'
import type { SchemaTable } from './lunargrip-types'
import { Play, Copy, Check, Terminal, Layers } from 'lucide-react'
import { toast } from 'sonner'

export function LunarGripSqlEditor({
  selectedTable,
  activeDatabase
}: {
  selectedTable: SchemaTable | null
  activeDatabase: string
}): React.JSX.Element {
  const [sqlQuery, setSqlQuery] = useState(() =>
    selectedTable
      ? `SELECT TOP 50 *\nFROM [${selectedTable.schema}].[${selectedTable.name}];`
      : 'SELECT @@VERSION AS [SQL_Server_Version];'
  )
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [queryResults, setQueryResults] = useState<{
    columns: string[]
    rows: (string | number)[][]
    elapsedMs: number
  } | null>(null)

  const handleRun = (): void => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      if (selectedTable) {
        const cols = selectedTable.columns.map((c) => c.name)
        const mockRows = Array.from({ length: 6 }).map((_, i) =>
          cols.map((colName, cIdx) => (cIdx === 0 ? i + 1 : `Valor_${colName}_${i + 1}`))
        )
        setQueryResults({ columns: cols, rows: mockRows, elapsedMs: 14 })
      } else {
        setQueryResults({
          columns: ['SQL_Server_Version'],
          rows: [['Microsoft SQL Server 2022 (RTM-CU12) (KB5033663) - 16.0.4115.5']],
          elapsedMs: 8
        })
      }
      toast.success('Consulta ejecutada con éxito')
    }, 280)
  }

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(sqlQuery)
    setCopied(true)
    toast.success('Script copiado al portapapeles')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-xs"
          >
            <Play className={`size-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            <span>{isRunning ? 'Ejecutando...' : 'Ejecutar (F5)'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-muted/40 transition-colors"
          >
            {copied ? (
              <Check className="size-3 text-status-success" />
            ) : (
              <Copy className="size-3" />
            )}
            <span>Copiar SQL</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="size-2 rounded-full bg-status-success animate-pulse" />
          <span>{activeDatabase}</span>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="flex-1 min-h-[160px] p-3 font-mono text-xs bg-muted/10">
        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          spellCheck={false}
          className="size-full bg-transparent resize-none outline-none font-mono text-foreground leading-relaxed selection:bg-primary/30"
          placeholder="Escribí tu consulta T-SQL acá..."
        />
      </div>

      {/* Results View */}
      <div className="h-[220px] min-h-[140px] border-t border-border/60 flex flex-col bg-card/60">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 text-[11px] font-semibold text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-1.5">
            <Terminal className="size-3 text-primary" />
            <span>Resultados</span>
          </div>
          {queryResults ? (
            <span className="font-mono text-[10px]">
              {queryResults.rows.length} filas ({queryResults.elapsedMs} ms)
            </span>
          ) : null}
        </div>

        <div className="flex-1 overflow-auto scrollbar-sleek p-2">
          {queryResults ? (
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  {queryResults.columns.map((col) => (
                    <th key={col} className="p-1.5 font-bold text-foreground/80 bg-muted/40">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResults.rows.map((row, rIdx) => (
                  <tr
                    key={String(rIdx)}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td key={String(cIdx)} className="p-1.5 text-muted-foreground">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center size-full text-xs text-muted-foreground/60 gap-1.5">
              <Layers className="size-4 opacity-40" />
              <span>Ejecutá una consulta para ver los resultados tabulares</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
