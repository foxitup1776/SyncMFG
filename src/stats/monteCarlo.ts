export interface ProcessStep {
  id: string
  name: string
  min: number
  typical: number
  max: number
}

export interface MonteCarloResult {
  totals: number[]
  mean: number
  median: number
  p10: number
  p50: number
  p90: number
  p95: number
  min: number
  max: number
  hitTargetPct: number | null
  /** Average contribution of each step to total time. */
  stepMeans: { id: string; name: string; mean: number; sharePct: number }[]
  trials: number
}

function sampleTriangular(min: number, mode: number, max: number): number {
  if (max <= min) return min
  const clampedMode = Math.min(Math.max(mode, min), max)
  const u = Math.random()
  const fc = (clampedMode - min) / (max - min)
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (clampedMode - min))
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - clampedMode))
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  const w = idx - lo
  return sorted[lo] * (1 - w) + sorted[hi] * w
}

export function runTimeStudyMonteCarlo(
  steps: ProcessStep[],
  trials: number,
  target: number | null,
): MonteCarloResult | null {
  const valid = steps.filter(
    (s) =>
      s.name.trim() &&
      Number.isFinite(s.min) &&
      Number.isFinite(s.typical) &&
      Number.isFinite(s.max) &&
      s.min <= s.typical &&
      s.typical <= s.max,
  )
  if (valid.length === 0 || trials < 1) return null

  const totals: number[] = []
  const stepSums = valid.map(() => 0)

  for (let t = 0; t < trials; t++) {
    let total = 0
    valid.forEach((step, i) => {
      const draw = sampleTriangular(step.min, step.typical, step.max)
      stepSums[i] += draw
      total += draw
    })
    totals.push(total)
  }

  const sorted = [...totals].sort((a, b) => a - b)
  const mean = totals.reduce((a, b) => a + b, 0) / totals.length
  const stepMeans = valid.map((step, i) => {
    const stepMean = stepSums[i] / trials
    return {
      id: step.id,
      name: step.name,
      mean: stepMean,
      sharePct: mean > 0 ? (stepMean / mean) * 100 : 0,
    }
  })

  const hitTargetPct =
    target === null || !Number.isFinite(target)
      ? null
      : (totals.filter((v) => v <= target).length / totals.length) * 100

  return {
    totals,
    mean,
    median: percentile(sorted, 0.5),
    p10: percentile(sorted, 0.1),
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    p95: percentile(sorted, 0.95),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    hitTargetPct,
    stepMeans: stepMeans.sort((a, b) => b.mean - a.mean),
    trials,
  }
}
