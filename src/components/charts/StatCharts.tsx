import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { quartiles } from '../../stats/descriptive'

type QuartileResult = NonNullable<ReturnType<typeof quartiles>>

const TEAL = '#1a3a3a'
const ACCENT = '#2f6f6a'
const MUTED = '#7a8b94'
const DANGER = '#9b2c2c'

export function HistogramChart({
  bins,
  usl,
  lsl,
}: {
  bins: { mid: number; count: number; start: number; end: number }[]
  usl?: number | null
  lsl?: number | null
}) {
  const data = bins.map((b) => ({
    name: b.mid.toFixed(2),
    count: b.count,
    mid: b.mid,
  }))
  return (
    <div className="chart-card">
      <h3>Histogram</h3>
      <p className="chart-caption">A “photo” of how values pile up.</p>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill={ACCENT} name="Count" />
            {lsl != null ? (
              <ReferenceLine x={closestLabel(data, lsl)} stroke={DANGER} strokeDasharray="4 4" />
            ) : null}
            {usl != null ? (
              <ReferenceLine x={closestLabel(data, usl)} stroke={DANGER} strokeDasharray="4 4" />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function closestLabel(
  data: { name: string; mid: number }[],
  value: number,
): string | undefined {
  if (data.length === 0) return undefined
  let best = data[0]
  for (const d of data) {
    if (Math.abs(d.mid - value) < Math.abs(best.mid - value)) best = d
  }
  return best.name
}

export function RunChart({ values }: { values: number[] }) {
  const data = values.map((v, i) => ({ i: i + 1, value: v }))
  return (
    <div className="chart-card">
      <h3>Run chart</h3>
      <p className="chart-caption">A “movie” of the numbers in the order you entered them.</p>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
            <XAxis dataKey="i" tick={{ fontSize: 11 }} name="Order" />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip />
            <Line
              type="linear"
              dataKey="value"
              stroke={TEAL}
              dot={{ r: 2 }}
              strokeWidth={2}
              name="Value"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function BoxPlotChart({ box }: { box: QuartileResult }) {
  // Simple schematic box using a custom SVG for clarity on phone + desktop
  const all = [
    box.whiskerLow,
    box.q1,
    box.q2,
    box.q3,
    box.whiskerHigh,
    ...box.outliers,
  ]
  const min = Math.min(...all)
  const max = Math.max(...all)
  const pad = (max - min) * 0.08 || 1
  const lo = min - pad
  const hi = max + pad
  const scale = (v: number) => ((v - lo) / (hi - lo)) * 100

  return (
    <div className="chart-card">
      <h3>Box plot</h3>
      <p className="chart-caption">
        Middle box = middle 50% of data. Line in the box = median. Dots = outliers.
      </p>
      <div className="box-plot">
        <div className="box-plot-track">
          <div
            className="box-whisker"
            style={{ left: `${scale(box.whiskerLow)}%`, width: `${scale(box.whiskerHigh) - scale(box.whiskerLow)}%` }}
          />
          <div
            className="box-body"
            style={{ left: `${scale(box.q1)}%`, width: `${Math.max(scale(box.q3) - scale(box.q1), 1)}%` }}
          />
          <div className="box-median" style={{ left: `${scale(box.q2)}%` }} />
          {box.outliers.map((o, i) => (
            <span key={`${o}-${i}`} className="box-outlier" style={{ left: `${scale(o)}%` }} />
          ))}
        </div>
        <div className="box-labels">
          <span>Low whisker {box.whiskerLow.toFixed(2)}</span>
          <span>Q1 {box.q1.toFixed(2)}</span>
          <span>Median {box.q2.toFixed(2)}</span>
          <span>Q3 {box.q3.toFixed(2)}</span>
          <span>High whisker {box.whiskerHigh.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export function ControlChart({
  title,
  caption,
  points,
  center,
  ucl,
  lcl,
  outIndexes,
}: {
  title: string
  caption: string
  points: number[]
  center: number
  ucl: number
  lcl: number
  outIndexes: number[]
}) {
  const out = new Set(outIndexes)
  const data = points.map((v, i) => ({
    i: i + 1,
    value: v,
    out: out.has(i) ? v : null,
    ok: out.has(i) ? null : v,
  }))

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <p className="chart-caption">{caption}</p>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
            <XAxis dataKey="i" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip />
            <ReferenceLine y={ucl} stroke={DANGER} strokeDasharray="6 4" label="UCL" />
            <ReferenceLine y={center} stroke={MUTED} />
            <ReferenceLine y={lcl} stroke={DANGER} strokeDasharray="6 4" label="LCL" />
            <Line type="linear" dataKey="value" stroke={TEAL} dot={false} strokeWidth={1.5} />
            <Scatter dataKey="ok" fill={ACCENT} name="In control" />
            <Scatter dataKey="out" fill={DANGER} name="Out of control" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DistributionChart({
  values,
  label = 'Total time',
}: {
  values: number[]
  label?: string
}) {
  // Build simple bins for Monte Carlo totals
  if (values.length === 0) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const k = 20
  const width = max === min ? 1 : (max - min) / k
  const bins = Array.from({ length: k }, (_, i) => {
    const start = min + i * width
    return {
      name: start.toFixed(1),
      count: 0,
      mid: start + width / 2,
    }
  })
  for (const v of values) {
    let idx = Math.floor((v - min) / width)
    if (idx >= k) idx = k - 1
    if (idx < 0) idx = 0
    bins[idx].count += 1
  }

  return (
    <div className="chart-card">
      <h3>{label} distribution</h3>
      <p className="chart-caption">How often each total showed up across the simulated runs.</p>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={bins}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" name="Runs" fill={ACCENT}>
              {bins.map((b) => (
                <Cell key={b.name} fill={ACCENT} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
