import { normalCdf, zTwoSided } from './normal'

/**
 * Hypothesis tests for counted data: one rate against a target, two rates
 * against each other, and a table of categories against groups (chi-square).
 */

export interface OneProportionResult {
  x: number
  n: number
  pHat: number
  p0: number
  z: number
  pValue: number
  /** Wilson score interval — behaves better than the textbook ± formula on small counts. */
  ciLow: number
  ciHigh: number
  confidencePct: number
  /** True when the normal approximation is reasonable (≥5 each way). */
  largeSampleOk: boolean
  higher: boolean
}

/** One rate vs a target rate (both as 0–1 fractions). */
export function oneProportionTest(
  x: number,
  n: number,
  p0: number,
  alpha = 0.05,
): OneProportionResult | null {
  if (!Number.isFinite(x) || !Number.isFinite(n) || !Number.isFinite(p0)) {
    return null
  }
  if (n <= 0 || x < 0 || x > n || p0 <= 0 || p0 >= 1) return null

  const pHat = x / n
  const se = Math.sqrt((p0 * (1 - p0)) / n)
  if (se <= 0) return null
  const z = (pHat - p0) / se
  const pValue = 2 * (1 - normalCdf(Math.abs(z)))
  const zc = zTwoSided(alpha)

  // Wilson score interval
  const denom = 1 + (zc * zc) / n
  const centre = (pHat + (zc * zc) / (2 * n)) / denom
  const half =
    (zc * Math.sqrt((pHat * (1 - pHat)) / n + (zc * zc) / (4 * n * n))) / denom

  return {
    x,
    n,
    pHat,
    p0,
    z,
    pValue: clamp01(pValue),
    ciLow: Math.max(0, centre - half),
    ciHigh: Math.min(1, centre + half),
    confidencePct: (1 - alpha) * 100,
    largeSampleOk: n * p0 >= 5 && n * (1 - p0) >= 5,
    higher: pHat > p0,
  }
}

export interface TwoProportionResult {
  x1: number
  n1: number
  x2: number
  n2: number
  p1: number
  p2: number
  /** p1 − p2, as a fraction. */
  diff: number
  pPooled: number
  z: number
  pValue: number
  /** Confidence interval on the gap between the two rates. */
  ciLow: number
  ciHigh: number
  confidencePct: number
  largeSampleOk: boolean
  /** How many times more likely group 1 is to fail. */
  ratio: number | null
}

/** Two rates side by side (pooled-variance z test plus a CI on the gap). */
export function twoProportionTest(
  x1: number,
  n1: number,
  x2: number,
  n2: number,
  alpha = 0.05,
): TwoProportionResult | null {
  const finite = [x1, n1, x2, n2].every((v) => Number.isFinite(v))
  if (!finite) return null
  if (n1 <= 0 || n2 <= 0) return null
  if (x1 < 0 || x2 < 0 || x1 > n1 || x2 > n2) return null

  const p1 = x1 / n1
  const p2 = x2 / n2
  const diff = p1 - p2
  const pPooled = (x1 + x2) / (n1 + n2)
  const sePooled = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2))
  if (sePooled <= 0) return null
  const z = diff / sePooled
  const pValue = clamp01(2 * (1 - normalCdf(Math.abs(z))))

  const seDiff = Math.sqrt(
    (p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2,
  )
  const zc = zTwoSided(alpha)

  return {
    x1,
    n1,
    x2,
    n2,
    p1,
    p2,
    diff,
    pPooled,
    z,
    pValue,
    ciLow: diff - zc * seDiff,
    ciHigh: diff + zc * seDiff,
    confidencePct: (1 - alpha) * 100,
    largeSampleOk:
      n1 * pPooled >= 5 &&
      n1 * (1 - pPooled) >= 5 &&
      n2 * pPooled >= 5 &&
      n2 * (1 - pPooled) >= 5,
    ratio: p2 > 0 ? p1 / p2 : null,
  }
}

export interface ChiSquareCell {
  row: string
  col: string
  observed: number
  expected: number
  /** Its slice of the total chi-square — the biggest slices tell the story. */
  contribution: number
  /** Standardized residual: positive means “more than expected here”. */
  residual: number
}

