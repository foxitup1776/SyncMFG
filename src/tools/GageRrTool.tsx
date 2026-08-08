import { useMemo } from 'react'
import { PlainReport } from '../components/PlainReport'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset, listDatasets } from '../storage/datasets'
import { fmt } from '../stats/descriptive'
import { computeGageRr } from '../stats/gageRr'

export function GageRrTool() {
  const [datasetId, setDatasetId] = usePersistedState('tool.gage.dataset', '')
  const [partCol, setPartCol] = usePersistedState('tool.gage.part', 'Part')
  const [opCol, setOpCol] = usePersistedState('tool.gage.op', 'Operator')
  const [valCol, setValCol] = usePersistedState('tool.gage.val', 'Measurement')

  const datasets = listDatasets()
  const dataset = datasetId ? getDataset(datasetId) : undefined
  const headers = dataset?.table.headers ?? []

  const result = useMemo(() => {
    if (!dataset) return null
    const pi = dataset.table.headers.indexOf(partCol)
    const oi = dataset.table.headers.indexOf(opCol)
    const vi = dataset.table.headers.indexOf(valCol)
    if (pi < 0 || oi < 0 || vi < 0) return null
    const rows = dataset.table.rows
      .map((r) => ({
        part: String(r[pi] ?? ''),
        operator: String(r[oi] ?? ''),
        value: typeof r[vi] === 'number' ? (r[vi] as number) : Number(r[vi]),
      }))
      .filter((r) => r.part && r.operator && Number.isFinite(r.value))
    return computeGageRr(rows)
  }, [dataset, partCol, opCol, valCol])

  const report: AnalysisReport | null = useMemo(() => {
    if (!result || !dataset) return null
    return {
      title: `Gage R&R — ${dataset.name}`,
      summary: `${result.verdict} Measurement system noise is about ${fmt(result.pctGage, 1)}% of total variation.`,
      bullets: [
        `Study shape: ${result.parts} parts × ${result.operators} operators (up to ${result.trials} repeats).`,
        `Repeatability (same person, same part) σ ≈ ${fmt(result.sigmaRepeatability)}.`,
        `Reproducibility (person-to-person) σ ≈ ${fmt(result.sigmaReproducibility)}.`,
        `Combined gage σ ≈ ${fmt(result.sigmaGage)} (${fmt(result.pctGage, 1)}% of total). Part-to-part ≈ ${fmt(result.pctPart, 1)}%.`,
        'Rule of thumb: under 10% is excellent, under 30% often OK, over 30% fix the measurement method before trusting process data.',
      ],
      termsUsed: ['gage rr', 'repeatability', 'reproducibility'],
    }
  }, [result, dataset])

  return (
    <div className="tool-view">
      <section className="panel">
        <h2>Gage R&R (lite)</h2>
        <p className="lede">
          Need columns for Part, Operator, and Measurement (repeat rows for
          repeats). Asks: is the gage trustworthy?
        </p>
        <div className="field-grid">
          <div>
            <label>Dataset</label>
            <select
              value={datasetId}
              onChange={(e) => {
                const id = e.target.value
                setDatasetId(id)
                const h = getDataset(id)?.table.headers ?? []
                setPartCol(h.find((x) => /part/i.test(x)) ?? h[0] ?? '')
                setOpCol(h.find((x) => /op|operator|appraiser/i.test(x)) ?? h[1] ?? '')
                setValCol(
                  h.find((x) => /meas|value|reading/i.test(x)) ?? h[2] ?? '',
                )
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
            <label>Part column</label>
            <select value={partCol} onChange={(e) => setPartCol(e.target.value)}>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Operator column</label>
            <select value={opCol} onChange={(e) => setOpCol(e.target.value)}>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Measurement column</label>
            <select value={valCol} onChange={(e) => setValCol(e.target.value)}>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result ? (
        <>
          <div className="stat-strip">
            <div>
              <span>% Gage</span>
              <strong>{fmt(result.pctGage, 1)}%</strong>
            </div>
            <div>
              <span>% Part</span>
              <strong>{fmt(result.pctPart, 1)}%</strong>
            </div>
            <div>
              <span>σ Repeat</span>
              <strong>{fmt(result.sigmaRepeatability)}</strong>
            </div>
            <div>
              <span>σ Repro</span>
              <strong>{fmt(result.sigmaReproducibility)}</strong>
            </div>
          </div>
          {report ? (
            <PlainReport report={report} sourceTool="Gage R&R" defaultPhase="measure" />
          ) : null}
        </>
      ) : datasetId ? (
        <p className="form-error">
          Need at least 2 parts, 2 operators, and repeat measurements per cell.
        </p>
      ) : null}
    </div>
  )
}
