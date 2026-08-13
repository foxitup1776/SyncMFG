import { useState } from 'react'
import type { AppView } from '../components/AppShell'
import { TOOL_GUIDES } from '../guides/toolGuides'
import { PathwaysPage } from './PathwaysPage'

const PHASE_ORDER = [
  'define',
  'data',
  'measure',
  'analyze',
  'improve',
  'control',
] as const

const PHASE_TITLE: Record<(typeof PHASE_ORDER)[number], string> = {
  define: 'Define the problem',
  data: 'Get data in',
  measure: 'Measure / baseline',
  analyze: 'Analyze / prove',
  improve: 'Improve',
  control: 'Control',
}

export function ToolsPage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  const [showCatalog, setShowCatalog] = useState(false)

  return (
    <div className="tools-page">
      <PathwaysPage onNavigate={onNavigate} />

      <section className="panel soft catalog-toggle">
        <button
          type="button"
          className="btn secondary"
          onClick={() => setShowCatalog((v) => !v)}
          aria-expanded={showCatalog}
        >
          {showCatalog ? 'Hide tool catalog' : 'Browse tools by name'}
        </button>
        <p className="meta">
          Prefer methods above. The catalog lists every calculator if you already
          know the textbook name.
        </p>
      </section>

      {showCatalog ? (
        <section className="panel">
          <h2>Tool catalog</h2>
          <p className="lede">
            Everyday names first. Prefer{' '}
            <button
              type="button"
              className="linkish"
              onClick={() => onNavigate('solve')}
            >
              Solve
            </button>{' '}
            if you want suggestions from a problem statement.
          </p>

          {PHASE_ORDER.map((phase) => {
            const guides = TOOL_GUIDES.filter((g) => g.phase === phase)
            if (guides.length === 0) return null
            return (
              <div key={phase} className="tool-group">
                <h3 className="subhead">{PHASE_TITLE[phase]}</h3>
                <ul className="tool-cards">
                  {guides.map((g) => (
                    <li key={g.id}>
                      <div className="tool-head">
                        <h3>{g.plainName}</h3>
                      </div>
                      {g.alsoCalled ? (
                        <p className="guide-also">Also called: {g.alsoCalled}</p>
                      ) : null}
                      <p>
                        <strong>Problem:</strong> {g.problem}
                      </p>
                      <p>
                        <strong>Does:</strong> {g.does}
                      </p>
                      <button
                        type="button"
                        className="btn primary"
                        onClick={() => onNavigate(g.id)}
                      >
                        Open + how-to
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      ) : null}
    </div>
  )
}
