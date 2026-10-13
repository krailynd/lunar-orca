import React from 'react'
import type { SchemaTable } from './lunargrip-types'
import { Key, Link2, ZoomIn, ZoomOut } from 'lucide-react'

export function LunarGripErdViewer({ tables }: { tables: SchemaTable[] }): React.JSX.Element {
  return (
    <div className="flex flex-col h-full bg-background/50 overflow-hidden select-none">
      <div className="flex items-center justify-between p-2.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Diagrama ERD (Entidad - Relación)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Esquema Vivo
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            className="p-1 rounded hover:bg-muted/40 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-muted/40 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 scrollbar-sleek bg-radial from-muted/20 to-background/90">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tables.map((table) => {
            const pkCount = table.columns.filter((c) => c.isPrimaryKey).length
            const fkCount = table.columns.filter((c) => c.isForeignKey).length
            return (
              <div
                key={`${table.schema}.${table.name}`}
                className="flex flex-col rounded-xl border border-border/70 bg-card/90 shadow-sm overflow-hidden hover:border-primary/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {table.schema}.{table.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {pkCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-callout-important/15 text-callout-important font-semibold">
                        PK
                      </span>
                    ) : null}
                    {fkCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">
                        FK
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-2 space-y-1 text-[11px] font-mono divide-y divide-border/20">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center justify-between pt-1 first:pt-0"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {col.isPrimaryKey ? (
                          <Key className="size-3 text-callout-important shrink-0" />
                        ) : col.isForeignKey ? (
                          <Link2 className="size-3 text-primary shrink-0" />
                        ) : (
                          <span className="size-3 shrink-0" />
                        )}
                        <span className={col.isPrimaryKey ? 'font-bold text-foreground' : ''}>
                          {col.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground/70 shrink-0">
                        <span>{col.type}</span>
                        {!col.nullable ? (
                          <span className="text-[9px] text-destructive">*</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {table.columns.some((c) => c.references) ? (
                  <div className="px-3 py-1.5 bg-muted/20 border-t border-border/40 text-[10px] text-muted-foreground">
                    {table.columns
                      .filter((c) => c.references)
                      .map((c) => (
                        <div key={c.name} className="flex items-center gap-1 truncate">
                          <span className="text-primary font-semibold">↳</span>
                          <span>
                            {c.name} → {c.references?.table}.{c.references?.column}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
