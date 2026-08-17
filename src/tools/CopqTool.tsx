import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AppView } from '../components/AppShell'
import { InterpretBanner, NextStepCta } from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  calcCopq,
  copqBucketById,
  copqItemsForBucket,
  COPQ_BUCKETS,
  interpretCopq,
  money,
  type CopqBucket,
  type CopqLine,
} from '../lean/copq'
import { fmt } from '../stats/descriptive'

const BUCKET_FILL: Record<CopqBucket, string> = {
  internal: '#9b2c2c',
  external: '#7b1d1d',
  appraisal: '#b08948',
  prevention: '#2f6f6a',
}

function newLine(
  bucket: CopqBucket,
  partial?: Partial<CopqLine>,
): CopqLine {
  return {
    id: crypto.randomUUID(),
    bucket,
    label: '',
    monthly: 0,
    note: '',
    ...partial,
  }
}

function exampleLines(): CopqLine[] {
  return [
    newLine('internal', { label: 'Scrap (material + labour)', monthly: 18400 }),
    newLine('internal', { label: 'Rework / touch-up hours', monthly: 9600 }),
    newLine('internal', { label: 'Downtime for quality', monthly: 4200 }),
    newLine('external', { label: 'Returns and credits', monthly: 6100 }),
    newLine('external', { label: 'Warranty claims', monthly: 3300 }),
    newLine('external', { label: 'Expedite / premium freight', monthly: 1800 }),
    newLine('appraisal', { label: 'Inspection labour', monthly: 7200 }),
    newLine('appraisal', { label: 'Gage calibration / MSA', monthly: 900 }),
    newLine('prevention', { label: 'Training and certification', monthly: 2100 }),
    newLine('prevention', { label: 'Preventive maintenance', monthly: 3600 }),
  ]
}

