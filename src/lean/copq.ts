import { fmt } from '../stats/descriptive'
import type { Interpretation } from '../stats/interpretations'

/**
 * Cost of poor quality (COPQ).
 * Internal + external failure = the money poor quality already cost you.
 * Appraisal + prevention = what you spend trying to stop it.
 */
export type CopqBucket = 'internal' | 'external' | 'appraisal' | 'prevention'

export interface CopqBucketDef {
  id: CopqBucket
  name: string
  everyday: string
  /** Failure buckets are the “poor quality” half; control buckets are spend-to-prevent */
  side: 'failure' | 'control'
  lookFor: string
}

export const COPQ_BUCKETS: CopqBucketDef[] = [
  {
    id: 'internal',
    name: 'Internal failure',
    everyday: 'We caught it — scrap, rework, downtime',
    side: 'failure',
    lookFor:
      'Scrapped parts, rework hours, sorting, re-inspection, line stopped for quality',
  },
  {
    id: 'external',
    name: 'External failure',
    everyday: 'The customer caught it — returns, warranty',
    side: 'failure',
    lookFor:
      'Returns, warranty claims, credits, freight to fix it, lost orders, complaint handling',
  },
  {
    id: 'appraisal',
    name: 'Appraisal',
    everyday: 'What we spend checking',
    side: 'control',
    lookFor: 'Inspection labour, testing, audits, gage calibration, first-piece checks',
  },
  {
    id: 'prevention',
    name: 'Prevention',
    everyday: 'What we spend stopping it up front',
    side: 'control',
    lookFor:
      'Training, preventive maintenance, mistake-proofing, standard work, process capability studies',
  },
]

export function copqBucketById(id: string): CopqBucketDef | undefined {
  return COPQ_BUCKETS.find((b) => b.id === id)
}

/** One-tap starter lines so nobody stares at a blank form. */
export interface CopqItemDef {
  id: string
  bucket: CopqBucket
  label: string
  hint: string
}

export const COPQ_ITEMS: CopqItemDef[] = [
  {
    id: 'scrap',
    bucket: 'internal',
    label: 'Scrap (material + labour)',
    hint: 'Pieces thrown away — count the material and the time already in them',
  },
  {
    id: 'rework',
    bucket: 'internal',
    label: 'Rework / touch-up hours',
    hint: 'Hours spent fixing pieces × loaded labour rate',
  },
  {
    id: 'quality-downtime',
    bucket: 'internal',
    label: 'Downtime for quality',
    hint: 'Line stopped to sort, purge, or adjust after a defect',
  },
  {
    id: 'sorting',
    bucket: 'internal',
    label: 'Sorting / 100% screening',
    hint: 'Containment work you only do because the process is not capable',
  },
  {
    id: 'returns',
    bucket: 'external',
    label: 'Returns and credits',
    hint: 'Product coming back plus the credit issued',
  },
  {
    id: 'warranty',
    bucket: 'external',
    label: 'Warranty claims',
    hint: 'Field repair, replacement parts, and the labour to make it right',
  },
  {
    id: 'expedite',
    bucket: 'external',
    label: 'Expedite / premium freight',
    hint: 'Air freight and overtime to cover a quality miss',
  },
  {
    id: 'complaints',
    bucket: 'external',
    label: 'Complaint handling',
    hint: 'Quality and sales time spent on customer escapes',
  },
  {
    id: 'inspection',
    bucket: 'appraisal',
    label: 'Inspection labour',
    hint: 'Dedicated checking time — hours × rate',
  },
  {
    id: 'testing',
    bucket: 'appraisal',
    label: 'Testing and lab work',
    hint: 'Destructive tests, lab samples, outside verification',
  },
  {
    id: 'calibration',
    bucket: 'appraisal',
    label: 'Gage calibration / MSA',
    hint: 'Keeping the measurement system honest',
  },
  {
    id: 'training',
    bucket: 'prevention',
    label: 'Training and certification',
    hint: 'Operator training, standard work coaching, belt training',
  },
  {
    id: 'pm',
    bucket: 'prevention',
    label: 'Preventive maintenance',
    hint: 'Planned maintenance that keeps the process capable',
  },
  {
    id: 'pokayoke',
    bucket: 'prevention',
    label: 'Mistake-proofing / fixtures',
    hint: 'Poka-yoke, jigs, and sensors that stop the defect happening',
  },
]

export function copqItemsForBucket(bucket: CopqBucket): CopqItemDef[] {
  return COPQ_ITEMS.filter((i) => i.bucket === bucket)
}

export interface CopqLine {
  id: string
  bucket: CopqBucket
  label: string
  /** Dollars per month */
  monthly: number
  note: string
}

export interface CopqInput {
  lines: CopqLine[]
  /** Defects (scrap + rework + escapes) in a typical month — for cost per defect */
  defectsPerMonth: number
  /** Monthly sales for the area, so COPQ can be shown as a share of revenue */
  revenuePerMonth: number
}

