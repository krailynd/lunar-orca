import React, { useState } from 'react'
import {
  Archive,
  Database,
  FileCode,
  HardDrive,
  Copy,
  Check,
  Play,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import {
  generateAttachDatabaseSql,
  generateBackupDatabaseSql,
  generateDetachDatabaseSql,
  generateInspectBakFileSql,
  generateRestoreDatabaseSql
} from './lunargrip-ssms-generator'
import { SsmsAttachDetachForm, SsmsBackupForm, SsmsRestoreForm } from './LunarGripSsmsForms'

type SsmsTab = 'backup' | 'restore' | 'attach' | 'detach'

export function LunarGripSsmsWorkbench({
  activeDatabase
}: {
  activeDatabase: string
}): React.JSX.Element {
  const [tab, setTab] = useState<SsmsTab>('backup')
  const [db, setDb] = useState(activeDatabase || 'LunarGrip Demo')
  const [bak, setBak] = useState('/demo/LunarGrip_backup.bak')
  const [format, setFormat] = useState(true)
  const [compress, setCompress] = useState(true)
  const [checksum, setChecksum] = useState(true)

  const [dataLog, setDataLog] = useState('LunarGrip_Data')
  const [dataMdf, setDataMdf] = useState('/demo/LunarGrip.mdf')
  const [logLog, setLogLog] = useState('LunarGrip_Log')
  const [logLdf, setLogLdf] = useState('/demo/LunarGrip_log.ldf')
  const [replace, setReplace] = useState(true)

  const [mdf, setMdf] = useState('/demo/LunarGrip.mdf')
  const [ldf, setLdf] = useState('/demo/LunarGrip_log.ldf')
  const [rebuild, setRebuild] = useState(false)
  const [dropConn, setDropConn] = useState(true)

  const [copied, setCopied] = useState(false)

  const generatedSql = (() => {
    if (tab === 'backup') {
      return generateBackupDatabaseSql({
        database: db,
        targetBakPath: bak,
        formatMedia: format,
        compression: compress,
        checksum
      })
    }
    if (tab === 'restore') {
      return `${generateInspectBakFileSql(bak)}\n\n${generateRestoreDatabaseSql({
        targetDatabase: db,
        sourceBakPath: bak,
        moveDataLogical: dataLog,
        moveDataToMdf: dataMdf,
        moveLogLogical: logLog,
        moveLogToLdf: logLdf,
        replace
      })}`
    }
    if (tab === 'attach') {
      return generateAttachDatabaseSql({
        databaseName: db,
        mdfPath: mdf,
        ldfPath: rebuild ? undefined : ldf,
        rebuildLog: rebuild
      })
    }
    return generateDetachDatabaseSql({
      databaseName: db,
      dropConnections: dropConn
    })
  })()

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(generatedSql)
    setCopied(true)
    toast.success('Script T-SQL copiado')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full bg-background select-none overflow-hidden">
      <div className="flex items-center justify-between p-2.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/50 text-xs">
          <button
            type="button"
            onClick={() => setTab('backup')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium ${
              tab === 'backup'
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Archive className="size-3.5" />
            <span>Backup (.BAK)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('restore')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium ${
              tab === 'restore'
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="size-3.5" />
            <span>Restaurar (.BAK)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('attach')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium ${
              tab === 'attach'
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HardDrive className="size-3.5" />
            <span>Attach (.MDF)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('detach')}
            className={`px-3 py-1 rounded-md font-medium ${
              tab === 'detach'
                ? 'bg-destructive/15 text-destructive border border-destructive/25 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Detach</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-muted/40"
          >
            {copied ? (
              <Check className="size-3 text-status-success" />
            ) : (
              <Copy className="size-3" />
            )}
            <span>Copiar T-SQL</span>
          </button>
          <button
            type="button"
            disabled
            title="Disponible cuando exista una conexión real"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            <Play className="size-3.5" />
            <span>Ejecutar (pendiente)</span>
          </button>
        </div>
      </div>
      <div className="flex items-start gap-2 border-b border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-warning" />
        <span>
          Vista previa solamente. Backup, restore, attach y detach no se ejecutan; requieren
          integración posterior y confirmación humana.
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 overflow-hidden">
        <div className="p-4 overflow-y-auto scrollbar-sleek">
          {tab === 'backup' ? (
            <SsmsBackupForm
              db={db}
              setDb={setDb}
              bak={bak}
              setBak={setBak}
              format={format}
              setFormat={setFormat}
              compress={compress}
              setCompress={setCompress}
              checksum={checksum}
              setChecksum={setChecksum}
            />
          ) : null}
          {tab === 'restore' ? (
            <SsmsRestoreForm
              db={db}
              setDb={setDb}
              bak={bak}
              setBak={setBak}
              dataLog={dataLog}
              setDataLog={setDataLog}
              dataMdf={dataMdf}
              setDataMdf={setDataMdf}
              logLog={logLog}
              setLogLog={setLogLog}
              logLdf={logLdf}
              setLogLdf={setLogLdf}
              replace={replace}
              setReplace={setReplace}
            />
          ) : null}
          {tab === 'attach' || tab === 'detach' ? (
            <SsmsAttachDetachForm
              mode={tab}
              db={db}
              setDb={setDb}
              mdf={mdf}
              setMdf={setMdf}
              ldf={ldf}
              setLdf={setLdf}
              rebuild={rebuild}
              setRebuild={setRebuild}
              dropConn={dropConn}
              setDropConn={setDropConn}
            />
          ) : null}
        </div>

        <div className="flex flex-col h-full bg-muted/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 text-xs font-semibold text-muted-foreground bg-muted/20">
            <div className="flex items-center gap-1.5">
              <FileCode className="size-3.5 text-primary" />
              <span>Vista Previa del Script T-SQL</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40">
              Vista previa solamente · Ejecución no disponible
            </span>
          </div>
          <div className="flex-1 p-3 overflow-auto font-mono text-[11px] text-foreground leading-relaxed scrollbar-sleek whitespace-pre">
            {generatedSql}
          </div>
        </div>
      </div>
    </div>
  )
}
