import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import {
  InterpretBanner,
  NextStepCta,
} from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { BoxPlotChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset, listDatasets } from '../storage/datasets'
import { numericColumn, numericColumnNames } from '../stats/column'
import { fmt, mean, quartiles } from '../stats/descriptive'
import { interpretTTest } from '../stats/interpretations'
import { welchTTest } from '../stats/ttest'

export function BeforeAfterTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [datasetId, setDatasetId] = usePersistedState(
    'tool.beforeafter.dataset',
    '',
  )
  const [colBefore, setColBefore] = usePersistedState(
    'tool.beforeafter.before',
    '',
  )
  const [colAfter, setColAfter] = usePersistedState(
    'tool.beforeafter.after',
    '',
  )
  const [wantLower, setWantLower] = usePersistedState(
    'tool.beforeafter.wantLower',
    true,
  )

  const datasets = listDatasets()
  const dataset = datasetId ? getDataset(datasetId) : undefined
  const cols = dataset ? numericColumnNames(dataset.table) : []
  const before =
    dataset && colBefore ? numericColumn(dataset.table, colBefore) : []
  const after =
    dataset && colAfter ? numericColumn(dataset.table, colAfter) : []
  const result = useMemo(() => welchTTest(before, after), [before, after])
  const boxBefore = useMemo(() => quartiles(before), [before])
  const boxAfter = useMemo(() => quartiles(after), [after])
  const meanBefore = useMemo(() => mean(before), [before])
  const meanAfter = useMemo(() => mean(after), [after])

  const interp = useMemo(
    () =>
      result
        ? interpretTTest({
            pValue: result.pValue,
            meanDiff: result.meanDiff,
            ciLow: result.ciLow,
            ciHigh: result.ciHigh,
            labelA: colBefore || 'Before',
            labelB: colAfter || 'After',
          })
        : null,
    [result, colBefore, colAfter],
  )

  const significantWin = useMemo(() => {
    if (!result || meanBefore == null || meanAfter == null) return false
    if (result.pValue >= 0.05) return false
    return wantLower ? meanAfter < meanBefore : meanAfter > meanBefore
  }, [result, meanBefore, meanAfter, wantLower])

  const report: AnalysisReport | null = useMemo(() => {
    if (!result || !dataset || meanBefore == null || meanAfter == null) {
      return null
    }
    const significant = result.pValue < 0.05
    const improved = wantLower
      ? meanAfter < meanBefore
      : meanAfter > meanBefore
    const delta = meanAfter - meanBefore
    const pct =
      meanBefore !== 0 ? (Math.abs(delta) / Math.abs(meanBefore)) * 100 : null

    let summary: string
    if (significant && improved) {
      summary = `The after numbers look truly better — not just lucky noise (p = ${fmt(result.pValue, 4)}). Average moved from ${fmt(meanBefore)} to ${fmt(meanAfter)}.`
    } else if (significant && !improved) {
      summary = `There is a real difference (p = ${fmt(result.pValue, 4)}), but it moved the wrong way for your goal. Average went from ${fmt(meanBefore)} to ${fmt(meanAfter)}.`
    } else {
      summary = `We do not yet have strong proof the fix changed the average (p = ${fmt(result.pValue, 4)}). Gap might still be noise — collect more after data or check a bigger change.`
    }

    return {
      title: `Did the fix work? — ${colBefore} → ${colAfter}`,
      summary,
      bullets: [
        `Before average ${fmt(meanBefore)} (n=${result.n1}). After average ${fmt(meanAfter)} (n=${result.n2}).`,
        `Change (after − before) = ${fmt(delta)}${pct != null ? ` (~${fmt(pct, 1)}% of the before level)` : ''}. 95% CI for Before−After gap: ${fmt(result.ciLow)} to ${fmt(result.ciHigh)}.`,
        wantLower
          ? 'Goal set: lower is better (scrap, time, defects, weight overage…).'
          : 'Goal set: higher is better (yield, uptime, capability…).',
        significant && improved
          ? 'Next: pin this report, then run a control chart on the after stream so the gain stays.'
          : 'Next: if you expected a clear win, verify the change was actually implemented, or gather more after samples.',
        'Quote from Lean notes: Kaizen is continuous small improvements — prove each one with data before celebrating.',
      ],
      termsUsed: ['p-value', 'mean', '2-sample t-test', 'kaizen'],
    }
  }, [
    result,
    dataset,
    meanBefore,
    meanAfter,
    wantLower,
    colBefore,
    colAfter,
  ])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="beforeafter" />
      <section className="panel">
        <h2>Did the fix work?</h2>
        <p className="lede">
          Compare a Before column to an After column. Same idea as “are two
          groups different,” framed for improvement checks.
        </p>
        {!datasetId ? (
          <p className="meta">
            Need two numeric columns named like Before and After (or old vs new
            samples). Paste under Data, then pick both here.
          </p>
        ) : null}
        <label>
          Dataset
          <select
            value={datasetId}
            onChange={(e) => {
              const id = e.target.value
              setDatasetId(id)
              const names = getDataset(id)
                ? numericColumnNames(getDataset(id)!.table)
                : []
              setColBefore(names[0] ?? '')
              setColAfter(names[1] ?? names[0] ?? '')
            }}
          >
            <option value="">Select…</option>
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Before column
            <select
              value={colBefore}
              onChange={(e) => setColBefore(e.target.value)}
            >
              <option value="">Select…</option>
              {cols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            After column
            <select
              value={colAfter}
              onChange={(e) => setColAfter(e.target.value)}
            >
              <option value="">Select…</option>
              {cols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="goal-fieldset">
          <legend>What does “better” mean?</legend>
          <label className="check-item">
            <input
              type="radio"
              checked={wantLower}
              onChange={() => setWantLower(true)}
            />
            Lower is better (scrap, cycle time, defects…)
          </label>
          <label className="check-item">
            <input
              type="radio"
              checked={!wantLower}
              onChange={() => setWantLower(false)}
            />
            Higher is better (yield, uptime…)
          </label>
        </fieldset>
      </section>

      {result && boxBefore && boxAfter ? (
        <>
          {interp ? (
            <InterpretBanner
              title={interp.title}
              plain={interp.plain}
              meta={interp.meta}
            >
              {significantWin ? (
                <NextStepCta
                  label="Open I-MR on After"
                  view="imr"
                  onNavigate={onNavigate}
                />
              ) : null}
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>Before avg</span>
              <strong>{fmt(result.mean1)}</strong>
            </div>
            <div>
              <span>After avg</span>
              <strong>{fmt(result.mean2)}</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{fmt(result.pValue, 4)}</strong>
            </div>
          </div>
          <div className="chart-grid">
            <div>
              <h3 className="subhead">Before</h3>
              <BoxPlotChart box={boxBefore} />
            </div>
            <div>
              <h3 className="subhead">After</h3>
              <BoxPlotChart box={boxAfter} />
            </div>
          </div>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Before / After"
              defaultPhase="improve"
            />
          ) : null}
        </>
      ) : datasetId ? (
        <p className="form-error">
          Pick two numeric columns with at least 2 values each.
        </p>
      ) : null}
    </div>
  )
}
