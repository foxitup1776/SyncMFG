import { useMemo } from 'react'
import { DatasetPicker } from '../components/DatasetPicker'
import { PlainReport } from '../components/PlainReport'
import {
  BoxPlotChart,
  HistogramChart,
  RunChart,
} from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset } from '../storage/datasets'
import { numericColumn } from '../stats/column'
import {
  fmt,
  histogramBins,
  mean,
  median,
  quartiles,
  sampleStdDev,
} from '../stats/descriptive'

export function VisualTool() {
  const [datasetId, setDatasetId] = usePersistedState('tool.visual.dataset', '')
  const [column, setColumn] = usePersistedState('tool.visual.column', '')

  const dataset = datasetId ? getDataset(datasetId) : undefined
  const values = useMemo(
    () => (dataset && column ? numericColumn(dataset.table, column) : []),
    [dataset, column],
  )

  const box = useMemo(() => quartiles(values), [values])
  const bins = useMemo(() => histogramBins(values), [values])

  const report: AnalysisReport | null = useMemo(() => {
    if (values.length < 2 || !box || !dataset) return null
    const m = mean(values)
    const med = median(values)
    const s = sampleStdDev(values)
    return {
      title: `Visual look — ${column}`,
      summary: `We plotted ${values.length} numbers from “${dataset.name}”, column “${column}”. The histogram shows the shape, the box plot shows the middle and outliers, and the run chart shows order.`,
      bullets: [
        `Average (mean) = ${fmt(m)}. Middle value (median) = ${fmt(med)}.`,
        `Spread (standard deviation) = ${fmt(s)}. Middle half of the data sits between ${fmt(box.q1)} and ${fmt(box.q3)}.`,
        box.outliers.length === 0
          ? 'No strong outliers showed up on the box plot.'
          : `We flagged ${box.outliers.length} outlier point(s) outside the whiskers: ${box.outliers
              .slice(0, 8)
              .map((v) => fmt(v))
              .join(', ')}${box.outliers.length > 8 ? '…' : ''}.`,
        'Next step if the shape looks unstable over time: run an I-MR control chart on the same column.',
      ],
      termsUsed: ['mean', 'median', 'standard deviation', 'histogram', 'box plot', 'run chart', 'outlier'],
    }
  }, [values, box, dataset, column])

  return (
    <div className="tool-view">
      <section className="panel">
        <h2>Histogram, box plot & run chart</h2>
        <p className="lede">
          First look at one measurement column — shape, middle, outliers, and
          order.
        </p>
        <DatasetPicker
          datasetId={datasetId}
          column={column}
          onChange={({ datasetId: id, column: col }) => {
            setDatasetId(id)
            setColumn(col)
          }}
        />
      </section>

      {values.length >= 2 && box ? (
        <>
          <div className="chart-grid">
            <HistogramChart bins={bins} />
            <BoxPlotChart box={box} />
            <RunChart values={values} />
          </div>
          {report ? <PlainReport report={report} /> : null}
        </>
      ) : datasetId && column ? (
        <p className="form-error">Need at least 2 numeric values in that column.</p>
      ) : null}
    </div>
  )
}
