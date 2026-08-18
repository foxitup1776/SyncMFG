import { useState } from 'react'
import type { AppView } from '../components/AppShell'
import { ToolVenn } from '../components/ToolVenn'
import type { FlowState } from '../guides/toolMap'
import { PathwaysPage } from './PathwaysPage'

export function ToolsPage({
  onNavigate,
  current,
}: {
  onNavigate: (v: AppView, flow?: FlowState) => void
  current?: AppView
}) {
  const [showWalkthroughs, setShowWalkthroughs] = useState(false)

  return (
    <div className="tools-page">
      <ToolVenn
        current={current}
        onOpen={(view, nextFlow) => onNavigate(view, nextFlow)}
      />

      <section className="catalog-toggle">
        <button
          type="button"
          className="btn ghost"
          onClick={() => setShowWalkthroughs((v) => !v)}
          aria-expanded={showWalkthroughs}
        >
          {showWalkthroughs
            ? 'Hide guided walkthroughs'
            : 'Need a step-by-step walkthrough?'}
        </button>
      </section>

      {showWalkthroughs ? <PathwaysPage onNavigate={onNavigate} /> : null}
    </div>
  )
}
