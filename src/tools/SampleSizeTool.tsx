import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import { InterpretBanner, NextStepCta } from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { PowerCurveChart } from '../components/charts/PlanCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { fmt } from '../stats/descriptive'
import { interpretSampleSize } from '../stats/interpretations'
import {
  planSampleSize,
  powerCurve,
  type PlanInput,
  type PlanKind,
} from '../stats/sampleSize'

const MODES: { kind: PlanKind; label: string; hint: string }[] = [
  {
    kind: 'mean2',
    label: 'Two groups (measured)',
    hint: 'Oven A vs Oven B, old supplier vs new — you measure a number on each piece.',
  },
  {
    kind: 'meanPaired',
    label: 'Same parts before & after',
    hint: 'Each part is measured twice, so each one is its own control.',
  },
  {
    kind: 'prop1',
    label: 'One rate vs a target',
    hint: 'Scrap rate against a 2% goal — pass/fail counting.',
  },
  {
    kind: 'prop2',
    label: 'Two rates',
    hint: 'Shift 1 scrap rate vs Shift 2 scrap rate — pass/fail counting.',
  },
]

const CONFIDENCE_OPTIONS = [
  { alpha: 0.1, label: '90% confidence (α 0.10)' },
  { alpha: 0.05, label: '95% confidence (α 0.05) — usual' },
  { alpha: 0.01, label: '99% confidence (α 0.01)' },
]

const POWER_OPTIONS = [
  { power: 0.7, label: '70% chance to catch it' },
  { power: 0.8, label: '80% chance to catch it — usual' },
  { power: 0.9, label: '90% chance to catch it' },
  { power: 0.95, label: '95% chance to catch it' },
]

