import { fmt } from '../stats/descriptive'
import type { Interpretation } from '../stats/interpretations'

/**
 * SMED (quick changeover) classification.
 * Internal = machine has to be stopped. External = can be done while it runs.
 * Waste = pure searching / walking / waiting that should not exist at all.
 */
export type SmedKind = 'internal' | 'external' | 'waste'

/** What the team plans to do about the task. */
export type SmedPlan = 'keep' | 'externalize' | 'eliminate' | 'shorten'

export interface SmedKindDef {
  id: SmedKind
  name: string
  everyday: string
  lookFor: string
}

export const SMED_KINDS: SmedKindDef[] = [
  {
    id: 'internal',
    name: 'Internal',
    everyday: 'Machine must be stopped',
    lookFor: 'Unbolting the die, threading material, adjusting after the swap',
  },
  {
    id: 'external',
    name: 'External',
    everyday: 'Can be done while it runs',
    lookFor: 'Staging the next die, pre-kitting tools, printing the work order',
  },
  {
    id: 'waste',
    name: 'Waste',
    everyday: 'Should not exist at all',
    lookFor: 'Hunting for a wrench, walking to the crib, waiting on a signature',
  },
]

export const SMED_PLANS: { id: SmedPlan; label: string; hint: string }[] = [
  { id: 'keep', label: 'Keep as is', hint: 'No change planned yet' },
  {
    id: 'externalize',
    label: 'Move off-line',
    hint: 'Do it while the machine is still running',
  },
  {
    id: 'eliminate',
    label: 'Eliminate',
    hint: 'Delete the task — shadow board, kit, poka-yoke',
  },
  {
    id: 'shorten',
    label: 'Shorten',
    hint: 'Same task, faster — quick clamps, no threads, no fine-tuning',
  },
]

export interface SmedTask {
  id: string
  name: string
  /** Minutes the task takes today */
  minutes: number
  kind: SmedKind
  plan: SmedPlan
  /** Target minutes when plan is “shorten” */
  targetMinutes: number
}

export function smedKindById(id: string): SmedKindDef | undefined {
  return SMED_KINDS.find((k) => k.id === id)
}

export interface SmedTotals {
  internal: number
  external: number
  waste: number
  /** Minutes the machine is down = internal + waste that happens during the stop */
  downtime: number
  /** All setup labour, on-line and off-line */
  totalWork: number
  /** Share of total setup work done off-line */
  externalSharePct: number
}

export interface SmedTaskAfter extends SmedTask {
  effectiveKind: SmedKind
  effectiveMinutes: number
  /** Minutes this task no longer costs the machine */
  downtimeSaved: number
}

export interface SmedResult {
  before: SmedTotals
  after: SmedTotals
  tasksAfter: SmedTaskAfter[]
  movedMinutes: number
  eliminatedMinutes: number
  shortenedMinutes: number
  downtimeSavedMinutes: number
  downtimeReductionPct: number
  /** Share of the original stopped-machine time now done off-line */
  externalizedPct: number
  /** Shingo's target: changeover under 10 minutes */
  singleDigitAfter: boolean
  biggestInternal: SmedTask | null
  taskCount: number
}

function emptyTotals(): SmedTotals {
  return {
    internal: 0,
    external: 0,
    waste: 0,
    downtime: 0,
    totalWork: 0,
    externalSharePct: 0,
  }
}

function finishTotals(t: SmedTotals): SmedTotals {
  t.downtime = t.internal + t.waste
  t.totalWork = t.internal + t.external + t.waste
  t.externalSharePct = t.totalWork > 0 ? (t.external / t.totalWork) * 100 : 0
  return t
}

