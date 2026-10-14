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

// Segmented control shared by the SSMS tabs; spring-eased so the active chip
// settles instead of snapping.
const SEGMENT_BASE = 'lunargrip-spring flex items-center gap-1.5 rounded-md px-3 py-1 font-medium'
const SEGMENT_IDLE = 'text-muted-foreground hover:text-foreground'
const SEGMENT_ACTIVE = 'border border-primary/30 bg-primary/20 text-primary shadow-xs'
const SEGMENT_DESTRUCTIVE =
  'border border-destructive/25 bg-destructive/15 text-destructive shadow-xs'

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
    <div className="lunargrip-ambient flex h-full flex-col overflow-hidden bg-background select-none">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/80 p-2.5 backdrop-blur-md">
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/50 p-0.5 text-xs backdrop-blur-md">
          <button
            type="button"
            onClick={() => setTab('backup')}
            className={`${SEGMENT_BASE} ${tab === 'backup' ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            <Archive className="size-3.5" />
            <span>Backup (.BAK)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('restore')}
            className={`${SEGMENT_BASE} ${tab === 'restore' ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            <Database className="size-3.5" />
            <span>Restaurar (.BAK)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('attach')}
            className={`${SEGMENT_BASE} ${tab === 'attach' ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            <HardDrive className="size-3.5" />
            <span>Attach (.MDF)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('detach')}
            className={`${SEGMENT_BASE} ${tab === 'detach' ? SEGMENT_DESTRUCTIVE : SEGMENT_IDLE}`}
          >
            <span>Detach</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="lunargrip-spring flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs font-medium hover:bg-muted/40"
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
            className="lunargrip-spring flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            <Play className="size-3.5" />
            <span>Ejecutar (pendiente)</span>
          </button>
        </div>
      </div>
      <div className="flex items-start gap-2 border-b border-border/50 bg-muted/25 px-4 py-2 text-xs text-muted-foreground backdrop-blur-md">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-warning" />
        <span>
          Vista previa solamente. Backup, restore, attach y detach no se ejecutan; requieren
          integración posterior y confirmación humana.
        </span>
      </div>

      <div className="grid flex-1 grid-cols-1 divide-y divide-border/60 overflow-hidden md:grid-cols-2 md:divide-x md:divide-y-0">
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

        <div className="flex h-full flex-col overflow-hidden bg-muted/10 backdrop-blur-sm">
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