export interface ChiSquareResult {
  rowLabels: string[]
  colLabels: string[]
  observed: number[][]
  expected: number[][]
  rowTotals: number[]
  colTotals: number[]
  total: number
  chiSq: number
  df: number
  pValue: number
  minExpected: number
  /** True when some expected count is under 5 (the classic caution). */
  lowExpectedWarning: boolean
  /** Effect size 0–1: how strongly the split depends on the group. */
  cramersV: number
  topCells: ChiSquareCell[]
}

/** Chi-square test of a categories × groups table (contingency test). */
export function chiSquareContingency(
  rowLabels: string[],
  colLabels: string[],
  observed: number[][],
): ChiSquareResult | null {
  const rows = observed.length
  if (rows < 2) return null
  const cols = observed[0]?.length ?? 0
  if (cols < 2) return null
  if (observed.some((r) => r.length !== cols)) return null
  if (observed.some((r) => r.some((v) => !Number.isFinite(v) || v < 0))) {
    return null
  }

  const rowTotals = observed.map((r) => r.reduce((s, v) => s + v, 0))
  const colTotals = Array.from({ length: cols }, (_, j) =>
    observed.reduce((s, r) => s + r[j], 0),
  )
  const total = rowTotals.reduce((s, v) => s + v, 0)
  if (total <= 0) return null
  if (rowTotals.some((v) => v <= 0) || colTotals.some((v) => v <= 0)) return null

  const expected = observed.map((_, i) =>
    Array.from({ length: cols }, (_, j) => (rowTotals[i] * colTotals[j]) / total),
  )

  let chiSq = 0
  let minExpected = Number.POSITIVE_INFINITY
  const cells: ChiSquareCell[] = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const e = expected[i][j]
      const o = observed[i][j]
      if (e < minExpected) minExpected = e
      const contribution = e > 0 ? (o - e) ** 2 / e : 0
      chiSq += contribution
      cells.push({
        row: rowLabels[i] ?? `Row ${i + 1}`,
        col: colLabels[j] ?? `Group ${j + 1}`,
        observed: o,
        expected: e,
        contribution,
        residual: e > 0 ? (o - e) / Math.sqrt(e) : 0,
      })
    }
  }

  const df = (rows - 1) * (cols - 1)
  const pValue = chiSquarePValue(chiSq, df)
  const cramersV = Math.sqrt(
    chiSq / (total * Math.max(1, Math.min(rows, cols) - 1)),
  )

  return {
    rowLabels,
    colLabels,
    observed,
    expected,
    rowTotals,
    colTotals,
    total,
    chiSq,
    df,
    pValue,
    minExpected,
    lowExpectedWarning: minExpected < 5,
    cramersV: Math.min(1, cramersV),
    topCells: [...cells]
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3),
  }
}

/** Right-tail area of the chi-square curve. */
export function chiSquarePValue(x: number, df: number): number {
  if (!Number.isFinite(x) || x <= 0 || df < 1) return 1
  return clamp01(1 - lowerGamma(df / 2, x / 2))
}

/** Regularized lower incomplete gamma P(a, x). */
function lowerGamma(a: number, x: number): number {
  if (x <= 0) return 0
  if (x < a + 1) {
    // Series expansion
    let sum = 1 / a
    let term = sum
    for (let n = 1; n < 300; n++) {
      term *= x / (a + n)
      sum += term
      if (Math.abs(term) < Math.abs(sum) * 1e-14) break
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a))
  }
  // Continued fraction for the upper tail, then flip
  let b = x + 1 - a
  let c = 1 / 1e-30
  let d = 1 / b
  let h = d
  for (let i = 1; i < 300; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = b + an / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-14) break
  }
  const q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
  return 1 - q
}

function logGamma(z: number): number {
  const g = 7
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843696540789804e-6, 1.5056327351493116e-7,
  ]
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
  }
  z -= 1
  let x = p[0]
  for (let i = 1; i < p.length; i++) x += p[i] / (z + i)
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 1
  return Math.min(1, Math.max(0, v))
}
