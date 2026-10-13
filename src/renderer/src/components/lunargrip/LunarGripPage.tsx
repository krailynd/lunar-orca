import React, { useState } from 'react'
import { Database, Terminal, Link2, HardDrive, RefreshCw, ShieldCheck, Server } from 'lucide-react'
import { DEFAULT_DATABASE_CONNECTIONS, MOCK_DATABASE_SCHEMA } from './lunargrip-mock-data'
import type { DatabaseConnection, SchemaTable } from './lunargrip-types'
import { LunarGripObjectExplorer } from './LunarGripObjectExplorer'
import { LunarGripSqlEditor } from './LunarGripSqlEditor'
import { LunarGripErdViewer } from './LunarGripErdViewer'
import { LunarGripSsmsWorkbench } from './LunarGripSsmsWorkbench'
import { toast } from 'sonner'

export default function LunarGripPage(): React.JSX.Element {
  const [connections] = useState<DatabaseConnection[]>(DEFAULT_DATABASE_CONNECTIONS)
  const [activeConn, setActiveConn] = useState<DatabaseConnection>(DEFAULT_DATABASE_CONNECTIONS[0]!)
  const [activeTab, setActiveTab] = useState<'editor' | 'erd' | 'ssms'>('editor')
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(
    MOCK_DATABASE_SCHEMA.tables[0] ?? null
  )

  const handleRefresh = (): void => {
    toast.success('Esquema de base de datos actualizado')
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-background/95 text-foreground select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-primary/15 text-primary border border-primary/25 flex items-center justify-center">
            <Database className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">LunarGrip</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
                Data Workbench
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground/80 leading-none">
              Gestión de SQL Server, Esquemas ERD y Backups SSMS (.BAK / .MDF)
            </p>
          </div>
        </div>

        {/* Server & Database Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-muted/30 text-xs">
            <Server className="size-3.5 text-primary shrink-0" />
            <select
              value={activeConn.id}
              onChange={(e) => {
                const found = connections.find((c) => c.id === e.target.value)
                if (found) {
                  setActiveConn(found)
                  toast.success(`Conectado a ${found.name}`)
                }
              }}
              className="bg-transparent text-xs font-medium outline-none cursor-pointer pr-1"
            >
              {connections.map((c) => (
                <SelectItemEntry key={c.id} connection={c} />
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
            title="Refrescar Esquema"
          >
            <RefreshCw className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Subtabs Navigation */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/50 bg-muted/10 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'editor'
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="size-3.5" />
            <span>Object Explorer & SQL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('erd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'erd'
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Link2 className="size-3.5" />
            <span>Diagrama ERD</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ssms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'ssms'
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HardDrive className="size-3.5" />
            <span>SSMS Workbench (.BAK / .MDF)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-status-success" />
          <span>Copiloto de IA con Guardas de Seguridad</span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-[240px_1fr] flex-1 min-h-0 overflow-hidden">
            <LunarGripObjectExplorer
              tables={MOCK_DATABASE_SCHEMA.tables}
              selectedTable={selectedTable}
              onSelectTable={setSelectedTable}
            />
            <LunarGripSqlEditor
              selectedTable={selectedTable}
              activeDatabase={activeConn.database}
            />
          </div>
        )}

        {activeTab === 'erd' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <LunarGripErdViewer tables={MOCK_DATABASE_SCHEMA.tables} />
          </div>
        )}

        {activeTab === 'ssms' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <LunarGripSsmsWorkbench activeDatabase={activeConn.database} />
          </div>
        )}
      </div>
    </div>
  )
}

function SelectItemEntry({ connection }: { connection: DatabaseConnection }): React.JSX.Element {
  return (
    <option value={connection.id} className="bg-popover text-popover-foreground">
      {connection.name} ({connection.database})
    </option>
  )
}
