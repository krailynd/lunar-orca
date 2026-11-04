/* oxlint-disable max-lines, react-doctor/no-adjust-state-on-prop-change -- Why: selection annotations and vim integration are synchronized from Monaco layout APIs. */
import React, { useRef, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import type { editor, IRange } from 'monaco-editor'
import type { MarkdownDocument } from '../../../../shared/filesystem-entry-types'
import { useAppStore } from '@/store'
import '@/lib/monaco-setup'
import { monacoTypographyOptions } from '@/lib/editor-typography'
import { useEditorTypography } from '@/hooks/use-editor-typography'

import { useContextualCopySetup } from './useContextualCopySetup'
import {
  attachVimModeToMonaco,
  type VimAdapter,
  type VimModeStatus
} from '@/lib/monaco-vim-adapter'
import { MonacoGutterContextMenu } from './MonacoGutterContextMenu'
import { isLinuxUserAgent } from '../terminal-pane/pane-helpers'
import { MAX_TOKENIZATION_LINE_LENGTH } from '@/lib/monaco-languages/monarch-embed-entry-budget'
import { buildFileEditorWordWrapOptions } from './file-editor-word-wrap-options'
import { toEditorModelUri } from './editor-model-uri'
import { getEditorModelOwnerKey } from './editor-model-owner'
import { getMonacoAutoHeightForContent, isMonacoAutoHeightCapped } from './monaco-auto-height'
import { monacoFindOptions } from './monaco-find-options'
import { useMonacoRevealScheduler } from './use-monaco-reveal-scheduler'
import type { MonacoContentSyncMode } from './monaco-content-sync'

import { useMonacoContentSyncBridge } from './use-monaco-content-sync-bridge'
import { useMonacoMarkdownAnnotations } from './use-monaco-markdown-annotations'
import { useMonacoEditorDecorations } from './use-monaco-editor-decorations'
import { useMonacoEditorMount } from './use-monaco-editor-mount'
import { snapshotMonacoViewState } from './monaco-view-state-persistence'
import { MonacoMarkdownAnnotationOverlay } from './MonacoMarkdownAnnotationOverlay'
import { usePluginSyntaxLanguage } from './use-plugin-syntax-language'
import {
  PLUGIN_SYNTAX_EDITOR_OPTIONS,
  applyModelLanguage
} from '@/lib/monaco-languages/plugin-syntax-editor-options'
import { useMonacoTheme } from '@/hooks/use-monaco-theme'
import { useEditorModelRekeyCarry } from './editor-model-rekey-carry'

type MonacoEditorProps = {
  fileId: string
  filePath: string
  viewStateKey: string
  // Why: identifies the pane for explicit open focus handoffs; omit on surfaces that never receive one.
  viewStateId?: string
  relativePath: string
  content: string
  language: string
  onContentChange: (content: string) => void
  onSave: (content: string) => void
  revealLine?: number
  revealColumn?: number
  revealMatchLength?: number
  markdownDocuments?: MarkdownDocument[]
  worktreeId?: string
  markdownAnnotationsEnabled?: boolean
  conflictDecorationsEnabled?: boolean
  readOnly?: boolean
  // Why: shows another tab's record read-only; never moves its cursor line or takes its reveals.
  passiveMirror?: boolean
  liveTail?: boolean
  autoHeight?: boolean
}

export default function MonacoEditor({
  fileId,
  filePath,
  viewStateKey,
  viewStateId,
  relativePath,
  content,
  language: coreLanguage,
  onContentChange,
  onSave,
  revealLine,
  revealColumn,
  revealMatchLength,
  markdownDocuments,
  worktreeId,
  markdownAnnotationsEnabled = false,
  conflictDecorationsEnabled = false,
  readOnly = false,
  passiveMirror = false,
  liveTail = false,
  autoHeight = false
}: MonacoEditorProps): React.JSX.Element {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const [mountedEditor, setMountedEditor] = useState<editor.IStandaloneCodeEditor | null>(null)
  const [autoHeightContentHeight, setAutoHeightContentHeight] = useState<number | null>(null)
  const language = usePluginSyntaxLanguage(filePath, coreLanguage)
  const languageRef = useRef(language)
  languageRef.current = language
  useEffect(
    () => applyModelLanguage([mountedEditor?.getModel()], language),
    [mountedEditor, language]
  )
  const unregisterFileSearchSelectionRef = useRef<(() => void) | null>(null)
  const { setupCopy, toastNode } = useContextualCopySetup()
  // Cancel pending throttled writes before snapshotting final scroll on unmount.
  const scrollThrottleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const propsRef = useRef({ relativePath, language, onSave, onContentChange })
  // Refresh during render so event handlers cannot read one-render-stale props.
  propsRef.current = { relativePath, language, onSave, onContentChange }
  const readOnlyRef = useRef(readOnly)
  readOnlyRef.current = readOnly
  const contentSyncModeRef = useRef<MonacoContentSyncMode>('undoable')
  contentSyncModeRef.current = readOnly && liveTail ? 'read-only-live-tail' : 'undoable'

  const settings = useAppStore((s) => s.settings)
  const setPendingEditorReveal = useAppStore((s) => s.setPendingEditorReveal)
  const setEditorCursorLine = useAppStore((s) => s.setEditorCursorLine)
  const typography = useEditorTypography()
  const typographyOptions = useMemo(() => monacoTypographyOptions(typography), [typography])
  // Mirrors Monaco's automatic spacing closely enough to size before mount.
  const autoHeightLineHeight = typography.lineHeight || Math.ceil(typography.fontSize * 1.45)
  const editorWordWrap = settings?.editorWordWrap
  const modelOwnerKey = useAppStore((state) => {
    const file = state.openFiles?.find((entry) => entry.id === fileId)
    return file
      ? getEditorModelOwnerKey(file, state)
      : JSON.stringify([null, `unresolved:${fileId}`])
  })
  const modelUri = useMemo(
    () => toEditorModelUri(filePath, modelOwnerKey),
    [filePath, modelOwnerKey]
  )
  useEditorModelRekeyCarry(fileId, modelUri)
  const estimatedAutoHeight = useMemo(() => {
    if (!autoHeight) {
      return null
    }
    return getMonacoAutoHeightForContent(content, autoHeightLineHeight)
  }, [autoHeight, content, autoHeightLineHeight])
  const renderedEditorHeight = autoHeight
    ? (autoHeightContentHeight ?? estimatedAutoHeight ?? 80)
    : null
  const autoHeightUsesInternalScroll =
    autoHeight && isMonacoAutoHeightCapped(renderedEditorHeight, autoHeightLineHeight)
  // The React wrapper skips first post-remount value sync; reconcile retained models from live contentRef, never the possibly stale lastSyncedContentRef.
  const contentRef = useRef(content)
  contentRef.current = content
  const [gutterMenuOpen, setGutterMenuOpen] = useState(false)
  const [gutterMenuPoint, setGutterMenuPoint] = useState({ x: 0, y: 0 })
  const [gutterMenuLine, setGutterMenuLine] = useState(1)
  const [gutterMenuSelection, setGutterMenuSelection] = useState<IRange | null>(null)
  const monacoTheme = useMonacoTheme()

  const { queueReveal, cancelScheduledReveal, clearTransientRevealHighlight } =
    useMonacoRevealScheduler()
  const contentSync = useMonacoContentSyncBridge({
    editorRef,
    mountedEditor,
    content,
    contentRef,
    contentSyncModeRef,
    modelKey: modelUri,
    fileId,
    onContentChange
  })
  const annotations = useMonacoMarkdownAnnotations({
    mountedEditor,
    editorContainerRef,
    relativePath,
    content,
    language,
    worktreeId,
    markdownAnnotationsEnabled
  })

  // Layout cleanup precedes the wrapper’s editor disposal, keeping final scroll readable.
  useLayoutEffect(() => {
    return () => {
      // Cancel throttled writes so stale positions cannot overwrite the final snapshot.
      if (scrollThrottleTimerRef.current !== null) {
        clearTimeout(scrollThrottleTimerRef.current)
        scrollThrottleTimerRef.current = null
      }
      snapshotMonacoViewState(editorRef, viewStateKey)
      cancelScheduledReveal()
      clearTransientRevealHighlight()
      unregisterFileSearchSelectionRef.current?.()
      unregisterFileSearchSelectionRef.current = null
    }
  }, [cancelScheduledReveal, clearTransientRevealHighlight, modelUri, viewStateKey])

  useEffect(() => {
    if (!editorRef.current) {
      return
    }
    editorRef.current.updateOptions({
      ...typographyOptions,
      ...buildFileEditorWordWrapOptions(editorWordWrap),
      readOnly
    })
  }, [typographyOptions, editorWordWrap, readOnly])

  const decorations = useMonacoEditorDecorations({
    editorRef,
    mountedEditor,
    content,
    language,
    markdownDocuments,
    conflictDecorationsEnabled
  })

  const handleMount = useMonacoEditorMount({
    fileId,
    filePath,
    modelOwnerKey,
    viewStateKey,
    viewStateId,
    passiveMirror,
    worktreeId,
    autoHeight,
    autoHeightLineHeight,
    editorRef,
    editorContainerRef,
    languageRef,
    propsRef,
    readOnlyRef,
    scrollThrottleTimerRef,
    unregisterFileSearchSelectionRef,
    setMountedEditor,
    setAutoHeightContentHeight,
    setEditorCursorLine,
    setupCopy,
    queueReveal,
    contentSync,
    decorations,
    annotations,
    gutterMenu: {
      setGutterMenuOpen,
      setGutterMenuPoint,
      setGutterMenuLine,
      setGutterMenuSelection
    }
  })

  const [vimStatus, setVimStatus] = useState<VimModeStatus | null>(null)
  const vimAdapterRef = useRef<VimAdapter | null>(null)

  // Attach / Detach Vim Mode
  useEffect(() => {
    if (!mountedEditor) {
      return
    }

    vimAdapterRef.current?.dispose()
    vimAdapterRef.current = attachVimModeToMonaco(mountedEditor, (status) => {
      setVimStatus(status)
    })

    return () => {
      vimAdapterRef.current?.dispose()
      vimAdapterRef.current = null
    }
  }, [mountedEditor])
  useEffect(() => {
    if (!revealLine || !editorRef.current) {
      return
    }
    const reveal = useAppStore.getState().pendingEditorReveal
    if (reveal?.viewStateId && (reveal.fileId !== fileId || reveal.viewStateId !== viewStateId)) {
      return
    }
    queueReveal(
      editorRef.current,
      revealLine,
      revealColumn ?? 1,
      revealMatchLength ?? 0,
      () => {
        reveal?.onApplied?.()
        // Why: a newer request may arrive during the editor-owned reveal frames.
        if (useAppStore.getState().pendingEditorReveal === reveal) {
          setPendingEditorReveal(null)
        }
      },
      reveal?.canApply
        ? () =>
            useAppStore.getState().pendingEditorReveal === reveal && reveal.canApply?.() !== false
        : undefined
    )
  }, [
    queueReveal,
    revealLine,
    revealColumn,
    revealMatchLength,
    setPendingEditorReveal,
    fileId,
    viewStateId
  ])

  return (
    <div
      ref={editorContainerRef}
      className={autoHeight ? 'relative' : 'relative h-full'}
      style={renderedEditorHeight === null ? undefined : { height: renderedEditorHeight }}
    >
      <MonacoMarkdownAnnotationOverlay
        shouldShowMarkdownAnnotations={annotations.shouldShowMarkdownAnnotations}
        commentPopover={annotations.commentPopover}
        setCommentPopover={annotations.setCommentPopover}
        selectionAnnotationTarget={annotations.selectionAnnotationTarget}
        setSelectionAnnotationTarget={annotations.setSelectionAnnotationTarget}
        onSubmitMarkdownComment={annotations.handleSubmitMarkdownComment}
      />
      <Editor
        key={modelUri}
        height={renderedEditorHeight === null ? '100%' : `${renderedEditorHeight}px`}
        language={language}
        // Use defaultValue because Orca owns later content sync; controlled values would duplicate setValue.
        defaultValue={content}
        theme={monacoTheme}
        onMount={handleMount}
        options={{
          dropIntoEditor: { enabled: false },
          // This global option also affects diff and Peek; it is defense in depth, not protection from Monarch embedding recursion below the cap.
          maxTokenizationLineLength: MAX_TOKENIZATION_LINE_LENGTH,
          // Monaco 0.55 forcibly disables diff sub-editor minimaps; only file editors honor this setting.
          minimap: { enabled: settings?.editorMinimapEnabled ?? false },
          scrollBeyondLastLine: false,
          ...PLUGIN_SYNTAX_EDITOR_OPTIONS,
          ...buildFileEditorWordWrapOptions(editorWordWrap),
          ...typographyOptions,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          automaticLayout: true,
          unicodeHighlight: {
            ambiguousCharacters: language !== 'markdown',
            invisibleCharacters: true
          },
          tabSize: 2,
          readOnly,
          scrollbar: autoHeight
            ? {
                vertical: autoHeightUsesInternalScroll ? 'auto' : 'hidden',
                handleMouseWheel: autoHeightUsesInternalScroll
              }
            : undefined,
          smoothScrolling: true,
          // Why: Zed/Neovide-style caret — smooth glide plus a soft blink.
          cursorSmoothCaretAnimation: 'on',
          cursorBlinking: 'smooth',
          padding: { top: 0 },
          find: monacoFindOptions,
          // Monaco owns rendered lines, so its selection clipboard must enforce the app opt-out independently of the global DOM hook.
          selectionClipboard: settings?.primarySelectionMiddleClickPaste ?? isLinuxUserAgent(),
          // Intelligent Code Suggestions & Auto-Complete (Blink.cmp / Zed style)
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'smart',
          tabCompletion: 'on',
          wordBasedSuggestions: 'allDocuments',
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showWords: true,
            preview: true,
            showClasses: true,
            showFunctions: true,
            showVariables: true,
            showConstants: true
          }
        }}
        // Build a model URI because the React wrapper’s Uri.parse treats Windows drive letters as schemes.
        path={modelUri}
        // Orca owns cursor/scroll restoration; disable the wrapper’s competing view-state map.
        saveViewState={false}
        keepCurrentModel
      />

      {/* Neovim / Vim Mode Floating Status Indicator */}
      {vimStatus && (
        <div className="absolute bottom-2 right-4 z-20 flex items-center gap-2 rounded-md border border-[#282c2de0] bg-[#1c1f20eb] px-2.5 py-1 text-[11px] font-mono shadow-md backdrop-blur-sm select-none pointer-events-none">
          <span
            className={`font-bold tracking-wider ${
              vimStatus.mode === 'INSERT'
                ? 'text-[#fabd2f]'
                : vimStatus.mode.startsWith('VISUAL')
                  ? 'text-[#d3869b]'
                  : 'text-[#b8bb26]'
            }`}
          >
            -- {vimStatus.mode} --
          </span>
          {vimStatus.subMode && vimStatus.subMode !== `-- ${vimStatus.mode} --` && (
            <span className="text-muted-foreground text-[10px]">{vimStatus.subMode}</span>
          )}
        </div>
      )}

      {toastNode}
      <MonacoGutterContextMenu
        open={gutterMenuOpen}
        onOpenChange={setGutterMenuOpen}
        point={gutterMenuPoint}
        line={gutterMenuLine}
        selection={gutterMenuSelection}
        fileId={fileId}
        filePath={filePath}
        relativePath={relativePath}
        worktreeId={worktreeId}
      />
    </div>
  )
}
