import { useMemo } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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
import { getDataset, listDatasets } from '../storage/datasets'
import { numericColumn, numericColumnNames } from '../stats/column'
import { fmt } from '../stats/descriptive'
import { describeR2 } from '../stats/distributionShape'
import { simpleRegression } from '../stats/regression'

export function RegressionTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [datasetId, setDatasetId] = usePersistedState('tool.reg.dataset', '')
  const [xCol, setXCol] = usePersistedState('tool.reg.x', '')
  const [yCol, setYCol] = usePersistedState('tool.reg.y', '')

  const datasets = listDatasets()
  const dataset = datasetId ? getDataset(datasetId) : undefined
  const cols = dataset ? numericColumnNames(dataset.table) : []
  const xs = dataset && xCol ? numericColumn(dataset.table, xCol) : []
  const ys = dataset && yCol ? numericColumn(dataset.table, yCol) : []
  const result = useMemo(() => simpleRegression(xs, ys), [xs, ys])

  const r2Reading = useMemo(
    () => (result ? describeR2(result.r2, result.r) : null),
    [result],
  )

  const highBand =
    r2Reading?.band === 'high' || r2Reading?.band === 'very high'
  const nWarn = result != null && result.n < 10

  const residualPoints = useMemo(
    () =>
      result
        ? result.points.map((p) => ({
            fitted: p.fitted,
            residual: p.residual,
          }))
        : [],
    [result],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!result || !dataset || !r2Reading) return null
    return {
      title: `Does this input move with that result? — ${xCol} → ${yCol}`,
      summary: r2Reading.relatedPlain.replace(/\bX\b/g, xCol).replace(/\bY\b/g, yCol),
      bullets: [
        `R² = ${fmt(result.r2, 3)} (${fmt(result.r2 * 100, 1)}%) is ${r2Reading.band}. Rule of thumb: ≥0.8 very high / related, ~0.3–0.6 moderate, under 0.1 very low / mostly unrelated.`,
        `Rule of thumb from the line: ${yCol} ≈ ${fmt(result.intercept)} + ${fmt(result.slope)} × ${xCol}. When ${xCol} goes up by 1, ${yCol} moves about ${fmt(result.slope)} on average.`,
        `Correlation r = ${fmt(result.r, 3)} — ${result.r >= 0 ? 'same direction' : 'opposite directions'}.`,
        `Based on ${result.n} paired rows from “${dataset.name}”.`,
        nWarn
          ? 'Warning: fewer than 10 paired points — a strong R² can still be luck. Collect more data before betting the process.'
          : r2Reading.caution,
      ],
      termsUsed: ['r-squared', 'correlation', 'regression', 'slope'],
    }
  }, [result, dataset, xCol, yCol, r2Reading, nWarn])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="regression" />
      <section className="panel">
        <h2>Does this input move with that result?</h2>
        <p className="lede">
          Pick an input and a result. We’ll show the scatter, a best-fit line, and
          how much of the result the input explains.
        </p>
        {!datasetId ? (
          <p className="meta">
            Need two paired numeric columns (X input and Y result) in the same
            rows. Paste under Data, then pick X and Y here.
          </p>
        ) : null}
        <div className="field-grid">
          <div>
            <label>Dataset</label>
            <select
              value={datasetId}
              onChange={(e) => {
                const id = e.target.value
                setDatasetId(id)
                const names = getDataset(id)
                  ? numericColumnNames(getDataset(id)!.table)
                  : []
                setXCol(names[0] ?? '')
                setYCol(names[1] ?? names[0] ?? '')
              }}
            >
              <option value="">Select…</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>X (input)</label>
            <select value={xCol} onChange={(e) => setXCol(e.target.value)}>
              {cols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Y (result)</label>
            <select value={yCol} onChange={(e) => setYCol(e.target.value)}>
              {cols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result && r2Reading ? (
        <>
          <InterpretBanner
            title={`R² is ${r2Reading.band} (${fmt(result.r2 * 100, 1)}%)`}
            plain={r2Reading.relatedPlain
              .replace(/\bX\b/g, `“${xCol}”`)
              .replace(/\bY\b/g, `“${yCol}”`)}
            meta={
              nWarn
                ? `Fewer than 10 points (n=${result.n}) — treat a strong R² with caution until you collect more paired rows. ${r2Reading.caution}`
                : r2Reading.caution
            }
          >
            {highBand ? (
              <>
                <p className="meta">
                  Pin this report and verify the cause on the floor — correlation
                  is not automatic proof of a fix.
                </p>
                <NextStepCta
                  label="Pin + verify cause"
                  view="projects"
                  onNavigate={onNavigate}
                />
              </>
            ) : null}
          </InterpretBanner>
          <div className="chart-card">
            <h3>Scatter with fit line</h3>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={result.points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                  <XAxis dataKey="x" name={xCol} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Scatter dataKey="y" fill="#2f6f6a" name={yCol} />
                  <Line
                    type="linear"
                    dataKey="fitted"
                    stroke="#1a3a3a"
                    dot={false}
                    name="Fit"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <h3>Residuals vs fitted</h3>
            <p className="chart-caption">
              Scatter of leftover error (Y − fit) against the fitted value —
              look for fan shapes or curves that say the straight line is a poor
              model.
            </p>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart data={residualPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                  <XAxis
                    dataKey="fitted"
                    name="Fitted"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="residual"
                    name="Residual"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Scatter dataKey="residual" fill="#3d5a80" name="Residual" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="stat-strip">
            <div>
              <span>Slope</span>
              <strong>{fmt(result.slope)}</strong>
            </div>
            <div>
              <span>Intercept</span>
              <strong>{fmt(result.intercept)}</strong>
            </div>
            <div>
              <span>r</span>
              <strong>{fmt(result.r)}</strong>
            </div>
            <div>
              <span>R²</span>
              <strong>{fmt(result.r2)}</strong>
            </div>
          </div>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Regression"
              defaultPhase="analyze"
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
