import { mean, sampleStdDev } from './descriptive'
import { computeImr } from './imr'

export interface CapabilityResult {
  n: number
  average: number
  stdOverall: number
  stdWithin: number
  cp: number | null
  cpk: number | null
  pp: number | null
  ppk: number | null
  usl: number | null
  lsl: number | null
  pctBelowLsl: number | null
  pctAboveUsl: number | null
}

function indexPair(
  usl: number | null,
  lsl: number | null,
  average: number,
  sigma: number,
): { potential: number | null; performance: number | null } {
  if (sigma <= 0) return { potential: null, performance: null }

  let potential: number | null = null
  if (usl !== null && lsl !== null && usl > lsl) {
    potential = (usl - lsl) / (6 * sigma)
  }

  const upper =
    usl !== null ? (usl - average) / (3 * sigma) : Number.POSITIVE_INFINITY
  const lower =
    lsl !== null ? (average - lsl) / (3 * sigma) : Number.POSITIVE_INFINITY
  const performance =
    usl === null && lsl === null ? null : Math.min(upper, lower)

  return { potential, performance }
}

export function computeCapability(
  values: number[],
  usl: number | null,
  lsl: number | null,
): CapabilityResult | null {
  if (values.length < 2) return null
  const average = mean(values)!
  const stdOverall = sampleStdDev(values)!
  const imr = computeImr(values)
  const stdWithin = imr?.sigmaWithin ?? stdOverall

  const within = indexPair(usl, lsl, average, stdWithin)
  const overall = indexPair(usl, lsl, average, stdOverall)

  const pctBelowLsl =
    lsl === null
      ? null
      : (values.filter((v) => v < lsl).length / values.length) * 100
  const pctAboveUsl =
    usl === null
      ? null
      : (values.filter((v) => v > usl).length / values.length) * 100

  return {
    n: values.length,
    average,
    stdOverall,
    stdWithin,
    cp: within.potential,
    cpk: within.performance,
    pp: overall.potential,
    ppk: overall.performance,
    usl,
    lsl,
    pctBelowLsl,
    pctAboveUsl,
  }
}
