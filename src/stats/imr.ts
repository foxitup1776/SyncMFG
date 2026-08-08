import { mean } from './descriptive'

/** I-MR (Individuals and Moving Range) for one measurement stream. */
export interface ImrResult {
  values: number[]
  movingRanges: number[]
  xBar: number
  mrBar: number
  uclX: number
  lclX: number
  uclMr: number
  lclMr: number
  /** Indices (0-based) of individuals outside X limits. */
  outOfControlX: number[]
  outOfControlMr: number[]
  sigmaWithin: number
}

export function computeImr(values: number[]): ImrResult | null {
  if (values.length < 2) return null

  const movingRanges: number[] = []
  for (let i = 1; i < values.length; i++) {
    movingRanges.push(Math.abs(values[i] - values[i - 1]))
  }

  const xBar = mean(values)!
  const mrBar = mean(movingRanges)!
  // Constants for n=2 moving range
  const E2 = 2.66
  const D4 = 3.267
  const d2 = 1.128

  const uclX = xBar + E2 * mrBar
  const lclX = xBar - E2 * mrBar
  const uclMr = D4 * mrBar
  const lclMr = 0

  const outOfControlX: number[] = []
  values.forEach((v, i) => {
    if (v > uclX || v < lclX) outOfControlX.push(i)
  })

  const outOfControlMr: number[] = []
  movingRanges.forEach((mr, i) => {
    if (mr > uclMr) outOfControlMr.push(i)
  })

  return {
    values,
    movingRanges,
    xBar,
    mrBar,
    uclX,
    lclX,
    uclMr,
    lclMr,
    outOfControlX,
    outOfControlMr,
    sigmaWithin: mrBar / d2,
  }
}
