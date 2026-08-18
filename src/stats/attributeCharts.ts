/**
 * Attribute control charts — the count half of the plant.
 *
 * p / np track *defective units* (pass or fail); c / u track *defects* (a unit
 * can carry several). Limits come from the count model, so there is no standard
 * deviation column to paste.
 */

export type AttributeChartKind = 'p' | 'np' | 'c' | 'u'

export interface AttributeRow {
  label: string
  /** Defectives (p / np) or defects (c / u) found in this sample. */
  count: number
  /** Pieces inspected (p / np) or inspection units (u). Ignored by c. */
  size: number
}

export interface AttributePoint {
  label: string
  value: number
  center: number
  ucl: number
  lcl: number
  count: number
  size: number
  out: boolean
}

export interface AttributeChartResult {
  kind: AttributeChartKind
  points: AttributePoint[]
  center: number
  ucl: number
  lcl: number
  /** True when subgroup sizes differ, so each point has its own limits. */
  variableLimits: boolean
  outIndexes: number[]
  totalCount: number
  totalSize: number
  avgSize: number
  /** What one point means, in everyday words. */
  valueLabel: string
  /** Units on the y-axis. */
  unitLabel: string
  warnings: string[]
}

export const CHART_META: Record<
  AttributeChartKind,
  { name: string; alsoCalled: string; plain: string; needsSize: boolean }
> = {
  p: {
    name: 'Share that failed',
    alsoCalled: 'p chart (fraction defective)',
    plain:
      'Each point is the percent of the sample that failed. Use it when the number inspected changes from day to day.',
    needsSize: true,
  },
  np: {
    name: 'How many failed',
    alsoCalled: 'np chart (number defective)',
    plain:
      'Each point is a raw count of failed pieces. Only fair when you inspect the same amount every time.',
    needsSize: true,
  },
  c: {
    name: 'Defect count per sample',
    alsoCalled: 'c chart (count of defects)',
    plain:
      'Each point is the total number of defects found — a unit can have several. Same amount inspected each time.',
    needsSize: false,
  },
  u: {
    name: 'Defects per unit',
    alsoCalled: 'u chart (defects per inspection unit)',
    plain:
      'Each point is defects divided by how much you inspected — use it when the inspected amount changes.',
    needsSize: true,
  },
}

/** Coaching: which of the four charts fits what you counted. */
export function chooseAttributeChart(opts: {
  countingDefectiveUnits: boolean
  constantSampleSize: boolean
}): { kind: AttributeChartKind; why: string } {
  if (opts.countingDefectiveUnits) {
    return opts.constantSampleSize
      ? {
          kind: 'np',
          why: 'You count pass/fail pieces and inspect the same amount each time, so a raw count (np) reads easily on the floor.',
        }
      : {
          kind: 'p',
          why: 'You count pass/fail pieces but the amount inspected moves around, so plot the share that failed (p) — otherwise a busy day looks like a bad day.',
        }
  }
  return opts.constantSampleSize
    ? {
        kind: 'c',
        why: 'You count defects (a unit can have several) with the same amount inspected each time, so plot the total count (c).',
      }
    : {
        kind: 'u',
        why: 'You count defects and the amount inspected changes, so plot defects per unit (u) to keep the comparison fair.',
      }
}

