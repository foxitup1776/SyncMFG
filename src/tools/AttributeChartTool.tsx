import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import { InterpretBanner, NextStepCta } from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { AttributeControlChart } from '../components/charts/PlanCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  CHART_META,
  chooseAttributeChart,
  computeAttributeChart,
  longestRunOneSide,
  type AttributeChartKind,
  type AttributeRow,
} from '../stats/attributeCharts'
import { fmt } from '../stats/descriptive'
import { interpretAttributeChart } from '../stats/interpretations'

const KINDS: AttributeChartKind[] = ['p', 'np', 'c', 'u']

function newRow(partial?: Partial<AttributeRow>): AttributeRow {
  return { label: '', count: 0, size: 100, ...partial }
}

const EXAMPLE_ROWS: AttributeRow[] = [
  { label: 'Day 1', count: 4, size: 100 },
  { label: 'Day 2', count: 6, size: 100 },
  { label: 'Day 3', count: 3, size: 95 },
  { label: 'Day 4', count: 5, size: 100 },
  { label: 'Day 5', count: 12, size: 100 },
  { label: 'Day 6', count: 4, size: 100 },
  { label: 'Day 7', count: 3, size: 90 },
  { label: 'Day 8', count: 5, size: 100 },
  { label: 'Day 9', count: 7, size: 100 },
  { label: 'Day 10', count: 4, size: 100 },
  { label: 'Day 11', count: 2, size: 100 },
  { label: 'Day 12', count: 6, size: 100 },
]

