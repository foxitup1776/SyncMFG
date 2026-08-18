import { mean, sampleStdDev } from './descriptive'
import { studentTCdf } from './special'

export interface TTestResult {
  n1: number
  n2: number
  mean1: number
  mean2: number
  s1: number
  s2: number
  t: number
  df: number
  pValue: number
  meanDiff: number
  ciLow: number
  ciHigh: number
  se: number
}

function tCritical(df: number, alpha = 0.05): number {
  // binary search for t where studentTCdf(t, df) = 1 - alpha/2
  let lo = 0,
    hi = 50
  const target = 1 - alpha / 2
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (studentTCdf(mid, df) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * Welch two-sample t-test (does not assume equal variances).
 * Same method Minitab uses when Assume equal variances is off, including
 * truncating Welch–Satterthwaite df to an integer.
 */
export function welchTTest(a: number[], b: number[]): TTestResult | null {
  if (a.length < 2 || b.length < 2) return null
  const mean1 = mean(a)!
  const mean2 = mean(b)!
  const s1 = sampleStdDev(a)!
  const s2 = sampleStdDev(b)!
  const n1 = a.length
  const n2 = b.length
  const se = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2)
  if (se === 0) return null
  const t = (mean1 - mean2) / se
  const v1 = (s1 * s1) / n1
  const v2 = (s2 * s2) / n2
  const dfRaw =
    (v1 + v2) ** 2 / ((v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1))
  const df = Math.max(1, Math.floor(dfRaw))
  const pValue = 2 * (1 - studentTCdf(Math.abs(t), df))
  const meanDiff = mean1 - mean2
  const tCrit = tCritical(df)
  return {
    n1,
    n2,
    mean1,
    mean2,
    s1,
    s2,
    t,
    df,
    pValue,
    meanDiff,
    se,
    ciLow: meanDiff - tCrit * se,
    ciHigh: meanDiff + tCrit * se,
  }
}
