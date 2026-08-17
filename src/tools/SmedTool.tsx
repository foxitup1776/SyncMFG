import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  calcSmed,
  interpretSmed,
  smedKindById,
  SMED_KINDS,
  SMED_PLANS,
  type SmedKind,
  type SmedPlan,
  type SmedTask,
} from '../lean/smed'
import { fmt } from '../stats/descriptive'

function newTask(kind: SmedKind, partial?: Partial<SmedTask>): SmedTask {
  return {
    id: crypto.randomUUID(),
    name: '',
    minutes: 0,
    kind,
    plan: 'keep',
    targetMinutes: 0,
    ...partial,
  }
}

function exampleTasks(): SmedTask[] {
  return [
    newTask('waste', {
      name: 'Hunt for the right wrench and shims',
      minutes: 6,
      plan: 'eliminate',
    }),
    newTask('internal', {
      name: 'Walk to crib for next die',
      minutes: 5,
      plan: 'externalize',
    }),
    newTask('internal', {
      name: 'Unbolt and lift out old die',
      minutes: 12,
      plan: 'shorten',
      targetMinutes: 6,
    }),
    newTask('internal', {
      name: 'Set and square new die',
      minutes: 14,
      plan: 'shorten',
      targetMinutes: 8,
    }),
    newTask('internal', {
      name: 'Thread material and adjust',
      minutes: 9,
    }),
    newTask('internal', {
      name: 'First-piece check and fine tune',
      minutes: 8,
      plan: 'shorten',
      targetMinutes: 4,
    }),
    newTask('external', {
      name: 'Stage next order paperwork',
      minutes: 4,
    }),
    newTask('waste', {
      name: 'Wait for lead to sign off',
      minutes: 3,
      plan: 'eliminate',
    }),
  ]
}

