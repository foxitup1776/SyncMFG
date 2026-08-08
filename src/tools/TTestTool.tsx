import { useMemo } from 'react'
import { DatasetPicker } from '../components/DatasetPicker'
import { PlainReport } from '../components/PlainReport'
import { BoxPlotChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset } from '../storage/datasets'
import { numericColumn, numericColumnNames } from '../stats/column'
import { fmt, quartiles } from '../stats/descriptive'
import { welchTTest } from '../stats/ttest'

export function TTestTool() {
  const [datasetId, setDatasetId] = usePersistedState('tool.ttest.dataset', '')
  const [colA, setColA] = usePersistedState('tool.ttest.a', '')
  const [colB, setColB] = usePersistedState('tool.ttest.b', '')

  const dataset = datasetId ? getDataset(datasetId) : undefined
  const cols = dataset ? numericColumnNames(dataset.table) : []
  const a = dataset && colA ? numericColumn(dataset.table, colA) : []
  const b = dataset && colB ? numericColumn(dataset.table, colB) : []
  const result = useMemo(() => welchTTest(a, b), [a, b])
  const boxA = useMemo(() => quartiles(a), [a])
  const boxB = useMemo(() => quartiles(b), [b])

  const report: AnalysisReport | null = useMemo(() => {
    if (!result || !dataset) return null
    const significant = result.pValue < 0.05
    return {
      title: `2-sample t-test — ${colA} vs ${colB}`,
      summary: significant
        ? `The difference between “${colA}” and “${colB}” looks real (not just luck). p-value = ${fmt(result.pValue, 4)}.`
        : `We do not have strong evidence that “${colA}” and “${colB}” truly differ. p-value = ${fmt(result.pValue, 4)} (above the usual 0.05 cut).`,
      bullets: [
        `Average ${colA} = ${fmt(result.mean1)} (n=${result.n1}). Average ${colB} = ${fmt(result.mean2)} (n=${result.n2}).`,
        `Difference (A − B) = ${fmt(result.meanDiff)}.`,
        `t = ${fmt(result.t, 3)}, degrees of freedom ≈ ${fmt(result.df, 1)}.`,
        significant
          ? 'In Six Sigma work, p < 0.05 usually means “act like this difference is real.”'
          : 'The averages may look different, but the spread and sample size say it could still be noise.',
      ],
      termsUsed: ['p-value', 'mean', 'standard deviation', '2-sample t-test'],
    }
  }, [result, dataset, colA, colB])

  return (
    <div className="tool-view">
      <section className="panel">
        <h2>2-sample t-test</h2>
        <p className="lede">
          Compare two numeric columns (e.g. Oven A vs Oven B) and ask if the
          difference is real.
        </p>
        <DatasetPicker
          datasetId={datasetId}
          column={colA}
          onChange={({ datasetId: id, column }) => {
            setDatasetId(id)
            setColA(column)
            const names = getDataset(id)
              ? numericColumnNames(getDataset(id)!.table)
              : []
            setColB(names.find((n) => n !== column) ?? names[1] ?? '')
          }}
        />
        <div className="field-grid">
          <div>
            <label htmlFor="col-b">Second column</label>
            <select
              id="col-b"
              value={colB}
              onChange={(e) => setColB(e.target.value)}
            >
              {cols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result && boxA && boxB ? (
        <>
          <div className="chart-grid">
            <BoxPlotChart box={boxA} />
            <BoxPlotChart box={boxB} />
          </div>
          <div className="stat-strip">
            <div>
              <span>Mean A</span>
              <strong>{fmt(result.mean1)}</strong>
            </div>
            <div>
              <span>Mean B</span>
              <strong>{fmt(result.mean2)}</strong>
            </div>
            <div>
              <span>t</span>
              <strong>{fmt(result.t)}</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{fmt(result.pValue, 4)}</strong>
            </div>
          </div>
          {report ? <PlainReport report={report} /> : null}
        </>
      ) : null}
    </div>
  )
}
