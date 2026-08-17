import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AppView } from '../components/AppShell'
import {
  InterpretBanner,
  NextStepCta,
} from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  EIGHT_WASTES,
  wasteById,
  type ImpactLevel,
  type WasteObservation,
} from '../lean/wastes'

function newObs(
  wasteId: string,
  partial?: Partial<WasteObservation>,
): WasteObservation {
  return {
    id: crypto.randomUUID(),
    wasteId,
    note: '',
    impact: 'medium',
    idea: '',
    ...partial,
  }
}

function loadExampleObs(): WasteObservation[] {
  return [
    newObs('motion', {
      note: 'Operator walks two aisles for film rolls every changeover',
      impact: 'high',
      idea: 'Stage film at point of use',
    }),
    newObs('motion', {
      note: 'Searching for correct jig — no shadow board',
      impact: 'high',
      idea: 'Shadow board + labels',
    }),
    newObs('motion', {
      note: 'Bending to floor bin for scrap tags each cycle',
      impact: 'medium',
      idea: 'Raise bin to waist height',
    }),
    newObs('motion', {
      note: 'Reaching across conveyor for labels',
      impact: 'medium',
    }),
    newObs('waiting', {
      note: 'Line idle waiting on QA first-piece check',
      impact: 'high',
      idea: 'First-piece checklist at cell',
    }),
    newObs('transportation', {
      note: 'Cart zig-zag to staging rack across plant',
      impact: 'medium',
    }),
    newObs('defects', {
      note: 'Film wrinkles after long reach / rush',
      impact: 'medium',
    }),
    newObs('inventory', {
      note: 'Three obsolete jigs still on the bench',
      impact: 'low',
      idea: 'Red-tag / Sort',
    }),
  ]
}

