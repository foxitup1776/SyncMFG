import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AppView } from '../components/AppShell'
import {
  InterpretBanner,
  NextStepCta,
} from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset, listDatasets } from '../storage/datasets'
import { fmt } from '../stats/descriptive'
import { interpretPareto } from '../stats/interpretations'
import { buildPareto } from '../stats/pareto'

export function ParetoTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [datasetId, setDatasetId] = usePersistedState('tool.pareto.dataset', '')
  const [labelCol, setLabelCol] = usePersistedState('tool.pareto.label', '')
  const [countCol, setCountCol] = usePersistedState('tool.pareto.count', '')

  const datasets = listDatasets()
  const dataset = datasetId ? getDataset(datasetId) : undefined
  const headers = dataset?.table.headers ?? []

  const items = useMemo(() => {
    if (!dataset || !labelCol) return []
    const li = dataset.table.headers.indexOf(labelCol)
    const ci = countCol ? dataset.table.headers.indexOf(countCol) : -1
    if (li < 0) return []
    const labels = dataset.table.rows.map((r) => String(r[li] ?? ''))
    const counts =
      ci >= 0
        ? dataset.table.rows.map((r) =>
            typeof r[ci] === 'number' ? (r[ci] as number) : Number(r[ci]) || 0,
          )
        : undefined
    return buildPareto(labels, counts)
  }, [dataset, labelCol, countCol])

  const vital = items.find((i) => i.cumPct >= 80) ?? items[items.length - 1]
  const vitalCount = items.filter((i) => i.cumPct <= 80).length || 1

  const interp = useMemo(() => {
    if (items.length === 0) return null
    return interpretPareto({
      topLabel: items[0].label,
      topPct: items[0].pct,
      vitalCount,
      cumAtVital: vital?.cumPct ?? items[items.length - 1].cumPct,
    })
  }, [items, vitalCount, vital])

  const report: AnalysisReport | null = useMemo(() => {
    if (!dataset || items.length === 0) return null
    return {
      title: `Pareto — ${dataset.name}`,
      summary: `We ranked causes from “${dataset.name}”. The tallest bars are your vital few — fix those first for the biggest payoff.`,
      bullets: [
        `Top cause: “${items[0].label}” with ${fmt(items[0].count, 0)} (${fmt(items[0].pct, 1)}% of the total).`,
        vital
          ? `About ${vitalCount} cause(s) cover ~80% of the problem (classic Pareto / 80-20 idea).`
          : 'Not enough categories to mark an 80% cut.',
        `Cumulative share after the top 3: ${fmt(items[Math.min(2, items.length - 1)].cumPct, 1)}%.`,
        'Next: dig into the top bar with a fishbone or process walk before chasing the long tail.',
      ],
      termsUsed: ['pareto', 'vital few'],
    }
  }, [dataset, items, vital, vitalCount])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="pareto" />
      <section className="panel">
        <h2>What are the biggest few problems?</h2>
        <p className="lede">
          Find the vital few defects or delays. Use a category column, and
          optionally a count column.
        </p>
        {!datasetId ? (
          <p className="meta">
            Need a category column (defect type, delay reason) and optionally a
            count column. Or one column of repeated labels — we count frequency.
          </p>
        ) : null}
        <div className="field-grid">
          <div>
            <label htmlFor="pareto-ds">Dataset</label>
            <select
              id="pareto-ds"
              value={datasetId}
              onChange={(e) => {
                setDatasetId(e.target.value)
                const ds = getDataset(e.target.value)
                setLabelCol(ds?.table.headers[0] ?? '')
                setCountCol(ds?.table.headers[1] ?? '')
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
            <label htmlFor="pareto-label">Category column</label>
            <select
              id="pareto-label"
              value={labelCol}
              onChange={(e) => setLabelCol(e.target.value)}
            >
              <option value="">Select…</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pareto-count">Count column (optional)</label>
            <select
              id="pareto-count"
              value={countCol}
              onChange={(e) => setCountCol(e.target.value)}
            >
              <option value="">Frequency of categories</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {items.length > 0 ? (
        <>
          {interp ? (
            <InterpretBanner
              title={interp.title}
              plain={interp.plain}
              meta={interp.meta}
            >
              <NextStepCta
                label="Open Fishbone for top bar"
                view="fishbone"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="chart-card">
            <h3>Pareto</h3>
            <p className="chart-caption">
              Bars = count. Line = cumulative % (read on the right axis).
            </p>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={items}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="count" fill="#2f6f6a" name="Count" />
                  <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke="#1a3a3a" name="Cumulative %" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          {report ? (
            <PlainReport report={report} sourceTool="Pareto" defaultPhase="analyze" />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
