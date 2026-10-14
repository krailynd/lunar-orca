import type { LunarGripUiState } from './lunargrip-types'

export const LUNARGRIP_STATUS_LABELS: Record<LunarGripUiState, string> = {
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
