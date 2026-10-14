import React from 'react'
import type { LunarGripUiState, SchemaTable } from './lunargrip-types'
import {
  Database,
  Table,
  Columns,
  Key,
  ChevronRight,
  Search,
  Server,
  FolderTree,
  Link2,
  Shield,
  Wrench,
  Eye
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function LunarGripObjectExplorer({
  tables,
  selectedTable,
  onSelectTable,
  state,
  database
}: {
  tables: SchemaTable[]
  selectedTable: SchemaTable | null
  onSelectTable: (table: SchemaTable) => void
  state: LunarGripUiState
  database: string
}): React.JSX.Element {
  const [filter, setFilter] = React.useState('')
  const [expanded, setExpanded] = React.useState({
    server: true,
    databases: true,
    database: true,
    schema: true
  })
  const visibleTables = tables.filter((table) =>
    `${table.schema}.${table.name}`.toLowerCase().includes(filter.toLowerCase())
  )
  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-border bg-card select-none">
      <div className="border-b border-border p-3">
        <div className="mb-3 flex items-center gap-2">
          <Database className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold">Object Explorer</span>
          <Badge variant="outline" className="ml-auto">
            Demo
          </Badge>
        </div>
        <div className="space-y-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Server className="size-3" /> Demo local
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="size-3" /> {database || 'Sin base seleccionada'}
          </div>
          <div className="flex items-center gap-1.5">
            <FolderTree className="size-3" /> dbo
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
          <Input
            aria-label="Buscar objetos"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Buscar objetos..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-sleek">
        {state !== 'demo' ? (
          <div className="p-3 text-xs text-muted-foreground">
            La metadata real aparecerá cuando exista una conexión.
          </div>
        ) : (
          <div className="space-y-1 text-xs">
            <TreeRow
              icon={<Server className="size-3.5" />}
              label="Demo local"
              open={expanded.server}
              onToggle={() => setExpanded((value) => ({ ...value, server: !value.server }))}
            />
            {expanded.server ? (
              <div className="ml-3 border-l border-border pl-2">
                <TreeRow
                  icon={<Database className="size-3.5" />}
                  label="Bases de datos"
                  open={expanded.databases}
                  onToggle={() =>
                    setExpanded((value) => ({ ...value, databases: !value.databases }))
                  }
                />
                {expanded.databases ? (
                  <div className="ml-3 border-l border-border pl-2">
                    <TreeRow
                      icon={<Database className="size-3.5" />}
                      label={database || 'LunarGrip Demo'}
                      open={expanded.database}
                      onToggle={() =>
                        setExpanded((value) => ({ ...value, database: !value.database }))
                      }
                    />
                    {expanded.database ? (
                      <div className="ml-3 border-l border-border pl-2">
                        <TreeRow
                          icon={<FolderTree className="size-3.5" />}
                          label="dbo"
                          open={expanded.schema}
                          onToggle={() =>
                            setExpanded((value) => ({ ...value, schema: !value.schema }))
                          }
                        />
                        {expanded.schema ? (
                          <>
                            <TreeRow
                              icon={<Table className="size-3.5" />}
                              label="Tables"
                              open
                              onToggle={() => undefined}
                            />
                            {visibleTables.map((table) => {
                              const isSelected = selectedTable?.name === table.name
                              return (
                                <div
                                  key={`${table.schema}.${table.name}`}
                                  className="space-y-1 pl-2"
                                >
                                  <button
                                    type="button"
                                    onClick={() => onSelectTable(table)}
                                    className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                                      isSelected
                                        ? 'bg-primary/15 text-primary border border-primary/25'
                                        : 'text-foreground/80 hover:bg-muted/40 hover:text-foreground'
                                    }`}
                                  >
                                    <Table className="size-3.5 shrink-0 opacity-70" />
                                    <span className="truncate flex-1 font-mono">
                                      {table.schema}.{table.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">demo</span>
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
                                          ) : col.isForeignKey ? (
                                            <Link2 className="size-3 text-primary shrink-0" />
                                          ) : (
                                            <Columns className="size-3 opacity-50 shrink-0" />
                                          )}
                                          <span className="font-mono text-foreground/90 truncate">
                                            {col.name}
                                          </span>
                                          <span className="text-[10px] opacity-60 ml-auto font-mono">
                                            {col.type}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              )
                            })}
                            <TreeRow
                              icon={<Eye className="size-3.5" />}
                              label="Views · demo vacío"
                              open={false}
                              onToggle={() => undefined}
                            />
                            <TreeRow
                              icon={<Wrench className="size-3.5" />}
                              label="Procedures · demo vacío"
                              open={false}
                              onToggle={() => undefined}
                            />
                            <TreeRow
                              icon={<Wrench className="size-3.5" />}
                              label="Functions · demo vacío"
                              open={false}
                              onToggle={() => undefined}
                            />
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
        {state === 'demo' && visibleTables.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">No hay objetos que coincidan.</div>
        ) : null}
      </div>
      <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Link2 className="size-3" /> Snapshot: sintético · sin conexión real
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <Shield className="size-3" /> Security / Programmability: demo vacío
        </div>
      </div>
    </div>
  )
}

function TreeRow({
  icon,
  label,
  open,
  onToggle
}: {
  icon: React.ReactNode
  label: string
  open: boolean
  onToggle: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ChevronRight className={`size-3 transition-transform ${open ? 'rotate-90' : ''}`} />
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}
