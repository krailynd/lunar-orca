/* oxlint-disable react-doctor/no-adjust-state-on-prop-change -- Why: selection annotations are synchronized from Monaco editor selection and layout APIs, not derived React props. */
import React, { useRef, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import type { MarkdownDocument } from '../../../../shared/filesystem-entry-types'
import { useAppStore } from '@/store'
import '@/lib/monaco-setup'
import { computeEditorFontSize, resolveEditorFontFamily } from '@/lib/editor-font-zoom'

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

const ZED_DEEP_CARBON_THEME_NAME = 'orca-zed-deep-carbon'
let zedDeepCarbonThemeRegistered = false

// Why: one registration per renderer; @monaco-editor/react calls this on every mount.
function registerZedDeepCarbonTheme(monaco: Monaco): void {
  if (zedDeepCarbonThemeRegistered) {
    return
  }
  zedDeepCarbonThemeRegistered = true
  monaco.editor.defineTheme(ZED_DEEP_CARBON_THEME_NAME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'fb4934' },
      { token: 'string', foreground: 'b8bb26' },
      { token: 'number', foreground: 'd3869b' },
      { token: 'type', foreground: 'fabd2f' },
      { token: 'type.identifier', foreground: 'fabd2f' },
      { token: 'function', foreground: '8ec07c' },
      { token: 'variable', foreground: 'd5d8da' }
    ],
    colors: {
      'editor.background': '#18191c',
      'editor.foreground': '#d5d8da',
      'editorLineNumber.foreground': '#504945',
      'editorLineNumber.activeForeground': '#b8bb26',
      'editorCursor.foreground': '#b8bb26',
      'editor.selectionBackground': '#3c4043',
      'editor.inactiveSelectionBackground': '#2a2d30',
      'editor.lineHighlightBackground': '#1c1f20eb',
      'editor.lineHighlightBorder': '#282c2de0',
      'editorGutter.background': '#18191c',
      'editorIndentGuide.background1': '#282c2d',
      'editorIndentGuide.activeBackground1': '#504945',
      'editorWidget.background': '#1c1f20',
      'editorWidget.border': '#282c2d',
      'editorSuggestWidget.background': '#1c1f20',
      'editorHoverWidget.background': '#1c1f20',
      'editorBracketMatch.background': '#3c404366',
      'editorBracketMatch.border': '#b8bb26',
      'scrollbarSlider.background': '#50494533',
      'scrollbarSlider.hoverBackground': '#50494566',
      'scrollbarSlider.activeBackground': '#50494599'
    }
  })
}
import { useMonacoContentSyncBridge } from './use-monaco-content-sync-bridge'
import { useMonacoMarkdownAnnotations } from './use-monaco-markdown-annotations'
import { useMonacoEditorDecorations } from './use-monaco-editor-decorations'
import { useMonacoEditorMount } from './use-monaco-editor-mount'
import { useDocumentDarkTheme } from '@/hooks/use-document-dark-theme'
import { snapshotMonacoViewState } from './monaco-view-state-persistence'
import { MonacoMarkdownAnnotationOverlay } from './MonacoMarkdownAnnotationOverlay'

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
  language,
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
  liveTail = false,
  autoHeight = false
}: MonacoEditorProps): React.JSX.Element {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const [mountedEditor, setMountedEditor] = useState<editor.IStandaloneCodeEditor | null>(null)
  const [autoHeightContentHeight, setAutoHeightContentHeight] = useState<number | null>(null)
  const languageRef = useRef(language)
  languageRef.current = language
  const unregisterFileSearchSelectionRef = useRef<(() => void) | null>(null)
  const { setupCopy, toastNode } = useContextualCopySetup()
  // Why: hold the throttle timer in a ref so unmount cleanup can cancel a pending write before snapshotting the final scroll position.
  const scrollThrottleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const propsRef = useRef({ relativePath, language, onSave, onContentChange })
  // Why: assign during render so the ref is current before any handler reads it (a useEffect would leave a one-render stale window).
  propsRef.current = { relativePath, language, onSave, onContentChange }
  const readOnlyRef = useRef(readOnly)
  readOnlyRef.current = readOnly
  const contentSyncModeRef = useRef<MonacoContentSyncMode>('undoable')
  contentSyncModeRef.current = readOnly && liveTail ? 'read-only-live-tail' : 'undoable'

  const settings = useAppStore((s) => s.settings)
  const editorFontZoomLevel = useAppStore((s) => s.editorFontZoomLevel)
  const setPendingEditorReveal = useAppStore((s) => s.setPendingEditorReveal)
  const setEditorCursorLine = useAppStore((s) => s.setEditorCursorLine)
  const editorFontSize = computeEditorFontSize(
    settings?.terminalFontSize ?? 13,
    editorFontZoomLevel
  )
  const editorFontFamily = resolveEditorFontFamily(settings)
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
  const estimatedAutoHeight = useMemo(() => {
    if (!autoHeight) {
      return null
    }
    return getMonacoAutoHeightForContent(content, Math.ceil(editorFontSize * 1.45))
  }, [autoHeight, content, editorFontSize])
  const renderedEditorHeight = autoHeight
    ? (autoHeightContentHeight ?? estimatedAutoHeight ?? 80)
    : null
  const autoHeightLineHeight = Math.ceil(editorFontSize * 1.45)
  const autoHeightUsesInternalScroll =
    autoHeight && isMonacoAutoHeightCapped(renderedEditorHeight, autoHeightLineHeight)
  // Why: @monaco-editor/react skips its value→model sync on the first post-remount render, so retained models need an explicit sync or they show stale text.
  // Invariant: the mount path must read `contentRef.current` (guaranteed latest), never `lastSyncedContentRef.current` (may be stale pre-mount).
  const contentRef = useRef(content)
  contentRef.current = content
  // Gutter context menu state
  const [gutterMenuOpen, setGutterMenuOpen] = useState(false)
  const [gutterMenuPoint, setGutterMenuPoint] = useState({ x: 0, y: 0 })
  const [gutterMenuLine, setGutterMenuLine] = useState(1)
  const isDark = useDocumentDarkTheme()

  const { queueReveal, cancelScheduledReveal, clearTransientRevealHighlight } =
    useMonacoRevealScheduler()
  const contentSync = useMonacoContentSyncBridge({
    editorRef,
    content,
    contentRef,
    contentSyncModeRef,
    modelKey: modelUri,
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

  // Why useLayoutEffect: cleanup runs before @monaco-editor/react disposes the editor, so getScrollTop() still reads valid state on unmount.
  useLayoutEffect(() => {
    return () => {
      // Why: cancel the pending throttled write so it can't fire after this snapshot and overwrite the final position with a stale value.
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

  // Update editor options when settings change
  useEffect(() => {
    if (!editorRef.current) {
      return
    }
    editorRef.current.updateOptions({
      fontSize: editorFontSize,
      fontFamily: editorFontFamily,
      ...buildFileEditorWordWrapOptions(editorWordWrap),
      // Keep a retained Monaco instance aligned when a tab changes between
      // a read-only surface and a normal editable file.
      readOnly
    })
  }, [editorFontFamily, editorFontSize, editorWordWrap, readOnly])

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
    gutterMenu: { setGutterMenuOpen, setGutterMenuPoint, setGutterMenuLine }
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
    queueReveal(editorRef.current, revealLine, revealColumn ?? 1, revealMatchLength ?? 0, () => {
      // Why: clear the pending payload only after the queued reveal runs, so navigation isn't lost if the editor unmounts first.
      setPendingEditorReveal(null)
    })
  }, [queueReveal, revealLine, revealColumn, revealMatchLength, setPendingEditorReveal])

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
        // Why: defaultValue, not controlled value — Orca owns post-mount content sync; a controlled path would double setValue.
        defaultValue={content}
        theme={isDark ? ZED_DEEP_CARBON_THEME_NAME : 'vs'}
        beforeMount={registerZedDeepCarbonTheme}
        onChange={contentSync.handleChange}
        onMount={handleMount}
        options={{
          dropIntoEditor: { enabled: false },
          // `IGlobalEditorOptions`, not per-editor: setting it here pins it for every
          // Monaco surface (diff, Peek) too, so this is the only site that needs it.
          // Defense-in-depth only — it does NOT guard the Monarch embed recursion,
          // which overflowed at ~17_000 chars, under this cap. See the budget module.
          maxTokenizationLineLength: MAX_TOKENIZATION_LINE_LENGTH,
          // Why: only the file editor honors this; Monaco 0.55 DiffEditor hard-overrides minimap.enabled=false on sub-editors (see diffEditorEditors._adjustOptionsForSubEditor).
          minimap: { enabled: settings?.editorMinimapEnabled ?? false },
          scrollBeyondLastLine: false,
          ...buildFileEditorWordWrapOptions(editorWordWrap),
          fontSize: editorFontSize,
          fontFamily: editorFontFamily,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          automaticLayout: true,
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
          // Why: Monaco owns its rendered line surface, so align its selection-clipboard with the app opt-out (the global DOM hook can't).
          selectionClipboard: settings?.primarySelectionMiddleClickPaste ?? isLinuxUserAgent(),
          // Intelligent Code Suggestions & Auto-Complete (Blink.cmp / Zed style)
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true
          },
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
        // Why the helper: `@monaco-editor/react` calls `Uri.parse` on this, which mis-reads a Windows drive path as its own scheme.
        path={modelUri}
        // Why: Orca owns cursor/scroll restoration, so disable @monaco-editor/react's competing view-state Map.
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
        filePath={filePath}
        relativePath={relativePath}
      />
    </div>
  )
}
