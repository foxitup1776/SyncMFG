import { normalCdf, normalQuantile } from './normal'
import { noncentralTCdf, studentTQuantile } from './special'

/**
 * “How many do I need?” planning math (power analysis).
 *
 * Measured two-group and paired plans use Minitab’s noncentral-t power
 * (Stat > Power and Sample Size > 2-Sample t / Paired t). Rate plans keep the
 * normal-approximation formulas.
 */

export type PlanKind = 'mean2' | 'meanPaired' | 'prop1' | 'prop2'

export interface PlanInput {
  kind: PlanKind
  /** Chance of a false alarm you will accept (0.05 = 5%). */
  alpha: number
  /** Chance of catching a real difference (0.80 = 80%). */
  power: number
  twoSided: boolean
  /** Continuous plans: the gap you want to be able to see. */
  delta?: number
  /** Continuous plans: usual spread (std dev), or spread of the paired differences. */
  sigma?: number
  /** Rate plans: today’s rate, in percent. */
  baselinePct?: number
  /** Rate plans: the rate you want to detect, in percent. */
  targetPct?: number
  /** Optional: sample size you already have, to score its power. */
  haveN?: number | null
}

export interface PlanResult {
  kind: PlanKind
  /** Everyday label for the plan. */
  label: string
  /** Rows needed per group (or pairs for a paired plan). */
  nPerGroup: number
  /** Groups the plan needs measured. */
  groups: number
  /** Total rows to collect. */
  totalN: number
  /** Cohen's d for continuous plans; null for rate plans. */
  effectSize: number | null
  alpha: number
  power: number
  twoSided: boolean
  zAlpha: number
  zBeta: number
  /** Plain-English walk of what drove the number. */
  detail: string
  /** Power you would actually get from `haveN`, if supplied. */
  achievedPower: number | null
  achievedN: number | null
  /** Power at the integer n we report (Minitab’s “Actual Power”). */
  actualPower: number | null
  warnings: string[]
  unitLabel: string
}

const LABELS: Record<PlanKind, string> = {
  mean2: 'Two groups, measured numbers',
  meanPaired: 'Same parts before and after',
  prop1: 'One rate vs a target',
  prop2: 'Two rates side by side',
}

const UNIT_LABELS: Record<PlanKind, string> = {
  mean2: 'pieces per group',
  meanPaired: 'pairs',
  prop1: 'pieces inspected',
  prop2: 'pieces per group',
}

function critical(alpha: number, twoSided: boolean): number {
  return normalQuantile(1 - (twoSided ? alpha / 2 : alpha))
}

/** Power you would get from a given n, for the same plan. */
export function powerAtN(input: PlanInput, n: number): number | null {
  if (!Number.isFinite(n) || n < 2) return null
  const zAlpha = critical(input.alpha, input.twoSided)

  if (input.kind === 'mean2' || input.kind === 'meanPaired') {
    const delta = Math.abs(input.delta ?? 0)
    const sigma = input.sigma ?? 0
    if (delta <= 0 || sigma <= 0) return null
    return tTestPower({
      n: Math.floor(n),
      delta,
      sigma,
      alpha: input.alpha,
      twoSided: input.twoSided,
      paired: input.kind === 'meanPaired',
    })
  }

  const p0 = pct(input.baselinePct)
  const p1 = pct(input.targetPct)
  if (p0 == null || p1 == null || p0 === p1) return null
  const diff = Math.abs(p1 - p0)

  if (input.kind === 'prop1') {
    const seNull = Math.sqrt((p0 * (1 - p0)) / n)
    const seAlt = Math.sqrt((p1 * (1 - p1)) / n)
    if (seAlt <= 0) return null
    return clamp01(normalCdf((diff - zAlpha * seNull) / seAlt))
  }

  const pooled = (p0 + p1) / 2
  const seNull = Math.sqrt((2 * pooled * (1 - pooled)) / n)
  const seAlt = Math.sqrt((p0 * (1 - p0) + p1 * (1 - p1)) / n)
  if (seAlt <= 0) return null
  return clamp01(normalCdf((diff - zAlpha * seNull) / seAlt))
}

