import { useMemo, useState } from 'react'
import type { AppView } from './AppShell'
import {
  DOMAINS,
  SPECTRUM,
  VENN_ZONES,
  flowFromDomain,
  toolsInZone,
  type DomainId,
  type FlowState,
  type Spectrum,
  type VennZone,
} from '../guides/toolMap'
import { getToolGuide } from '../guides/toolGuides'

export function ToolVenn({
  current,
  onOpen,
}: {
  current?: AppView
  onOpen: (view: AppView, flow: FlowState) => void
}) {
  const [focus, setFocus] = useState<DomainId | 'all'>('all')

  const visibleZones = useMemo(() => {
    if (focus === 'all') return VENN_ZONES
    return VENN_ZONES.filter((z) => z.domains.includes(focus))
  }, [focus])

  return (
    <div className="tool-venn">
      <section className="panel start-hero">
        <h2>Methods</h2>
        <p className="lede">
          Every tool lives in statistical process control, hypothesis testing,
          Lean — or the overlap. Color is the use spectrum: look, then prove,
          then act. Tap a circle to filter; tap a chip to jump in. The flow rail
          above keeps your place.
        </p>
        <div className="spectrum-legend" aria-label="Use spectrum">
          {SPECTRUM.map((s) => (
            <span key={s.id} className={`spectrum-key ${s.id}`}>
              <strong>{s.label}</strong>
              <span>{s.hint}</span>
            </span>
          ))}
        </div>
      </section>

      <div className="venn-legend" role="group" aria-label="Method domains">
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={
              focus === d.id ? `venn-filter ${d.id} on` : `venn-filter ${d.id}`
            }
            aria-pressed={focus === d.id}
            onClick={() => setFocus((prev) => (prev === d.id ? 'all' : d.id))}
          >
            <strong>{d.short}</strong>
            <span>{d.question}</span>
          </button>
        ))}
      </div>

      <div className="venn-stage" aria-hidden="true">
        <span className={`venn-circle spc ${focus === 'spc' || focus === 'all' ? 'lit' : ''}`}>
          SPC
        </span>
        <span className={`venn-circle hyp ${focus === 'hyp' || focus === 'all' ? 'lit' : ''}`}>
          Prove
        </span>
        <span className={`venn-circle lean ${focus === 'lean' || focus === 'all' ? 'lit' : ''}`}>
          Lean
        </span>
      </div>

      <div className="venn-zones">
        {visibleZones.map((zone) => (
          <ZoneCard
            key={zone.id}
            zone={zone.id}
            title={zone.title}
            hint={zone.hint}
            current={current}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}

function ZoneCard({
  zone,
  title,
  hint,
  current,
  onOpen,
}: {
  zone: VennZone
  title: string
  hint: string
  current?: AppView
  onOpen: (view: AppView, flow: FlowState) => void
}) {
  const tools = toolsInZone(zone)
  if (tools.length === 0) return null
  const domainForFlow: DomainId =
    zone === 'hyp' || zone === 'hyp-lean' ? 'hyp' : zone === 'lean' ? 'lean' : 'spc'

  return (
    <section className={`venn-zone zone-${zone}`}>
      <h3>{title}</h3>
      <p className="meta">{hint}</p>
      <div className="venn-chips">
        {tools.map((t) => {
          const guide = getToolGuide(t.id)
          return (
            <button
              key={t.id}
              type="button"
              className={chipClass(t.spectrum, current === t.id)}
              title={guide?.plainName ?? t.chip}
              onClick={() => onOpen(t.id, flowFromDomain(domainForFlow, t.id))}
            >
              {t.chip}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function chipClass(spectrum: Spectrum, on: boolean): string {
  return on ? `map-chip ${spectrum} on` : `map-chip ${spectrum}`
}
