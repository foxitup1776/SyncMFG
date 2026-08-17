import { fmt } from '../stats/descriptive'
import type { Interpretation } from '../stats/interpretations'

/** Time units operators actually use on the floor. */
export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days'

const MINUTES_PER: Record<TimeUnit, number> = {
  seconds: 1 / 60,
  minutes: 1,
  hours: 60,
  days: 60 * 24,
}

export const TIME_UNITS: { id: TimeUnit; label: string; short: string }[] = [
  { id: 'seconds', label: 'Seconds', short: 'sec' },
  { id: 'minutes', label: 'Minutes', short: 'min' },
  { id: 'hours', label: 'Hours', short: 'hr' },
  { id: 'days', label: 'Days', short: 'days' },
]

export function unitShort(unit: TimeUnit): string {
  return TIME_UNITS.find((u) => u.id === unit)?.short ?? unit
}

export function toMinutes(value: number, unit: TimeUnit): number {
  return value * MINUTES_PER[unit]
}

export function fromMinutes(minutes: number, unit: TimeUnit): number {
  return minutes / MINUTES_PER[unit]
}

/* ------------------------------------------------------------------ *
 * Takt time — the pace customer demand sets for the line
 * ------------------------------------------------------------------ */

export interface TaktInput {
  /** Time the line is actually available to run in one period */
  availableTime: number
  availableUnit: TimeUnit
  /** Units the customer wants in that same period */
  customerDemand: number
}

export interface TaktResult {
  /** Available time expressed in minutes */
  availableMinutes: number
  customerDemand: number
  /** Seconds of takt per unit */
  taktSeconds: number
  /** Minutes of takt per unit */
  taktMinutes: number
  /** Demand rate expressed as units per hour */
  demandPerHour: number
}

/** Takt = available time ÷ customer demand. */
export function calcTakt(input: TaktInput): TaktResult | null {
  const { availableTime, availableUnit, customerDemand } = input
  if (!Number.isFinite(availableTime) || !Number.isFinite(customerDemand)) {
    return null
  }
  if (availableTime <= 0 || customerDemand <= 0) return null

  const availableMinutes = toMinutes(availableTime, availableUnit)
  const taktMinutes = availableMinutes / customerDemand

  return {
    availableMinutes,
    customerDemand,
    taktMinutes,
    taktSeconds: taktMinutes * 60,
    demandPerHour: customerDemand / (availableMinutes / 60),
  }
}

/* ------------------------------------------------------------------ *
 * Cycle balance — station times against takt
 * ------------------------------------------------------------------ */

export interface Station {
  id: string
  name: string
  /** Cycle time per unit, in the tool's chosen station unit */
  cycleTime: number
  /** People staffed at this station */
  operators: number
}

export interface StationLoad extends Station {
  /** Cycle time converted to seconds */
  cycleSeconds: number
  /** Percent of takt this station consumes (100% = exactly at pace) */
  loadPct: number
  /** Seconds above (positive) or below (negative) takt */
  vsTaktSeconds: number
  overTakt: boolean
}

export interface BalanceResult {
  loads: StationLoad[]
  /** Sum of every station cycle time, in seconds */
  totalWorkSeconds: number
  /** Slowest station — the pace-setter */
  bottleneck: StationLoad
  /** Line output pace set by the bottleneck, in seconds per unit */
  bottleneckSeconds: number
  /** sum(cycle) / (stations × bottleneck) × 100 */
  balanceEfficiencyPct: number
  /** 100 − balance efficiency: work that sits idle waiting on the bottleneck */
  imbalancePct: number
  /** Idle seconds per unit spread across the line */
  idleSeconds: number
  /** Stations busier than takt (cannot hold the pace) */
  overTaktCount: number
  /** Fewest stations the work content could theoretically fill at takt */
  theoreticalStations: number
  /** Can the bottleneck keep up with demand? */
  meetsTakt: boolean
  /** Units the line can make in the available time at bottleneck pace */
  capacityUnits: number
}

