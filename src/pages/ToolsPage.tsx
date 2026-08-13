import type { AppView } from '../components/AppShell'
import { TOOL_GUIDES } from '../guides/toolGuides'

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
  return (
    <div className="tools-page">
      <section className="panel">
        <h2>Tools by question</h2>
        <p className="lede">
          Names are written as the problem they answer. Textbook names sit
          underneath. Prefer{' '}
          <button type="button" className="linkish" onClick={() => onNavigate('solve')}>
            Solve
          </button>{' '}
          if you want automatic suggestions from your problem statement.
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
    </div>
  )
}
