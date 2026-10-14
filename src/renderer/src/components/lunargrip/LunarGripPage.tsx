import React, { useState } from 'react'
import {
  Database,
  HardDrive,
  Link2,
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
import type { DatabaseConnection, SchemaTable, LunarGripUiState } from './lunargrip-types'
import { LunarGripConnectionDialog } from './LunarGripConnectionDialog'
import { LunarGripStatusBadge } from './LunarGripStatusBadge'
import { LunarGripObjectExplorer } from './LunarGripObjectExplorer'
import { LunarGripSqlEditor } from './LunarGripSqlEditor'
import { LunarGripErdViewer } from './LunarGripErdViewer'
import { LunarGripSsmsWorkbench } from './LunarGripSsmsWorkbench'

export default function LunarGripPage(): React.JSX.Element {
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [uiState, setUiState] = useState<LunarGripUiState>('disconnected')
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(null)
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null)

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
    setConnectionDialogOpen(false)
  }

  const handleTestConnection = (connection: DatabaseConnection): void => {
    setUiState('failed')
    setConnectionDialogOpen(false)
    toast.info('Conexión real no disponible', {
      description: 'Falta el driver SQL Server. No se ejecutó SQL ni se abrió una conexión.'
    })
    setActiveConnection(connection)
  }

  const leaveDemo = (): void => {
    setUiState('disconnected')
    setActiveConnection(null)
    setSelectedTable(null)
  }

  const showWorkbench =
    uiState === 'demo' || uiState === 'connected' || uiState === 'partial' || uiState === 'stale'
  const database =
    uiState === 'demo' ? MOCK_DATABASE_SCHEMA.database : (activeConnection?.database ?? '')

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
            <p className="text-xs text-muted-foreground">
              SQL Server local · sin ejecución SQL en esta fase
            </p>
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
              <span>{uiState === 'demo' ? 'Demo local' : 'Metadata no disponible'}</span>
            </div>
          </div>
          <TabsContent value="editor" className="min-h-0 flex-1">
            <div className="grid h-full min-h-0 grid-cols-[260px_1fr]">
              <LunarGripObjectExplorer
                tables={MOCK_DATABASE_SCHEMA.tables}
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
                state={uiState}
                database={database}
              />
              <LunarGripSqlEditor
                selectedTable={selectedTable}
                activeDatabase={database}
                demo={uiState === 'demo'}
              />
            </div>
          </TabsContent>
          <TabsContent value="erd" className="min-h-0 flex-1">
            <LunarGripErdViewer
              tables={MOCK_DATABASE_SCHEMA.tables}
              snapshot={MOCK_DATABASE_SCHEMA}
            />
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
            La conexión real todavía no está disponible en LunarGrip.
          </p>
        ) : null}
      </div>
    </div>
  )
}
