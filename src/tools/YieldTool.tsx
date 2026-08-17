import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import {
  InterpretBanner,
  NextStepCta,
} from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { fmt } from '../stats/descriptive'
import { interpretYield } from '../stats/interpretations'
import { calcYield, calcYieldRows, type YieldRow } from '../stats/yield'

function newRow(partial?: Partial<YieldRow>): YieldRow {
  return { label: '', good: 0, total: 0, ...partial }
}

export function YieldTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [mode, setMode] = usePersistedState<'simple' | 'rows'>(
    'tool.yield.mode',
    'simple',
  )
  const [goodRaw, setGoodRaw] = usePersistedState('tool.yield.good', '920')
  const [totalRaw, setTotalRaw] = usePersistedState('tool.yield.total', '1000')
  const [targetRaw, setTargetRaw] = usePersistedState('tool.yield.target', '98')
  const [rows, setRows] = usePersistedState<YieldRow[]>('tool.yield.rows', [
    newRow({ label: 'Startup / first hour', good: 85, total: 100 }),
    newRow({ label: 'Steady run', good: 835, total: 900 }),
  ])

  const targetNum = targetRaw.trim() === '' ? null : Number(targetRaw)
  const target =
    targetNum !== null && Number.isFinite(targetNum) ? targetNum : null

  const simple = useMemo(() => {
    const good = Number(goodRaw)
    const total = Number(totalRaw)
    return calcYield({ good, total, targetFpyPct: target })
  }, [goodRaw, totalRaw, target])

  const multi = useMemo(() => calcYieldRows(rows), [rows])
  const overall =
    mode === 'simple'
      ? simple
      : multi.overall
        ? calcYield({
            good: multi.overall.good,
            total: multi.overall.total,
            targetFpyPct: target,
          })
        : null

  const startupFpy =
    mode === 'rows' && multi.rows.length >= 2 ? multi.rows[0]?.fpyPct : null
  const steadyFpy =
    mode === 'rows' && multi.rows.length >= 2
      ? multi.rows[multi.rows.length - 1]?.fpyPct
      : null

  const interp = useMemo(
    () =>
      overall
        ? interpretYield({
            fpyPct: overall.fpyPct,
            scrapPct: overall.scrapPct,
            hitTarget: overall.hitTarget,
            targetFpyPct: overall.targetFpyPct,
            startupFpy,
            steadyFpy,
          })
        : null,
    [overall, startupFpy, steadyFpy],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!overall) return null
    const targetNote =
      overall.hitTarget == null
        ? 'No FPY target entered.'
        : overall.hitTarget
          ? `You met the first-pass yield target of ${fmt(overall.targetFpyPct, 1)}%.`
          : `Below the first-pass yield target of ${fmt(overall.targetFpyPct, 1)}% — dig into scrap reasons next.`
    const periodNote =
      mode === 'rows' && multi.rows.length >= 2
        ? `By period: ${multi.rows
            .map((r) => `${r.label || 'Row'} ${fmt(r.fpyPct, 1)}%`)
            .join(' · ')}. Compare startup vs steady — Reduced Yield often hides in the first hour after changeover.`
        : 'Tip: use By period to split startup vs steady run and see where quality loss lands.'
    return {
      title: 'First-pass yield / scrap',
      summary: `Of ${overall.total.toLocaleString()} pieces, ${overall.good.toLocaleString()} passed the first time. First-pass yield = ${fmt(overall.fpyPct, 1)}%. Scrap/rework rate = ${fmt(overall.scrapPct, 1)}%.`,
      bullets: [
        `${overall.scrap.toLocaleString()} pieces did not pass first time (scrap or rework). OEE treats both as quality loss.`,
        targetNote,
        periodNote,
        'Next: Pareto the defect reasons, then check process stability if scrap is jumpy.',
      ],
      termsUsed: ['first-pass yield', 'oee', 'pareto'],
    }
  }, [overall, mode, multi.rows])

  function fillExample() {
    setMode('rows')
    setTargetRaw('98')
    setGoodRaw('920')
    setTotalRaw('1000')
    setRows([
      newRow({ label: 'Startup / first hour', good: 82, total: 100 }),
      newRow({ label: 'Steady run', good: 873, total: 900 }),
    ])
  }

  const suggestPareto =
    overall != null &&
    (overall.hitTarget === false ||
      (startupFpy != null &&
        steadyFpy != null &&
        Math.abs(startupFpy - steadyFpy) >= 5))

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="yield" />
      <section className="panel">
        <h2>First-pass yield / scrap</h2>
        <p className="lede">
          How many pieces were good the first time — no rework counted as
          good.
        </p>
        <div className="row actions">
          <button
            type="button"
            className={mode === 'simple' ? 'btn primary' : 'btn secondary'}
            onClick={() => setMode('simple')}
          >
            One shift / batch
          </button>
          <button
            type="button"
            className={mode === 'rows' ? 'btn primary' : 'btn secondary'}
            onClick={() => setMode('rows')}
          >
            By period (startup vs run)
          </button>
          <button type="button" className="btn secondary" onClick={fillExample}>
            Fill example
          </button>
        </div>

        {mode === 'simple' ? (
          <div className="form-grid">
            <label>
              Good (first pass)
              <input
                type="number"
                min={0}
                value={goodRaw}
                onChange={(e) => setGoodRaw(e.target.value)}
              />
            </label>
            <label>
              Total produced
              <input
                type="number"
                min={0}
                value={totalRaw}
                onChange={(e) => setTotalRaw(e.target.value)}
              />
            </label>
            <label>
              FPY target % (optional)
              <input
                type="number"
                min={0}
                max={100}
                value={targetRaw}
                onChange={(e) => setTargetRaw(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className="table-edit">
            <div className="table-edit-head">
              <span>Period</span>
              <span>Good</span>
              <span>Total</span>
              <span />
            </div>
            {rows.map((r, i) => (
              <div key={i} className="table-edit-row">
                <input
                  value={r.label}
                  placeholder="e.g. Startup"
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
                  value={r.good || ''}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((row, j) =>
                        j === i
                          ? { ...row, good: Number(e.target.value) || 0 }
                          : row,
                      ),
                    )
                  }
                />
                <input
                  type="number"
                  min={0}
                  value={r.total || ''}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((row, j) =>
                        j === i
                          ? { ...row, total: Number(e.target.value) || 0 }
                          : row,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() =>
                    setRows((prev) => prev.filter((_, j) => j !== i))
                  }
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
              Add period
            </button>
            <label className="inline-target">
              Overall FPY target % (optional)
              <input
                type="number"
                min={0}
                max={100}
                value={targetRaw}
                onChange={(e) => setTargetRaw(e.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      {overall ? (
        <>
          {interp ? (
            <InterpretBanner
              title={interp.title}
              plain={interp.plain}
              meta={interp.meta}
            >
              {suggestPareto ? (
                <NextStepCta
                  label="Open Pareto for scrap reasons"
                  view="pareto"
                  onNavigate={onNavigate}
                />
              ) : null}
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>First-pass yield</span>
              <strong>{fmt(overall.fpyPct, 1)}%</strong>
            </div>
            <div>
              <span>Scrap / rework</span>
              <strong>{fmt(overall.scrapPct, 1)}%</strong>
            </div>
            <div>
              <span>Good</span>
              <strong>{overall.good.toLocaleString()}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{overall.total.toLocaleString()}</strong>
            </div>
          </div>
          {mode === 'rows' && multi.rows.length > 0 ? (
            <section className="panel soft">
              <h3 className="subhead">By period</h3>
              <ul className="period-list">
                {multi.rows.map((r) => (
                  <li key={`${r.label}-${r.total}-${r.good}`}>
                    <strong>{r.label || 'Period'}</strong>
                    <span>
                      FPY {fmt(r.fpyPct, 1)}% · scrap {fmt(r.scrapPct, 1)}% ·{' '}
                      {r.good}/{r.total}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Yield / FPY"
              defaultPhase="measure"
            />
          ) : null}
        </>
      ) : (
        <p className="form-error">
          Enter good ≤ total, with total greater than zero.
        </p>
      )}
    </div>
  )
}