export function AttributeChartTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [kind, setKind] = usePersistedState<AttributeChartKind>(
    'tool.attribute.kind',
    'p',
  )
  const [rows, setRows] = usePersistedState<AttributeRow[]>(
    'tool.attribute.rows',
    EXAMPLE_ROWS,
  )
  const [countingDefectives, setCountingDefectives] = usePersistedState(
    'tool.attribute.defectives',
    true,
  )
  const [constantSize, setConstantSize] = usePersistedState(
    'tool.attribute.constant',
    false,
  )

  const meta = CHART_META[kind]
  const recommendation = useMemo(
    () =>
      chooseAttributeChart({
        countingDefectiveUnits: countingDefectives,
        constantSampleSize: constantSize,
      }),
    [countingDefectives, constantSize],
  )

  const result = useMemo(() => computeAttributeChart(kind, rows), [kind, rows])
  const longestRun = useMemo(
    () => (result ? longestRunOneSide(result.points) : 0),
    [result],
  )

  const interp = useMemo(
    () =>
      result
        ? interpretAttributeChart({
            kind: result.kind,
            outCount: result.outIndexes.length,
            outLabels: result.outIndexes.map(
              (i) => result.points[i].label || `#${i + 1}`,
            ),
            center: result.center,
            unitLabel: result.unitLabel,
            longestRun,
            variableLimits: result.variableLimits,
          })
        : null,
    [result, longestRun],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!result) return null
    const outLabels = result.outIndexes.map(
      (i) => result.points[i].label || `#${i + 1}`,
    )
    return {
      title: `${meta.name} — ${meta.alsoCalled}`,
      summary:
        result.outIndexes.length === 0
          ? `Across ${result.points.length} samples, nothing crossed a control limit. Center line = ${fmt(result.center, 3)} ${result.unitLabel}, so the bounce you see is common cause.`
          : `Across ${result.points.length} samples, ${result.outIndexes.length} went outside the limits (${outLabels.join(', ')}). Center line = ${fmt(result.center, 3)} ${result.unitLabel}.`,
      bullets: [
        `Totals: ${result.totalCount.toLocaleString()} ${countingDefectives ? 'defective units' : 'defects'} across ${result.totalSize.toLocaleString()} ${meta.needsSize ? 'inspected' : 'samples'}.`,
        result.variableLimits
          ? `Sample sizes vary (average ${fmt(result.avgSize, 1)}), so the limits step in and out — smaller samples get wider guardrails, which is honest, not a glitch.`
          : `Every sample was the same size, so limits are flat at ${fmt(result.ucl, 3)} / ${fmt(result.lcl, 3)} ${result.unitLabel}.`,
        longestRun >= 7
          ? `Longest run on one side of the center line: ${longestRun} points. Even with no limit break, that pattern says the rate shifted.`
          : `Longest run on one side of the center line: ${longestRun} points — nothing alarming (7+ is the usual flag).`,
        result.outIndexes.length === 0
          ? 'Because the counts are stable, improvement has to come from changing the system — not from reacting to individual bad days.'
          : 'Investigate what changed at the flagged samples (material lot, new operator, tooling, inspection standard) before changing the process for everybody.',
        'Attribute limits come from the count model itself, so there is no standard deviation column to paste — just how many you inspected and how many were bad.',
        ...result.warnings,
      ],
      termsUsed: [
        'attribute data',
        'p chart',
        'u chart',
        'control limit',
        'common cause',
        'special cause',
      ],
    }
  }, [result, meta, longestRun, countingDefectives])

  const sizeHeader = kind === 'c' ? 'Samples (ignored)' : meta.needsSize
    ? countingDefectives
      ? 'Inspected'
      : 'Units inspected'
    : 'Inspected'

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="attribute" />
      <section className="panel">
        <h2>Is my defect rate stable?</h2>
        <p className="lede">
          Control charts for counted data — pass/fail tallies and defect counts,
          no measurements needed.
        </p>

        <div className="form-grid">
          <label>
            What are you counting?
            <select
              value={countingDefectives ? 'defectives' : 'defects'}
              onChange={(e) =>
                setCountingDefectives(e.target.value === 'defectives')
              }
            >
              <option value="defectives">
                Bad pieces (each piece passes or fails)
              </option>
              <option value="defects">
                Defects (one piece can have several)
              </option>
            </select>
          </label>
          <label>
            Do you inspect the same amount each time?
            <select
              value={constantSize ? 'yes' : 'no'}
              onChange={(e) => setConstantSize(e.target.value === 'yes')}
            >
              <option value="no">No — the amount changes</option>
              <option value="yes">Yes — same amount every time</option>
            </select>
          </label>
        </div>

        <p className="meta">
          Suggested chart: <strong>{CHART_META[recommendation.kind].name}</strong>{' '}
          ({CHART_META[recommendation.kind].alsoCalled}). {recommendation.why}
        </p>

        <div className="row actions">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={kind === k ? 'btn primary' : 'btn secondary'}
              onClick={() => setKind(k)}
            >
              {CHART_META[k].name}
            </button>
          ))}
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setKind(recommendation.kind)
              setRows(EXAMPLE_ROWS)
            }}
          >
            Fill example
          </button>
        </div>
        <p className="meta">
          <strong>{meta.alsoCalled}:</strong> {meta.plain}
        </p>

        <div className="table-edit">
          <div className="table-edit-head">
            <span>Sample / day</span>
            <span>{countingDefectives ? 'Bad pieces' : 'Defects'}</span>
            <span>{sizeHeader}</span>
            <span />
          </div>
          {rows.map((r, i) => (
            <div key={i} className="table-edit-row">
              <input
                value={r.label}
                placeholder="e.g. Day 1"
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((row, j) =>
                      j === i ? { ...row, label: e.target.value } : row,
                    ),
                  )
                }
              />
              <input
                type="number"
                min={0}
                value={r.count || ''}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((row, j) =>
                      j === i
                        ? { ...row, count: Number(e.target.value) || 0 }
                        : row,
                    ),
                  )
                }
              />
              <input
                type="number"
                min={0}
                disabled={kind === 'c'}
                value={r.size || ''}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((row, j) =>
                      j === i
                        ? { ...row, size: Number(e.target.value) || 0 }
                        : row,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="btn ghost"
                onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn secondary"
            onClick={() => setRows((prev) => [...prev, newRow()])}
          >
            Add sample
          </button>
        </div>
      </section>

      {result ? (
        <>
          {interp ? (
            <InterpretBanner
              title={interp.title}
              plain={interp.plain}
              meta={interp.meta}
            >
              <NextStepCta
                label={
                  result.outIndexes.length > 0
                    ? 'Open Fishbone for the flagged days'
                    : 'Open Pareto for defect reasons'
                }
                view={result.outIndexes.length > 0 ? 'fishbone' : 'pareto'}
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}

          <div className="stat-strip">
            <div>
              <span>Center line</span>
              <strong>{fmt(result.center, 3)}</strong>
            </div>
            <div>
              <span>Out of control</span>
              <strong>{result.outIndexes.length}</strong>
            </div>
            <div>
              <span>Samples</span>
              <strong>{result.points.length}</strong>
            </div>
            <div>
              <span>Longest one-side run</span>
              <strong>{longestRun}</strong>
            </div>
          </div>

          {result.warnings.length > 0 ? (
            <section className="panel soft note-warn">
              <h3 className="subhead">Read this chart carefully</h3>
              <ul className="tip-list">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="chart-grid">
            <AttributeControlChart
              title={`${meta.name} (${meta.alsoCalled})`}
              caption="Red points sit outside the control limits. Limits step when the amount inspected changes."
              points={result.points}
              unitLabel={result.unitLabel}
            />
          </div>

          {report ? (
            <PlainReport
              report={report}
              sourceTool={`Attribute chart (${kind})`}
              defaultPhase="measure"
            />
          ) : null}
        </>
      ) : (
        <p className="form-error">
          Need at least 2 samples. For pass/fail charts, bad pieces cannot exceed
          the amount inspected.
        </p>
      )}
    </div>
  )
}