export function WasteWalkTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [area, setArea] = usePersistedState('tool.wastewalk.area', '')
  const [date, setDate] = usePersistedState(
    'tool.wastewalk.date',
    new Date().toISOString().slice(0, 10),
  )
  const [observer, setObserver] = usePersistedState('tool.wastewalk.who', '')
  const [selectedWaste, setSelectedWaste] = useState<string | null>(null)
  const [obs, setObs] = usePersistedState<WasteObservation[]>(
    'tool.wastewalk.obs',
    [],
  )

  function addSelected() {
    if (!selectedWaste) return
    setObs((prev) => [...prev, newObs(selectedWaste)])
    setSelectedWaste(null)
  }

  function updateObs(id: string, patch: Partial<WasteObservation>) {
    setObs((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  function loadExamples() {
    setArea('Wrapper station')
    setObserver('Demo operator')
    setObs(loadExampleObs())
  }

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of obs) map.set(o.wasteId, (map.get(o.wasteId) ?? 0) + 1)
    return map
  }, [obs])

  const chartData = useMemo(
    () =>
      EIGHT_WASTES.map((w) => ({
        name: w.name,
        count: counts.get(w.id) ?? 0,
      })).filter((d) => d.count > 0),
    [counts],
  )

  const ranked = useMemo(
    () => [...counts.entries()].sort((a, b) => b[1] - a[1]),
    [counts],
  )
  const topId = ranked[0]?.[0]
  const motionCount = counts.get('motion') ?? 0
  const motionIsFocus =
    topId === 'motion' || motionCount >= 3

  const report: AnalysisReport | null = useMemo(() => {
    if (obs.length === 0) return null
    const top = ranked[0]
    const topName = top ? wasteById(top[0])?.name ?? top[0] : ''
    const high = obs.filter((o) => o.impact === 'high').length
    return {
      title: `Waste walk — ${area.trim() || 'area'}`,
      summary: `${obs.length} observation(s) logged${area.trim() ? ` at “${area.trim()}”` : ''}. Most common waste type: ${topName} (${top?.[1] ?? 0}). ${high} marked high impact.`,
      bullets: [
        `DOWNTIME checklist used: Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra-processing.`,
        ...ranked.slice(0, 3).map(([id, n]) => {
          const w = wasteById(id)
          return `${w?.name ?? id}: ${n} finding(s). Look for: ${w?.lookFor ?? ''}`
        }),
        'Training tip: watch a full cycle before asking questions — focus on the process, not blaming people.',
        'Next: pick the top 1–3 high-impact items, Fishbone/5 Whys if needed, then prove a fix with before/after.',
      ],
      termsUsed: ['eight wastes', 'gemba', 'kaizen'],
    }
  }, [obs, ranked, area])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="wastewalk" />
      <section className="panel">
        <h2>Waste walk (DOWNTIME)</h2>
        <p className="lede">
          Walk the Gemba. Tap a waste type when you see it, jot what you saw, and
          rank impact — no advanced math.
        </p>
        <div className="form-grid">
          <label>
            Area / line
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Packaging cell B"
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={typeof date === 'string' ? date : ''}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Observer
            <input
              value={observer}
              onChange={(e) => setObserver(e.target.value)}
              placeholder="Your name"
            />
          </label>
        </div>
        <div className="row actions">
          <button type="button" className="btn secondary" onClick={loadExamples}>
            Load example observations
          </button>
        </div>
      </section>

      <section className="panel soft">
        <h3 className="subhead">Tap a waste you see</h3>
        <p className="meta">
          Acronym: <strong>DOWNTIME</strong> — same 8 wastes taught in most Lean
          certification paths (also called TIMWOODS).
        </p>
        <div className="waste-chip-grid">
          {EIGHT_WASTES.map((w) => {
            const n = counts.get(w.id) ?? 0
            const on = selectedWaste === w.id
            return (
              <button
                key={w.id}
                type="button"
                className={on ? 'waste-chip selected' : 'waste-chip'}
                onClick={() => setSelectedWaste(on ? null : w.id)}
                aria-pressed={on}
              >
                <span className="waste-letter">{w.letter}</span>
                <strong>{w.name}</strong>
                <span className="waste-short">{w.short}</span>
                {n > 0 ? <span className="waste-count">{n}</span> : null}
              </button>
            )
          })}
        </div>
        {selectedWaste ? (
          <div className="waste-detail">
            <p>
              <strong>{wasteById(selectedWaste)?.name}</strong> —{' '}
              {wasteById(selectedWaste)?.lookFor}
            </p>
            <button type="button" className="btn primary" onClick={addSelected}>
              Log this observation
            </button>
          </div>
        ) : (
          <p className="meta">Select a tile, then log what you saw.</p>
        )}
      </section>

      {obs.length > 0 ? (
        <section className="panel">
          <div className="row actions" style={{ justifyContent: 'space-between' }}>
            <h3 className="subhead" style={{ margin: 0 }}>
              Observations ({obs.length})
            </h3>
            <button
              type="button"
              className="btn ghost danger"
              onClick={() => {
                if (confirm('Clear all waste-walk observations?')) setObs([])
              }}
            >
              Clear all
            </button>
          </div>
          {chartData.length > 0 ? (
            <div className="chart-card">
              <h3>Waste counts by type</h3>
              <p className="chart-caption">
                How many times each DOWNTIME waste showed up on this walk.
              </p>
              <div className="chart-frame">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2f6f6a" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
          <ul className="obs-list">
            {obs.map((o) => {
              const w = wasteById(o.wasteId)
              return (
                <li key={o.id} className="obs-card">
                  <div className="obs-head">
                    <span className="waste-letter sm">{w?.letter}</span>
                    <strong>{w?.name}</strong>
                    <button
                      type="button"
                      className="btn ghost danger"
                      onClick={() =>
                        setObs((prev) => prev.filter((x) => x.id !== o.id))
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <label>
                    What did you see?
                    <textarea
                      rows={2}
                      value={o.note}
                      onChange={(e) => updateObs(o.id, { note: e.target.value })}
                      placeholder="Be specific — where, when, how often"
                    />
                  </label>
                  <div className="impact-row">
                    <span>Impact</span>
                    {(['low', 'medium', 'high'] as ImpactLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={
                          o.impact === level
                            ? `impact-chip ${level} on`
                            : `impact-chip ${level}`
                        }
                        onClick={() => updateObs(o.id, { impact: level })}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <label>
                    Idea to try (optional)
                    <input
                      value={o.idea}
                      onChange={(e) => updateObs(o.id, { idea: e.target.value })}
                      placeholder="Quick countermeasure idea"
                    />
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {report ? (
        <>
          <InterpretBanner
            title="What the walk is telling you"
            plain={
              motionIsFocus
                ? 'Motion (extra walking / reaching / searching) is a top finding. That usually means layout, staging, or 5S — not “work harder.”'
                : 'Rank high-impact findings, pick the vital few, then attack with 5S, Fishbone, or a before/after check.'
            }
            meta={`Top type: ${wasteById(topId ?? '')?.name ?? '—'}${motionCount ? ` · Motion count: ${motionCount}` : ''}`}
          >
            {motionIsFocus ? (
              <NextStepCta
                label="Open 5S"
                view="fives"
                onNavigate={onNavigate}
              />
            ) : null}
          </InterpretBanner>
          <PlainReport
            report={report}
            sourceTool="Waste walk"
            defaultPhase="analyze"
          />
        </>
      ) : null}
    </div>
  )
}
