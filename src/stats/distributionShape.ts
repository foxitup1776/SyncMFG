import { mean, median, sampleStdDev } from './descriptive'

export type ShapeKind =
  | 'bell-shaped'
  | 'right-skewed'
  | 'left-skewed'
  | 'fairly-flat'
  | 'two-humps'
  | 'spike'
  | 'unknown'

export interface ShapeReading {
  kind: ShapeKind
  label: string
  plain: string
  skewHint: string
}

/** Lightweight shape reading for operators — not a formal goodness-of-fit test. */
export function readDistributionShape(values: number[]): ShapeReading | null {
  if (values.length < 5) return null
  const m = mean(values)
  const med = median(values)
  const s = sampleStdDev(values)
  if (m == null || med == null || s == null || s === 0) {
    return {
      kind: 'spike',
      label: 'Almost all the same',
      plain:
        'Values barely move. That can be great (tight process) or a measurement stuck on one reading — check the gage.',
      skewHint: 'Little to no spread.',
    }
  }

  // Pearson's second skewness coefficient
  const skew = (3 * (m - med)) / s
  const peaks = countHistogramPeaks(values)

  if (peaks >= 2) {
    return {
      kind: 'two-humps',
      label: 'Two humps (mixture)',
      plain:
        'The histogram has more than one peak. Often that means two processes mixed together (two shifts, two machines, two suppliers). Split the data before you trust averages.',
      skewHint: `Skew score ≈ ${skew.toFixed(2)} (secondary).`,
    }
  }

  if (Math.abs(skew) < 0.5) {
    const flat = isFairlyFlat(values)
    if (flat) {
      return {
        kind: 'fairly-flat',
        label: 'Fairly flat / spread out',
        plain:
          'Values are spread across a wide range without a sharp middle pile. Expect more unpredictability until you tighten the process or find a missing factor.',
        skewHint: 'Roughly balanced left and right.',
      }
    }
    return {
      kind: 'bell-shaped',
      label: 'Roughly bell-shaped (normal-ish)',
      plain:
        'Most points pile near the middle with fewer out at the tails — the classic “hill” shape. Many control-chart and capability tools assume something like this.',
      skewHint: 'Mean and median are close — little skew.',
    }
  }

  if (skew > 0) {
    return {
      kind: 'right-skewed',
      label: 'Right-skewed (long high tail)',
      plain:
        'A pile on the low/typical side with a long stretch of higher values. Common for times and counts (a few slow jobs pull the average up). The median is often a fairer “typical” than the average.',
      skewHint: `Average (${m.toFixed(2)}) sits above the median (${med.toFixed(2)}).`,
    }
  }

  return {
    kind: 'left-skewed',
    label: 'Left-skewed (long low tail)',
    plain:
      'A pile on the high side with a long stretch of lower values. A few low outliers can pull the average down — check those points before changing the whole process.',
    skewHint: `Average (${m.toFixed(2)}) sits below the median (${med.toFixed(2)}).`,
  }
}

function countHistogramPeaks(values: number[]): number {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) return 1
  const k = Math.max(5, Math.min(12, Math.ceil(Math.sqrt(values.length))))
  const width = (max - min) / k
  const counts = new Array(k).fill(0)
  for (const v of values) {
    let i = Math.floor((v - min) / width)
    if (i >= k) i = k - 1
    counts[i]++
  }
  let peaks = 0
  for (let i = 1; i < k - 1; i++) {
    if (counts[i] > counts[i - 1] && counts[i] >= counts[i + 1] && counts[i] >= 2) {
      // require clear enough peak vs neighbors
      if (counts[i] >= Math.max(counts[i - 1], counts[i + 1]) + 0) peaks++
    }
  }
  // Ends as peaks
  if (counts[0] > counts[1] && counts[0] >= 2) peaks++
  if (counts[k - 1] > counts[k - 2] && counts[k - 1] >= 2) peaks++
  return peaks
}

function isFairlyFlat(values: number[]): boolean {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) return false
  const k = 6
  const width = (max - min) / k
  const counts = new Array(k).fill(0)
  for (const v of values) {
    let i = Math.floor((v - min) / width)
    if (i >= k) i = k - 1
    counts[i]++
  }
  const avg = values.length / k
  const maxC = Math.max(...counts)
  return maxC < avg * 1.6
}

export function describeR2(r2: number, r: number): {
  band: 'very high' | 'high' | 'moderate' | 'low' | 'very low'
  relatedPlain: string
  caution: string
} {
  const pct = r2 * 100
  let band: ReturnType<typeof describeR2>['band']
  if (r2 >= 0.8) band = 'very high'
  else if (r2 >= 0.6) band = 'high'
  else if (r2 >= 0.3) band = 'moderate'
  else if (r2 >= 0.1) band = 'low'
  else band = 'very low'

  const direction =
    r >= 0 ? 'same direction (as X goes up, Y tends to go up)' : 'opposite directions'

  const relatedPlain =
    band === 'very high' || band === 'high'
      ? `R² = ${pct.toFixed(1)}% is ${band} — ${xExplain(pct)} tightly related along a straight line (${direction}).`
      : band === 'moderate'
        ? `R² = ${pct.toFixed(1)}% is moderate — there is a real-ish link, but a lot of the result still comes from other factors or noise (${direction}).`
        : `R² = ${pct.toFixed(1)}% is ${band} — mostly unrelated for a straight-line model. Don’t bet big process changes on this alone (${direction}).`

  return {
    band,
    relatedPlain,
    caution:
      'Always glance at sample size and the scatter. Two lucky points can fake a perfect R². Related ≠ proven cause.',
  }
}

function xExplain(pct: number): string {
  return `about ${pct.toFixed(0)}% of the up-and-down in Y is explained by X;`
}
