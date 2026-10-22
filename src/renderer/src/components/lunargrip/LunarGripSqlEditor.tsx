import React, { useCallback, useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import type { OnMount } from '@monaco-editor/react'
import { AlertCircle, Copy, Database, Loader2, MessageSquare, Play, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type {
  LunarGripConnectionPayload,
  QueryResult,
  QueryResultViewProps,
  SchemaTable
} from './lunargrip-types'

const SQL_KEYWORDS = [
  'SELECT',
  'INSERT INTO',
  'UPDATE',
  'DELETE',
  'FROM',
  'WHERE',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL OUTER JOIN',
  'CROSS APPLY',
  'OUTER APPLY',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'UNION ALL',
  'WITH',
  'OVER',
  'PARTITION BY',
  'CREATE TABLE',
  'ALTER TABLE',
  'DROP TABLE',
  'CREATE PROCEDURE',
  'CREATE FUNCTION',
  'CREATE INDEX',
  'CREATE VIEW',
  'BEGIN TRANSACTION',
  'COMMIT TRANSACTION',
  'ROLLBACK TRANSACTION',
  'BEGIN TRY',
  'END TRY',
  'BEGIN CATCH',
  'END CATCH',
  'DECLARE',
  'SET',
  'IF',
  'ELSE',
  'WHILE',
  'RETURN',
  'PRINT',
  'EXEC',
  'EXECUTE',
  'TOP',
  'DISTINCT',
  'AS',
  'ON',
  'IN',
  'NOT',
  'AND',
  'OR',
  'LIKE',
  'BETWEEN',
  'IS NULL',
  'IS NOT NULL',
  'EXISTS'
] as const

const SQL_DATA_TYPES = [
  'INT',
  'BIGINT',
  'SMALLINT',
  'TINYINT',
  'BIT',
  'DECIMAL',
  'NUMERIC',
  'MONEY',
  'FLOAT',
  'REAL',
  'DATE',
  'DATETIME',
  'DATETIME2',
  'TIME',
  'CHAR',
  'VARCHAR',
  'NCHAR',
  'NVARCHAR',
  'TEXT',
  'NTEXT',
  'BINARY',
  'VARBINARY',
  'IMAGE',
  'UNIQUEIDENTIFIER',
  'XML',
  'JSON'
] as const

const SQL_FUNCTIONS = [
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'GETDATE()',
  'SYSDATETIME()',
  'DATEADD',
  'DATEDIFF',
  'DATEPART',
  'ISNULL',
  'COALESCE',
  'NULLIF',
  'CAST',
  'CONVERT',
  'TRY_CAST',
  'TRY_CONVERT',
  'STRING_AGG',
  'STRING_SPLIT',
  'SUBSTRING',
  'CHARINDEX',
  'LEN',
  'UPPER',
  'LOWER',
  'LTRIM',
  'RTRIM',
  'TRIM',
  'REPLACE',
  'NEWID()',
  'SCOPE_IDENTITY()',
  '@@ROWCOUNT',
  '@@ERROR',
  'ROW_NUMBER()',
  'RANK()',
  'DENSE_RANK()'
] as const

const SQL_SNIPPETS = [
  { label: 'sel', detail: 'SELECT * FROM', insertText: 'SELECT ${1:*}\nFROM ${2:table};' },
  {
    label: 'ins',
    detail: 'INSERT INTO',
    insertText: 'INSERT INTO ${1:table} (${2:columns})\nVALUES (${3:values});'
  },
  {
    label: 'upd',
    detail: 'UPDATE … SET',
    insertText: 'UPDATE ${1:table}\nSET ${2:column} = ${3:value}\nWHERE ${4:condition};'
  },
  {
    label: 'del',
    detail: 'DELETE FROM',
    insertText: 'DELETE FROM ${1:table}\nWHERE ${2:condition};'
  },
  {
    label: 'crt',
    detail: 'CREATE TABLE',
    insertText:
      'CREATE TABLE ${1:table} (\n  ${2:id} INT NOT NULL PRIMARY KEY,\n  ${3:name} NVARCHAR(255) NOT NULL\n);'
  },
  {
    label: 'sp',
    detail: 'CREATE PROCEDURE',
    insertText: 'CREATE PROCEDURE ${1:procedure}\nAS\nBEGIN\n  SET NOCOUNT ON;\n  ${2}\nEND;'
  },
  {
    label: 'trycatch',
    detail: 'BEGIN TRY … END CATCH',
    insertText: 'BEGIN TRY\n  ${1}\nEND TRY\nBEGIN CATCH\n  PRINT ERROR_MESSAGE();\nEND CATCH;'
  }
] as const

export function LunarGripSqlEditor({
  selectedTable,
  activeDatabase,
  connection,
  demo,
  ResultView,
  MessagesView
}: {
  selectedTable: SchemaTable | null
  activeDatabase: string
  connection: LunarGripConnectionPayload | null
  demo: boolean
  ResultView: React.ComponentType<QueryResultViewProps>
  MessagesView: React.ComponentType<QueryResultViewProps>
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
  // Why: ids and names must stay unique; a monotonic counter never reuses a slot.
  const nextQueryIdRef = useRef(2)
  const activeQueryIdRef = useRef(activeQueryId)
  useEffect(() => {
    activeQueryIdRef.current = activeQueryId
  }, [activeQueryId])
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
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [resultTab, setResultTab] = useState<'results' | 'messages' | 'diagnostics'>('results')
  const runRef = useRef<(statement: string) => void>(() => undefined)

  const createQuery = useCallback((): void => {
    const ordinal = nextQueryIdRef.current
    nextQueryIdRef.current += 1
    const id = `query-${ordinal}`
    setQueries((current) => [
      ...current,
      { id, name: `Consulta ${ordinal}`, value: '', dirty: false }
    ])
    setActiveQueryId(id)
  }, [])

  // Why: Ctrl/Cmd+Shift+Q must work even when focus sits on the tab strip, not the editor.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) {
        return
      }
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) {
        return
      }
      if (event.key.toLowerCase() !== 'q') {
        return
      }
      event.preventDefault()
      createQuery()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [createQuery])

  const handleEditorMount: OnMount = (editor, monaco) => {
    completionDisposableRef.current?.dispose()
    completionDisposableRef.current = monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: [' ', '.', '(', '['],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        const keyword = (label: string) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: label,
          range
        })
        return {
          suggestions: [
            ...SQL_KEYWORDS.map(keyword),
            ...SQL_DATA_TYPES.map((label) => ({
              label,
              kind: monaco.languages.CompletionItemKind.TypeParameter,
              insertText: label,
              detail: 'Tipo de dato T-SQL',
              range
            })),
            ...SQL_FUNCTIONS.map((label) => ({
              label,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: label,
              detail: 'Función de sistema T-SQL',
              range
            })),
            ...SQL_SNIPPETS.map((snippet) => ({
              label: snippet.label,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: snippet.insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: snippet.detail,
              range
            })),
            ...['Usuarios', 'Proyectos', 'Tareas'].map((label) => ({
              label,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: label,
              detail: 'Tabla demo',
              range
            })),
            ...['id', 'nombre', 'created_at'].map((label) => ({
              label,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: label,
              detail: 'Columna demo',
              range
            }))
          ]
        }
      }
    })
    const runFromEditor = (): void => {
      const model = editor.getModel()
      const selection = editor.getSelection()
      const selectedText =
        model && selection && !selection.isEmpty() ? model.getValueInRange(selection) : ''
      runRef.current(selectedText || model?.getValue() || '')
    }
    editor.addAction({
      id: 'lunargrip.run-query',
      label: 'Ejecutar consulta',
      keybindings: [monaco.KeyCode.F5],
      run: runFromEditor
    })
    editor.addAction({
      id: 'lunargrip.run-selection',
      label: 'Ejecutar selección o consulta',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: runFromEditor
    })
    editor.addAction({
      id: 'lunargrip.show-completions',
      label: 'Mostrar sugerencias demo',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      run: () => editor.trigger('keyboard', 'editor.action.triggerSuggest', {})
    })
    editor.addAction({
      id: 'lunargrip.new-query',
      label: 'Nueva consulta',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyQ],
      run: () => createQuery()
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

  // Why: only a table selection regenerates SQL. Depending on activeQueryId here wiped the
  // newly opened tab on every switch, so the tab id is read through a ref instead.
  useEffect(() => {
    if (!selectedTable) {
      return
    }
    const targetId = activeQueryIdRef.current
    setQueries((current) =>
      current.map((query) =>
        query.id === targetId
          ? {
              ...query,
              value: `SELECT TOP 50 *\nFROM [${selectedTable.schema}].[${selectedTable.name}];`,
              dirty: true
            }
          : query
      )
    )
  }, [selectedTable])

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(sqlQuery)
    setCopied(true)
    toast.success('Script copiado al portapapeles')
    window.setTimeout(() => setCopied(false), 1500)
  }

  const runStatement = useCallback(
    async (statement: string): Promise<void> => {
      const trimmed = statement.trim()
      if (trimmed.length === 0) {
        toast.info('Escribí una consulta antes de ejecutar (F5).')
        return
      }
      if (!connection) {
        toast.info('Conectá un servidor para ejecutar consultas.')
        return
      }
      setRunning(true)
      try {
        const response = await window.api.lunarGrip.executeSql(connection, trimmed, activeDatabase)
        if (!('columns' in response)) {
          setResult({
            columns: [],
            rows: [],
            rowCount: 0,
            elapsedMs: 0,
            messages: [],
            error: response.error
          })
          setResultTab('messages')
          return
        }
        setResult(response)
        setResultTab(response.columns.length > 0 ? 'results' : 'messages')
      } catch (error: unknown) {
        toast.error('No se pudo ejecutar la consulta', {
          description: error instanceof Error ? error.message : 'Error desconocido'
        })
      } finally {
        setRunning(false)
      }
    },
    [activeDatabase, connection]
  )

  useEffect(() => {
    runRef.current = (statement: string) => {
      void runStatement(statement)
    }
  }, [runStatement])

  const handleTabChange = (value: string): void => {
    if (value === 'results' || value === 'messages' || value === 'diagnostics') {
      setResultTab(value)
    }
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
              onClick={createQuery}
              title="Nueva consulta (Ctrl/Cmd+Shift+Q)"
            >
              +
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {activeQuery.dirty ? 'Sin guardar' : 'Guardada'} ·{' '}
            {completionReady ? 'Autocompletado T-SQL' : 'Editor cargando'}
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
          <Button
            size="sm"
            onClick={() => {
              void runStatement(sqlQuery)
            }}
            disabled={running || !connection}
          >
            {running ? <Loader2 className="animate-spin" /> : <Play />}
            {running ? 'Ejecutando…' : 'Ejecutar'}
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-[220px] flex-1 flex-col border-b border-border/50">
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
            <Terminal className="size-3.5" />
            <span>SQL · T-SQL</span>
            <span className="ml-auto">F5 · Ctrl/Cmd+Enter con conexión real</span>
          </div>
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language="sql"
              theme="vs-dark"
              path={activeQuery.id}
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
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                snippetSuggestions: 'top',
                tabCompletion: 'on'
              }}
            />
          </div>
        </div>
        <div className="h-[220px] min-h-[170px]">
          <Tabs value={resultTab} onValueChange={handleTabChange} className="h-full">
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
              <ResultView result={result} running={running} demo={demo} />
            </TabsContent>
            <TabsContent value="messages" className="h-[calc(100%-2.25rem)]">
              <MessagesView result={result} running={running} demo={demo} />
            </TabsContent>
            <TabsContent value="diagnostics" className="h-[calc(100%-2.25rem)]">
              <div className="lunargrip-empty-card m-3 rounded-xl px-6 py-4 text-center text-xs text-muted-foreground">
                {demo
                  ? 'Diagnósticos demo: no hay análisis de servidor disponible.'
                  : 'No hay diagnósticos disponibles.'}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