export function calcBalance(
  stations: Station[],
  stationUnit: TimeUnit,
  takt: TaktResult,
): BalanceResult | null {
  const usable = stations.filter(
    (s) => Number.isFinite(s.cycleTime) && s.cycleTime > 0,
  )
  if (usable.length === 0) return null

  const taktSeconds = takt.taktSeconds
  const loads: StationLoad[] = usable.map((s) => {
    const cycleSeconds = toMinutes(s.cycleTime, stationUnit) * 60
    return {
      ...s,
      cycleSeconds,
      loadPct: (cycleSeconds / taktSeconds) * 100,
      vsTaktSeconds: cycleSeconds - taktSeconds,
      overTakt: cycleSeconds > taktSeconds,
    }
  })

  const totalWorkSeconds = loads.reduce((sum, l) => sum + l.cycleSeconds, 0)
  const bottleneck = loads.reduce((worst, l) =>
    l.cycleSeconds > worst.cycleSeconds ? l : worst,
  )
  const bottleneckSeconds = bottleneck.cycleSeconds
  const balanceEfficiencyPct =
    (totalWorkSeconds / (loads.length * bottleneckSeconds)) * 100

  return {
    loads,
    totalWorkSeconds,
    bottleneck,
    bottleneckSeconds,
    balanceEfficiencyPct,
    imbalancePct: 100 - balanceEfficiencyPct,
    idleSeconds: loads.length * bottleneckSeconds - totalWorkSeconds,
    overTaktCount: loads.filter((l) => l.overTakt).length,
    theoreticalStations: Math.max(1, Math.ceil(totalWorkSeconds / taktSeconds)),
    meetsTakt: bottleneckSeconds <= taktSeconds,
    capacityUnits: (takt.availableMinutes * 60) / bottleneckSeconds,
  }
}

/* ------------------------------------------------------------------ *
 * Little's Law — WIP ≈ throughput × lead time
 * ------------------------------------------------------------------ */

export type LittleSolveFor = 'wip' | 'throughput' | 'leadTime'

export interface LittleInput {
  solveFor: LittleSolveFor
  /** Pieces sitting in the process (started but not finished) */
  wip: number
  /** Finished units per throughputUnit */
  throughput: number
  throughputUnit: TimeUnit
  /** How long one unit takes to get all the way through */
  leadTime: number
  leadTimeUnit: TimeUnit
}

export interface LittleResult {
  solveFor: LittleSolveFor
  wip: number
  throughput: number
  throughputUnit: TimeUnit
  leadTime: number
  leadTimeUnit: TimeUnit
  /** The value we calculated, formatted with its own label */
  answerLabel: string
  answerValue: number
}

/**
 * Little's Law: WIP = throughput × lead time.
 * Everything is normalised through minutes so the three inputs can each use
 * whatever unit the floor talks in (parts/hour with lead time in days, etc).
 */
export function solveLittlesLaw(input: LittleInput): LittleResult | null {
  const { solveFor, throughputUnit, leadTimeUnit } = input
  const perMinute = input.throughput / MINUTES_PER[throughputUnit]
  const leadMinutes = toMinutes(input.leadTime, leadTimeUnit)

  if (solveFor === 'wip') {
    if (!(perMinute > 0) || !(leadMinutes > 0)) return null
    const wip = perMinute * leadMinutes
    return {
      ...input,
      wip,
      answerLabel: 'Work in process (pieces)',
      answerValue: wip,
    }
  }

  if (solveFor === 'throughput') {
    if (!(input.wip > 0) || !(leadMinutes > 0)) return null
    const throughputPerMinute = input.wip / leadMinutes
    const throughput = throughputPerMinute * MINUTES_PER[throughputUnit]
    return {
      ...input,
      throughput,
      answerLabel: `Throughput (pieces per ${unitShort(throughputUnit)})`,
      answerValue: throughput,
    }
  }

  if (!(input.wip > 0) || !(perMinute > 0)) return null
  const leadMinutesOut = input.wip / perMinute
  const leadTime = fromMinutes(leadMinutesOut, leadTimeUnit)
  return {
    ...input,
    leadTime,
    answerLabel: `Lead time (${unitShort(leadTimeUnit)})`,
    answerValue: leadTime,
  }
}

/* ------------------------------------------------------------------ *
 * Plain-English coaching
 * ------------------------------------------------------------------ */