export function SmedTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [machine, setMachine] = usePersistedState('tool.smed.machine', '')
  const [changeoversPerWeek, setChangeoversPerWeek] = usePersistedState(
    'tool.smed.perWeek',
    '5',
  )
  const [selectedKind, setSelectedKind] = useState<SmedKind | null>(null)
  const [tasks, setTasks] = usePersistedState<SmedTask[]>('tool.smed.tasks', [])

  const result = useMemo(() => calcSmed(tasks), [tasks])
  const interp = useMemo(() => (result ? interpretSmed(result) : null), [result])

  const perWeek = Number(changeoversPerWeek)
  const hoursPerYear =
    result && Number.isFinite(perWeek) && perWeek > 0
      ? (result.downtimeSavedMinutes * perWeek * 52) / 60
      : null

  const counts = useMemo(() => {
    const map = new Map<SmedKind, number>()
    for (const t of tasks) map.set(t.kind, (map.get(t.kind) ?? 0) + 1)
    return map
  }, [tasks])

  const chartData = useMemo(() => {
    if (!result) return []
    return [
      {
        name: 'Before',
        Internal: Number(result.before.internal.toFixed(1)),
        Waste: Number(result.before.waste.toFixed(1)),
        External: Number(result.before.external.toFixed(1)),
      },
      {
        name: 'After plan',
        Internal: Number(result.after.internal.toFixed(1)),
        Waste: Number(result.after.waste.toFixed(1)),
        External: Number(result.after.external.toFixed(1)),
      },
    ]
  }, [result])

  const report: AnalysisReport | null = useMemo(() => {
    if (!result) return null
    const { before, after } = result
    return {
      title: `Quick changeover (SMED)${machine.trim() ? ` — ${machine.trim()}` : ''}`,
      summary: `${result.taskCount} task(s) sorted. The machine stops for ${fmt(before.downtime, 1)} min today; the plan on this sheet takes it to ${fmt(after.downtime, 1)} min (${fmt(result.downtimeReductionPct, 0)}% less stopped time).`,
      bullets: [
        `Before: internal ${fmt(before.internal, 1)} min (machine down) · external ${fmt(before.external, 1)} min (done while running) · waste ${fmt(before.waste, 1)} min (should not exist).`,
        `After the plan: internal ${fmt(after.internal, 1)} min · external ${fmt(after.external, 1)} min · waste ${fmt(after.waste, 1)} min.`,
        `Off-line share of all setup work goes from ${fmt(before.externalSharePct, 0)}% to ${fmt(after.externalSharePct, 0)}%. You externalized ${fmt(result.externalizedPct, 0)}% of the original machine stop.`,
        `Moved off-line ${fmt(result.movedMinutes, 1)} min · eliminated ${fmt(result.eliminatedMinutes, 1)} min · shortened ${fmt(result.shortenedMinutes, 1)} min.`,
        hoursPerYear !== null
          ? `At ${fmt(perWeek, 0)} changeover(s) a week that is about ${fmt(hoursPerYear, 1)} machine hours a year back in production.`
          : 'Enter changeovers per week to turn saved minutes into yearly machine hours.',
        result.biggestInternal
          ? `Longest task with the machine down: “${result.biggestInternal.name.trim() || 'unnamed task'}” at ${fmt(result.biggestInternal.minutes, 1)} min — attack that one next.`
          : 'No internal tasks left with the machine down — verify on the floor before you believe it.',
        'SMED order of attack: delete the waste, move what can be staged off-line, then make what is left faster (quick clamps, no threads, no fine-tuning).',
        'Prove it with a stopwatch on the next two changeovers, then watch startup scrap — a fast changeover that makes bad parts is not a win.',
      ],
      termsUsed: [
        'smed',
        'internal setup',
        'external setup',
        'changeover',
        'six big losses',
        'eight wastes',
      ],
    }
  }, [result, machine, hoursPerYear, perWeek])

  function addSelected() {
    if (!selectedKind) return
    setTasks((prev) => [...prev, newTask(selectedKind)])
    setSelectedKind(null)
  }

  function updateTask(id: string, patch: Partial<SmedTask>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function loadExamples() {
    setMachine('Press brake — die swap')
    setChangeoversPerWeek('5')
    setTasks(exampleTasks())
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="smed" />

      <section className="panel">
        <h2>Quick changeover sheet (SMED)</h2>
        <p className="lede">
          Walk one real changeover with a stopwatch. For each task, tap whether
          the machine has to be stopped (internal), whether it could be done
          while it runs (external), or whether it is pure waste.
        </p>
        <div className="form-grid">
          <label>
            Machine / changeover
            <input
              value={machine}
              onChange={(e) => setMachine(e.target.value)}
              placeholder="e.g. Press brake — die swap"
            />
          </label>
          <label>
            Changeovers per week
            <input
              type="number"
              min={0}
              step="any"
              value={changeoversPerWeek}
              onChange={(e) => setChangeoversPerWeek(e.target.value)}
            />
          </label>
        </div>
        <div className="row actions">
          <button type="button" className="btn secondary" onClick={loadExamples}>
            Load example changeover
          </button>
        </div>
      </section>

      <section className="panel soft">
        <h3 className="subhead">Tap the kind of task you timed</h3>
        <p className="meta">
          The whole SMED idea: anything you can do while the machine still runs
          is free time. Anything that only exists because the shop is
          disorganized is waste you can delete today.
        </p>
        <div className="waste-chip-grid">
          {SMED_KINDS.map((k) => {
            const n = counts.get(k.id) ?? 0
            const on = selectedKind === k.id
            return (
              <button
                key={k.id}
                type="button"
                className={on ? 'waste-chip selected' : 'waste-chip'}
                onClick={() => setSelectedKind(on ? null : k.id)}
                aria-pressed={on}
              >
                <span className={`kind-letter ${k.id}`}>
                  {k.name.charAt(0)}
                </span>
                <strong>{k.name}</strong>
                <span className="waste-short">{k.everyday}</span>
                {n > 0 ? <span className="waste-count">{n}</span> : null}
              </button>
            )
          })}
        </div>
        {selectedKind ? (
          <div className="waste-detail">
            <p>
              <strong>{smedKindById(selectedKind)?.name}</strong> —{' '}
              {smedKindById(selectedKind)?.lookFor}
            </p>
            <button type="button" className="btn primary" onClick={addSelected}>
              Add this task
            </button>
          </div>
        ) : (
          <p className="meta">Pick a tile, then add the task you timed.</p>
        )}
      </section>

      {tasks.length > 0 ? (
        <section className="panel">
          <div className="row actions" style={{ justifyContent: 'space-between' }}>
            <h3 className="subhead" style={{ margin: 0 }}>
              Changeover tasks ({tasks.length})
            </h3>
            <button
              type="button"
              className="btn ghost danger"
              onClick={() => {
                if (confirm('Clear all changeover tasks?')) setTasks([])
              }}
            >
              Clear all
            </button>
          </div>
          <ul className="obs-list">
            {tasks.map((t) => {
              const kind = smedKindById(t.kind)
              return (
                <li key={t.id} className="obs-card">
                  <div className="obs-head">
                    <span className={`kind-letter sm ${t.kind}`}>
                      {kind?.name.charAt(0)}
                    </span>
                    <strong>{kind?.name}</strong>
                    <button
                      type="button"
                      className="btn ghost danger"
                      onClick={() =>
                        setTasks((prev) => prev.filter((x) => x.id !== t.id))
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <label>
                    What is the operator doing?
                    <input
                      value={t.name}
                      onChange={(e) => updateTask(t.id, { name: e.target.value })}
                      placeholder="e.g. Unbolt and lift out old die"
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Minutes today
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={t.minutes}
                        onChange={(e) =>
                          updateTask(t.id, { minutes: Number(e.target.value) })
                        }
                      />
                    </label>
                    {t.plan === 'shorten' ? (
                      <label>
                        Target minutes after
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={t.targetMinutes}
                          onChange={(e) =>
                            updateTask(t.id, {
                              targetMinutes: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    ) : null}
                  </div>
                  <div className="impact-row">
                    <span>Type</span>
                    {SMED_KINDS.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        className={
                          t.kind === k.id
                            ? `kind-chip ${k.id} on`
                            : `kind-chip ${k.id}`
                        }
                        onClick={() => updateTask(t.id, { kind: k.id })}
                        aria-pressed={t.kind === k.id}
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                  <div className="impact-row">
                    <span>Plan</span>
                    {SMED_PLANS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={
                          t.plan === p.id ? 'kind-chip on' : 'kind-chip'
                        }
                        title={p.hint}
                        onClick={() =>
                          updateTask(t.id, {
                            plan: p.id as SmedPlan,
                            targetMinutes:
                              p.id === 'shorten' && t.targetMinutes === 0
                                ? Math.max(
                                    0,
                                    Number((t.minutes / 2).toFixed(1)),
                                  )
                                : t.targetMinutes,
                          })
                        }
                        aria-pressed={t.plan === p.id}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {result ? (
        <>
          <div className="stat-strip">
            <div>
              <span>Machine stop before</span>
              <strong>{fmt(result.before.downtime, 1)} min</strong>
            </div>
            <div>
              <span>Machine stop after</span>
              <strong>{fmt(result.after.downtime, 1)} min</strong>
            </div>
            <div>
              <span>Externalized</span>
              <strong>{fmt(result.externalizedPct, 0)}%</strong>
            </div>
            <div>
              <span>Hours back / year</span>
              <strong>
                {hoursPerYear === null ? '—' : `${fmt(hoursPerYear, 1)} hr`}
              </strong>
            </div>
          </div>

          <div className="chart-card">
            <h3>Before vs after — where the setup minutes sit</h3>
            <p className="chart-caption">
              Internal and Waste both stop the machine. External happens while
              the machine keeps running, so it is free time.
            </p>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{
                      value: 'minutes',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11 },
                    }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Internal" stackId="a" fill="#9b2c2c" />
                  <Bar dataKey="Waste" stackId="a" fill="#b08948" />
                  <Bar dataKey="External" stackId="a" fill="#2f6f6a" />
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
                label="Simulate the new changeover time"
                view="montecarlo"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}

          {report ? (
            <PlainReport
              report={report}
              sourceTool="SMED changeover"
              defaultPhase="improve"
            />
          ) : null}
        </>
      ) : (
        <p className="meta">
          Add tasks with minutes above (or load the example) to see before/after
          totals and the percent you can move off-line.
        </p>
      )}
    </div>
  )
}
