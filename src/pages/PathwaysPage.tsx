import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppView } from '../components/AppShell'
import {
  PATHWAY_FAMILIES,
  PATHWAY_FAMILY,
  PATHWAYS,
  getPathway,
  type PathwayFamily,
} from '../guides/pathways'
import { flowFromPathway, type FlowState } from '../guides/toolMap'
import { usePersistedState } from '../hooks/usePersistedState'

export function PathwaysPage({
  onNavigate,
  initialPathwayId,
}: {
  onNavigate: (v: AppView, flow?: FlowState) => void
  initialPathwayId?: string
}) {
  const [selectedId, setSelectedId] = usePersistedState(
    'pathways.selected',
    initialPathwayId ?? '',
  )
  const [showNotes, setShowNotes] = useState(false)
  const detailRef = useRef<HTMLElement | null>(null)
  const selected = useMemo(
    () => (selectedId ? getPathway(selectedId) : undefined),
    [selectedId],
  )

  const selectedFamily: PathwayFamily =
    (selectedId && PATHWAY_FAMILY[selectedId]) || 'now'
  const [openFamily, setOpenFamily] = useState<PathwayFamily | null>(
    selectedFamily,
  )

  const skipScroll = useRef(true)

  useEffect(() => {
    if (selectedId && PATHWAY_FAMILY[selectedId]) {
      setOpenFamily(PATHWAY_FAMILY[selectedId])
    }
  }, [selectedId])

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false
      return
    }
    if (!selectedId || !detailRef.current) return
    detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedId])

  useEffect(() => {
    setShowNotes(false)
  }, [selectedId])

  return (
    <div className="pathways-page">
      <section className="panel start-hero">
        <h2>Choose a method</h2>
        <p className="lede">
          Pick the job on the floor. Open a group, tap a tile, then follow the
          steps — teaching notes stay tucked away until you want them.
        </p>
      </section>

      <div className="family-list">
        {PATHWAY_FAMILIES.map((family) => {
          const items = PATHWAYS.filter((p) => PATHWAY_FAMILY[p.id] === family.id)
          const open = openFamily === family.id
          return (
            <section key={family.id} className="family-block">
              <button
                type="button"
                className={open ? 'family-head open' : 'family-head'}
                aria-expanded={open}
                onClick={() =>
                  setOpenFamily((prev) =>
                    prev === family.id ? null : family.id,
                  )
                }
              >
                <span>
                  <strong>{family.title}</strong>
                  <span className="family-hint">{family.hint}</span>
                </span>
                <span className="family-count">{items.length}</span>
              </button>
              {open ? (
                <div className="pathway-grid compact">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={
                        selectedId === p.id
                          ? 'pathway-tile selected'
                          : 'pathway-tile'
                      }
                      onClick={() => setSelectedId(p.id)}
                    >
                      <span className="pathway-short">{p.shortLabel}</span>
                      <strong>{p.title}</strong>
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>

      {selected ? (
        <section ref={detailRef} className="panel pathway-detail">
          <p className="guide-kicker">Walkthrough</p>
          <h2>{selected.title}</h2>
          <p className="hero-copy">{selected.floorQuestion}</p>
          <p className="lede">{selected.whyItMatters}</p>

          <h3 className="subhead">Do this</h3>
          <ol className="pathway-steps">
            {selected.steps.map((step, i) => (
              <li key={step.title}>
                <div>
                  <strong>
                    {i + 1}. {step.title}
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
                    onClick={() => {
                      const toolIds = selected.steps
                        .map((s) => s.toolId)
                        .filter((id): id is AppView => Boolean(id))
                      onNavigate(
                        step.toolId!,
                        flowFromPathway(
                          selected.title,
                          selected.id,
                          toolIds,
                          step.toolId!,
                        ),
                      )
                    }}
                  >
                    Open
                  </button>
                ) : null}
              </li>
            ))}
          </ol>

          <div className="row actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShowNotes((v) => !v)}
              aria-expanded={showNotes}
            >
              {showNotes ? 'Hide teaching notes' : 'Teaching notes & example'}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => onNavigate('solve')}
            >
              Start from my problem
            </button>
          </div>

          {showNotes ? (
            <div className="notes-drawer">
              <h3 className="subhead">From your teaching notes</h3>
              <ul className="quote-list compact">
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
            </div>
          ) : null}
        </section>
      ) : (
        <p className="lede panel soft">
          Open a group above, then tap a tile for the steps.
        </p>
      )}
    </div>
  )
}
