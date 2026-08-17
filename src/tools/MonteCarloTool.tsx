import { useMemo, useState } from 'react'
import type { AppView } from '../components/AppShell'
import {
  InterpretBanner,
  NextStepCta,
} from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { DistributionChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { fmt } from '../stats/descriptive'
import { interpretMonteCarlo } from '../stats/interpretations'
import {
  runTimeStudyMonteCarlo,
  type ProcessStep,
} from '../stats/monteCarlo'

function newStep(partial?: Partial<ProcessStep>): ProcessStep {
  return {
    id: crypto.randomUUID(),
    name: '',
    min: 0,
    typical: 0,
    max: 0,
    ...partial,
  }
}

export function MonteCarloTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [steps, setSteps] = usePersistedState<ProcessStep[]>('tool.mc.steps', [
    newStep({ name: 'Load', min: 8, typical: 10, max: 15 }),
    newStep({ name: 'Cycle', min: 20, typical: 25, max: 35 }),
    newStep({ name: 'Inspect', min: 5, typical: 7, max: 12 }),
  ])
  const [trials, setTrials] = usePersistedState('tool.mc.trials', 5000)
  const [targetRaw, setTargetRaw] = usePersistedState('tool.mc.target', '60')
  const [seedRun, setSeedRun] = useState(0)

  const target = targetRaw.trim() === '' ? null : Number(targetRaw)

  const result = useMemo(() => {
    // seedRun forces recalculation when user clicks Run again
    void seedRun
    return runTimeStudyMonteCarlo(
      steps,
      trials,
      target !== null && Number.isFinite(target) ? target : null,
    )
  }, [steps, trials, target, seedRun])

  const interp = useMemo(
    () =>
      result
        ? interpretMonteCarlo({
            median: result.median,
            p95: result.p95,
            hitTargetPct: result.hitTargetPct,
            target: target !== null && Number.isFinite(target) ? target : null,
          })
        : null,
    [result, target],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!result) return null
    const top = result.stepMeans[0]
    return {
      title: 'Time-study Monte Carlo',
      summary: `We simulated ${result.trials.toLocaleString()} complete runs by randomly picking realistic times for each step (slow / typical / fast). That shows the range of total times you should expect — not just one happy-path number.`,
      bullets: [
        `Typical total time (median) ≈ ${fmt(result.median, 2)}. Average ≈ ${fmt(result.mean, 2)}.`,
        `Most runs fall between ${fmt(result.p10, 2)} (faster 10%) and ${fmt(result.p90, 2)} (slower end, 90th percentile).`,
        `95th percentile ≈ ${fmt(result.p95, 2)} — a useful “plan for the slow day” number.`,
        result.hitTargetPct === null
          ? 'No target time entered, so we did not score on-time risk.'
          : `${fmt(result.hitTargetPct, 1)}% of simulated runs finished at or under your target of ${fmt(target, 2)}.`,
        top
          ? `Biggest average time consumer: “${top.name}” (~${fmt(top.sharePct, 1)}% of total). Improve that step first if you need shorter cycle time.`
          : 'Add named steps with min / typical / max times to simulate.',
      ],
      termsUsed: [
        'monte carlo',
        'percentile',
        'median',
        'triangular distribution',
      ],
    }
  }, [result, target])

  function updateStep(id: string, patch: Partial<ProcessStep>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="montecarlo" />
      <section className="panel">
        <h2>What total time should we expect?</h2>
        <p className="lede">
          List process steps with a fast, typical, and slow time. We run
          thousands of “what if” days and show the likely total time and risk of
          missing a target.
        </p>

        <div className="steps-table-wrap">
          <table className="steps-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Min</th>
                <th>Typical</th>
                <th>Max</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {steps.map((step) => (
                <tr key={step.id}>
                  <td>
                    <input
                      value={step.name}
                      onChange={(e) => updateStep(step.id, { name: e.target.value })}
                      placeholder="Step name"
                    />
                  </td>
                  <td>
                    <input
                      inputMode="decimal"
                      value={step.min}
                      onChange={(e) =>
                        updateStep(step.id, { min: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td>
                    <input
                      inputMode="decimal"
                      value={step.typical}
                      onChange={(e) =>
                        updateStep(step.id, { typical: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td>
                    <input
                      inputMode="decimal"
                      value={step.max}
                      onChange={(e) =>
                        updateStep(step.id, { max: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn ghost danger"
                      onClick={() =>
                        setSteps((prev) => prev.filter((s) => s.id !== step.id))
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => setSteps((prev) => [...prev, newStep()])}
          >
            Add step
          </button>
        </div>

        <div className="field-grid">
          <div>
            <label htmlFor="trials">Simulated runs</label>
            <input
              id="trials"
              type="number"
              min={200}
              max={20000}
              value={trials}
              onChange={(e) => setTrials(Number(e.target.value) || 1000)}
            />
          </div>
          <div>
            <label htmlFor="target">Target total time (optional)</label>
            <input
              id="target"
              inputMode="decimal"
              value={targetRaw}
              onChange={(e) => setTargetRaw(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>
        </div>

        <div className="row actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => setSeedRun((n) => n + 1)}
          >
            Run simulation
          </button>
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
                label="Save into project"
                view="projects"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>Median</span>
              <strong>{fmt(result.median, 2)}</strong>
            </div>
            <div>
              <span>P90</span>
              <strong>{fmt(result.p90, 2)}</strong>
            </div>
            <div>
              <span>P95</span>
              <strong>{fmt(result.p95, 2)}</strong>
            </div>
            <div>
              <span>On-time</span>
              <strong>
                {result.hitTargetPct === null
                  ? '—'
                  : `${fmt(result.hitTargetPct, 1)}%`}
              </strong>
            </div>
          </div>
          <DistributionChart values={result.totals} label="Total process time" />
          <section className="panel">
            <h3>Where time goes (average share)</h3>
            <ul className="dataset-list">
              {result.stepMeans.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.name}</strong>
                    <span className="meta">
                      avg {fmt(s.mean, 2)} · {fmt(s.sharePct, 1)}% of total
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Monte Carlo"
              defaultPhase="improve"
            />
          ) : null}
        </>
      ) : (
        <p className="form-error">
          Add steps with min ≤ typical ≤ max, then run the simulation.
        </p>
      )}
    </div>
  )
}
