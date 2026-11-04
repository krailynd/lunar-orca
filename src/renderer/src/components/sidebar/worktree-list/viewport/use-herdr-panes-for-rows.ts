import { useMemo, useCallback } from 'react'
import type { HerdrPaneInfo } from '../../../../../../shared/herdr-types'
import { useHerdrSessions } from '@/lib/useHerdrSessions'
import type { RenderRow } from '../listing/render-row'

export function useHerdrPanesForRows(renderRows: RenderRow[]): {
  herdrPanesByWorktree: ReadonlyMap<string, HerdrPaneInfo[]>
  handleHerdrPaneClick: (pane: HerdrPaneInfo) => void
} {
  const { sessions, focusPane } = useHerdrSessions()

  const herdrPanesByWorktree = useMemo(() => {
    const map = new Map<string, HerdrPaneInfo[]>()
    const allPanes = sessions.flatMap((s) => s.panes)
    if (!allPanes.length) {
      return map
    }

    for (const row of renderRows) {
      if (row.type === 'item') {
        const wt = row.worktree
        const wtPath = wt.path.toLowerCase().replace(/\\/g, '/').replace(/\/$/, '')

        const matched = allPanes.filter((pane) => {
          // 1. Coincidencia estricta por slug de sesión de Pi (--home-user-project--)
          if (pane.session_path) {
            const sess = pane.session_path.toLowerCase()
            const slug = wtPath.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]/gi, '-')
            if (sess.includes(`--${slug}--`)) {
              return true
            }
          }

          // 2. Coincidencia estricta por CWD (debe ser el worktree o un subdirectorio interno, NUNCA el padre)
          const pCwd = (pane.foreground_cwd || pane.cwd || '')
            .toLowerCase()
            .replace(/\\/g, '/')
            .replace(/\/$/, '')
          if (pCwd && (pCwd === wtPath || pCwd.startsWith(`${wtPath}/`))) {
            return true
          }

          return false
        })

        if (matched.length > 0) {
          map.set(wt.id, matched)
        }
      }
    }
    return map
  }, [sessions, renderRows])

  const handleHerdrPaneClick = useCallback(
    (pane: HerdrPaneInfo) => {
      const session = sessions.find((s) => s.panes.some((p) => p.pane_id === pane.pane_id))
      if (session) {
        void focusPane(session.sessionName, pane.pane_id)
      }
    },
    [sessions, focusPane]
  )

  return {
    herdrPanesByWorktree,
    handleHerdrPaneClick
  }
}
