import React, { useState } from 'react'
import {
  AlertCircle,
  Database,
  HardDrive,
  Link2,
  MessageSquare,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { MOCK_DATABASE_SCHEMA } from './lunargrip-mock-data'
import type {
  DatabaseSchemaSnapshot,
  LunarGripConnectionPayload,
  LunarGripUiState,
  QueryResultViewProps,
  SchemaTable
} from './lunargrip-types'
import {
  LunarGripConnectionDialog,
  type LunarGripConnectionInput
} from './LunarGripConnectionDialog'
import { LunarGripStatusBadge } from './LunarGripStatusBadge'
import { LunarGripObjectExplorer } from './LunarGripObjectExplorer'
import { LunarGripSqlEditor } from './LunarGripSqlEditor'
import { LunarGripErdViewer } from './LunarGripErdViewer'
import { LunarGripSsmsWorkbench } from './LunarGripSsmsWorkbench'

export default function LunarGripPage(): React.JSX.Element {
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [uiState, setUiState] = useState<LunarGripUiState>('disconnected')
  const [activeConnection, setActiveConnection] = useState<LunarGripConnectionInput | null>(null)
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null)
  const [schema, setSchema] = useState<DatabaseSchemaSnapshot | null>(null)
  const [serverDatabases, setServerDatabases] = useState<string[]>([])
  const [activeDatabase, setActiveDatabase] = useState('')

  const handleDialogChange = (open: boolean): void => {
    setConnectionDialogOpen(open)
    if (open && uiState === 'disconnected') {
      setUiState('configuring')
    } else if (!open && uiState === 'configuring') {
      setUiState('disconnected')
    }
  }

  const openDemo = (): void => {
    setActiveConnection(null)
    setUiState('demo')
    setSelectedTable(null)
    setSchema(null)
    setServerDatabases([])
    setActiveDatabase('')
    setConnectionDialogOpen(false)
  }

  const loadSchemaFor = async (
    connection: LunarGripConnectionInput,
    database: string
  ): Promise<boolean> => {
    setActiveDatabase(database)
    const schemaResult = await window.api.lunarGrip.readSchema({
      ...toIpcPayload(connection),
      database
    })
    if (!('status' in schemaResult)) {
      setUiState('partial')
      toast.warning('Conectado, pero no se pudo leer el esquema', {
        description: schemaResult.error.message
      })
      return false
    }

    setSchema({
      database: schemaResult.database || database,
      engine: 'sqlserver',
      generatedAt: schemaResult.generatedAt,
      server: `${connection.host}:${connection.port}`,
      schema: schemaResult.tables[0]?.schema ?? 'dbo',
      source: 'real',
      status: 'connected',
      tables: schemaResult.tables.map((table) => ({
        schema: table.schema,
        name: table.name,
        columns: table.columns.map((column) => ({
          name: column.name,
          type: column.type,
          nullable: column.nullable,
          isPrimaryKey: column.isPrimaryKey
        }))
      }))
    })
    setSelectedTable(null)
    setUiState('connected')
    return true
  }

  const handleTestConnection = async (connection: LunarGripConnectionInput): Promise<void> => {
    setUiState('connecting')
    setActiveConnection(connection)

    const payload = toIpcPayload(connection)
    try {
      const connectionResult = await window.api.lunarGrip.testConnection(payload)
      if (!('status' in connectionResult)) {
        setUiState('failed')
        toast.error('No se pudo conectar', { description: connectionResult.error.message })
        return
      }
      if (connectionResult.status === 'failed') {
        setUiState('failed')
        toast.error('No se pudo conectar', {
          description: connectionResult.error?.message ?? 'La conexión falló.'
        })
        return
      }

      const databaseResult = await window.api.lunarGrip.listDatabases(payload)
      const databases = 'databases' in databaseResult ? databaseResult.databases : []
      setServerDatabases(databases)
      const target = connection.database || databases[0] || ''

      if (!(await loadSchemaFor(connection, target))) {
        return
      }
      setConnectionDialogOpen(false)
      toast.success(`Conectado a ${target || connection.host}`)
    } catch (error: unknown) {
      setUiState('failed')
      toast.error('No se pudo conectar', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  const handleSelectDatabase = (database: string): void => {
    if (!activeConnection || database === activeDatabase) {
      return
    }
    void loadSchemaFor(activeConnection, database)
  }

  const leaveDemo = (): void => {
    setUiState('disconnected')
    setActiveConnection(null)
    setSelectedTable(null)
    setSchema(null)
    setServerDatabases([])
    setActiveDatabase('')
  }

  const showWorkbench =
    uiState === 'demo' || uiState === 'connected' || uiState === 'partial' || uiState === 'stale'
  const database = uiState === 'demo' ? MOCK_DATABASE_SCHEMA.database : activeDatabase
  const tables = uiState === 'demo' ? MOCK_DATABASE_SCHEMA.tables : (schema?.tables ?? [])
  const snapshot = uiState === 'demo' || !schema ? MOCK_DATABASE_SCHEMA : schema

  return (
    <div className="lunargrip-ambient flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="lunargrip-rail flex size-8 items-center justify-center rounded-lg border border-border/50 bg-card/80">
            <Database className="size-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">LunarGrip</span>
              <Badge variant="outline">Data Workbench</Badge>
              <LunarGripStatusBadge state={uiState} />
            </div>
            <p className="text-xs text-muted-foreground">SQL Server · conexión TDS directa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showWorkbench ? (
            <>
              <span className="hidden text-xs text-muted-foreground md:inline">
                {uiState === 'demo'
                  ? 'Datos sintéticos'
                  : `${activeConnection?.host ?? 'Sin servidor'} · ${database}`}
              </span>
              <Button variant="outline" size="sm" onClick={() => setConnectionDialogOpen(true)}>
                <Plus /> Nueva conexión
              </Button>
              {uiState === 'demo' ? (
                <Button variant="ghost" size="sm" onClick={leaveDemo}>
                  Salir de demo
                </Button>
              ) : null}
            </>
          ) : (
            <Button size="sm" onClick={() => setConnectionDialogOpen(true)}>
              <Plus /> Nueva conexión
            </Button>
          )}
        </div>
      </header>

      {!showWorkbench ? (
        <DisconnectedState
          onNewConnection={() => setConnectionDialogOpen(true)}
          onOpenDemo={openDemo}
          state={uiState}
        />
      ) : (
        <Tabs defaultValue="editor" className="flex min-h-0 flex-1">
          <div className="flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-1.5 backdrop-blur-md">
            <TabsList variant="line">
              <TabsTrigger value="editor">
                <Terminal /> Object Explorer & SQL
              </TabsTrigger>
              <TabsTrigger value="erd">
                <Link2 /> Diagrama ERD
              </TabsTrigger>
              <TabsTrigger value="ssms">
                <HardDrive /> SSMS Workbench
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              <span>{uiState === 'demo' ? 'Demo local' : 'Esquema en vivo'}</span>
            </div>
          </div>
          <TabsContent value="editor" className="min-h-0 flex-1">
            <div className="grid h-full min-h-0 grid-cols-[260px_1fr]">
              <LunarGripObjectExplorer
                tables={tables}
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
                state={uiState}
                database={database}
                serverDatabases={serverDatabases}
                activeDatabase={activeDatabase}
                onSelectDatabase={handleSelectDatabase}
                serverLabel={
                  uiState === 'demo'
                    ? 'Demo local'
                    : `${activeConnection?.host ?? 'Sin servidor'} (${activeConnection?.username ?? ''})`
                }
              />
              <LunarGripSqlEditor
                selectedTable={selectedTable}
                activeDatabase={database}
                connection={activeConnection ? toIpcPayload(activeConnection) : null}
                demo={uiState === 'demo'}
                ResultView={QueryResultView}
                MessagesView={QueryMessagesView}
              />
            </div>
          </TabsContent>
          <TabsContent value="erd" className="min-h-0 flex-1">
            <LunarGripErdViewer tables={tables} snapshot={snapshot} />
          </TabsContent>
          <TabsContent value="ssms" className="min-h-0 flex-1">
            <LunarGripSsmsWorkbench activeDatabase={database || 'Sin conexión'} />
          </TabsContent>
        </Tabs>
      )}

      <LunarGripConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={handleDialogChange}
        onOpenDemo={openDemo}
        onTestConnection={handleTestConnection}
        testing={uiState === 'connecting'}
      />
    </div>
  )
}

function DisconnectedState({
  onNewConnection,
  onOpenDemo,
  state
}: {
  onNewConnection: () => void
  onOpenDemo: () => void
  state: LunarGripUiState
}): React.JSX.Element {
  return (
    <div className="lunargrip-ambient flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="lunargrip-empty-card w-full max-w-xl rounded-xl p-8 text-center">
        <div className="lunargrip-rail mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-border/50 bg-card/70">
          {state === 'failed' ? (
            <RefreshCw className="size-6 text-destructive" />
          ) : (
            <Server className="size-6 text-muted-foreground" />
          )}
        </div>
        <LunarGripStatusBadge state={state} />
        <h1 className="mt-4 text-xl font-semibold">Conectá un servidor local para comenzar</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          No hay ninguna base seleccionada. La demo local es sintética y no representa una conexión
          real.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={onNewConnection}>
            <Plus /> Nueva conexión
          </Button>
          <Button variant="outline" onClick={onOpenDemo}>
            <Database /> Abrir demo local
          </Button>
        </div>
        {state === 'failed' ? (
          <p className="mt-4 text-xs text-destructive">
            La conexión falló. Revisá host, puerto, credenciales y certificado.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function toIpcPayload(connection: LunarGripConnectionInput): LunarGripConnectionPayload {
  const { id, host, port, database, username, password, encrypt, trustServerCertificate } =
    connection
  return {
    connectionId: id,
    host,
    port,
    database,
    username,
    password,
    encrypt,
    trustServerCertificate
  }
}

function resultsPlaceholder(running: boolean, demo: boolean): string {
  if (running) {
    return 'Ejecutando consulta…'
  }
  return demo
    ? 'DEMO · Datos sintéticos · Sin conexión real. No se ejecutan consultas.'
    : 'Ejecutá una consulta para ver resultados.'
}

function messagesPlaceholder(running: boolean, demo: boolean): string {
  if (running) {
    return 'Ejecutando consulta…'
  }
  return demo
    ? 'DEMO · Sin conexión real. No hay mensajes de SQL Server.'
    : 'Ejecutá una consulta para ver mensajes.'
}

function QueryResultView({ result, running, demo }: QueryResultViewProps): React.JSX.Element {
  if (!result || result.columns.length === 0) {
    return (
      <EmptyPanel icon={<Database className="size-4" />} text={resultsPlaceholder(running, demo)} />
    )
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5 text-xs text-muted-foreground">
        <span>
          {result.rowCount} fila(s) · {result.columns.length} columna(s)
        </span>
        <span>Completado en {result.elapsedMs} ms</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto scrollbar-sleek">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-muted/60">
            <tr>
              {result.columns.map((column) => (
                <th
                  key={column}
                  className="border-b border-border/60 px-3 py-1.5 text-left font-medium whitespace-nowrap text-muted-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-muted/20">
                {result.columns.map((column) => (
                  <td
                    key={column}
                    className="border-b border-border/40 px-3 py-1 whitespace-nowrap text-foreground"
                  >
                    {formatCell(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QueryMessagesView({ result, running, demo }: QueryResultViewProps): React.JSX.Element {
  if (!result) {
    return (
      <EmptyPanel
        icon={<MessageSquare className="size-4" />}
        text={messagesPlaceholder(running, demo)}
      />
    )
  }
  return (
    <div className="flex h-full flex-col gap-1 overflow-auto scrollbar-sleek p-3 font-mono text-xs">
      {result.error ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>Error SQL: {result.error.message}</span>
        </div>
      ) : null}
      {toMessageEntries(result.messages).map((entry) => (
        <p key={entry.key} className="text-muted-foreground">
          {entry.message}
        </p>
      ))}
      {result.columns.length === 0 ? (
        <p className="text-muted-foreground">({result.rowCount} filas afectadas)</p>
      ) : null}
      <p className="text-foreground">Completado en {result.elapsedMs} ms</p>
    </div>
  )
}

function EmptyPanel({ icon, text }: { icon: React.ReactNode; text: string }): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="lunargrip-empty-card flex items-center gap-2 rounded-xl px-6 py-4 text-xs text-muted-foreground">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  )
}

function toMessageEntries(messages: string[]): { key: string; message: string }[] {
  const seen = new Map<string, number>()
  return messages.map((message) => {
    const count = seen.get(message) ?? 0
    seen.set(message, count + 1)
    return { key: `${message}#${count}`, message }
  })
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}
