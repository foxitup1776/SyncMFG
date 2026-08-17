import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const TEAL = '#1a3a3a'
const ACCENT = '#2f6f6a'
const MUTED = '#7a8b94'
const DANGER = '#9b2c2c'

/** “More rows buys me what?” — power against sample size. */
export function PowerCurveChart({
  points,
  targetN,
  targetPowerPct,
  unitLabel,
}: {
  points: { n: number; powerPct: number }[]
  targetN: number
  targetPowerPct: number
  unitLabel: string
}) {
  if (points.length < 2) return null
  return (
    <div className="chart-card">
      <h3>What extra samples buy you</h3>
      <p className="chart-caption">
        Chance of catching the difference you described, as the sample grows.
        The dashed lines mark your plan.
      </p>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={points}
            margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
            <XAxis
              dataKey="n"
              tick={{ fontSize: 11 }}
              label={{
                value: unitLabel,
                position: 'insideBottom',
                offset: -2,
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Power']}
              labelFormatter={(v) => `${v} ${unitLabel}`}
            />
            <ReferenceLine
              y={targetPowerPct}
              stroke={MUTED}
              strokeDasharray="6 4"
              label={{ value: 'Target power', fontSize: 10, fill: MUTED }}
            />
            <ReferenceLine x={targetN} stroke={ACCENT} strokeDasharray="6 4" />
            <Line
              type="monotone"
              dataKey="powerPct"
              stroke={TEAL}
              strokeWidth={2}
              dot={false}
              name="Power"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export interface AttributeChartPoint {
  label: string
  value: number
  center: number
  ucl: number
  lcl: number
  out: boolean
}

/**
 * Control chart where each sample can carry its own limits (p and u charts
 * widen the guardrails when you inspected less).
 */
export function AttributeControlChart({
  title,
  caption,
  points,
  unitLabel,
}: {
  title: string
  caption: string
  points: AttributeChartPoint[]
  unitLabel: string
}) {
  const data = points.map((p, i) => ({
    label: p.label || `#${i + 1}`,
    value: p.value,
    ucl: p.ucl,
    lcl: p.lcl,
    center: p.center,
    out: p.out ? p.value : null,
    ok: p.out ? null : p.value,
  }))

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <p className="chart-caption">{caption}</p>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              formatter={(v, name) => [
                `${Number(v).toFixed(3)} ${unitLabel}`,
                String(name),
              ]}
            />
            <Line
              type="stepAfter"
              dataKey="ucl"
              stroke={DANGER}
              strokeDasharray="6 4"
              dot={false}
              strokeWidth={1.5}
              name="Upper limit"
            />
            <Line
              type="stepAfter"
              dataKey="lcl"
              stroke={DANGER}
              strokeDasharray="6 4"
              dot={false}
              strokeWidth={1.5}
              name="Lower limit"
            />
            <Line
              type="linear"
              dataKey="center"
              stroke={MUTED}
              dot={false}
              strokeWidth={1}
              name="Center"
            />
            <Line
              type="linear"
              dataKey="value"
              stroke={TEAL}
              dot={false}
              strokeWidth={1.5}
              name={unitLabel}
            />
            <Scatter dataKey="ok" fill={ACCENT} name="In control" />
            <Scatter dataKey="out" fill={DANGER} name="Out of control" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** Step-by-step yield bars for rolled throughput yield. */
export function StepYieldBars({
  steps,
  weakestLabel,
}: {
  steps: { label: string; yieldPct: number }[]
  weakestLabel: string | null
}) {
  if (steps.length === 0) return null
  return (
    <div className="score-bars">
      {steps.map((s, i) => (
        <div className="score-bar-row" key={`${s.label}-${i}`}>
          <span>{s.label || `Step ${i + 1}`}</span>
          <span className="score-bar-track">
            <span
              className="score-bar-fill"
              style={{
                width: `${Math.max(0, Math.min(100, s.yieldPct))}%`,
                background:
                  s.label === weakestLabel ? DANGER : undefined,
              }}
            />
          </span>
          <span>{s.yieldPct.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}
