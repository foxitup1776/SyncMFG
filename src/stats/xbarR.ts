import { mean } from './descriptive'

/** Subgroup size → control chart constants. */
const CONST: Record<number, { A2: number; D3: number; D4: number }> = {
  2: { A2: 1.88, D3: 0, D4: 3.267 },
  3: { A2: 1.023, D3: 0, D4: 2.575 },
  4: { A2: 0.729, D3: 0, D4: 2.282 },
  5: { A2: 0.577, D3: 0, D4: 2.115 },
  6: { A2: 0.483, D3: 0, D4: 2.004 },
  7: { A2: 0.419, D3: 0.076, D4: 1.924 },
  8: { A2: 0.373, D3: 0.136, D4: 1.864 },
  9: { A2: 0.337, D3: 0.184, D4: 1.816 },
  10: { A2: 0.308, D3: 0.223, D4: 1.777 },
}

export interface XbarRResult {
  n: number
  subgroupCount: number
  xBars: number[]
  ranges: number[]
  xBarBar: number
  rBar: number
  uclX: number
  lclX: number
  uclR: number
  lclR: number
  outX: number[]
  outR: number[]
}

/** Each row is one subgroup; columns are the samples in that subgroup. */
export function computeXbarR(subgroups: number[][]): XbarRResult | null {
  const clean = subgroups
    .map((row) => row.filter((v) => Number.isFinite(v)))
    .filter((row) => row.length >= 2)
  if (clean.length < 2) return null
  const n = clean[0].length
  if (n < 2 || n > 10) return null
  if (clean.some((row) => row.length !== n)) return null
  const c = CONST[n]
  if (!c) return null

  const xBars = clean.map((row) => mean(row)!)
  const ranges = clean.map((row) => Math.max(...row) - Math.min(...row))
  const xBarBar = mean(xBars)!
  const rBar = mean(ranges)!
  const uclX = xBarBar + c.A2 * rBar
  const lclX = xBarBar - c.A2 * rBar
  const uclR = c.D4 * rBar
  const lclR = c.D3 * rBar

  const outX: number[] = []
  xBars.forEach((v, i) => {
    if (v > uclX || v < lclX) outX.push(i)
  })
  const outR: number[] = []
  ranges.forEach((v, i) => {
    if (v > uclR || v < lclR) outR.push(i)
  })

  return {
    n,
    subgroupCount: clean.length,
    xBars,
    ranges,
    xBarBar,
    rBar,
    uclX,
    lclX,
    uclR,
    lclR,
    outX,
    outR,
  }
}
