import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { LunarGripUiState } from './lunargrip-types'

const labels: Record<LunarGripUiState, string> = {
  disconnected: 'Sin conexión',
  configuring: 'Configurando',
  connecting: 'Conectando',
  connected: 'Conectada',
  loading: 'Cargando metadata',
  partial: 'Metadata parcial',
  stale: 'Snapshot stale',
  failed: 'Fallida',
  demo: 'DEMO · Sin conexión real'
}

export function LunarGripStatusBadge({ state }: { state: LunarGripUiState }): React.JSX.Element {
  return (
    <Badge variant={state === 'failed' ? 'destructive' : 'outline'} className="whitespace-nowrap">
      {labels[state]}
    </Badge>
  )
}
