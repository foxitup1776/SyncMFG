import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
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
  calcBalance,
  calcTakt,
  interpretLittlesLaw,
  interpretTakt,
  solveLittlesLaw,
  TIME_UNITS,
  unitShort,
  type LittleSolveFor,
  type Station,
  type TimeUnit,
} from '../lean/flow'
import { fmt } from '../stats/descriptive'

const OVER = '#9b2c2c'
const UNDER = '#2f6f6a'

function newStation(partial?: Partial<Station>): Station {
  return {
    id: crypto.randomUUID(),
    name: '',
    cycleTime: 0,
    operators: 1,
    ...partial,
  }
}

function exampleStations(): Station[] {
  return [
    newStation({ name: 'Load blank', cycleTime: 38 }),
    newStation({ name: 'Press', cycleTime: 51 }),
    newStation({ name: 'Deburr', cycleTime: 72 }),
    newStation({ name: 'Inspect', cycleTime: 31 }),
    newStation({ name: 'Pack', cycleTime: 44 }),
  ]
}

export function TaktTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [availableTime, setAvailableTime] = usePersistedState(
    'tool.takt.available',
    '450',
  )
  const [availableUnit, setAvailableUnit] = usePersistedState<TimeUnit>(
    'tool.takt.availableUnit',
    'minutes',
  )
  const [demand, setDemand] = usePersistedState('tool.takt.demand', '500')
  const [stationUnit, setStationUnit] = usePersistedState<TimeUnit>(
    'tool.takt.stationUnit',
    'seconds',
  )
  const [stations, setStations] = usePersistedState<Station[]>(
    'tool.takt.stations',
    exampleStations(),
  )

  const [solveFor, setSolveFor] = usePersistedState<LittleSolveFor>(
    'tool.takt.ll.solveFor',
    'leadTime',
  )
  const [wip, setWip] = usePersistedState('tool.takt.ll.wip', '240')
  const [throughput, setThroughput] = usePersistedState(
    'tool.takt.ll.throughput',
    '60',
  )
  const [throughputUnit, setThroughputUnit] = usePersistedState<TimeUnit>(
    'tool.takt.ll.throughputUnit',
    'hours',
  )
  const [leadTime, setLeadTime] = usePersistedState('tool.takt.ll.lead', '4')
  const [leadTimeUnit, setLeadTimeUnit] = usePersistedState<TimeUnit>(
    'tool.takt.ll.leadUnit',
    'hours',
  )

  const takt = useMemo(
    () =>
      calcTakt({
        availableTime: Number(availableTime),
        availableUnit,
        customerDemand: Number(demand),
      }),
    [availableTime, availableUnit, demand],
  )

  const balance = useMemo(
    () => (takt ? calcBalance(stations, stationUnit, takt) : null),
    [stations, stationUnit, takt],
  )

  const little = useMemo(
    () =>
      solveLittlesLaw({
        solveFor,
        wip: Number(wip),
        throughput: Number(throughput),
        throughputUnit,
        leadTime: Number(leadTime),
        leadTimeUnit,
      }),
    [solveFor, wip, throughput, throughputUnit, leadTime, leadTimeUnit],
  )

  const taktInterp = useMemo(
    () => (takt ? interpretTakt(takt, balance) : null),
    [takt, balance],
  )
  const littleInterp = useMemo(
    () => (little ? interpretLittlesLaw(little) : null),
    [little],
  )

  const chartData = useMemo(
    () =>
      balance
        ? balance.loads.map((l) => ({
            name: l.name.trim() || 'Station',
            seconds: Number(l.cycleSeconds.toFixed(1)),
            over: l.overTakt,
          }))
        : [],
    [balance],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!takt) return null
    const bullets: string[] = [
      `Takt = available time ÷ customer demand = ${fmt(takt.availableMinutes, 1)} min ÷ ${fmt(takt.customerDemand, 0)} pieces = ${fmt(takt.taktSeconds, 1)} sec (${fmt(takt.taktMinutes, 2)} min) per piece.`,
      `Demand pace ≈ ${fmt(takt.demandPerHour, 1)} piece(s) per hour. Available time means real running time — breaks, planned meetings, and scheduled cleaning are already taken out.`,
    ]

    if (balance) {
      bullets.push(
        `Slowest station (bottleneck): “${balance.bottleneck.name.trim() || 'Station'}” at ${fmt(balance.bottleneck.cycleSeconds, 1)} sec — the line can only go as fast as this station.`,
        `Line balance efficiency ${fmt(balance.balanceEfficiencyPct, 1)}%, so imbalance is ${fmt(balance.imbalancePct, 1)}% (${fmt(balance.idleSeconds, 1)} idle sec per piece waiting on the bottleneck).`,
        balance.meetsTakt
          ? `Capacity ≈ ${fmt(balance.capacityUnits, 0)} piece(s) in the available time — enough for demand of ${fmt(takt.customerDemand, 0)}.`
          : `Capacity ≈ ${fmt(balance.capacityUnits, 0)} piece(s) versus demand of ${fmt(takt.customerDemand, 0)} — the line misses takt until the bottleneck gets lighter.`,
        `Total work content ${fmt(balance.totalWorkSeconds, 1)} sec ÷ takt ${fmt(takt.taktSeconds, 1)} sec means the job could theoretically fit in ${balance.theoreticalStations} balanced station(s).`,
      )
    } else {
      bullets.push(
        'Add station cycle times to see who is over takt and how lumpy the load is.',
      )
    }

    if (little) {
      bullets.push(
        `Little's Law: WIP ${fmt(little.wip, 1)} piece(s) ≈ throughput ${fmt(little.throughput, 2)} per ${unitShort(little.throughputUnit)} × lead time ${fmt(little.leadTime, 2)} ${unitShort(little.leadTimeUnit)}. Solved for ${little.answerLabel.toLowerCase()}.`,
        'Fewer pieces started at once shortens lead time at the same throughput — that is why one-piece flow beats big batches.',
      )
    }

    bullets.push(
      'Do not ask people to beat takt. Take work off the slowest station, or move a task to a station that is waiting.',
    )

    return {
      title: 'Pace the line — takt, balance, and flow',
      summary: `One good piece must finish every ${fmt(takt.taktSeconds, 1)} seconds to keep up with the customer.${balance ? ` The slowest station runs ${fmt(balance.bottleneck.cycleSeconds, 1)} sec, so the line ${balance.meetsTakt ? 'can hold' : 'cannot hold'} that pace and load imbalance is ${fmt(balance.imbalancePct, 1)}%.` : ''}`,
      bullets,
      termsUsed: [
        'takt time',
        'cycle time',
        'bottleneck',
        'line balance',
        "little's law",
        'work in process',
        'throughput',
        'lead time',
      ],
    }
  }, [takt, balance, little])

  function updateStation(id: string, patch: Partial<Station>) {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
  }

  /**
   * Keep the three Little's Law fields consistent: whatever we just calculated
   * becomes a real input before we start solving for something else.
   */
  function switchSolveFor(next: LittleSolveFor) {
    if (little && next !== solveFor) {
      if (solveFor === 'wip') setWip(fmt(little.wip, 2))
      if (solveFor === 'throughput') setThroughput(fmt(little.throughput, 2))
      if (solveFor === 'leadTime') setLeadTime(fmt(little.leadTime, 2))
    }
    setSolveFor(next)
  }

  function fillExample() {
    setAvailableTime('450')
    setAvailableUnit('minutes')
    setDemand('500')
    setStationUnit('seconds')
    setStations(exampleStations())
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="takt" />

      <section className="panel">
        <h2>Pace the line (takt time)</h2>
        <p className="lede">
          Takt is the customer’s drumbeat: how often one good piece has to come
          off the line. Enter the time you really have and what the customer
          wants — no advanced math.
        </p>
        <div className="row actions">
          <button type="button" className="btn secondary" onClick={fillExample}>
            Fill example
          </button>
        </div>
        <div className="form-grid">
          <label>
            Available run time
            <input
              type="number"
              min={0}
              step="any"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
            />
          </label>
          <label>
            Time unit
            <select
              value={availableUnit}
              onChange={(e) => setAvailableUnit(e.target.value as TimeUnit)}
            >
              {TIME_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Customer demand (pieces in that time)
            <input
              type="number"
              min={0}
              step="any"
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
            />
          </label>
        </div>
        <p className="meta">
          Available time is running time only — take out breaks, planned
          meetings, and scheduled cleaning first. Example: an 8-hour shift with
          30 minutes of breaks is 450 minutes.
        </p>
      </section>

      {takt ? (
        <div className="stat-strip">
          <div>
            <span>Takt (sec/piece)</span>
            <strong>{fmt(takt.taktSeconds, 1)}</strong>
          </div>
          <div>
            <span>Takt (min/piece)</span>
            <strong>{fmt(takt.taktMinutes, 2)}</strong>
          </div>
          <div>
            <span>Demand pace</span>
            <strong>{fmt(takt.demandPerHour, 1)}/hr</strong>
          </div>
          <div>
            <span>Available</span>
            <strong>{fmt(takt.availableMinutes, 0)} min</strong>
          </div>
        </div>
      ) : (
        <p className="form-error">
          Enter available time &gt; 0 and customer demand &gt; 0 to get takt.
        </p>
      )}

      <section className="panel">
        <h3 className="subhead">Station cycle times vs takt</h3>
        <p className="meta">
          Cycle time is how long one station needs per piece. Keep every station
          in the same unit.
        </p>
        <label className="inline-target">
          Station time unit
          <select
            value={stationUnit}
            onChange={(e) => setStationUnit(e.target.value as TimeUnit)}
          >
            {TIME_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>

        <div className="steps-table-wrap">
          <table className="steps-table">
            <thead>
              <tr>
                <th>Station / operator</th>
                <th>Cycle ({unitShort(stationUnit)})</th>
                <th>People</th>
                <th>vs takt</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => {
                const load = balance?.loads.find((l) => l.id === s.id)
                return (
                  <tr key={s.id}>
                    <td>
                      <input
                        value={s.name}
                        onChange={(e) =>
                          updateStation(s.id, { name: e.target.value })
                        }
                        placeholder="Station name"
                      />
                    </td>
                    <td>
                      <input
                        inputMode="decimal"
                        value={s.cycleTime}
                        onChange={(e) =>
                          updateStation(s.id, {
                            cycleTime: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        inputMode="numeric"
                        value={s.operators}
                        onChange={(e) =>
                          updateStation(s.id, {
                            operators: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      {load ? (
                        <span
                          className={
                            load.overTakt ? 'load-tag over' : 'load-tag under'
                          }
                        >
                          {fmt(load.loadPct, 0)}% of takt
                        </span>
                      ) : (
                        <span className="meta">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn ghost danger"
                        onClick={() =>
                          setStations((prev) =>
                            prev.filter((x) => x.id !== s.id),
                          )
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="row actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => setStations((prev) => [...prev, newStation()])}
          >
            Add station
          </button>
        </div>
      </section>

      {takt && balance ? (
        <>
          <div className="chart-card">
            <h3>Load chart — station time against takt</h3>
            <p className="chart-caption">
              Each bar is one station’s cycle time in seconds. The dashed line
              is takt: bars above it cannot keep up with the customer.
            </p>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{
                      value: 'sec / piece',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11 },
                    }}
                  />
                  <Tooltip />
                  <ReferenceLine
                    y={Number(takt.taktSeconds.toFixed(1))}
                    stroke={OVER}
                    strokeDasharray="6 4"
                    label={{ value: 'Takt', position: 'right', fontSize: 11 }}
                  />
                  <Bar dataKey="seconds" name="Cycle time (sec)">
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={d.over ? OVER : UNDER} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stat-strip">
            <div>
              <span>Bottleneck</span>
              <strong>{fmt(balance.bottleneckSeconds, 1)} sec</strong>
            </div>
            <div>
              <span>Imbalance</span>
              <strong>{fmt(balance.imbalancePct, 1)}%</strong>
            </div>
            <div>
              <span>Balance efficiency</span>
              <strong>{fmt(balance.balanceEfficiencyPct, 1)}%</strong>
            </div>
            <div>
              <span>Capacity</span>
              <strong>{fmt(balance.capacityUnits, 0)} pcs</strong>
            </div>
          </div>
        </>
      ) : null}

      {taktInterp ? (
        <InterpretBanner
          title={taktInterp.title}
          plain={taktInterp.plain}
          meta={taktInterp.meta}
        >
          <NextStepCta
            label={
              balance && !balance.meetsTakt
                ? 'Open OEE — is it downtime or speed?'
                : 'Open SMED changeover form'
            }
            view={balance && !balance.meetsTakt ? 'oee' : 'smed'}
            onNavigate={onNavigate}
          />
        </InterpretBanner>
      ) : null}

      <section className="panel">
        <h3 className="subhead">Little’s Law — pile of work vs lead time</h3>
        <p className="meta">
          WIP ≈ throughput × lead time. Enter the two numbers you know and we
          solve for the third. WIP means pieces started but not finished.
        </p>
        <div className="row actions">
          {(
            [
              { id: 'wip', label: 'Solve for WIP' },
              { id: 'throughput', label: 'Solve for throughput' },
              { id: 'leadTime', label: 'Solve for lead time' },
            ] as { id: LittleSolveFor; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={
                solveFor === opt.id ? 'kind-chip on' : 'kind-chip'
              }
              aria-pressed={solveFor === opt.id}
              onClick={() => switchSolveFor(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <label>
            Work in process (pieces)
            {solveFor === 'wip' ? (
              <input
                readOnly
                value={little ? fmt(little.wip, 1) : '—'}
                aria-label="Calculated work in process"
              />
            ) : (
              <input
                type="number"
                min={0}
                step="any"
                value={wip}
                onChange={(e) => setWip(e.target.value)}
              />
            )}
          </label>
          <label>
            Throughput (good pieces)
            {solveFor === 'throughput' ? (
              <input
                readOnly
                value={little ? fmt(little.throughput, 2) : '—'}
                aria-label="Calculated throughput"
              />
            ) : (
              <input
                type="number"
                min={0}
                step="any"
                value={throughput}
                onChange={(e) => setThroughput(e.target.value)}
              />
            )}
          </label>
          <label>
            per
            <select
              value={throughputUnit}
              onChange={(e) => setThroughputUnit(e.target.value as TimeUnit)}
            >
              {TIME_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lead time
            {solveFor === 'leadTime' ? (
              <input
                readOnly
                value={little ? fmt(little.leadTime, 2) : '—'}
                aria-label="Calculated lead time"
              />
            ) : (
              <input
                type="number"
                min={0}
                step="any"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
              />
            )}
          </label>
          <label>
            Lead time unit
            <select
              value={leadTimeUnit}
              onChange={(e) => setLeadTimeUnit(e.target.value as TimeUnit)}
            >
              {TIME_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {little ? null : (
          <p className="form-error">
            Enter the other two values above (all greater than zero) and we will
            solve the third.
          </p>
        )}
      </section>

      {littleInterp && little ? (
        <InterpretBanner
          title={littleInterp.title}
          plain={littleInterp.plain}
          meta={littleInterp.meta}
        >
          <NextStepCta
            label="Model changeover time risk"
            view="montecarlo"
            onNavigate={onNavigate}
          />
        </InterpretBanner>
      ) : null}

      {report ? (
        <PlainReport
          report={report}
          sourceTool="Takt & flow"
          defaultPhase="measure"
        />
      ) : null}
    </div>
  )
}
