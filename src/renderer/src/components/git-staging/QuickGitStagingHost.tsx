import { lazy, Suspense } from 'react'

const QuickGitStagingModal = lazy(() => import('./QuickGitStagingModal'))

export function QuickGitStagingHost(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <QuickGitStagingModal />
    </Suspense>
  )
}
