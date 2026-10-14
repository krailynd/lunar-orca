import React, { useMemo, useState } from 'react'
import type { DatabaseSchemaSnapshot, SchemaTable } from './lunargrip-types'
import { Badge } from '@/components/ui/badge'
import {
  Crosshair,
  Key,
  Link2,
  LocateFixed,
  Maximize2,
  Search,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export function LunarGripErdViewer({
  tables,
  snapshot
}: {
  tables: SchemaTable[]
  snapshot: DatabaseSchemaSnapshot
}): React.JSX.Element {
  const [scale, setScale] = useState(1)
  const [filter, setFilter] = useState('')
  const visibleTables = useMemo(
    () =>
      tables.filter((table) =>
        `${table.schema}.${table.name}`.toLowerCase().includes(filter.toLowerCase())
      ),
    [filter, tables]
  )
  const relations = visibleTables.flatMap((table) =>
    table.columns
      .filter((column) => column.references)
      .map(
        (column) =>
          `${table.schema}.${table.name}.${column.name} → ${column.references?.table}.${column.references?.column}`
      )
  )
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background select-none">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link2 className="size-4 text-primary" />
          <span className="truncate text-xs font-semibold text-foreground">
            Diagrama ERD (Entidad - Relación)
          </span>
          <Badge variant="secondary">DEMO · Snapshot sintético · Sin conexión real</Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="relative hidden md:block">
            <Search className="absolute top-2 left-2 size-3.5" />
            <Input
              aria-label="Filtrar tablas del ERD"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filtrar tablas"
            />
          </div>
          <button
            type="button"
            aria-label="Alejar"
            onClick={() => setScale((value) => Math.max(0.7, value - 0.1))}
            className="rounded p-1 hover:bg-muted"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Acercar"
            onClick={() => setScale((value) => Math.min(1.5, value + 0.1))}
            className="rounded p-1 hover:bg-muted"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Centrar diagrama"
            onClick={() => setScale(1)}
            className="rounded p-1 hover:bg-muted"
          >
            <Crosshair className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Ajustar a pantalla"
            onClick={() => setScale(0.85)}
            className="rounded p-1 hover:bg-muted"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-border bg-card px-4 py-2 text-[11px] text-muted-foreground md:grid-cols-5">
        <span>
          Servidor: <strong className="text-foreground">{snapshot.server}</strong>
        </span>
        <span>
          Base: <strong className="text-foreground">{snapshot.database}</strong>
        </span>
        <span>
          Schema: <strong className="text-foreground">{snapshot.schema}</strong>
        </span>
        <span>
          Snapshot: <strong className="text-foreground">Sintético</strong>
        </span>
        <span>
          Fecha:{' '}
          <strong className="text-foreground">
            {new Date(snapshot.generatedAt).toLocaleDateString()}
          </strong>
        </span>
      </div>
      <div className="flex-1 overflow-auto p-6 scrollbar-sleek">
        <div
          className="mx-auto flex w-max origin-top-left flex-wrap gap-6"
          style={{ transform: `scale(${scale})` }}
        >
          {visibleTables.map((table) => {
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
      <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Key className="size-3 text-callout-important" /> PK
        </span>
        <span className="flex items-center gap-1">
          <Link2 className="size-3 text-primary" /> FK
        </span>
        <span className="ml-auto">
          <LocateFixed className="mr-1 inline size-3" />
          {relations.length} relaciones deterministas
        </span>
      </div>
    </div>
  )
}
