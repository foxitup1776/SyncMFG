import { useMemo } from 'react'
import { DatasetPicker } from '../components/DatasetPicker'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { ControlChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset } from '../storage/datasets'
import { numericColumn } from '../stats/column'
import { fmt } from '../stats/descriptive'
import { computeImr } from '../stats/imr'
import { westernElectricHits } from '../stats/westernElectric'

export function ImrTool() {
  const [datasetId, setDatasetId] = usePersistedState('tool.imr.dataset', '')
  const [column, setColumn] = usePersistedState('tool.imr.column', '')

  const dataset = datasetId ? getDataset(datasetId) : undefined
  const values = useMemo(
    () => (dataset && column ? numericColumn(dataset.table, column) : []),
    [dataset, column],
  )
  const imr = useMemo(() => computeImr(values), [values])
  const we = useMemo(
    () =>
      imr
        ? westernElectricHits(imr.values, imr.xBar, imr.uclX, imr.lclX)
        : [],
    [imr],
  )

  const flagged = useMemo(() => {
    if (!imr) return []
    const set = new Set<number>([
      ...imr.outOfControlX,
      ...we.flatMap((h) => h.indexes),
    ])
    return [...set]
  }, [imr, we])

  const report: AnalysisReport | null = useMemo(() => {
    if (!imr || !dataset) return null
    return {
      title: `I-MR control chart — ${column}`,
      summary:
        we.length === 0
          ? `Using ${imr.values.length} points from “${dataset.name}”, no Western Electric alarms fired. The process looks stable on these rules.`
          : `Using ${imr.values.length} points from “${dataset.name}”, ${we.length} Western Electric rule(s) fired. Treat those as special-cause clues.`,
      bullets: [
        `Center line (average) = ${fmt(imr.xBar)}. Average moving range = ${fmt(imr.mrBar)}.`,
        `Individuals limits: UCL ${fmt(imr.uclX)} · LCL ${fmt(imr.lclX)}.`,
        `Moving Range UCL = ${fmt(imr.uclMr)}. ${imr.outOfControlMr.length} MR point(s) above that limit.`,
        ...we.map(
          (h) =>
            `${h.rule}: ${h.plain} Points (order): ${h.indexes
              .map((i) => i + 1)
              .join(', ')}.`,
        ),
        we.length === 0
          ? 'You can move on to capability (Cp/Cpk) if you have customer specs.'
          : 'Look at what changed near the flagged points (tooling, material, shift, method).',
        'Control limits are the voice of the process — not the customer spec limits.',
      ],
      termsUsed: [
        'control limit',
        'common cause',
        'special cause',
        'moving range',
        'i-mr',
        'western electric',
        'sample',
      ],
    }
  }, [imr, dataset, column, we])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="imr" />
      <section className="panel">
        <h2>Is this process stable?</h2>
        <p className="lede">
          Stability check for one measurement column, including run-rule alarms
          (not only points outside limits).
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

      {imr ? (
        <>
          <div className="chart-grid">
            <ControlChart
              title="Individuals (I) chart"
              caption="Red points = outside limits or Western Electric alarms."
              points={imr.values}
              center={imr.xBar}
              ucl={imr.uclX}
              lcl={imr.lclX}
              outIndexes={flagged}
            />
            <ControlChart
              title="Moving Range (MR) chart"
              caption="Each point is the absolute change from the previous measurement."
              points={imr.movingRanges}
              center={imr.mrBar}
              ucl={imr.uclMr}
              lcl={imr.lclMr}
              outIndexes={imr.outOfControlMr}
            />
          </div>
          {report ? (
            <PlainReport report={report} sourceTool="I-MR" defaultPhase="measure" />
          ) : null}
        </>
      ) : datasetId && column ? (
        <p className="form-error">Need at least 2 numeric values for an I-MR chart.</p>
      ) : null}
    </div>
  )
}
