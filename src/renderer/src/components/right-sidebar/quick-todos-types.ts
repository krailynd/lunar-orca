export const QUICK_TODO_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type QuickTodoPriority = (typeof QUICK_TODO_PRIORITIES)[number]

export type QuickTodoScope = 'workspace' | 'project' | 'all'

export type QuickTodoColor = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'pink' | 'cyan'

export type QuickTodoItem = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  dueDate?: string
  priority: QuickTodoPriority
  color?: QuickTodoColor
  category?: string
  workspacePath?: string
  repoId?: string
}

export const STORAGE_KEY = 'orca_quick_todos_v1'

export const PRIORITY_CONFIG: Record<
  QuickTodoPriority,
  { label: string; color: string; border: string; bg: string }
> = {
  low: {
    label: 'Baja',
    color: 'text-muted-foreground',
    border: 'border-muted/40',
    bg: 'bg-muted/10'
  },
  medium: {
    label: 'Media',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10'
  },
  high: {
    label: 'Alta',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10'
  },
  urgent: {
    label: 'Urgente',
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10'
  }
}

export const COLOR_PALETTE: {
  id: QuickTodoColor
  label: string
  bgClass: string
  borderClass: string
}[] = [
  {
    id: 'emerald',
    label: 'Esmeralda',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-l-emerald-500 border-l-[3px]'
  },
  {
    id: 'blue',
    label: 'Zafiro',
    bgClass: 'bg-blue-500',
    borderClass: 'border-l-blue-500 border-l-[3px]'
  },
  {
    id: 'purple',
    label: 'Amatista',
    bgClass: 'bg-purple-500',
    borderClass: 'border-l-purple-500 border-l-[3px]'
  },
  {
    id: 'amber',
    label: 'Ámbar',
    bgClass: 'bg-amber-500',
    borderClass: 'border-l-amber-500 border-l-[3px]'
  },
  {
    id: 'rose',
    label: 'Rubí',
    bgClass: 'bg-rose-500',
    borderClass: 'border-l-rose-500 border-l-[3px]'
  },
  {
    id: 'pink',
    label: 'Rosa',
    bgClass: 'bg-pink-500',
    borderClass: 'border-l-pink-500 border-l-[3px]'
  },
  {
    id: 'cyan',
    label: 'Cian',
    bgClass: 'bg-cyan-500',
    borderClass: 'border-l-cyan-500 border-l-[3px]'
  }
]
