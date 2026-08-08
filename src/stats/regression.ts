import { mean } from './descriptive'

export interface RegressionResult {
  n: number
  slope: number
  intercept: number
  r: number
  r2: number
  points: { x: number; y: number; fitted: number }[]
}

export function simpleRegression(
  xs: number[],
  ys: number[],
): RegressionResult | null {
  const n = Math.min(xs.length, ys.length)
  if (n < 3) return null
  const x = xs.slice(0, n)
  const y = ys.slice(0, n)
  const mx = mean(x)!
  const my = mean(y)!
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    sxx += dx * dx
    syy += dy * dy
    sxy += dx * dy
  }
  if (sxx === 0 || syy === 0) return null
  const slope = sxy / sxx
  const intercept = my - slope * mx
  const r = sxy / Math.sqrt(sxx * syy)
  const r2 = r * r
  const points = x.map((xi, i) => ({
    x: xi,
    y: y[i],
    fitted: intercept + slope * xi,
  }))
  return { n, slope, intercept, r, r2, points }
}
