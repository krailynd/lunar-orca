import React from 'react'
import { FolderOpen, AlertTriangle } from 'lucide-react'

export function SsmsBackupForm(props: {
  db: string
  setDb: (v: string) => void
  bak: string
  setBak: (v: string) => void
  format: boolean
  setFormat: (v: boolean) => void
  compress: boolean
  setCompress: (v: boolean) => void
  checksum: boolean
  setChecksum: (v: boolean) => void
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold mb-1">Base de Datos</label>
        <input
          type="text"
          value={props.db}
          onChange={(e) => props.setDb(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-border/70 bg-muted/20 text-xs font-mono"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Ruta Destino (.BAK)</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={props.bak}
            onChange={(e) => props.setBak(e.target.value)}
            className="flex-1 px-2.5 py-1.5 rounded-lg border border-border/70 bg-muted/20 text-xs font-mono"
          />
          <button
            type="button"
            className="p-1.5 rounded-lg border border-border/70 hover:bg-muted/40"
          >
            <FolderOpen className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="space-y-1.5 pt-1 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.format}
            onChange={(e) => props.setFormat(e.target.checked)}
          />
          <span>Sobrescribir archivo de medios (FORMAT / INIT)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.compress}
            onChange={(e) => props.setCompress(e.target.checked)}
          />
          <span>Compresión nativa (COMPRESSION)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.checksum}
            onChange={(e) => props.setChecksum(e.target.checked)}
          />
          <span>Verificar páginas (CHECKSUM)</span>
        </label>
      </div>
    </div>
  )
}

export function SsmsRestoreForm(props: {
  db: string
  setDb: (v: string) => void
  bak: string
  setBak: (v: string) => void
  dataLog: string
  setDataLog: (v: string) => void
  dataMdf: string
  setDataMdf: (v: string) => void
  logLog: string
  setLogLog: (v: string) => void
  logLdf: string
  setLogLdf: (v: string) => void
  replace: boolean
  setReplace: (v: boolean) => void
}): React.JSX.Element {
  return (
    <div className="space-y-2.5 text-xs">
      <div>
        <label className="block font-semibold mb-1">Nombre Destino</label>
        <input
          type="text"
          value={props.db}
          onChange={(e) => props.setDb(e.target.value)}
          className="w-full px-2.5 py-1 rounded-lg border border-border/70 bg-muted/20 font-mono"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Archivo .BAK</label>
        <input
          type="text"
          value={props.bak}
          onChange={(e) => props.setBak(e.target.value)}
          className="w-full px-2.5 py-1 rounded-lg border border-border/70 bg-muted/20 font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
        <div>
          <label className="block text-muted-foreground mb-0.5">Lógico MDF</label>
          <input
            type="text"
            value={props.dataLog}
            onChange={(e) => props.setDataLog(e.target.value)}
            className="w-full px-2 py-1 rounded border border-border/70 bg-muted/20 font-mono"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-0.5">Destino .MDF</label>
          <input
            type="text"
            value={props.dataMdf}
            onChange={(e) => props.setDataMdf(e.target.value)}
            className="w-full px-2 py-1 rounded border border-border/70 bg-muted/20 font-mono"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-0.5">Lógico LDF</label>
          <input
            type="text"
            value={props.logLog}
            onChange={(e) => props.setLogLog(e.target.value)}
            className="w-full px-2 py-1 rounded border border-border/70 bg-muted/20 font-mono"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-0.5">Destino .LDF</label>
          <input
            type="text"
            value={props.logLdf}
            onChange={(e) => props.setLogLdf(e.target.value)}
            className="w-full px-2 py-1 rounded border border-border/70 bg-muted/20 font-mono"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={props.replace}
          onChange={(e) => props.setReplace(e.target.checked)}
        />
        <span>Sobrescribir existente (WITH REPLACE)</span>
      </label>
    </div>
  )
}

export function SsmsAttachDetachForm(props: {
  mode: 'attach' | 'detach'
  db: string
  setDb: (v: string) => void
  mdf: string
  setMdf: (v: string) => void
  ldf: string
  setLdf: (v: string) => void
  rebuild: boolean
  setRebuild: (v: boolean) => void
  dropConn: boolean
  setDropConn: (v: boolean) => void
}): React.JSX.Element {
  if (props.mode === 'detach') {
    return (
      <div className="space-y-3 text-xs">
        <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Separar Base (Detach)</span>
          </div>
          <p className="text-[11px] opacity-90 leading-tight">
            Desconecta la base del servidor SQL sin borrar los archivos .mdf ni .ldf del disco.
          </p>
        </div>
        <div>
          <label className="block font-semibold mb-1">Base de Datos</label>
          <input
            type="text"
            value={props.db}
            onChange={(e) => props.setDb(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border/70 bg-muted/20 font-mono"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.dropConn}
            onChange={(e) => props.setDropConn(e.target.checked)}
          />
          <span>Forzar desconexión inmediata (ROLLBACK IMMEDIATE)</span>
        </label>
      </div>
    )
  }

  return (
    <div className="space-y-3 text-xs">
      <div>
        <label className="block font-semibold mb-1">Nombre a Conectar</label>
        <input
          type="text"
          value={props.db}
          onChange={(e) => props.setDb(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-border/70 bg-muted/20 font-mono"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Archivo Primario (.MDF)</label>
        <input
          type="text"
          value={props.mdf}
          onChange={(e) => props.setMdf(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-border/70 bg-muted/20 font-mono"
        />
      </div>
      {!props.rebuild ? (
        <div>
          <label className="block font-semibold mb-1">Archivo Registro (.LDF)</label>
          <input
            type="text"
            value={props.ldf}
            onChange={(e) => props.setLdf(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border/70 bg-muted/20 font-mono"
          />
        </div>
      ) : null}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.rebuild}
          onChange={(e) => props.setRebuild(e.target.checked)}
        />
        <span>Reconstruir log si falta (ATTACH_REBUILD_LOG)</span>
      </label>
    </div>
  )
}
