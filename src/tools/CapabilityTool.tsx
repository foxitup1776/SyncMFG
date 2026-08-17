import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import { DatasetPicker } from '../components/DatasetPicker'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { HistogramChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset } from '../storage/datasets'
import { numericColumn } from '../stats/column'
import { computeCapability } from '../stats/capability'
import { fmt, histogramBins } from '../stats/descriptive'
import { readDistributionShape } from '../stats/distributionShape'

function parseOptional(raw: string): number | null {
  const t = raw.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function CapabilityTool({
  onNavigate: _onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [datasetId, setDatasetId] = usePersistedState('tool.cap.dataset', '')
  const [column, setColumn] = usePersistedState('tool.cap.column', '')
  const [uslRaw, setUslRaw] = usePersistedState('tool.cap.usl', '')
  const [lslRaw, setLslRaw] = usePersistedState('tool.cap.lsl', '')

  const dataset = datasetId ? getDataset(datasetId) : undefined
  const values = useMemo(
    () => (dataset && column ? numericColumn(dataset.table, column) : []),
    [dataset, column],
  )
  const usl = parseOptional(uslRaw)
  const lsl = parseOptional(lslRaw)
  const result = useMemo(
    () => computeCapability(values, usl, lsl),
    [values, usl, lsl],
  )
  const bins = useMemo(() => histogramBins(values), [values])
  const shape = useMemo(() => readDistributionShape(values), [values])

  const report: AnalysisReport | null = useMemo(() => {
    if (!result || !dataset) return null
    const shapeLine = shape
      ? `Distribution shape: ${shape.label}. ${shape.plain}`
      : null
    if (usl === null && lsl === null) {
      return {
        title: `Capability — ${column}`,
        summary:
          'Enter at least one customer limit (USL and/or LSL) to score capability.',
        bullets: [
          `We have ${result.n} values. Average = ${fmt(result.average)}, overall spread σ = ${fmt(result.stdOverall)}.`,
          ...(shapeLine ? [shapeLine] : []),
        ],
        termsUsed: [
          'cpk',
          'specification limit',
          'standard deviation',
          'distribution shape',
        ],
      }
    }

    const cpk = result.cpk
    const verdict =
      cpk === null
        ? 'We could not compute Cpk with the limits provided.'
        : cpk >= 1.33
          ? `Cpk = ${fmt(cpk)} — generally considered capable in many plants (target often ≥ 1.33).`
          : cpk >= 1
            ? `Cpk = ${fmt(cpk)} — barely fits; expect some risk of defects.`
            : `Cpk = ${fmt(cpk)} — not capable against these customer limits. Center the process or reduce spread.`

    return {
      title: `Process capability — ${column}`,
      summary: `Compared “${dataset.name}” column “${column}” to your customer limits. ${verdict}`,
      bullets: [
        `Average = ${fmt(result.average)}. Within-subgroup σ (from moving range) = ${fmt(result.stdWithin)}. Overall σ = ${fmt(result.stdOverall)}.`,
        ...(shapeLine ? [shapeLine] : []),
        `Short-term: Cp = ${fmt(result.cp)}, Cpk = ${fmt(result.cpk)}.`,
        `Long-term feel: Pp = ${fmt(result.pp)}, Ppk = ${fmt(result.ppk)}.`,
        lsl !== null
          ? `${fmt(result.pctBelowLsl, 2)}% of pasted points sit below LSL ${fmt(lsl)}.`
          : 'No lower spec (LSL) entered.',
        usl !== null
          ? `${fmt(result.pctAboveUsl, 2)}% of pasted points sit above USL ${fmt(usl)}.`
          : 'No upper spec (USL) entered.',
        'Cp/Cpk use short-term (within) variation; Pp/Ppk use the overall spread of this whole pasted batch. If the shape is two-humped, split the data before trusting Cpk.',
      ],
      termsUsed: [
        'cp',
        'cpk',
        'pp',
        'ppk',
        'specification limit',
        'standard deviation',
        'distribution shape',
      ],
    }
  }, [result, dataset, column, usl, lsl, shape])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="capability" />
      <section className="panel">
        <h2>Can we hit the customer limits?</h2>
        <p className="lede">
          After the process looks stable, ask: can it hit the customer’s allowed
          range?
        </p>
        <DatasetPicker
          datasetId={datasetId}
          column={column}
          onChange={({ datasetId: id, column: col }) => {
            setDatasetId(id)
            setColumn(col)
          }}
        />
        <div className="field-grid">
          <div>
            <label htmlFor="lsl">Lower spec (LSL)</label>
            <input
              id="lsl"
              inputMode="decimal"
              placeholder="e.g. 48"
              value={lslRaw}
              onChange={(e) => setLslRaw(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="usl">Upper spec (USL)</label>
            <input
              id="usl"
              inputMode="decimal"
              placeholder="e.g. 52"
              value={uslRaw}
              onChange={(e) => setUslRaw(e.target.value)}
            />
          </div>
        </div>
      </section>

      {result && values.length >= 2 ? (
        <>
          {shape ? (
            <section className="panel soft interpret-banner">
              <p className="guide-kicker">Chart interpretation</p>
              <h3>{shape.label}</h3>
              <p>{shape.plain}</p>
            </section>
          ) : null}
          <HistogramChart bins={bins} usl={usl} lsl={lsl} />
          <div className="stat-strip">
            <div>
              <span>Cp</span>
              <strong>{fmt(result.cp)}</strong>
            </div>
            <div>
              <span>Cpk</span>
              <strong>{fmt(result.cpk)}</strong>
            </div>
            <div>
              <span>Pp</span>
              <strong>{fmt(result.pp)}</strong>
            </div>
            <div>
              <span>Ppk</span>
              <strong>{fmt(result.ppk)}</strong>
            </div>
          </div>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Capability"
              defaultPhase="measure"
            />
          ) : null}
        </>
      ) : datasetId && column ? (
        <p className="form-error">Need at least 2 numeric values.</p>
      ) : null}
    </div>
  )
}