export function computeAttributeChart(
  kind: AttributeChartKind,
  rows: AttributeRow[],
): AttributeChartResult | null {
  const needsSize = CHART_META[kind].needsSize
  const clean = rows.filter((r) => {
    if (!Number.isFinite(r.count) || r.count < 0) return false
    if (needsSize && (!Number.isFinite(r.size) || r.size <= 0)) return false
    if ((kind === 'p' || kind === 'np') && r.count > r.size) return false
    return true
  })
  if (clean.length < 2) return null

  const totalCount = clean.reduce((s, r) => s + r.count, 0)
  const totalSize = clean.reduce(
    (s, r) => s + (needsSize ? r.size : 1),
    0,
  )
  const avgSize = needsSize ? totalSize / clean.length : 1
  const sizes = clean.map((r) => (needsSize ? r.size : 1))
  const variableLimits =
    needsSize && sizes.some((s) => Math.abs(s - sizes[0]) > 1e-9)
  const warnings: string[] = []

  let center: number
  let valueLabel: string
  let unitLabel: string
  let pointOf: (row: AttributeRow) => number
  let limitsOf: (row: AttributeRow) => { ucl: number; lcl: number }

  if (kind === 'p') {
    const pBar = totalCount / totalSize
    center = pBar * 100
    valueLabel = 'Share that failed'
    unitLabel = '% failed'
    pointOf = (r) => (r.count / r.size) * 100
    limitsOf = (r) => {
      const spread = 3 * Math.sqrt((pBar * (1 - pBar)) / r.size)
      return {
        ucl: Math.min(1, pBar + spread) * 100,
        lcl: Math.max(0, pBar - spread) * 100,
      }
    }
    if (avgSize * pBar < 5) {
      warnings.push(
        `On average you only expect about ${(avgSize * pBar).toFixed(1)} failed pieces per sample. Limits get twitchy below ~5 — inspect bigger samples or group days together.`,
      )
    }
  } else if (kind === 'np') {
    const pBar = totalCount / totalSize
    center = pBar * avgSize
    valueLabel = 'Failed pieces per sample'
    unitLabel = 'failed pieces'
    pointOf = (r) => r.count
    limitsOf = () => {
      const spread = 3 * Math.sqrt(center * (1 - pBar))
      return { ucl: center + spread, lcl: Math.max(0, center - spread) }
    }
    if (variableLimits) {
      warnings.push(
        `Your sample sizes are not equal, so this np chart uses the average of ${avgSize.toFixed(1)} inspected. A share-that-failed (p) chart is the honest choice here.`,
      )
    }
  } else if (kind === 'c') {
    center = totalCount / clean.length
    valueLabel = 'Defects per sample'
    unitLabel = 'defects'
    pointOf = (r) => r.count
    limitsOf = () => {
      const spread = 3 * Math.sqrt(center)
      return { ucl: center + spread, lcl: Math.max(0, center - spread) }
    }
    if (center < 5) {
      warnings.push(
        `Average count is only ${center.toFixed(1)} defects per sample. Below ~5 the lower limit sits at zero and the chart can only warn you about spikes.`,
      )
    }
  } else {
    center = totalCount / totalSize
    valueLabel = 'Defects per unit'
    unitLabel = 'defects / unit'
    pointOf = (r) => r.count / r.size
    limitsOf = (r) => {
      const spread = 3 * Math.sqrt(center / r.size)
      return { ucl: center + spread, lcl: Math.max(0, center - spread) }
    }
  }

  const points: AttributePoint[] = clean.map((r) => {
    const value = pointOf(r)
    const { ucl, lcl } = limitsOf(r)
    return {
      label: r.label,
      value,
      center,
      ucl,
      lcl,
      count: r.count,
      size: needsSize ? r.size : 1,
      out: value > ucl + 1e-9 || value < lcl - 1e-9,
    }
  })

  const outIndexes = points
    .map((p, i) => (p.out ? i : -1))
    .filter((i) => i >= 0)

  const firstLimits = points[0]

  return {
    kind,
    points,
    center,
    ucl: firstLimits.ucl,
    lcl: firstLimits.lcl,
    variableLimits,
    outIndexes,
    totalCount,
    totalSize,
    avgSize,
    valueLabel,
    unitLabel,
    warnings,
  }
}

/** Longest run of points on one side of the center line (a shift clue). */
export function longestRunOneSide(points: AttributePoint[]): number {
  let best = 0
  let run = 0
  let above: boolean | null = null
  for (const p of points) {
    if (p.value === p.center) {
      run = 0
      above = null
      continue
    }
    const isAbove = p.value > p.center
    if (isAbove === above) {
      run += 1
    } else {
      above = isAbove
      run = 1
    }
    if (run > best) best = run
  }
  return best
}
