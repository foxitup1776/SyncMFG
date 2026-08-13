import { useMemo } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset, listDatasets } from '../storage/datasets'
import { numericColumn, numericColumnNames } from '../stats/column'
import { fmt } from '../stats/descriptive'
import { describeR2 } from '../stats/distributionShape'
import { simpleRegression } from '../stats/regression'

export function RegressionTool() {
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
        r2Reading.caution,
      ],
      termsUsed: ['r-squared', 'correlation', 'regression', 'slope'],
    }
  }, [result, dataset, xCol, yCol, r2Reading])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="regression" />
      <section className="panel">
        <h2>Does this input move with that result?</h2>
        <p className="lede">
          Pick an input and a result. We’ll show the scatter, a best-fit line, and
          how much of the result the input explains.
        </p>
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
          <section className="panel soft interpret-banner">
            <p className="guide-kicker">Chart interpretation</p>
            <h3>
              R² is {r2Reading.band} ({fmt(result.r2 * 100, 1)}%)
            </h3>
            <p>
              {r2Reading.relatedPlain
                .replace(/\bX\b/g, `“${xCol}”`)
                .replace(/\bY\b/g, `“${yCol}”`)}
            </p>
            <p className="meta">{r2Reading.caution}</p>
          </section>
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