export interface CopqBucketTotal {
  bucket: CopqBucket
  monthly: number
  annual: number
  /** Share of total cost of quality */
  sharePct: number
}

export interface CopqResult {
  buckets: CopqBucketTotal[]
  internalMonthly: number
  externalMonthly: number
  appraisalMonthly: number
  preventionMonthly: number
  /** Internal + external failure — the actual cost of poor quality */
  failureMonthly: number
  failureAnnual: number
  /** Appraisal + prevention — what you spend to keep it from happening */
  controlMonthly: number
  controlAnnual: number
  /** All four buckets: total cost of quality */
  totalMonthly: number
  totalAnnual: number
  /** Failure dollars per defect */
  costPerDefect: number | null
  /** Failure dollars as a share of sales */
  failurePctOfRevenue: number | null
  /** Failure dollars for every $1 of prevention spend */
  failurePerPreventionDollar: number | null
  /** Which failure bucket hurts more */
  worstFailure: 'internal' | 'external'
  biggestLine: CopqLine | null
}

export function calcCopq(input: CopqInput): CopqResult | null {
  const usable = input.lines.filter(
    (l) => Number.isFinite(l.monthly) && l.monthly > 0,
  )
  if (usable.length === 0) return null

  const monthlyBy: Record<CopqBucket, number> = {
    internal: 0,
    external: 0,
    appraisal: 0,
    prevention: 0,
  }
  for (const line of usable) monthlyBy[line.bucket] += line.monthly

  const failureMonthly = monthlyBy.internal + monthlyBy.external
  const controlMonthly = monthlyBy.appraisal + monthlyBy.prevention
  const totalMonthly = failureMonthly + controlMonthly

  const buckets: CopqBucketTotal[] = COPQ_BUCKETS.map((def) => ({
    bucket: def.id,
    monthly: monthlyBy[def.id],
    annual: monthlyBy[def.id] * 12,
    sharePct: totalMonthly > 0 ? (monthlyBy[def.id] / totalMonthly) * 100 : 0,
  }))

  const biggestLine = [...usable].sort((a, b) => b.monthly - a.monthly)[0] ?? null

  return {
    buckets,
    internalMonthly: monthlyBy.internal,
    externalMonthly: monthlyBy.external,
    appraisalMonthly: monthlyBy.appraisal,
    preventionMonthly: monthlyBy.prevention,
    failureMonthly,
    failureAnnual: failureMonthly * 12,
    controlMonthly,
    controlAnnual: controlMonthly * 12,
    totalMonthly,
    totalAnnual: totalMonthly * 12,
    costPerDefect:
      input.defectsPerMonth > 0 ? failureMonthly / input.defectsPerMonth : null,
    failurePctOfRevenue:
      input.revenuePerMonth > 0
        ? (failureMonthly / input.revenuePerMonth) * 100
        : null,
    failurePerPreventionDollar:
      monthlyBy.prevention > 0 ? failureMonthly / monthlyBy.prevention : null,
    worstFailure:
      monthlyBy.external > monthlyBy.internal ? 'external' : 'internal',
    biggestLine,
  }
}

export function money(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 10_000) return `$${Math.round(n).toLocaleString()}`
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function interpretCopq(result: CopqResult): Interpretation {
  const worst = result.worstFailure === 'external' ? 'external' : 'internal'
  const worstMoney =
    worst === 'external' ? result.externalMonthly : result.internalMonthly

  const perDefect =
    result.costPerDefect === null
      ? ''
      : ` Every defect costs about ${money(result.costPerDefect)} once you add the failure money up — a number worth writing on the board.`

  const revenue =
    result.failurePctOfRevenue === null
      ? ''
      : ` That is ${fmt(result.failurePctOfRevenue, 1)}% of sales walking out the door.`

  if (worst === 'external') {
    return {
      title: `Poor quality costs ${money(result.failureMonthly)} a month (${money(result.failureAnnual)} a year)`,
      plain: `The bigger half is external failure — ${money(worstMoney)} a month in returns, warranty, and freight. Escapes cost far more than the same defect caught in-house, because you pay to make the part, ship it, take it back, and repair the relationship.${revenue}${perDefect}`,
      meta: result.failurePerPreventionDollar
        ? `You lose about ${money(result.failurePerPreventionDollar)} to failures for every $1 spent on prevention — the cheapest next dollar is upstream.`
        : 'No prevention spend entered — add training, PM, and mistake-proofing to see the trade.',
    }
  }

  return {
    title: `Poor quality costs ${money(result.failureMonthly)} a month (${money(result.failureAnnual)} a year)`,
    plain: `Most of it is internal failure — ${money(worstMoney)} a month in scrap, rework, and quality downtime. Good news: you are catching it before the customer does, and internal defects are the ones a Pareto plus a capable process can actually remove.${revenue}${perDefect}`,
    meta: result.biggestLine
      ? `Biggest single line: “${result.biggestLine.label}” at ${money(result.biggestLine.monthly)}/month — start there, not with the long tail.`
      : 'Rank the biggest lines first — the vital few carry most of the money.',
  }
}
