import { useEffect, useMemo, useRef } from 'react'
import type { AppView } from '../components/AppShell'
import { PATHWAYS, getPathway } from '../guides/pathways'
import { usePersistedState } from '../hooks/usePersistedState'

export function PathwaysPage({
  onNavigate,
  initialPathwayId,
}: {
  onNavigate: (v: AppView) => void
  initialPathwayId?: string
}) {
  const [selectedId, setSelectedId] = usePersistedState(
    'pathways.selected',
    initialPathwayId ?? '',
  )
  const detailRef = useRef<HTMLElement | null>(null)
  const selected = useMemo(
    () => (selectedId ? getPathway(selectedId) : undefined),
    [selectedId],
  )

  useEffect(() => {
    if (!selectedId || !detailRef.current) return
    detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedId])

  return (
    <div className="pathways-page">
      <section className="panel">
        <h2>Choose a method</h2>
        <p className="lede">
          Don’t start from a jargon menu. Pick the job on the floor — we’ll walk
          through what it means, quote the teaching notes, show an example, then
          open the right tools.
        </p>
      </section>

      <div className="pathway-grid">
        {PATHWAYS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              selectedId === p.id ? 'pathway-tile selected' : 'pathway-tile'
            }
            onClick={() => setSelectedId(p.id)}
          >
            <span className="pathway-short">{p.shortLabel}</span>
            <strong>{p.title}</strong>
            <span className="pathway-sub">{p.subtitle}</span>
          </button>
        ))}
      </div>

      {selected ? (
        <section ref={detailRef} className="panel pathway-detail">
          <p className="guide-kicker">Method walkthrough</p>
          <h2>{selected.title}</h2>
          <p className="hero-copy">{selected.floorQuestion}</p>
          <p className="lede">{selected.whyItMatters}</p>

          <h3 className="subhead">From your teaching notes</h3>
          <ul className="quote-list">
            {selected.quotes.map((q) => (
              <li key={q.text}>
                <blockquote>“{q.text}”</blockquote>
                <cite>{q.source}</cite>
              </li>
            ))}
          </ul>

          <h3 className="subhead">Floor example</h3>
          <div className="example-card">
            <strong>{selected.example.title}</strong>
            <p>{selected.example.story}</p>
          </div>

          <h3 className="subhead">Do it in SYNCMFG</h3>
          <ol className="pathway-steps">
            {selected.steps.map((step, i) => (
              <li key={step.title}>
                <div>
                  <strong>
                    Step {i + 1}: {step.title}
                  </strong>
                  <p>{step.detail}</p>
                  {step.doneWhen ? (
                    <p className="meta done-when">{step.doneWhen}</p>
                  ) : null}
                </div>
                {step.toolId ? (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => onNavigate(step.toolId!)}
                  >
                    Open tool
                  </button>
                ) : null}
              </li>
            ))}
          </ol>

          <div className="row actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => onNavigate('solve')}
            >
              Start from my problem instead
            </button>
          </div>
        </section>
      ) : (
        <p className="lede panel soft">
          Tap a tile above to open the full walkthrough.
        </p>
      )}
    </div>
  )
}
