import type React from 'react'
import { useState } from 'react'
import { Bookmark, Calendar, Edit2, History, Loader2, Palette, Play, Trash2, X } from 'lucide-react'
import { COLOR_OPTIONS, type useSessionHistory } from './session-history-types'
import { restoreSessionSnapshot } from './session-restore-manager'

export function SessionsHistoryDrawer({
  open,
  onClose,
  history
}: {
  open: boolean
  onClose: () => void
  history: ReturnType<typeof useSessionHistory>
}): React.JSX.Element | null {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTimestamp, setEditTimestamp] = useState('')
  const [colorPickerId, setColorPickerId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoreProgress, setRestoreProgress] = useState<string | null>(null)

  const handleRestore = async (item: Parameters<typeof restoreSessionSnapshot>[0]) => {
    if (restoringId) {
      return
    }
    setRestoringId(item.id)
    setRestoreProgress('Iniciando restauración...')
    try {
      await restoreSessionSnapshot(item, (step) => setRestoreProgress(step))
    } finally {
      setRestoringId(null)
      setRestoreProgress(null)
    }
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex h-full w-96 flex-col border-l border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-300">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary">
            <History className="size-5" />
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Historial de Sesiones
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Puntos de control y snapshots guardados ({history.sessions.length})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Lista de Snapshots */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-sleek">
          {history.sessions.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
              <Bookmark className="size-8 stroke-1 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium">Aún no hay sesiones guardadas</p>
              <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                Usá el botón de Guardar Sesión en la barra para crear un punto de restauración.
              </p>
            </div>
          ) : (
            history.sessions.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-border/60 bg-muted/20 p-3.5 shadow-xs transition hover:border-primary/40 hover:bg-muted/30"
                style={{ borderLeftWidth: 4, borderLeftColor: item.color }}
              >
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-primary bg-background px-2 py-1 text-xs font-semibold text-foreground focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editTimestamp}
                      onChange={(e) => setEditTimestamp(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground focus:outline-none"
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          history.renameSession(item.id, editName, editTimestamp)
                          setEditingId(null)
                        }}
                        className="rounded-md bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.id)
                            setEditName(item.name)
                            setEditTimestamp(item.timestamp)
                          }}
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title="Editar nombre y fecha"
                        >
                          <Edit2 className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setColorPickerId(colorPickerId === item.id ? null : item.id)
                          }
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title="Cambiar color"
                        >
                          <Palette className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => history.deleteSession(item.id)}
                          className="rounded p-1 text-destructive hover:bg-destructive/10"
                          title="Eliminar snapshot"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {item.description ? (
                      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                        {item.description}
                      </p>
                    ) : null}

                    {/* Selector de Color In-line */}
                    {colorPickerId === item.id ? (
                      <div className="my-2 flex items-center gap-1.5 rounded-lg border border-border/80 bg-background p-1.5">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => {
                              history.updateSessionColor(item.id, c.value)
                              setColorPickerId(null)
                            }}
                            className="size-4 rounded-full transition-transform hover:scale-125"
                            style={{ backgroundColor: c.value }}
                          />
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/80">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="size-3 text-muted-foreground" />
                        {item.timestamp}
                      </span>
                      {item.reposData && item.reposData.length > 0 ? (
                        <>
                          <span>•</span>
                          <span className="font-medium text-foreground/80">
                            {item.reposData.length}{' '}
                            {item.reposData.length === 1 ? 'proyecto' : 'proyectos'}
                          </span>
                        </>
                      ) : null}
                      <span>•</span>
                      <span>{item.worktreesCount} worktrees</span>
                      <span>•</span>
                      <span>{item.terminalsCount} terminales</span>
                    </div>

                    {item.reposData && item.reposData.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.reposData.map((r) => (
                          <span
                            key={r.id}
                            className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary border border-primary/20"
                          >
                            📁 {r.displayName}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {item.worktreeNames && item.worktreeNames.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.worktreeNames.slice(0, 4).map((wName) => (
                          <span
                            key={wName}
                            className="rounded-md bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-foreground/80 border border-border/40"
                          >
                            {wName}
                          </span>
                        ))}
                        {item.worktreeNames.length > 4 ? (
                          <span className="rounded-md bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                            +{item.worktreeNames.length - 4} más
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Botón de Restauración Inteligente */}
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground/70">
                        {restoringId === item.id ? restoreProgress : 'Restaurar entorno limpio'}
                      </span>
                      <button
                        type="button"
                        disabled={restoringId !== null}
                        onClick={() => handleRestore(item)}
                        className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition"
                      >
                        {restoringId === item.id ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            <span>Restaurando...</span>
                          </>
                        ) : (
                          <>
                            <Play className="size-3 fill-current" />
                            <span>Cargar sesión</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-border/60 text-center">
          <p className="text-[10px] text-muted-foreground/70">
            Snapshots almacenados de forma segura en almacenamiento local.
          </p>
        </div>
      </div>
    </div>
  )
}
