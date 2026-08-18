/**
 * Shared normal-curve helpers.
 *
 * Kept tiny and dependency-free so sample-size planning, sigma level, and
 * proportion tests all speak the same math.
 */

import { erf } from './special'

/** Area under the bell curve to the left of z. */
export function normalCdf(z: number): number {
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

/** The z value with `p` of the curve below it (inverse of normalCdf). */
export function normalQuantile(p: number): number {
  if (p <= 0) return Number.NEGATIVE_INFINITY
  if (p >= 1) return Number.POSITIVE_INFINITY

  // Acklam's rational approximation, then one Halley refinement step.
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ]
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ]
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ]
  const pLow = 0.02425
  const pHigh = 1 - pLow

  let x: number
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p))
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  } else if (p <= pHigh) {
    const q = p - 0.5
    const r = q * q
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p))
    x =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }

  const e = normalCdf(x) - p
  const u = (e * Math.sqrt(2 * Math.PI)) / Math.exp(-(x * x) / 2)
  return x - u / (1 + (x * u) / 2)
}

/** Two-sided critical z for a significance level (alpha 0.05 → 1.96). */
export function zTwoSided(alpha: number): number {
  return normalQuantile(1 - alpha / 2)
}

/** One-sided critical z for a significance level (alpha 0.05 → 1.645). */
export function zOneSided(alpha: number): number {
  return normalQuantile(1 - alpha)
}

