export interface YieldInput {
  good: number
  total: number
  targetFpyPct?: number | null
}

export interface YieldResult {
  good: number
  scrap: number
  total: number
  fpyPct: number
  scrapPct: number
  targetFpyPct: number | null
  hitTarget: boolean | null
}

/** First-pass yield from good pieces and total produced (includes rework as not-good). */
export function calcYield(input: YieldInput): YieldResult | null {
  const good = input.good
  const total = input.total
  if (!Number.isFinite(good) || !Number.isFinite(total) || total <= 0 || good < 0) {
    return null
  }
  if (good > total) return null
  const scrap = total - good
  const fpyPct = (good / total) * 100
  const scrapPct = (scrap / total) * 100
  const target =
    input.targetFpyPct != null && Number.isFinite(input.targetFpyPct)
      ? input.targetFpyPct
      : null
  return {
    good,
    scrap,
    total,
    fpyPct,
    scrapPct,
    targetFpyPct: target,
    hitTarget: target == null ? null : fpyPct >= target,
  }
}

export interface YieldRow {
  label: string
  good: number
  total: number
}

export function calcYieldRows(rows: YieldRow[]): {
  rows: (YieldResult & { label: string })[]
  overall: YieldResult | null
} {
  const out: (YieldResult & { label: string })[] = []
  let goodSum = 0
  let totalSum = 0
  for (const r of rows) {
    const y = calcYield({ good: r.good, total: r.total })
    if (!y) continue
    out.push({ ...y, label: r.label })
    goodSum += y.good
    totalSum += y.total
  }
  return {
    rows: out,
    overall: calcYield({ good: goodSum, total: totalSum }),
  }
}
