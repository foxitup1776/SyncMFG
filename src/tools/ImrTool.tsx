import { useMemo, useState } from 'react'
import { DatasetPicker } from '../components/DatasetPicker'
import { PlainReport } from '../components/PlainReport'
import { ControlChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { getDataset } from '../storage/datasets'
import { numericColumn } from '../stats/column'
import { fmt } from '../stats/descriptive'
import { computeImr } from '../stats/imr'

export function ImrTool() {
  const [datasetId, setDatasetId] = useState('')
  const [column, setColumn] = useState('')

  const dataset = datasetId ? getDataset(datasetId) : undefined
  const values = useMemo(
    () => (dataset && column ? numericColumn(dataset.table, column) : []),
    [dataset, column],
  )
  const imr = useMemo(() => computeImr(values), [values])

  const report: AnalysisReport | null = useMemo(() => {
    if (!imr || !dataset) return null
    const ooc = imr.outOfControlX.length
    return {
      title: `I-MR control chart — ${column}`,
      summary:
        ooc === 0
          ? `Using ${imr.values.length} points from “${dataset.name}”, the process looks stable on the Individuals chart — no points outside the control limits.`
          : `Using ${imr.values.length} points from “${dataset.name}”, ${ooc} point(s) sit outside the Individuals control limits. That usually means a special cause worth investigating, not just normal noise.`,
      bullets: [
        `Center line (average) = ${fmt(imr.xBar)}. Average moving range = ${fmt(imr.mrBar)}.`,
        `Individuals limits: UCL ${fmt(imr.uclX)} · LCL ${fmt(imr.lclX)} (from average ± 2.66 × average moving range).`,
        `Moving Range UCL = ${fmt(imr.uclMr)}. ${imr.outOfControlMr.length} moving-range point(s) above that limit.`,
        ooc === 0
          ? 'No Individuals points outside limits. You can move on to capability (Cp/Cpk) if you have customer specs.'
          : `Out-of-control Individuals at row order: ${imr.outOfControlX.map((i) => i + 1).join(', ')}. Look at what changed at those times (tooling, material, shift, method).`,
        'These control limits are the “voice of the process,” not the customer spec limits.',
      ],
      termsUsed: [
        'control limit',
        'common cause',
        'special cause',
        'moving range',
        'i-mr',
        'sample',
      ],
    }
  }, [imr, dataset, column])

  return (
    <div className="tool-view">
      <section className="panel">
        <h2>I-MR control chart</h2>
        <p className="lede">
          Best first stability check when you paste one measurement column from
          a large batch (not live auto-data).
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
              caption="Each point is one measurement. Red points are outside the calculated limits."
              points={imr.values}
              center={imr.xBar}
              ucl={imr.uclX}
              lcl={imr.lclX}
              outIndexes={imr.outOfControlX}
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
          {report ? <PlainReport report={report} /> : null}
        </>
      ) : datasetId && column ? (
        <p className="form-error">Need at least 2 numeric values for an I-MR chart.</p>
      ) : null}
    </div>
  )
}