export function interpretTakt(
  takt: TaktResult,
  balance: BalanceResult | null,
): Interpretation {
  if (!balance) {
    return {
      title: `Takt ≈ ${fmt(takt.taktSeconds, 1)} sec per piece`,
      plain: `Customer demand of ${fmt(takt.customerDemand, 0)} piece(s) in ${fmt(takt.availableMinutes, 1)} available minutes means one good piece must come off the line every ${fmt(takt.taktSeconds, 1)} seconds (${fmt(takt.taktMinutes, 2)} min). Takt is the customer's drumbeat — not a stretch goal you invent.`,
      meta: 'Add station cycle times next to see who can and cannot hold that pace.',
    }
  }

  const b = balance.bottleneck
  if (!balance.meetsTakt) {
    return {
      title: `“${b.name}” is the bottleneck — the line cannot hold takt`,
      plain: `Takt is ${fmt(takt.taktSeconds, 1)} sec per piece, but “${b.name}” needs ${fmt(b.cycleSeconds, 1)} sec (${fmt(b.loadPct, 0)}% of takt). The whole line runs at the slowest station, so real output caps near ${fmt(balance.capacityUnits, 0)} piece(s) versus the ${fmt(takt.customerDemand, 0)} the customer wants. Take work off that station before asking anyone to hurry.`,
      meta: `Imbalance ${fmt(balance.imbalancePct, 1)}% · ${balance.overTaktCount} station(s) over takt · ${fmt(balance.idleSeconds, 1)} idle sec per piece elsewhere.`,
    }
  }

  if (balance.imbalancePct >= 20) {
    return {
      title: `Line keeps takt, but the load is lumpy (${fmt(balance.imbalancePct, 1)}% imbalance)`,
      plain: `Every station is inside the ${fmt(takt.taktSeconds, 1)} sec takt, so demand is covered. But “${b.name}” at ${fmt(b.cycleSeconds, 1)} sec sets the real pace while the rest wait — about ${fmt(balance.idleSeconds, 1)} idle seconds per piece across the line. Move a little work from the busiest station to the quietest and the same people make more.`,
      meta: `Balance efficiency ${fmt(balance.balanceEfficiencyPct, 1)}% · work content ${fmt(balance.totalWorkSeconds, 1)} sec could theoretically fill ${balance.theoreticalStations} station(s).`,
    }
  }

  return {
    title: `Balanced line holding takt (${fmt(balance.balanceEfficiencyPct, 1)}% balance)`,
    plain: `Slowest station “${b.name}” runs ${fmt(b.cycleSeconds, 1)} sec against a ${fmt(takt.taktSeconds, 1)} sec takt, and station loads sit close together (${fmt(balance.imbalancePct, 1)}% imbalance). Protect this pace with standard work — then look at changeover or downtime losses for the next gain.`,
    meta: `Capacity ≈ ${fmt(balance.capacityUnits, 0)} piece(s) in the available time vs demand of ${fmt(takt.customerDemand, 0)}.`,
  }
}

export function interpretLittlesLaw(result: LittleResult): Interpretation {
  const leadShort = unitShort(result.leadTimeUnit)
  const thruShort = unitShort(result.throughputUnit)

  const base = `WIP ${fmt(result.wip, 1)} piece(s) ≈ throughput ${fmt(result.throughput, 2)} per ${thruShort} × lead time ${fmt(result.leadTime, 2)} ${leadShort}.`

  if (result.solveFor === 'leadTime') {
    return {
      title: `Lead time ≈ ${fmt(result.leadTime, 2)} ${leadShort}`,
      plain: `${base} That is how long one piece really waits in your process, queue time included. Cut the pile of work in process and lead time drops with it — you do not have to run faster.`,
      meta: 'Little’s Law is an average over a stable period, not a promise for any single hot job.',
    }
  }

  if (result.solveFor === 'throughput') {
    return {
      title: `Throughput ≈ ${fmt(result.throughput, 2)} piece(s) per ${thruShort}`,
      plain: `${base} With that much work in process and that lead time, this is the rate the process is actually delivering. If it is under customer demand, the fix is flow (fewer things started at once), not more starts.`,
      meta: 'Throughput counts finished good pieces — started-but-stuck work is inventory, not output.',
    }
  }

  return {
    title: `Expected WIP ≈ ${fmt(result.wip, 1)} piece(s)`,
    plain: `${base} That is roughly how much unfinished work has to be sitting in the process to support this pace and lead time. Count what is actually on the floor: far more than this means hidden queues, and every extra piece stretches lead time.`,
    meta: 'Halve the work in process at the same throughput and lead time roughly halves — this is why one-piece flow feels faster.',
  }
}
