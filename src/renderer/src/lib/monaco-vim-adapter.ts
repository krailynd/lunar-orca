import type * as monaco from 'monaco-editor'
import { initVimMode as initMonacoVimMode } from 'monaco-vim'

export type VimModeStatus = {
  mode: 'NORMAL' | 'INSERT' | 'VISUAL' | 'VISUAL BLOCK' | 'REPLACE'
  subMode?: string
}

export type VimAdapter = {
  dispose: () => void
}

/**
 * Initializes Vim mode on a Monaco editor instance, binding to an HTML status element
 * or updating a callback with the current Vim mode status (NORMAL / INSERT / VISUAL / etc.).
 */
export function attachVimModeToMonaco(
  editorInstance: monaco.editor.IStandaloneCodeEditor,
  statusElementOrCb?: HTMLElement | ((status: VimModeStatus) => void)
): VimAdapter {
  let statusNode: HTMLElement | null = null
  let callback: ((status: VimModeStatus) => void) | null = null

  if (typeof statusElementOrCb === 'function') {
    callback = statusElementOrCb
    statusNode = document.createElement('div')
    statusNode.style.display = 'none'
    document.body.appendChild(statusNode)
  } else if (statusElementOrCb instanceof HTMLElement) {
    statusNode = statusElementOrCb
  }

  // initVimMode binds Monaco and dispatches change events to the status node
  const vimMode = initMonacoVimMode(editorInstance, statusNode)

  let observer: MutationObserver | null = null
  if (statusNode && callback) {
    observer = new MutationObserver(() => {
      const text = statusNode?.textContent?.trim() || ''
      let mode: VimModeStatus['mode'] = 'NORMAL'
      if (text.includes('-- INSERT --')) {
        mode = 'INSERT'
      } else if (text.includes('-- VISUAL BLOCK --')) {
        mode = 'VISUAL BLOCK'
      } else if (text.includes('-- VISUAL --')) {
        mode = 'VISUAL'
      } else if (text.includes('-- REPLACE --')) {
        mode = 'REPLACE'
      } else {
        mode = 'NORMAL'
      }
      callback?.({ mode, subMode: text })
    })

    observer.observe(statusNode, { childList: true, characterData: true, subtree: true })
    // Emit initial
    callback({ mode: 'NORMAL', subMode: '' })
  }

  return {
    dispose: () => {
      observer?.disconnect()
      if (statusNode && typeof statusElementOrCb === 'function') {
        statusNode.remove()
      }
      try {
        vimMode?.dispose()
      } catch {
        // ignore safe disposal errors
      }
    }
  }
}