/** Minimum sample size for the plan you described. */
export function planSampleSize(input: PlanInput): PlanResult | null {
  const alpha = input.alpha
  const power = input.power
  if (!(alpha > 0 && alpha < 1) || !(power > 0 && power < 1)) return null

  const zAlpha = critical(alpha, input.twoSided)
  const zBeta = normalQuantile(power)
  const warnings: string[] = []
  let nPerGroup: number
  let groups: number
  let effectSize: number | null = null
  let detail: string

  if (input.kind === 'mean2' || input.kind === 'meanPaired') {
    const delta = Math.abs(input.delta ?? 0)
    const sigma = input.sigma ?? 0
    if (!(delta > 0) || !(sigma > 0)) return null
    effectSize = delta / sigma
    const paired = input.kind === 'meanPaired'
    nPerGroup = smallestN(
      (n) =>
        tTestPower({
          n,
          delta,
          sigma,
          alpha,
          twoSided: input.twoSided,
          paired,
        }),
      power,
    )
    groups = paired ? 1 : 2
    detail = paired
      ? `Effect size = gap ÷ spread of the differences = ${round(delta)} ÷ ${round(sigma)} = ${round(effectSize, 2)}. Because each part is its own control, a paired plan needs roughly half the rows of two separate groups.`
      : `Effect size = gap ÷ spread = ${round(delta)} ÷ ${round(sigma)} = ${round(effectSize, 2)}. Bigger gaps and tighter processes both shrink the sample you need.`
    if (effectSize < 0.2) {
      warnings.push(
        'That is a very small effect compared with your normal spread — expect a big sample, and check the gage first so measurement noise is not eating the signal.',
      )
    }
    if (nPerGroup < 5) {
      warnings.push(
        'Math says a handful of pieces is enough, but never plan under about 5 per group — you also want to see the shape of the data.',
      )
    }
  } else {
    const p0 = pct(input.baselinePct)
    const p1 = pct(input.targetPct)
    if (p0 == null || p1 == null) return null
    if (p0 === p1) return null
    const diff = Math.abs(p1 - p0)

    if (input.kind === 'prop1') {
      const raw =
        (zAlpha * Math.sqrt(p0 * (1 - p0)) + zBeta * Math.sqrt(p1 * (1 - p1))) **
          2 /
        diff ** 2
      nPerGroup = Math.max(5, Math.ceil(raw))
      groups = 1
      detail = `You want to tell ${round(p0 * 100, 2)}% apart from ${round(p1 * 100, 2)}% — a gap of ${round(diff * 100, 2)} percentage points. Rate work is expensive: halving the gap you care about roughly quadruples the count.`
    } else {
      const pooled = (p0 + p1) / 2
      const raw =
        (zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) +
          zBeta * Math.sqrt(p0 * (1 - p0) + p1 * (1 - p1))) **
          2 /
        diff ** 2
      nPerGroup = Math.max(5, Math.ceil(raw))
      groups = 2
      detail = `Comparing ${round(p0 * 100, 2)}% against ${round(p1 * 100, 2)}% means spotting a ${round(diff * 100, 2)} percentage-point gap. Counting pass/fail throws away detail, so rates always need far more pieces than measured numbers.`
    }

    const smallest = Math.min(p0, p1)
    if (nPerGroup * smallest < 5) {
      warnings.push(
        'At this rate you may still see fewer than about 5 defectives — the normal approximation gets shaky. Inspect more, or measure something continuous instead of pass/fail.',
      )
    }
  }

  const achievedN =
    input.haveN != null && Number.isFinite(input.haveN) && input.haveN >= 2
      ? Math.floor(input.haveN)
      : null
  const achievedPower =
    achievedN != null ? powerAtN(input, achievedN) : null

  if (achievedN != null && achievedN < nPerGroup) {
    warnings.push(
      `You listed ${achievedN} ${UNIT_LABELS[input.kind]}, which is short of the ${nPerGroup} the plan asks for. Collect the rest before you call a result real.`,
    )
  }

  return {
    kind: input.kind,
    label: LABELS[input.kind],
    nPerGroup,
    groups,
    totalN: nPerGroup * groups,
    effectSize,
    alpha,
    power,
    twoSided: input.twoSided,
    zAlpha,
    zBeta,
    detail,
    achievedPower,
    achievedN,
    actualPower: powerAtN(input, nPerGroup),
    warnings,
    unitLabel: UNIT_LABELS[input.kind],
  }
}

/** Power for a spread of sample sizes — the “more rows buys me what?” curve. */
export function powerCurve(
  input: PlanInput,
  target: number,
): { n: number; powerPct: number }[] {
  const top = Math.max(20, Math.ceil(target * 2))
  const step = Math.max(1, Math.round(top / 24))
  const out: { n: number; powerPct: number }[] = []
  for (let n = step * 2; n <= top; n += step) {
    const p = powerAtN(input, n)
    if (p == null) continue
    out.push({ n, powerPct: p * 100 })
  }
  return out
}

function pct(value: number | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null
  const p = value / 100
  if (p <= 0 || p >= 1) return null
  return p
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.min(1, Math.max(0, v))
}

function round(v: number, digits = 3): number {
  return Number(v.toFixed(digits))
}

/** Minitab 2-sample t / paired t power: noncentral t with λ = (δ/σ)√(n/2) or √n. */
function tTestPower(opts: {
  n: number
  delta: number
  sigma: number
  alpha: number
  twoSided: boolean
  paired: boolean
}): number {
  const n = opts.n
  const df = opts.paired ? n - 1 : 2 * n - 2
  if (df < 1 || opts.sigma <= 0) return 0
  const lambda = opts.paired
    ? (opts.delta / opts.sigma) * Math.sqrt(n)
    : (opts.delta / opts.sigma) * Math.sqrt(n / 2)
  const tCrit = studentTQuantile(
    opts.twoSided ? 1 - opts.alpha / 2 : 1 - opts.alpha,
    df,
  )
  if (opts.twoSided) {
    return clamp01(
      1 -
        noncentralTCdf(tCrit, df, lambda) +
        noncentralTCdf(-tCrit, df, lambda),
    )
  }
  return clamp01(1 - noncentralTCdf(tCrit, df, lambda))
}

/** Smallest integer n ≥ 2 whose power is at least `target`. */
function smallestN(powerOf: (n: number) => number, target: number): number {
  const maxN = 2_000_000
  const meets = (n: number) => powerOf(n) >= target - 1e-12
  if (meets(2)) return 2
  let hi = 2
  while (hi < maxN && !meets(hi)) hi = Math.min(maxN, hi * 2)
  if (!meets(hi)) return maxN
  let lo = Math.max(2, Math.floor(hi / 2))
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (meets(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}
