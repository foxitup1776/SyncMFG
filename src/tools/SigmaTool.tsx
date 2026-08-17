import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import { InterpretBanner, NextStepCta } from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { StepYieldBars } from '../components/charts/PlanCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { fmt } from '../stats/descriptive'
import { interpretRty, interpretSigmaLevel } from '../stats/interpretations'
import {
  calcRty,
  calcSigmaLevel,
  SIGMA_TABLE,
  type RtyStep,
} from '../stats/sigmaLevel'

function newStep(partial?: Partial<RtyStep>): RtyStep {
  return { label: '', units: 0, defects: 0, ...partial }
}

export function SigmaTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [mode, setMode] = usePersistedState<'single' | 'rty'>(
    'tool.sigma.mode',
    'single',
  )
  const [unitsRaw, setUnitsRaw] = usePersistedState('tool.sigma.units', '1200')
  const [defectsRaw, setDefectsRaw] = usePersistedState('tool.sigma.defects', '38')
  const [oppRaw, setOppRaw] = usePersistedState('tool.sigma.opp', '4')
  const [applyShift, setApplyShift] = usePersistedState(
    'tool.sigma.shift',
    true,
  )
  const [steps, setSteps] = usePersistedState<RtyStep[]>('tool.sigma.steps', [
    newStep({ label: 'Mix / dose', units: 1000, defects: 20 }),
    newStep({ label: 'Form', units: 1000, defects: 45 }),
    newStep({ label: 'Bake', units: 1000, defects: 90 }),
    newStep({ label: 'Pack', units: 1000, defects: 15 }),
  ])

  const single = useMemo(
    () =>
      calcSigmaLevel({
        units: Number(unitsRaw),
        defects: Number(defectsRaw),
        opportunitiesPerUnit: Number(oppRaw),
        applyShift,
      }),
    [unitsRaw, defectsRaw, oppRaw, applyShift],
  )

  const rty = useMemo(() => calcRty(steps), [steps])

  const singleInterp = useMemo(
    () =>
      single
        ? interpretSigmaLevel({
            dpmo: single.dpmo,
            sigmaLevel: single.sigmaLevel,
            shiftApplied: single.shiftApplied,
            yieldPct: single.yieldPct,
            dpu: single.dpu,
            band: single.band,
          })
        : null,
    [single],
  )

  const rtyInterp = useMemo(
    () =>
      rty
        ? interpretRty({
            rtyPct: rty.rtyPct,
            weakestLabel: rty.weakest?.label ?? null,
            weakestYieldPct: rty.weakest?.yieldPct ?? null,
            stepCount: rty.steps.length,
            hiddenFactoryPct: rty.hiddenFactoryPct,
            finalStepYieldPct: rty.finalStepYieldPct,
          })
        : null,
    [rty],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (mode === 'single') {
      if (!single) return null
      return {
        title: 'Process sigma / DPMO scorecard',
        summary: `${single.defects.toLocaleString()} defects across ${single.units.toLocaleString()} units with ${single.opportunitiesPerUnit} check point(s) each = ${Math.round(single.dpmo).toLocaleString()} DPMO, about ${fmt(single.sigmaLevel, 2)} sigma${single.shiftApplied ? ' (with the 1.5 shift)' : ' (long-term, no shift)'}.`,
        bullets: [
          `Defects per unit (DPU) = ${fmt(single.dpu, 4)}. Defects per opportunity = ${fmt(single.dpo, 6)}.`,
          `${fmt(single.yieldPct, 4)}% of check points came out clean. Chance a whole unit is defect-free ≈ ${fmt(single.firstPassYieldPct, 2)}%.`,
          single.shiftApplied
            ? `Long-term sigma straight from the data is ${fmt(single.zLongTerm, 2)}; the reported ${fmt(single.sigmaLevel, 2)} adds the traditional 1.5 shift so it lines up with the “6 sigma = 3.4 DPMO” table.`
            : `Reported sigma is the long-term value (${fmt(single.zLongTerm, 2)}) with no shift. Most certification tables assume the 1.5 shift, so say which one you are quoting.`,
          'Counting opportunities honestly matters more than the decimal places: inflate opportunities per unit and your sigma level rises without a single real improvement.',
          'Next: Pareto the defect types so the DPMO number turns into an attack list.',
        ],
        termsUsed: ['dpmo', 'dpu', 'sigma level', 'first-pass yield', 'pareto'],
      }
    }
    if (!rty) return null
    return {
      title: 'Rolled throughput yield across the line',
      summary: `Across ${rty.steps.length} step(s), rolled throughput yield ≈ ${fmt(rty.rtyPct, 2)}%. That is the share of units that clear every step with no rework and no scrap.`,
      bullets: [
        `Step yields: ${rty.steps.map((s) => `${s.label || 'Step'} ${fmt(s.yieldPct, 1)}%`).join(' · ')}.`,
        rty.weakest
          ? `Weakest step is “${rty.weakest.label || 'unnamed'}” at ${fmt(rty.weakest.yieldPct, 1)}% (${rty.weakest.defects} bad out of ${rty.weakest.units}). Fixing the weakest step moves RTY the most.`
          : 'Add at least two steps to see where the losses stack up.',
        `Normalized yield ≈ ${fmt(rty.normalizedYieldPct, 1)}% — the yield every step would need to produce this same end-to-end result.`,
        rty.hiddenFactoryPct > 5
          ? `The best single step reads ${fmt(rty.hiddenFactoryPct, 1)} points better than the true end-to-end number. That gap is the hidden factory: rework that gets absorbed locally and never shows on a report.`
          : 'Steps are fairly balanced, so no single station is hiding the losses.',
        'Next: Pareto the defect reasons at the weakest step, then control-chart that step.',
      ],
      termsUsed: ['rty', 'first-pass yield', 'hidden factory', 'pareto'],
    }
  }, [mode, single, rty])

  function fillExample() {
    if (mode === 'single') {
      setUnitsRaw('1200')
      setDefectsRaw('38')
      setOppRaw('4')
      setApplyShift(true)
    } else {
      setSteps([
        newStep({ label: 'Mix / dose', units: 1000, defects: 20 }),
        newStep({ label: 'Form', units: 1000, defects: 45 }),
        newStep({ label: 'Bake', units: 1000, defects: 90 }),
        newStep({ label: 'Pack', units: 1000, defects: 15 }),
      ])
    }
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="sigma" />
      <section className="panel">
        <h2>What sigma level are we running?</h2>
        <p className="lede">
          Turns your defect counts into the Six Sigma scorecard language —
          defects per unit, DPMO, sigma level, and end-to-end yield.
        </p>
        <div className="row actions">
          <button
            type="button"
            className={mode === 'single' ? 'btn primary' : 'btn secondary'}
            onClick={() => setMode('single')}
          >
            One process (DPMO)
          </button>
          <button
            type="button"
            className={mode === 'rty' ? 'btn primary' : 'btn secondary'}
            onClick={() => setMode('rty')}
          >
            Multi-step (rolled yield)
          </button>
          <button type="button" className="btn secondary" onClick={fillExample}>
            Fill example
          </button>
        </div>

        {mode === 'single' ? (
          <>
            <p className="meta">
              A “defect” is one thing wrong. An “opportunity” is one way a unit
              could go wrong — count the check points you actually inspect, and
              keep that count honest across reports.
            </p>
            <div className="form-grid">
              <label>
                Units inspected
                <input
                  type="number"
                  min={1}
                  value={unitsRaw}
                  onChange={(e) => setUnitsRaw(e.target.value)}
                />
              </label>
              <label>
                Defects found (not defective units)
                <input
                  type="number"
                  min={0}
                  value={defectsRaw}
                  onChange={(e) => setDefectsRaw(e.target.value)}
                />
              </label>
              <label>
                Opportunities per unit
                <input
                  type="number"
                  min={1}
                  value={oppRaw}
                  onChange={(e) => setOppRaw(e.target.value)}
                />
              </label>
              <label>
                Sigma convention
                <select
                  value={applyShift ? 'shift' : 'raw'}
                  onChange={(e) => setApplyShift(e.target.value === 'shift')}
                >
                  <option value="shift">
                    Add the 1.5 shift (matches the classic table)
                  </option>
                  <option value="raw">
                    No shift (long-term sigma from your data)
                  </option>
                </select>
              </label>
            </div>
          </>
        ) : (
          <>
            <p className="meta">
              List the steps a part walks through. Each step multiplies, so
              several “pretty good” steps can still add up to a poor whole.
            </p>
            <div className="table-edit">
              <div className="table-edit-head">
                <span>Step</span>
                <span>Units in</span>
                <span>Bad units</span>
                <span />
              </div>
              {steps.map((s, i) => (
                <div key={i} className="table-edit-row">
                  <input
                    value={s.label}
                    placeholder="e.g. Bake"
                    onChange={(e) =>
                      setSteps((prev) =>
                        prev.map((row, j) =>
                          j === i ? { ...row, label: e.target.value } : row,
                        ),
                      )
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    value={s.units || ''}
                    onChange={(e) =>
                      setSteps((prev) =>
                        prev.map((row, j) =>
                          j === i
                            ? { ...row, units: Number(e.target.value) || 0 }
                            : row,
                        ),
                      )
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    value={s.defects || ''}
                    onChange={(e) =>
                      setSteps((prev) =>
                        prev.map((row, j) =>
                          j === i
                            ? { ...row, defects: Number(e.target.value) || 0 }
                            : row,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() =>
                      setSteps((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn secondary"
                onClick={() => setSteps((prev) => [...prev, newStep()])}
              >
                Add step
              </button>
            </div>
          </>
        )}
      </section>

      {mode === 'single' && single ? (
        <>
          {singleInterp ? (
            <InterpretBanner
              title={singleInterp.title}
              plain={singleInterp.plain}
              meta={singleInterp.meta}
            >
              <NextStepCta
                label="Open Pareto for defect types"
                view="pareto"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>Sigma level</span>
              <strong>{fmt(single.sigmaLevel, 2)}</strong>
            </div>
            <div>
              <span>DPMO</span>
              <strong>{Math.round(single.dpmo).toLocaleString()}</strong>
            </div>
            <div>
              <span>DPU</span>
              <strong>{fmt(single.dpu, 4)}</strong>
            </div>
            <div>
              <span>Clean check points</span>
              <strong>{fmt(single.yieldPct, 3)}%</strong>
            </div>
          </div>
          <section className="panel soft">
            <h3 className="subhead">
              Reference table (with the 1.5 shift, as usually published)
            </h3>
            <ul className="period-list">
              {SIGMA_TABLE.map((row) => (
                <li key={row.sigma}>
                  <strong>{row.sigma} sigma</strong>
                  <span>
                    {row.dpmo.toLocaleString()} DPMO · {row.yieldPct}% good
                  </span>
                </li>
              ))}
            </ul>
            <p className="meta">
              Your {fmt(single.sigmaLevel, 2)} sigma sits{' '}
              {single.sigmaLevel >= 3
                ? 'above the 3-sigma line most plants start from'
                : 'below the 3-sigma line — customers will feel this'}
              . The shift toggle changes which column you are comparing against,
              so always say which convention you used.
            </p>
          </section>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Process sigma / DPMO"
              defaultPhase="measure"
            />
          ) : null}
        </>
      ) : null}

      {mode === 'rty' && rty ? (
        <>
          {rtyInterp ? (
            <InterpretBanner
              title={rtyInterp.title}
              plain={rtyInterp.plain}
              meta={rtyInterp.meta}
            >
              <NextStepCta
                label="Open Pareto for the weakest step"
                view="pareto"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>Rolled throughput yield</span>
              <strong>{fmt(rty.rtyPct, 2)}%</strong>
            </div>
            <div>
              <span>Steps</span>
              <strong>{rty.steps.length}</strong>
            </div>
            <div>
              <span>Normalized yield</span>
              <strong>{fmt(rty.normalizedYieldPct, 1)}%</strong>
            </div>
            <div>
              <span>Weakest step</span>
              <strong>{rty.weakest?.label || '—'}</strong>
            </div>
          </div>
          <section className="panel soft">
            <h3 className="subhead">Yield by step (red = weakest)</h3>
            <StepYieldBars
              steps={rty.steps.map((s) => ({
                label: s.label,
                yieldPct: s.yieldPct,
              }))}
              weakestLabel={rty.weakest?.label ?? null}
            />
            <p className="meta">
              Looking only at the last inspection would have told you{' '}
              {rty.finalStepYieldPct != null
                ? `${fmt(rty.finalStepYieldPct, 1)}%`
                : '—'}
              , while the honest end-to-end number is {fmt(rty.rtyPct, 1)}%.
            </p>
          </section>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Rolled throughput yield"
              defaultPhase="measure"
            />
          ) : null}
        </>
      ) : null}

      {mode === 'single' && !single ? (
        <p className="form-error">
          Need units greater than zero, defects of zero or more, and at least one
          opportunity per unit.
        </p>
      ) : null}
      {mode === 'rty' && !rty ? (
        <p className="form-error">
          Each step needs units greater than zero and bad units no larger than
          units in.
        </p>
      ) : null}
    </div>
  )
}
