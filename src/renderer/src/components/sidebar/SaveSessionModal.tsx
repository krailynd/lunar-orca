import React, { useState, useEffect } from 'react'
import { Bookmark, Check, Clock, X } from 'lucide-react'
import { useAllWorktrees } from '@/store/selectors'
import { cn } from '@/lib/utils'
import { COLOR_OPTIONS } from './session-history-types'

export function SaveSessionModal({
  open,
  onClose,
  onSave
}: {
  open: boolean
  onClose: () => void
  onSave: (name: string, description: string, customTimestamp: string, color: string) => void
}): React.JSX.Element | null {
  const allWorktrees = useAllWorktrees()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)

  useEffect(() => {
    if (open) {
      const now = new Date()
      const formatted = new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(now)
      setTimestamp(formatted)
      setName(`Punto de Restauración (${allWorktrees.length} worktrees)`)
      setDescription('')
    }
  }, [open, allWorktrees.length])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary">
            <Bookmark className="size-5" />
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Guardar Estado de Sesión Actual
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground/80">Nombre de la Sesión</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Feature Auth + Worktrees de prueba"
              className="mt-1 w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/80">
              Fecha y Hora (Editable)
            </label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/30 pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/80">
              Descripción o Notas (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas clave de los agentes o tareas en curso..."
              className="mt-1 w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/80">Color Distintivo</label>
            <div className="mt-2 flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'size-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center',
                    color === c.value && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value ? <Check className="size-3 text-white" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(name, description, timestamp, color)
              onClose()
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-98 transition"
          >
            <Bookmark className="size-3.5" />
            <span>Guardar en Historial</span>
          </button>
        </div>
      </div>
    </div>
  )
}
