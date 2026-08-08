export function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function sampleStdDev(values: number[]): number | null {
  if (values.length < 2) return null
  const m = mean(values)!
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function quartiles(values: number[]): {
  q1: number
  q2: number
  q3: number
  iqr: number
  whiskerLow: number
  whiskerHigh: number
  outliers: number[]
} | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const q2 = median(sorted)!
  const mid = Math.floor(sorted.length / 2)
  const lower = sorted.slice(0, mid)
  const upper = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1)
  const q1 = median(lower) ?? q2
  const q3 = median(upper) ?? q2
  const iqr = q3 - q1
  const fenceLow = q1 - 1.5 * iqr
  const fenceHigh = q3 + 1.5 * iqr
  const inliers = sorted.filter((v) => v >= fenceLow && v <= fenceHigh)
  const outliers = sorted.filter((v) => v < fenceLow || v > fenceHigh)
  return {
    q1,
    q2,
    q3,
    iqr,
    whiskerLow: inliers[0] ?? q1,
    whiskerHigh: inliers[inliers.length - 1] ?? q3,
    outliers,
  }
}

export function histogramBins(
  values: number[],
  binCount?: number,
): { start: number; end: number; mid: number; count: number }[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) {
    return [{ start: min, end: max, mid: min, count: values.length }]
  }
  const k =
    binCount ??
    Math.max(5, Math.min(20, Math.ceil(1 + Math.log2(values.length))))
  const width = (max - min) / k
  const bins = Array.from({ length: k }, (_, i) => {
    const start = min + i * width
    const end = i === k - 1 ? max : start + width
    return { start, end, mid: (start + end) / 2, count: 0 }
  })
  for (const v of values) {
    let idx = Math.floor((v - min) / width)
    if (idx >= k) idx = k - 1
    if (idx < 0) idx = 0
    bins[idx].count += 1
  }
  return bins
}

export function fmt(n: number | null, digits = 3): string {
  if (n === null || Number.isNaN(n)) return '—'
  if (Number.isInteger(n)) return String(n)
  return Number(n.toFixed(digits)).toString()
}
