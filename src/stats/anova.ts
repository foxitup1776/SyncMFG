import { mean } from './descriptive'
import { fCdf } from './special'

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
