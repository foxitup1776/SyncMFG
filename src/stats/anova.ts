import { mean } from './descriptive'

export interface AnovaResult {
  groupNames: string[]
  groupMeans: number[]
  groupNs: number[]
  grandMean: number
  betweenSS: number
  withinSS: number
  betweenDF: number
  withinDF: number
  msb: number
  msw: number
  f: number
  pValue: number
}

/** One-way ANOVA across 3+ numeric groups (columns). */
export function oneWayAnova(groups: { name: string; values: number[] }[]): AnovaResult | null {
  const clean = groups
    .map((g) => ({
      name: g.name,
      values: g.values.filter((v) => Number.isFinite(v)),
    }))
    .filter((g) => g.values.length >= 2)
  if (clean.length < 3) return null

  const all = clean.flatMap((g) => g.values)
  const grandMean = mean(all)!
  const k = clean.length
  const n = all.length
  const betweenDF = k - 1
  const withinDF = n - k
  if (withinDF < 1) return null

  let betweenSS = 0
  let withinSS = 0
  const groupMeans: number[] = []
  const groupNs: number[] = []

  for (const g of clean) {
    const m = mean(g.values)!
    groupMeans.push(m)
    groupNs.push(g.values.length)
    betweenSS += g.values.length * (m - grandMean) ** 2
    withinSS += g.values.reduce((s, v) => s + (v - m) ** 2, 0)
  }

  const msb = betweenSS / betweenDF
  const msw = withinSS / withinDF
  if (msw <= 0) return null
  const f = msb / msw
  const pValue = 1 - fCdf(f, betweenDF, withinDF)

  return {
    groupNames: clean.map((g) => g.name),
    groupMeans,
    groupNs,
    grandMean,
    betweenSS,
    withinSS,
    betweenDF,
    withinDF,
    msb,
    msw,
    f,
    pValue: Math.min(1, Math.max(0, pValue)),
  }
}

/** Approximate F CDF via regularized incomplete beta. */
function fCdf(f: number, d1: number, d2: number): number {
  if (f <= 0) return 0
  const x = (d1 * f) / (d1 * f + d2)
  return incompleteBeta(x, d1 / 2, d2 / 2)
}

function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  )
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(x, a, b)) / a
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
