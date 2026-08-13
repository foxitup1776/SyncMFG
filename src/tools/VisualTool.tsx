import { useMemo } from 'react'
import { DatasetPicker } from '../components/DatasetPicker'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
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
import { readDistributionShape } from '../stats/distributionShape'

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

  const shape = useMemo(() => readDistributionShape(values), [values])

  const report: AnalysisReport | null = useMemo(() => {
    if (values.length < 2 || !box || !dataset) return null
    const m = mean(values)
    const med = median(values)
    const s = sampleStdDev(values)
    const range = Math.max(...values) - Math.min(...values)
    return {
      title: `Visual look — ${column}`,
      summary: shape
        ? `Shape reading: ${shape.label}. ${shape.plain}`
        : `We plotted ${values.length} numbers from “${dataset.name}”, column “${column}”.`,
      bullets: [
        `Dataset “${dataset.name}”, column “${column}” — ${values.length} values. Average = ${fmt(m)}, median = ${fmt(med)}, spread (std. dev.) = ${fmt(s)}.`,
        `What the numbers cover: lowest ${fmt(Math.min(...values))}, highest ${fmt(Math.max(...values))} (range ${fmt(range)}). Middle half sits between ${fmt(box.q1)} and ${fmt(box.q3)}.`,
        shape
          ? `Distribution: ${shape.label}. ${shape.skewHint}`
          : 'Need a few more points to guess the distribution shape.',
        m != null && med != null && Math.abs(m - med) > (s ?? 0) * 0.25
          ? 'Average and middle disagree a bit — prefer the median as “typical” until you clean outliers or split mixed groups.'
          : 'Average and median are in the same ballpark — a single “typical” value is reasonable.',
        box.outliers.length === 0
          ? 'No strong outliers on the box plot.'
          : `Outliers flagged: ${box.outliers
              .slice(0, 8)
              .map((v) => fmt(v))
              .join(', ')}${box.outliers.length > 8 ? '…' : ''}. Investigate those before changing the whole process.`,
        'Histogram = photo of the pile. Box plot = middle 50% + whiskers. Run chart = movie in time order — next use I-MR if the movie looks jumpy.',
      ],
      termsUsed: [
        'mean',
        'median',
        'standard deviation',
        'histogram',
        'box plot',
        'run chart',
        'outlier',
        'distribution shape',
      ],
    }
  }, [values, box, dataset, column, shape])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="visual" />
      <section className="panel">
        <h2>See the shape of my data</h2>
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
          {shape ? (
            <section className="panel soft interpret-banner">
              <p className="guide-kicker">Chart interpretation</p>
              <h3>{shape.label}</h3>
              <p>{shape.plain}</p>
              <p className="meta">{shape.skewHint}</p>
            </section>
          ) : null}
          <div className="chart-grid">
            <HistogramChart bins={bins} />
            <BoxPlotChart box={box} />
            <RunChart values={values} />
          </div>
          {report ? (
            <PlainReport report={report} sourceTool="Visual" defaultPhase="measure" />
          ) : null}
        </>
      ) : datasetId && column ? (
        <p className="form-error">Need at least 2 numeric values in that column.</p>
      ) : null}
    </div>
  )
}
