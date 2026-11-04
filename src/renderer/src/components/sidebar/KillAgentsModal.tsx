import type React from 'react'
import { Trash2 } from 'lucide-react'

export function KillAgentsModal({
  open,
  onClose,
  onConfirm
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}): React.JSX.Element | null {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-sm rounded-2xl border border-destructive/40 bg-background/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-destructive">
          <div className="rounded-full bg-destructive/15 p-2">
            <Trash2 className="size-5" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            ¿Limpiar y detener todos los agentes?
          </h2>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Esta acción cerrará las terminales activas de agentes y limpiará los procesos PTY en
          ejecución para liberar memoria y recursos. ¿Deseás continuar?
        </p>

        <div className="mt-6 flex justify-end gap-2">
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
              onConfirm()
              onClose()
            }}
            className="flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-1.5 text-xs font-semibold text-destructive-foreground shadow-sm hover:opacity-90 active:scale-98 transition"
          >
            <Trash2 className="size-3.5" />
            <span>Sí, Detener Agentes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
