import type React from 'react'
import { ArrowUpRight } from 'lucide-react'

export function QuickActionRow({
  icon: Icon,
  label,
  shortcut,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortcut: string
  onClick: () => void
}): React.JSX.Element {
  return (
    <button type="button" onClick={onClick} className="home-quick-action group">
      <span className="home-quick-action-icon">
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-[13px] font-medium home-text-strong">{label}</span>
        <span className="text-[10px] home-text-faint">{shortcut}</span>
      </span>
      <ArrowUpRight className="size-3.5 home-text-faint transition-colors group-hover:home-text-muted" />
    </button>
  )
}