/** Roll a task list into before/after changeover totals. */
export function calcSmed(tasks: SmedTask[]): SmedResult | null {
  const usable = tasks.filter(
    (t) => Number.isFinite(t.minutes) && t.minutes > 0,
  )
  if (usable.length === 0) return null

  const before = emptyTotals()
  const after = emptyTotals()
  const tasksAfter: SmedTaskAfter[] = []

  let movedMinutes = 0
  let eliminatedMinutes = 0
  let shortenedMinutes = 0

  for (const task of usable) {
    before[task.kind] += task.minutes

    let effectiveKind: SmedKind = task.kind
    let effectiveMinutes = task.minutes

    if (task.plan === 'eliminate') {
      effectiveMinutes = 0
      eliminatedMinutes += task.minutes
    } else if (task.plan === 'externalize') {
      effectiveKind = 'external'
      if (task.kind !== 'external') movedMinutes += task.minutes
    } else if (task.plan === 'shorten') {
      const target = Number.isFinite(task.targetMinutes)
        ? Math.max(0, task.targetMinutes)
        : task.minutes
      effectiveMinutes = Math.min(target, task.minutes)
      shortenedMinutes += task.minutes - effectiveMinutes
    }

    after[effectiveKind] += effectiveMinutes

    const downtimeBefore = task.kind === 'external' ? 0 : task.minutes
    const downtimeAfter = effectiveKind === 'external' ? 0 : effectiveMinutes
    tasksAfter.push({
      ...task,
      effectiveKind,
      effectiveMinutes,
      downtimeSaved: downtimeBefore - downtimeAfter,
    })
  }

  finishTotals(before)
  finishTotals(after)

  const downtimeSavedMinutes = before.downtime - after.downtime
  const internalTasks = usable
    .filter((t) => t.kind === 'internal')
    .sort((a, b) => b.minutes - a.minutes)

  return {
    before,
    after,
    tasksAfter,
    movedMinutes,
    eliminatedMinutes,
    shortenedMinutes,
    downtimeSavedMinutes,
    downtimeReductionPct:
      before.downtime > 0 ? (downtimeSavedMinutes / before.downtime) * 100 : 0,
    externalizedPct:
      before.downtime > 0 ? (movedMinutes / before.downtime) * 100 : 0,
    singleDigitAfter: after.downtime > 0 && after.downtime < 10,
    biggestInternal: internalTasks[0] ?? null,
    taskCount: usable.length,
  }
}

export function interpretSmed(result: SmedResult): Interpretation {
  const { before, after } = result
  const savedHoursPerYear = (changeoversPerWeek: number) =>
    fmt((result.downtimeSavedMinutes * changeoversPerWeek * 52) / 60, 1)

  if (result.downtimeSavedMinutes <= 0) {
    const wasteNote =
      before.waste > 0
        ? ` ${fmt(before.waste, 1)} min of that is pure waste (hunting, walking, waiting) — delete it first; it needs no capital.`
        : ''
    return {
      title: `Changeover stops the machine for ${fmt(before.downtime, 1)} min`,
      plain: `Right now ${fmt(before.internal, 1)} min is internal (machine down) and only ${fmt(before.external, 1)} min happens off-line.${wasteNote} Nothing is flagged to move yet — walk the list and mark anything that could be staged while the machine still runs.`,
      meta: `${fmt(before.externalSharePct, 0)}% of setup work is currently external. SMED's whole trick is pushing that number up.`,
    }
  }

  const target = result.singleDigitAfter
    ? ' That clears the single-minute (under 10 min) bar Shingo aimed at.'
    : ` Next target: keep chipping until the stop is under 10 minutes — start with “${result.biggestInternal?.name ?? 'the longest internal task'}”.`

  return {
    title: `Plan cuts the machine stop ${fmt(result.downtimeReductionPct, 0)}% — ${fmt(before.downtime, 1)} → ${fmt(after.downtime, 1)} min`,
    plain: `Moving ${fmt(result.movedMinutes, 1)} min off-line, eliminating ${fmt(result.eliminatedMinutes, 1)} min, and shortening another ${fmt(result.shortenedMinutes, 1)} min gives back ${fmt(result.downtimeSavedMinutes, 1)} min of run time per changeover — about ${savedHoursPerYear(5)} hours a year at five changeovers a week.${target}`,
    meta: `Externalized ${fmt(result.externalizedPct, 0)}% of the original stop · off-line share of total setup work ${fmt(before.externalSharePct, 0)}% → ${fmt(after.externalSharePct, 0)}%.`,
  }
}
