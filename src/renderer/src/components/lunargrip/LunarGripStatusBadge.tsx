import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { LunarGripUiState } from './lunargrip-types'
import { LUNARGRIP_STATUS_LABELS } from './lunargrip-status-labels'

export function LunarGripStatusBadge({ state }: { state: LunarGripUiState }): React.JSX.Element {
  return (
    <Badge variant={state === 'failed' ? 'destructive' : 'outline'} className="whitespace-nowrap">
      {LUNARGRIP_STATUS_LABELS[state]}
    </Badge>
  )
}
