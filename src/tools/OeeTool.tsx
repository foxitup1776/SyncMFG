import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import {
  InterpretBanner,
  NextStepCta,
} from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { fmt } from '../stats/descriptive'
import { interpretOee } from '../stats/interpretations'
import { calcOee } from '../stats/oee'

const WEAK_LABEL = {
  availability: 'Availability (too much downtime vs plan)',
  performance: 'Performance (slow cycles or small stops while “running”)',
  quality: 'Quality (scrap / rework hurting first-pass yield)',
} as const

export function OeeTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [planned, setPlanned] = usePersistedState('tool.oee.planned', '480')
  const [downtime, setDowntime] = usePersistedState('tool.oee.down', '60')
  const [ideal, setIdeal] = usePersistedState('tool.oee.ideal', '0.5')
  const [totalPcs, setTotalPcs] = usePersistedState('tool.oee.total', '700')
  const [goodPcs, setGoodPcs] = usePersistedState('tool.oee.good', '665')
  const [unit, setUnit] = usePersistedState('tool.oee.unit', 'minutes')

  const result = useMemo(
    () =>
      calcOee({
        plannedTime: Number(planned),
        downtime: Number(downtime),
        idealCycleTime: Number(ideal),
        totalPieces: Number(totalPcs),
        goodPieces: Number(goodPcs),
      }),
    [planned, downtime, ideal, totalPcs, goodPcs],
  )

  const interp = useMemo(
    () =>
      result
        ? interpretOee({
            oeePct: result.oeePct,
            weakest: result.weakest,
            availabilityPct: result.availabilityPct,
            performancePct: result.performancePct,
            qualityPct: result.qualityPct,
          })
        : null,
    [result],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!result) return null
    return {
      title: 'OEE lite — where is the loss?',
      summary: `Overall Equipment Effectiveness ≈ ${fmt(result.oeePct, 1)}%. That is Availability (${fmt(result.availabilityPct, 1)}%) × Performance (${fmt(result.performancePct, 1)}%) × Quality (${fmt(result.qualityPct, 1)}%).`,
      bullets: [
        `Run time = ${fmt(result.runTime, 1)} ${unit} (planned ${fmt(result.plannedTime, 1)} minus downtime ${fmt(result.downtime, 1)}).`,
        `Biggest drag right now: ${WEAK_LABEL[result.weakest]}.`,
        result.weakest === 'availability'
          ? 'Next: split downtime into Equipment Failure vs Setup/Changeover (Six Big Losses), then attack the tallest reason with Pareto.'
          : result.weakest === 'performance'
            ? 'Next: hunt small stops and slow cycles — operators often fix them so fast they never get logged.'
            : 'Next: score first-pass yield and Pareto defect codes — process defects vs startup (reduced) yield.',
        'World-class plants chase high OEE, but the win is knowing which loss to fix first — not the single number.',
      ],
      termsUsed: ['oee', 'first-pass yield', 'six big losses'],
    }
  }, [result, unit])

  function fillExample() {
    setUnit('minutes')
    setPlanned('480')
    setDowntime('60')
    setIdeal('0.5')
    setTotalPcs('700')
    setGoodPcs('665')
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="oee" />
      <section className="panel">
        <h2>Is the line effective? (OEE lite)</h2>
        <p className="lede">
          Three scores multiplied: were we running, were we at speed, were pieces
          good the first time?
        </p>
        <div className="row actions">
          <button type="button" className="btn secondary" onClick={fillExample}>
            Fill example
          </button>
        </div>
        <label>
          Time unit (label only — keep every time field in the same unit)
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="seconds">Seconds</option>
          </select>
        </label>
        <p className="meta">
          Example: an 8-hour shift = 480 minutes. Ideal cycle is minutes per
          good piece at design speed (e.g. 0.5 min/pc). Planned, downtime, and
          ideal cycle must all use “{unit}”.
        </p>
        <div className="form-grid">
          <label>
            Planned time ({unit})
            <input
              type="number"
              min={0}
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
            />
          </label>
          <label>
            Downtime ({unit})
            <input
              type="number"
              min={0}
              value={downtime}
              onChange={(e) => setDowntime(e.target.value)}
            />
          </label>
          <label>
            Ideal cycle time ({unit} / piece)
            <input
              type="number"
              min={0}
              step="any"
              value={ideal}
              onChange={(e) => setIdeal(e.target.value)}
            />
          </label>
          <label>
            Total pieces produced
            <input
              type="number"
              min={0}
              value={totalPcs}
              onChange={(e) => setTotalPcs(e.target.value)}
            />
          </label>
          <label>
            Good first-pass pieces
            <input
              type="number"
              min={0}
              value={goodPcs}
              onChange={(e) => setGoodPcs(e.target.value)}
            />
          </label>
        </div>
      </section>

      {result ? (
        <>
          {interp ? (
            <InterpretBanner
              title={interp.title}
              plain={interp.plain}
              meta={interp.meta}
            >
              <NextStepCta
                label={
                  result.weakest === 'quality'
                    ? 'Open Yield / FPY'
                    : 'Open Pareto'
                }
                view={result.weakest === 'quality' ? 'yield' : 'pareto'}
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>OEE</span>
              <strong>{fmt(result.oeePct, 1)}%</strong>
            </div>
            <div>
              <span>Availability</span>
              <strong>{fmt(result.availabilityPct, 1)}%</strong>
            </div>
            <div>
              <span>Performance</span>
              <strong>{fmt(result.performancePct, 1)}%</strong>
            </div>
            <div>
              <span>Quality</span>
              <strong>{fmt(result.qualityPct, 1)}%</strong>
            </div>
          </div>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="OEE lite"
              defaultPhase="measure"
            />
          ) : null}
        </>
      ) : (
        <p className="form-error">
          Check inputs: planned &gt; 0, downtime ≤ planned, good ≤ total, ideal
          cycle &gt; 0.
        </p>
      )}
    </div>
  )
}
