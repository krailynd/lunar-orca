import type React from 'react'

export type OmnibarCategory = 'all' | 'workspaces' | 'files' | 'commands' | 'agents'

export type OmnibarItem = {
  id: string
  title: string
  subtitle?: string
  category: Exclude<OmnibarCategory, 'all'>
  icon: React.ReactNode
  badge?: string
  shortcut?: string
  onSelect: () => void
}
