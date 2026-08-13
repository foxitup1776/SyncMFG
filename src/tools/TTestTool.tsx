import { useMemo } from 'react'
import { DatasetPicker } from '../components/DatasetPicker'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
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
      title: `Are these two groups really different? — ${colA} vs ${colB}`,
      summary: significant
        ? `“${colA}” and “${colB}” look truly different — not just lucky noise. Chance of seeing a gap this big if nothing real changed: ${fmt(result.pValue, 4)} (under the usual 0.05 cut).`
        : `We do not yet have strong proof that “${colA}” and “${colB}” truly differ. Chance this gap is just luck: ${fmt(result.pValue, 4)} (above 0.05).`,
      bullets: [
        `Average ${colA} = ${fmt(result.mean1)} (${result.n1} values). Average ${colB} = ${fmt(result.mean2)} (${result.n2} values).`,
        `Gap (A minus B) = ${fmt(result.meanDiff)}.`,
        `The math score behind this (t-statistic) is ${fmt(result.t, 3)}.`,
        significant
          ? 'Plain takeaway: treat this as a real difference and dig into why.'
          : 'Plain takeaway: the gap might still be noise — collect more data or look for a bigger difference.',
      ],
      termsUsed: ['p-value', 'mean', 'standard deviation', '2-sample t-test'],
    }
  }, [result, dataset, colA, colB])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="ttest" />
      <section className="panel">
        <h2>Are these two groups really different?</h2>
        <p className="lede">
          Pick two columns (Oven A vs Oven B, Shift 1 vs Shift 2). We’ll tell you
          if the gap looks real or like luck.
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
          {report ? (
            <PlainReport report={report} sourceTool="t-test" defaultPhase="analyze" />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
