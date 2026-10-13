import React from 'react'
import type { SchemaTable } from './lunargrip-types'
import { Database, Table, Columns, Key, ChevronRight } from 'lucide-react'

export function LunarGripObjectExplorer({
  tables,
  selectedTable,
  onSelectTable
}: {
  tables: SchemaTable[]
  selectedTable: SchemaTable | null
  onSelectTable: (table: SchemaTable) => void
}): React.JSX.Element {
  return (
    <div className="flex flex-col h-full bg-card/60 border-r border-border/60 select-none overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/20">
        <Database className="size-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          Object Explorer
        </span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
          {tables.length} tablas
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-sleek">
        {tables.map((table) => {
          const isSelected = selectedTable?.name === table.name
          return (
            <div key={`${table.schema}.${table.name}`} className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectTable(table)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-primary/15 text-primary border border-primary/25'
                    : 'text-foreground/80 hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <Table className="size-3.5 shrink-0 opacity-70" />
                <span className="truncate flex-1 font-mono">
                  {table.schema}.{table.name}
                </span>
                {table.rowCount !== undefined ? (
                  <span className="text-[10px] text-muted-foreground/60">{table.rowCount}</span>
                ) : null}
                <ChevronRight
                  className={`size-3 transition-transform ${isSelected ? 'rotate-90 text-primary' : 'opacity-40'}`}
                />
              </button>

              {isSelected ? (
                <div className="ml-5 pl-2 border-l border-border/50 space-y-1 py-1">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground py-0.5"
                    >
                      {col.isPrimaryKey ? (
                        <Key className="size-3 text-callout-important shrink-0" />
                      ) : (
                        <Columns className="size-3 opacity-50 shrink-0" />
                      )}
                      <span className="font-mono text-foreground/90 truncate">{col.name}</span>
                      <span className="text-[10px] opacity-60 ml-auto font-mono">{col.type}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