export function SampleSizeTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [kind, setKind] = usePersistedState<PlanKind>(
    'tool.samplesize.kind',
    'mean2',
  )
  const [alphaRaw, setAlphaRaw] = usePersistedState('tool.samplesize.alpha', '0.05')
  const [powerRaw, setPowerRaw] = usePersistedState('tool.samplesize.power', '0.8')
  const [twoSided, setTwoSided] = usePersistedState(
    'tool.samplesize.twoSided',
    true,
  )
  const [deltaRaw, setDeltaRaw] = usePersistedState('tool.samplesize.delta', '1')
  const [sigmaRaw, setSigmaRaw] = usePersistedState('tool.samplesize.sigma', '0.7')
  const [baselineRaw, setBaselineRaw] = usePersistedState(
    'tool.samplesize.baseline',
    '5',
  )
  const [targetRaw, setTargetRaw] = usePersistedState(
    'tool.samplesize.target',
    '2',
  )
  const [haveRaw, setHaveRaw] = usePersistedState('tool.samplesize.have', '')

  const isRate = kind === 'prop1' || kind === 'prop2'

  const input: PlanInput = useMemo(() => {
    const haveNum = haveRaw.trim() === '' ? null : Number(haveRaw)
    return {
      kind,
      alpha: Number(alphaRaw),
      power: Number(powerRaw),
      twoSided,
      delta: Number(deltaRaw),
      sigma: Number(sigmaRaw),
      baselinePct: Number(baselineRaw),
      targetPct: Number(targetRaw),
      haveN: haveNum != null && Number.isFinite(haveNum) ? haveNum : null,
    }
  }, [
    kind,
    alphaRaw,
    powerRaw,
    twoSided,
    deltaRaw,
    sigmaRaw,
    baselineRaw,
    targetRaw,
    haveRaw,
  ])

  const plan = useMemo(() => planSampleSize(input), [input])
  const curve = useMemo(
    () => (plan ? powerCurve(input, plan.nPerGroup) : []),
    [input, plan],
  )

  const interp = useMemo(
    () =>
      plan
        ? interpretSampleSize({
            label: plan.label,
            nPerGroup: plan.nPerGroup,
            groups: plan.groups,
            totalN: plan.totalN,
            unitLabel: plan.unitLabel,
            powerPct: plan.power * 100,
            alphaPct: plan.alpha * 100,
            effectSize: plan.effectSize,
            achievedPowerPct:
              plan.achievedPower != null ? plan.achievedPower * 100 : null,
            achievedN: plan.achievedN,
          })
        : null,
    [plan],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!plan) return null
    const setup = isRate
      ? `Today’s rate ${fmt(Number(baselineRaw), 2)}% vs the ${fmt(Number(targetRaw), 2)}% you want to be able to detect.`
      : `A gap of ${fmt(Number(deltaRaw))} against a usual spread (standard deviation) of ${fmt(Number(sigmaRaw))}.`
    return {
      title: `Sample size plan — ${plan.label}`,
      summary: `Collect ${plan.nPerGroup} ${plan.unitLabel}${plan.groups > 1 ? ` (${plan.totalN} total)` : ''} for a ${fmt(plan.power * 100, 0)}% chance of proving the difference, at ${fmt((1 - plan.alpha) * 100, 0)}% confidence. ${setup}`,
      bullets: [
        plan.detail,
        `Critical values used: z for the false-alarm risk = ${fmt(plan.zAlpha, 3)}${plan.twoSided ? ' (two-sided)' : ' (one-sided)'}; z for power = ${fmt(plan.zBeta, 3)}.`,
        plan.achievedPower != null && plan.achievedN != null
          ? `With the ${plan.achievedN} you already have, power is about ${fmt(plan.achievedPower * 100, 0)}% — meaning a ${fmt(100 - plan.achievedPower * 100, 0)}% chance of missing a real difference.`
          : 'Tip: enter the sample you already have to see how much power it actually gives you.',
        ...plan.warnings,
        'Write this number on the data collection plan and stick to it. Pick samples fairly (random or every Nth piece) so a big sample is not just a biased one.',
      ],
      termsUsed: [
        'sample size',
        'statistical power',
        'alpha',
        'effect size',
        'p-value',
        'sample',
      ],
    }
  }, [plan, isRate, baselineRaw, targetRaw, deltaRaw, sigmaRaw])

  function fillExample() {
    if (isRate) {
      setBaselineRaw('5')
      setTargetRaw('2')
      setHaveRaw('200')
    } else {
      setDeltaRaw('0.5')
      setSigmaRaw('0.35')
      setHaveRaw('5')
    }
    setAlphaRaw('0.05')
    setPowerRaw('0.8')
    setTwoSided(true)
  }

  const nextView: AppView = isRate ? 'proportions' : 'ttest'
  const nextLabel = isRate
    ? 'Open the rate comparison tool'
    : 'Open the two-group comparison'

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="samplesize" />
      <section className="panel">
        <h2>How many samples do I need?</h2>
        <p className="lede">
          Decide the count <em>before</em> you start measuring, so nobody has to
          argue about “a few more parts” later.
        </p>

        <div className="row actions">
          {MODES.map((m) => (
            <button
              key={m.kind}
              type="button"
              className={kind === m.kind ? 'btn primary' : 'btn secondary'}
              onClick={() => setKind(m.kind)}
            >
              {m.label}
            </button>
          ))}
          <button type="button" className="btn secondary" onClick={fillExample}>
            Fill example
          </button>
        </div>
        <p className="meta">
          {MODES.find((m) => m.kind === kind)?.hint}
        </p>

        <div className="form-grid">
          <label>
            How sure about false alarms?
            <select
              value={alphaRaw}
              onChange={(e) => setAlphaRaw(e.target.value)}
            >
              {CONFIDENCE_OPTIONS.map((o) => (
                <option key={o.alpha} value={String(o.alpha)}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            How sure you want to catch it (power)
            <select
              value={powerRaw}
              onChange={(e) => setPowerRaw(e.target.value)}
            >
              {POWER_OPTIONS.map((o) => (
                <option key={o.power} value={String(o.power)}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Which direction matters?
            <select
              value={twoSided ? 'two' : 'one'}
              onChange={(e) => setTwoSided(e.target.value === 'two')}
            >
              <option value="two">Either direction (safer default)</option>
              <option value="one">Only one direction</option>
            </select>
          </label>
        </div>

        {isRate ? (
          <div className="form-grid">
            <label>
              {kind === 'prop1' ? 'Target rate %' : 'Group 1 rate % (today)'}
              <input
                type="number"
                min={0.01}
                max={99.99}
                step="any"
                value={baselineRaw}
                onChange={(e) => setBaselineRaw(e.target.value)}
              />
            </label>
            <label>
              {kind === 'prop1'
                ? 'Rate you want to detect %'
                : 'Group 2 rate % (hoped for)'}
              <input
                type="number"
                min={0.01}
                max={99.99}
                step="any"
                value={targetRaw}
                onChange={(e) => setTargetRaw(e.target.value)}
              />
            </label>
            <label>
              Pieces you already have (optional)
              <input
                type="number"
                min={0}
                value={haveRaw}
                onChange={(e) => setHaveRaw(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className="form-grid">
            <label>
              Gap worth finding (in your units)
              <input
                type="number"
                min={0}
                step="any"
                value={deltaRaw}
                onChange={(e) => setDeltaRaw(e.target.value)}
              />
            </label>
            <label>
              {kind === 'meanPaired'
                ? 'Spread of the before/after differences'
                : 'Usual spread (standard deviation)'}
              <input
                type="number"
                min={0}
                step="any"
                value={sigmaRaw}
                onChange={(e) => setSigmaRaw(e.target.value)}
              />
            </label>
            <label>
              Pieces you already have (optional)
              <input
                type="number"
                min={0}
                value={haveRaw}
                onChange={(e) => setHaveRaw(e.target.value)}
              />
            </label>
          </div>
        )}

        <p className="meta">
          {isRate
            ? 'Rates are expensive to prove. If you can measure the feature (a dimension, a weight, a time) instead of just pass/fail, the same job usually needs a fraction of the pieces.'
            : 'No history? Use a quick 10–20 piece pilot to estimate the spread, or take the tolerance width divided by 6 as a rough stand-in.'}
        </p>
      </section>

      {plan ? (
        <>
          {interp ? (
            <InterpretBanner
              title={interp.title}
              plain={interp.plain}
              meta={interp.meta}
            >
              <NextStepCta
                label={nextLabel}
                view={nextView}
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}

          <div className="stat-strip">
            <div>
              <span>{plan.groups > 1 ? 'Per group' : 'Sample size'}</span>
              <strong>{plan.nPerGroup}</strong>
            </div>
            <div>
              <span>Total to collect</span>
              <strong>{plan.totalN}</strong>
            </div>
            <div>
              <span>{plan.effectSize != null ? 'Effect size' : 'Gap to detect'}</span>
              <strong>
                {plan.effectSize != null
                  ? fmt(plan.effectSize, 2)
                  : `${fmt(Math.abs(Number(baselineRaw) - Number(targetRaw)), 2)} pts`}
              </strong>
            </div>
            <div>
              <span>Power you asked for</span>
              <strong>{fmt(plan.power * 100, 0)}%</strong>
            </div>
          </div>

          {plan.warnings.length > 0 ? (
            <section className="panel soft note-warn">
              <h3 className="subhead">Before you commit</h3>
              <ul className="tip-list">
                {plan.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="chart-grid">
            <PowerCurveChart
              points={curve}
              targetN={plan.nPerGroup}
              targetPowerPct={plan.power * 100}
              unitLabel={plan.groups > 1 ? 'per group' : 'samples'}
            />
          </div>

          {report ? (
            <PlainReport
              report={report}
              sourceTool="Sample size / power"
              defaultPhase="measure"
            />
          ) : null}
        </>
      ) : (
        <p className="form-error">
          {isRate
            ? 'Enter two different rates, each between 0 and 100%.'
            : 'Enter a gap greater than zero and a spread greater than zero.'}
        </p>
      )}
    </div>
  )
}
