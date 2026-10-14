import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import type { OnMount } from '@monaco-editor/react'
import { AlertCircle, Copy, Database, MessageSquare, Play, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { SchemaTable } from './lunargrip-types'

export function LunarGripSqlEditor({
  selectedTable,
  activeDatabase,
  demo
}: {
  selectedTable: SchemaTable | null
  activeDatabase: string
  demo: boolean
}): React.JSX.Element {
  const [queries, setQueries] = useState(() => [
    {
      id: 'query-1',
      name: 'Consulta 1',
      value: selectedTable
        ? `SELECT TOP 50 *\nFROM [${selectedTable.schema}].[${selectedTable.name}];`
        : '-- Seleccioná una tabla para generar una consulta de ejemplo',
      dirty: false
    }
  ])
  const [activeQueryId, setActiveQueryId] = useState('query-1')
  const activeQuery = queries.find((query) => query.id === activeQueryId) ?? queries[0]!
  const sqlQuery = activeQuery.value
  const setSqlQuery = (value: string): void => {
    setQueries((current) =>
      current.map((query) =>
        query.id === activeQueryId ? { ...query, value, dirty: true } : query
      )
    )
  }
  const [completionReady, setCompletionReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const completionDisposableRef = useRef<{ dispose: () => void } | null>(null)

  const handleEditorMount: OnMount = (editor, monaco) => {
    completionDisposableRef.current?.dispose()
    completionDisposableRef.current = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: () => ({
        suggestions: [
          ...['SELECT', 'FROM', 'WHERE', 'JOIN', 'ORDER BY'].map((label) => ({
            label,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: label
          })),
          ...['Usuarios', 'Proyectos', 'Tareas'].map((label) => ({
            label,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: label,
            detail: 'Tabla demo'
          })),
          ...['id', 'nombre', 'created_at'].map((label) => ({
            label,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: label,
            detail: 'Columna demo'
          })),
          ...['COUNT', 'SUM', 'GETDATE'].map((label) => ({
            label,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: label,
            detail: 'Función T-SQL demo'
          }))
        ]
      })
    })
    editor.addAction({
      id: 'lunargrip.show-completions',
      label: 'Mostrar sugerencias demo',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      run: () => editor.trigger('keyboard', 'editor.action.triggerSuggest', {})
    })
    setCompletionReady(true)
  }

  useEffect(
    () => () => {
      completionDisposableRef.current?.dispose()
      completionDisposableRef.current = null
    },
    []
  )

  useEffect(() => {
    if (selectedTable) {
      setQueries((current) =>
        current.map((query) =>
          query.id === activeQueryId
            ? {
                ...query,
                value: `SELECT TOP 50 *\nFROM [${selectedTable.schema}].[${selectedTable.name}];`,
                dirty: true
              }
            : query
        )
      )
    }
  }, [activeQueryId, selectedTable])

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(sqlQuery)
    setCopied(true)
    toast.success('Script copiado al portapapeles')
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="lunargrip-ambient flex h-full min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/80 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {queries.map((query) => (
              <Button
                key={query.id}
                variant={query.id === activeQueryId ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveQueryId(query.id)}
              >
                {query.name}
                {query.dirty ? ' *' : ''}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const id = `query-${queries.length + 1}`
                setQueries((current) => [
                  ...current,
                  { id, name: `Consulta ${current.length + 1}`, value: '', dirty: false }
                ])
                setActiveQueryId(id)
              }}
            >
              +
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {activeQuery.dirty ? 'Sin guardar' : 'Guardada'} ·{' '}
            {completionReady ? 'Sugerencias demo' : 'Editor cargando'}
          </span>
          {demo ? <Badge variant="secondary">Demo</Badge> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">
            {activeDatabase || 'Sin base seleccionada'}
          </span>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy /> {copied ? 'Copiado' : 'Copiar'}
          </Button>
          <Button size="sm" disabled title="Disponible cuando exista una conexión real">
            <Play /> Ejecutar
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-[220px] flex-1 flex-col border-b border-border/50">
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
            <Terminal className="size-3.5" />
            <span>SQL · T-SQL</span>
            <span className="ml-auto">Ctrl/Cmd+Enter disponible con conexión real</span>
          </div>
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language="sql"
              theme="vs-dark"
              value={sqlQuery}
              onChange={(value) => setSqlQuery(value ?? '')}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                fontSize: 13,
                padding: { top: 12 },
                readOnly: false,
                suggestOnTriggerCharacters: true
              }}
            />
          </div>
        </div>
        <div className="h-[220px] min-h-[170px]">
          <Tabs defaultValue="results" className="h-full">
            <TabsList variant="line">
              <TabsTrigger value="results">
                <Database /> Resultados
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare /> Mensajes
              </TabsTrigger>
              <TabsTrigger value="diagnostics">
                <AlertCircle /> Diagnósticos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="results" className="h-[calc(100%-2.25rem)]">
              <div className="flex h-full items-center justify-center p-4">
                <div className="lunargrip-empty-card flex items-center gap-2 rounded-xl px-6 py-4 text-xs text-muted-foreground">
                  <Database className="size-4" />
                  <span>
                    {demo
                      ? 'DEMO · Datos sintéticos · Sin conexión real. No se ejecutan consultas.'
                      : 'Sin conexión y sin resultados.'}
                  </span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="messages" className="h-[calc(100%-2.25rem)]">
              <div className="flex h-full items-center justify-center p-4">
                <div className="lunargrip-empty-card flex items-center gap-2 rounded-xl px-6 py-4 text-xs text-muted-foreground">
                  <MessageSquare className="size-4" />
                  <span>Ejecución no disponible: no hay conexión real.</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="diagnostics" className="h-[calc(100%-2.25rem)]">
              <div className="flex h-full items-center justify-center p-4">
                <div className="lunargrip-empty-card flex items-center gap-2 rounded-xl px-6 py-4 text-xs text-muted-foreground">
                  <AlertCircle className="size-4" />
                  <span>
                    {demo
                      ? 'Diagnósticos demo: no hay análisis de servidor disponible.'
                      : 'No hay diagnósticos porque no existe una conexión real.'}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
