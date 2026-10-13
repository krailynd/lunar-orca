import type React from 'react'
import { Bot, Code2, Layers, Sparkles, Terminal, Zap } from 'lucide-react'
import type { AiVaultAgent } from '../../../../shared/ai-vault-types'

export type HarnessCategory = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgGlow: string
  borderGlow: string
  badgeBg: string
  badgeText: string
  agents: AiVaultAgent[]
}

export const HARNESS_CATEGORIES: HarnessCategory[] = [
  {
    id: 'pi',
    name: 'Pi Agent',
    icon: Sparkles,
    color: 'text-workspace-status-review',
    bgGlow: 'bg-workspace-status-review/10',
    borderGlow: 'border-workspace-status-review/30 group-hover:border-workspace-status-review/50',
    badgeBg: 'bg-workspace-status-review/15',
    badgeText: 'text-workspace-status-review',
    agents: ['pi', 'omp', 'prime-agent']
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    icon: Code2,
    color: 'text-status-success',
    bgGlow: 'bg-status-success-background',
    borderGlow: 'border-status-success-border group-hover:border-status-success',
    badgeBg: 'bg-status-success-background',
    badgeText: 'text-status-success',
    agents: ['opencode', 'opencode2']
  },
  {
    id: 'hermes',
    name: 'Hermes Agent',
    icon: Zap,
    color: 'text-status-warning',
    bgGlow: 'bg-status-warning-background',
    borderGlow: 'border-status-warning-border group-hover:border-status-warning',
    badgeBg: 'bg-status-warning-background',
    badgeText: 'text-status-warning',
    agents: ['hermes']
  },
  {
    id: 'claude',
    name: 'Claude Code',
    icon: Bot,
    color: 'text-agent-question',
    bgGlow: 'bg-agent-question/10',
    borderGlow: 'border-agent-question/30 group-hover:border-agent-question/50',
    badgeBg: 'bg-agent-question/15',
    badgeText: 'text-agent-question',
    agents: ['claude']
  },
  {
    id: 'codex',
    name: 'Codex',
    icon: Terminal,
    color: 'text-primary',
    bgGlow: 'bg-primary/10',
    borderGlow: 'border-primary/30 group-hover:border-primary/50',
    badgeBg: 'bg-primary/15',
    badgeText: 'text-primary',
    agents: ['codex']
  },
  {
    id: 'antigravity',
    name: 'Antigravity / CPA / Otros',
    icon: Layers,
    color: 'text-callout-important',
    bgGlow: 'bg-callout-important/10',
    borderGlow: 'border-callout-important/30 group-hover:border-callout-important/50',
    badgeBg: 'bg-callout-important/15',
    badgeText: 'text-callout-important',
    agents: [
      'antigravity',
      'gemini',
      'cursor',
      'copilot',
      'devin',
      'cline',
      'kimi',
      'droid',
      'openclaw',
      'codebuddy',
      'qoder',
      'rovo',
      'zcode',
      'grok',
      'muse',
      'jcode'
    ]
  }
]

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) {
    return 'Reciente'
  }
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return 'Reciente'
  }
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) {
    return 'Hace un momento'
  }
  if (diffSec < 3600) {
    return `Hace ${Math.floor(diffSec / 60)}m`
  }
  if (diffSec < 86400) {
    return `Hace ${Math.floor(diffSec / 3600)}h`
  }
  if (diffSec < 604800) {
    return `Hace ${Math.floor(diffSec / 86400)}d`
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
