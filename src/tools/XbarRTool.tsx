import { useMemo } from 'react'
import { PlainReport } from '../components/PlainReport'
import { ControlChart } from '../components/charts/StatCharts'
import type { AnalysisReport, CellValue } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset, listDatasets } from '../storage/datasets'
import { fmt } from '../stats/descriptive'
import { computeXbarR } from '../stats/xbarR'

function rowToNumbers(row: CellValue[]): number[] {
  return row
    .map((c) => (typeof c === 'number' ? c : Number(c)))
    .filter((n) => Number.isFinite(n))
}

export function XbarRTool() {
  const [datasetId, setDatasetId] = usePersistedState('tool.xbarr.dataset', '')
  const datasets = listDatasets()
  const dataset = datasetId ? getDataset(datasetId) : undefined

  const result = useMemo(() => {
    if (!dataset) return null
    const subgroups = dataset.table.rows.map(rowToNumbers)
    return computeXbarR(subgroups)
  }, [dataset])

  const report: AnalysisReport | null = useMemo(() => {
    if (!result || !dataset) return null
    return {
      title: `X̄-R chart — ${dataset.name}`,
      summary:
        result.outX.length === 0 && result.outR.length === 0
          ? `With subgroup size ${result.n} and ${result.subgroupCount} subgroups, both X̄ and R look in control.`
          : `Flags found: ${result.outX.length} X̄ point(s) and ${result.outR.length} Range point(s) outside limits — investigate those subgroups.`,
      bullets: [
        `Overall average (X̄̄) = ${fmt(result.xBarBar)}. Average range (R̄) = ${fmt(result.rBar)}.`,
        `X̄ limits: UCL ${fmt(result.uclX)} · LCL ${fmt(result.lclX)}.`,
        `R limits: UCL ${fmt(result.uclR)} · LCL ${fmt(result.lclR)}.`,
        'Each spreadsheet row should be one subgroup (e.g. 5 pieces checked at the same time).',
        'Use this when your Excel is already batched; use I-MR when you have one long measurement column.',
      ],
      termsUsed: ['control limit', 'xbar-r', 'common cause', 'special cause'],
    }
  }, [result, dataset])

  return (
    <div className="tool-view">
      <section className="panel">
        <h2>X̄-R control chart</h2>
        <p className="lede">
          For data already in subgroups: each row = one sample group, columns =
          the pieces in that group (size 2–10).
        </p>
        <label htmlFor="xbarr-ds">Dataset</label>
        <select
          id="xbarr-ds"
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
        >
          <option value="">Select…</option>
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </section>

      {result ? (
        <>
          <div className="chart-grid">
            <ControlChart
              title="X̄ chart"
              caption="Average of each subgroup over time."
              points={result.xBars}
              center={result.xBarBar}
              ucl={result.uclX}
              lcl={result.lclX}
              outIndexes={result.outX}
            />
            <ControlChart
              title="R chart"
              caption="Range (max − min) inside each subgroup."
              points={result.ranges}
              center={result.rBar}
              ucl={result.uclR}
              lcl={result.lclR}
              outIndexes={result.outR}
            />
          </div>
          {report ? (
            <PlainReport report={report} sourceTool="Xbar-R" defaultPhase="measure" />
          ) : null}
        </>
      ) : datasetId ? (
        <p className="form-error">
          Need at least 2 subgroups with the same size (2–10 numbers per row).
        </p>
      ) : null}
    </div>
  )
}