export function CopqTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [area, setArea] = usePersistedState('tool.copq.area', '')
  const [defects, setDefects] = usePersistedState('tool.copq.defects', '1200')
  const [revenue, setRevenue] = usePersistedState('tool.copq.revenue', '850000')
  const [openBucket, setOpenBucket] = useState<CopqBucket | null>(null)
  const [lines, setLines] = usePersistedState<CopqLine[]>('tool.copq.lines', [])

  const result = useMemo(
    () =>
      calcCopq({
        lines,
        defectsPerMonth: Number(defects),
        revenuePerMonth: Number(revenue),
      }),
    [lines, defects, revenue],
  )

  const interp = useMemo(() => (result ? interpretCopq(result) : null), [result])

  const chartData = useMemo(
    () =>
      result
        ? result.buckets.map((b) => ({
            name: copqBucketById(b.bucket)?.name ?? b.bucket,
            bucket: b.bucket,
            monthly: Number(b.monthly.toFixed(0)),
          }))
        : [],
    [result],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!result) return null
    return {
      title: `Cost of poor quality${area.trim() ? ` — ${area.trim()}` : ''}`,
      summary: `Poor quality is costing about ${money(result.failureMonthly)} a month — ${money(result.failureAnnual)} a year. That is internal failure ${money(result.internalMonthly)} plus external failure ${money(result.externalMonthly)}.`,
      bullets: [
        `Internal failure (we caught it): ${money(result.internalMonthly)}/month — scrap, rework, sorting, quality downtime.`,
        `External failure (the customer caught it): ${money(result.externalMonthly)}/month — returns, warranty, credits, premium freight.`,
        `Appraisal (checking): ${money(result.appraisalMonthly)}/month. Prevention (stopping it up front): ${money(result.preventionMonthly)}/month.`,
        `Total cost of quality across all four buckets: ${money(result.totalMonthly)}/month, ${money(result.totalAnnual)}/year.`,
        result.costPerDefect === null
          ? 'Enter defects per month to get a cost per defect number people remember.'
          : `Cost per defect ≈ ${money(result.costPerDefect)} (failure dollars ÷ ${fmt(Number(defects), 0)} defects a month).`,
        result.failurePctOfRevenue === null
          ? 'Enter monthly sales to see poor quality as a share of revenue.'
          : `Poor quality equals ${fmt(result.failurePctOfRevenue, 1)}% of sales. Many plants find 5–15% before they start measuring.`,
        result.failurePerPreventionDollar === null
          ? 'No prevention spend entered — the trade-off is invisible until you add training, PM, and mistake-proofing.'
          : `For every $1 spent on prevention you are losing about ${money(result.failurePerPreventionDollar)} to failures. Prevention is almost always the cheapest dollar.`,
        result.biggestLine
          ? `Biggest single cost line: “${result.biggestLine.label || 'unnamed'}” at ${money(result.biggestLine.monthly)}/month — Pareto the defect codes behind it before spending anywhere else.`
          : 'Rank the lines and attack the vital few first.',
        'Use one loaded rate everyone agrees on (material + labour + burden) and keep the same assumptions before and after the fix — the comparison matters more than perfect accounting.',
        'Pin this into Improve as the baseline business case, then re-run it with the same assumptions and pin it into Control to show the savings held.',
      ],
      termsUsed: [
        'copq',
        'internal failure cost',
        'external failure cost',
        'appraisal cost',
        'prevention cost',
        'first-pass yield',
        'pareto',
      ],
    }
  }, [result, area, defects])

  function updateLine(id: string, patch: Partial<CopqLine>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function addItem(bucket: CopqBucket, label: string) {
    setLines((prev) => [...prev, newLine(bucket, { label })])
  }

  function loadExamples() {
    setArea('Line 2 — stamped brackets')
    setDefects('1200')
    setRevenue('850000')
    setLines(exampleLines())
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="copq" />

      <section className="panel">
        <h2>What is scrap really costing us? (COPQ)</h2>
        <p className="lede">
          Put a dollar figure on poor quality so improvement stops being an
          opinion. Four buckets: what we caught, what the customer caught, what
          we spend checking, and what we spend preventing.
        </p>
        <div className="form-grid">
          <label>
            Area / line / product
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Line 2 — stamped brackets"
            />
          </label>
          <label>
            Defects per month (scrap + rework + escapes)
            <input
              type="number"
              min={0}
              step="any"
              value={defects}
              onChange={(e) => setDefects(e.target.value)}
            />
          </label>
          <label>
            Monthly sales for this area ($)
            <input
              type="number"
              min={0}
              step="any"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
            />
          </label>
        </div>
        <div className="row actions">
          <button type="button" className="btn secondary" onClick={loadExamples}>
            Load example numbers
          </button>
        </div>
      </section>

      <section className="panel soft">
        <h3 className="subhead">Tap a bucket, then add the costs you know</h3>
        <p className="meta">
          Estimates beat blanks. Use one loaded rate (material + labour +
          burden) and stay consistent — you are comparing before and after, not
          filing taxes.
        </p>
        <div className="waste-chip-grid">
          {COPQ_BUCKETS.map((b) => {
            const n = lines.filter((l) => l.bucket === b.id).length
            const on = openBucket === b.id
            return (
              <button
                key={b.id}
                type="button"
                className={on ? 'waste-chip selected' : 'waste-chip'}
                onClick={() => setOpenBucket(on ? null : b.id)}
                aria-pressed={on}
              >
                <span className={`kind-letter copq-${b.id}`}>
                  {b.side === 'failure' ? '!' : '$'}
                </span>
                <strong>{b.name}</strong>
                <span className="waste-short">{b.everyday}</span>
                {n > 0 ? <span className="waste-count">{n}</span> : null}
              </button>
            )
          })}
        </div>

        {openBucket ? (
          <div className="waste-detail">
            <p>
              <strong>{copqBucketById(openBucket)?.name}</strong> —{' '}
              {copqBucketById(openBucket)?.lookFor}
            </p>
            <div className="row actions">
              {copqItemsForBucket(openBucket).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="kind-chip"
                  title={item.hint}
                  onClick={() => addItem(openBucket, item.label)}
                >
                  + {item.label}
                </button>
              ))}
              <button
                type="button"
                className="btn secondary"
                onClick={() => addItem(openBucket, '')}
              >
                + Blank line
              </button>
            </div>
          </div>
        ) : (
          <p className="meta">Pick a bucket to see one-tap cost lines.</p>
        )}
      </section>

      {lines.length > 0 ? (
        <section className="panel">
          <div className="row actions" style={{ justifyContent: 'space-between' }}>
            <h3 className="subhead" style={{ margin: 0 }}>
              Cost lines ({lines.length})
            </h3>
            <button
              type="button"
              className="btn ghost danger"
              onClick={() => {
                if (confirm('Clear all cost lines?')) setLines([])
              }}
            >
              Clear all
            </button>
          </div>
          <div className="steps-table-wrap">
            <table className="steps-table">
              <thead>
                <tr>
                  <th>Bucket</th>
                  <th>Cost line</th>
                  <th>$ per month</th>
                  <th>$ per year</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <select
                        value={l.bucket}
                        onChange={(e) =>
                          updateLine(l.id, {
                            bucket: e.target.value as CopqBucket,
                          })
                        }
                      >
                        {COPQ_BUCKETS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={l.label}
                        onChange={(e) =>
                          updateLine(l.id, { label: e.target.value })
                        }
                        placeholder="What is the cost?"
                      />
                    </td>
                    <td>
                      <input
                        inputMode="decimal"
                        value={l.monthly}
                        onChange={(e) =>
                          updateLine(l.id, { monthly: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td>
                      <span className="meta">{money(l.monthly * 12)}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn ghost danger"
                        onClick={() =>
                          setLines((prev) => prev.filter((x) => x.id !== l.id))
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {result ? (
        <>
          <div className="stat-strip">
            <div>
              <span>Poor quality / month</span>
              <strong>{money(result.failureMonthly)}</strong>
            </div>
            <div>
              <span>Annualized</span>
              <strong>{money(result.failureAnnual)}</strong>
            </div>
            <div>
              <span>Cost per defect</span>
              <strong>{money(result.costPerDefect)}</strong>
            </div>
            <div>
              <span>Share of sales</span>
              <strong>
                {result.failurePctOfRevenue === null
                  ? '—'
                  : `${fmt(result.failurePctOfRevenue, 1)}%`}
              </strong>
            </div>
          </div>

          <div className="chart-card">
            <h3>Where the quality money goes ($/month)</h3>
            <p className="chart-caption">
              Red buckets are money already lost. Teal and gold are what you
              spend trying to stop it — usually far cheaper than the red.
            </p>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => money(Number(v))} />
                  <Bar dataKey="monthly" name="$ per month">
                    {chartData.map((d) => (
                      <Cell key={d.bucket} fill={BUCKET_FILL[d.bucket]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {interp ? (
            <InterpretBanner
              title={interp.title}
              plain={interp.plain}
              meta={interp.meta}
            >
              <NextStepCta
                label={
                  result.worstFailure === 'external'
                    ? 'Rank escape reasons in Pareto'
                    : 'Rank scrap reasons in Pareto'
                }
                view="pareto"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}

          {report ? (
            <PlainReport
              report={report}
              sourceTool="COPQ"
              defaultPhase="improve"
            />
          ) : null}
        </>
      ) : (
        <p className="meta">
          Add at least one cost line above (or load the example) to see monthly
          and annual cost of poor quality.
        </p>
      )}
    </div>
  )
}
