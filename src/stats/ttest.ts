import { mean, sampleStdDev } from './descriptive'

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

/** Welch two-sample t-test (does not assume equal variances). */
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
  const df =
    (v1 + v2) ** 2 / ((v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1))
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

/** Approximate t CDF via regularized incomplete beta. */
function studentTCdf(t: number, df: number): number {
  const x = df / (df + t * t)
  const a = df / 2
  const b = 0.5
  const ib = incompleteBeta(x, a, b)
  return 1 - 0.5 * ib
}

function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt =
    Math.exp(
      logGamma(a + b) -
        logGamma(a) -
        logGamma(b) +
        a * Math.log(x) +
        b * Math.log(1 - x),
    )
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b
}

function betacf(x: number, a: number, b: number): number {
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < 1e-30) d = 1e-30
  d = 1 / d
  let h = d
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-8) break
  }
  return h
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
