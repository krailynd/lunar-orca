import React, { useState, useEffect, useMemo } from 'react'
import { Check, Plus, Trash2, AlertCircle, Sparkles, Search } from 'lucide-react'
import { useActiveRepo, useActiveWorktree } from '@/store/selectors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  COLOR_PALETTE,
  PRIORITY_CONFIG,
  QUICK_TODO_PRIORITIES,
  STORAGE_KEY,
  type QuickTodoColor,
  type QuickTodoItem,
  type QuickTodoPriority,
  type QuickTodoScope
} from './quick-todos-types'

export default function QuickTodosPanel(): React.JSX.Element {
  const activeWorktree = useActiveWorktree()
  const activeRepo = useActiveRepo()
  const activePath = activeWorktree?.path ?? ''
  const activeRepoId = activeRepo?.id ?? activeWorktree?.repoId ?? ''

  const [todos, setTodos] = useState<QuickTodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [scope, setScope] = useState<QuickTodoScope>('workspace')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<QuickTodoPriority>('medium')
  const [newCategory, setNewCategory] = useState('')
  const [newColor, setNewColor] = useState<QuickTodoColor>('emerald')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // Ignore write errors
    }
  }, [todos])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const t of todos) {
      if (t.category?.trim()) {
        set.add(t.category.trim())
      }
    }
    return Array.from(set)
  }, [todos])

  const scopedTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (scope === 'workspace') {
        if (activePath && todo.workspacePath && todo.workspacePath !== activePath) {
          return false
        }
      } else if (scope === 'project') {
        if (activeRepoId && todo.repoId && todo.repoId !== activeRepoId) {
          return false
        }
      }
      if (selectedCategory && todo.category !== selectedCategory) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = todo.title.toLowerCase().includes(q)
        const matchesCat = todo.category?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesCat) {
          return false
        }
      }
      return true
    })
  }, [todos, scope, activePath, activeRepoId, selectedCategory, searchQuery])

  const toggleComplete = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const handleAddTodo = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      return
    }

    const item: QuickTodoItem = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: newTitle.trim(),
      completed: false,
      createdAt: Date.now(),
      priority: newPriority,
      color: newColor,
      category: newCategory.trim() || undefined,
      workspacePath: activePath || undefined,
      repoId: activeRepoId || undefined
    }

    setTodos((prev) => [item, ...prev])
    setNewTitle('')
    setNewCategory('')
    setIsAdding(false)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-foreground">
      {/* Header bar */}
      <div className="shrink-0 border-b border-sidebar-border px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Check className="size-3.5 stroke-[2.5]" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-foreground">
              Tareas &amp; Notas Rápidas
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsAdding((v) => !v)}
            title="Añadir nueva tarea rápida"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        {/* Scope Selector: Workspace / Proyecto / Todo */}
        <div className="mt-2.5 flex rounded-md border border-sidebar-border bg-sidebar-accent/30 p-0.5 text-[11px] font-medium shadow-xs">
          <button
            type="button"
            onClick={() => setScope('workspace')}
            className={cn(
              'flex-1 rounded py-1 text-center transition-all',
              scope === 'workspace'
                ? 'border border-foreground/15 bg-background font-semibold text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Workspace
          </button>
          <button
            type="button"
            onClick={() => setScope('project')}
            className={cn(
              'flex-1 rounded py-1 text-center transition-all',
              scope === 'project'
                ? 'border border-foreground/15 bg-background font-semibold text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Proyecto
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={cn(
              'flex-1 rounded py-1 text-center transition-all',
              scope === 'all'
                ? 'border border-foreground/15 bg-background font-semibold text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Todo
          </button>
        </div>

        {/* Search input */}
        <div className="mt-2 flex h-7 items-center gap-1.5 rounded border border-sidebar-border bg-input/40 px-2 focus-within:border-primary/50">
          <Search className="size-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar notas o tareas..."
            className="w-full bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Categories Chips */}
        {categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium transition-all',
                selectedCategory === null
                  ? 'bg-foreground/15 text-foreground'
                  : 'bg-sidebar-accent/50 text-muted-foreground hover:text-foreground'
              )}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium transition-all',
                  selectedCategory === cat
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-sidebar-accent/50 text-muted-foreground hover:text-foreground'
                )}
              >
                #{cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add New Todo Form Collapse */}
      {isAdding && (
        <form
          onSubmit={handleAddTodo}
          className="shrink-0 border-b border-sidebar-border bg-sidebar-accent/20 p-2.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="¿Qué tenés pendiente por hacer?"
            className="w-full rounded border border-sidebar-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/60"
            autoFocus
          />

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {/* Priority selection */}
            <div className="flex items-center gap-1 rounded border border-sidebar-border bg-background p-0.5">
              {QUICK_TODO_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-medium capitalize transition-all',
                    newPriority === p
                      ? cn(PRIORITY_CONFIG[p].bg, PRIORITY_CONFIG[p].color, 'font-semibold')
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>

            {/* Category tag */}
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Tag (ej. backend)"
              className="w-24 rounded border border-sidebar-border bg-background px-1.5 py-0.5 text-[10px] text-foreground outline-none"
            />

            {/* Color picker */}
            <div className="flex items-center gap-1">
              {COLOR_PALETTE.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setNewColor(c.id)}
                  className={cn(
                    'size-3.5 rounded-full transition-transform',
                    c.bgClass,
                    newColor === c.id && 'ring-2 ring-foreground/40 scale-110'
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <Button type="button" variant="ghost" size="xs" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="xs">
              Guardar
            </Button>
          </div>
        </form>
      )}

      {/* Todo List Items */}
      <div className="scrollbar-sleek min-h-0 flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {scopedTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Sparkles className="size-6 text-muted-foreground/30 mb-2" />
            <span className="text-xs font-medium">No hay tareas pendientes</span>
            <span className="text-[10px] text-muted-foreground/60 mt-0.5">
              Creá una nota rápida o tarea usando el botón (+)
            </span>
          </div>
        ) : (
          scopedTodos.map((todo) => {
            const pConf = PRIORITY_CONFIG[todo.priority]
            const colorOption = COLOR_PALETTE.find((c) => c.id === todo.color)
            return (
              <div
                key={todo.id}
                className={cn(
                  'group relative flex items-start gap-2 rounded-lg border p-2 transition-all',
                  colorOption?.borderClass,
                  todo.completed
                    ? 'border-sidebar-border/40 bg-sidebar-accent/10 opacity-60'
                    : 'border-sidebar-border bg-sidebar-accent/25 hover:border-sidebar-border/80 hover:bg-sidebar-accent/40 shadow-xs'
                )}
              >
                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleComplete(todo.id)}
                  className={cn(
                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    todo.completed
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-sidebar-border hover:border-foreground/60'
                  )}
                >
                  {todo.completed && <Check className="size-3 stroke-[3]" />}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-xs font-medium leading-relaxed break-words',
                      todo.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {todo.title}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    {/* Priority badge on hover */}
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded px-1 py-0.2 font-medium',
                        pConf.bg,
                        pConf.color
                      )}
                      title={`Prioridad: ${pConf.label}`}
                    >
                      <AlertCircle className="size-2.5" />
                      {pConf.label}
                    </span>

                    {todo.category && (
                      <span className="rounded bg-background/60 px-1 py-0.2 text-muted-foreground">
                        #{todo.category}
                      </span>
                    )}

                    <span className="text-muted-foreground/40 tabular-nums">
                      {new Date(todo.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    className="size-5 rounded p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between border-t border-sidebar-border px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>
          {scopedTodos.filter((t) => t.completed).length} de {scopedTodos.length} completadas
        </span>
        <span className="capitalize">{scope}</span>
      </div>
    </div>
  )
}
