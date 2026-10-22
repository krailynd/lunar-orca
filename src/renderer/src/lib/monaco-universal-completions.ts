import type * as monaco from 'monaco-editor'

export type CodeSnippet = {
  label: string
  insertText: string
  detail: string
  documentation: string
}

const JAVA_SNIPPETS: CodeSnippet[] = [
  {
    label: 'psvm',
    insertText: 'public static void main(String[] args) {\n\t$0\n}',
    detail: 'IntelliJ / NetBeans: public static void main',
    documentation: 'Genera el método de entrada principal: public static void main(String[] args)'
  },
  {
    label: 'main',
    insertText: 'public static void main(String[] args) {\n\t$0\n}',
    detail: 'Main method',
    documentation: 'Genera el método principal main'
  },
  {
    label: 'sout',
    insertText: 'System.out.println($0);',
    detail: 'System.out.println(...)',
    documentation: 'Imprime en la salida estándar consola'
  },
  {
    label: 'soutv',
    insertText: 'System.out.println("${1:var} = " + ${1:var});',
    detail: 'System.out.println("var = " + var)',
    documentation: 'Imprime el nombre y valor de una variable'
  },
  {
    label: 'serr',
    insertText: 'System.err.println($0);',
    detail: 'System.err.println(...)',
    documentation: 'Imprime en la salida de error estándar'
  },
  {
    label: 'ifn',
    insertText: 'if (${1:var} == null) {\n\t$0\n}',
    detail: 'if null check',
    documentation: 'Condicional if (var == null)'
  },
  {
    label: 'inn',
    insertText: 'if (${1:var} != null) {\n\t$0\n}',
    detail: 'if not null check',
    documentation: 'Condicional if (var != null)'
  },
  {
    label: 'trycatch',
    insertText: 'try {\n\t$1\n} catch (${2:Exception} ${3:e}) {\n\t${3:e}.printStackTrace();\n}',
    detail: 'try / catch block',
    documentation: 'Bloque de captura y manejo de excepciones'
  },
  {
    label: 'fori',
    insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:max}; ${1:i}++) {\n\t$0\n}',
    detail: 'for index loop',
    documentation: 'Bucle for indexado tradicional'
  },
  {
    label: 'iter',
    insertText: 'for (${1:Object} ${2:item} : ${3:collection}) {\n\t$0\n}',
    detail: 'foreach loop',
    documentation: 'Bucle for-each mejorado'
  }
]

let universalCompletionRegistered = false

/**
 * Registers rich code completions and Live Templates (IntelliJ / NetBeans style)
 * for Java and other languages in Monaco Editor.
 */
export function registerUniversalCompletions(monacoInstance: typeof monaco): void {
  if (universalCompletionRegistered) {
    return
  }
  universalCompletionRegistered = true

  // Java snippets provider
  monacoInstance.languages.registerCompletionItemProvider('java', {
    triggerCharacters: ['.', ' ', 'p', 's', 'i', 't', 'f'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions: monaco.languages.CompletionItem[] = JAVA_SNIPPETS.map((snippet) => ({
        label: snippet.label,
        kind: monacoInstance.languages.CompletionItemKind.Snippet,
        documentation: { value: snippet.documentation },
        detail: snippet.detail,
        insertText: snippet.insertText,
        insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        sortText: `0_${snippet.label}`
      }))

      return { suggestions }
    }
  })
}
