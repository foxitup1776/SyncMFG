import { mean, sampleStdDev } from './descriptive'

export interface GageRrResult {
  parts: number
  operators: number
  trials: number
  sigmaRepeatability: number
  sigmaReproducibility: number
  sigmaGage: number
  sigmaPart: number
  sigmaTotal: number
  pctGage: number
  pctPart: number
  verdict: string
}

/**
 * Lite Gage R&R using nested means (range-style intuition via stdev).
 * Expects rows of { part, operator, value } with ≥2 trials per cell when possible.
 */
export function computeGageRr(
  rows: { part: string; operator: string; value: number }[],
): GageRrResult | null {
  if (rows.length < 6) return null
  const parts = [...new Set(rows.map((r) => r.part))]
  const operators = [...new Set(rows.map((r) => r.operator))]
  if (parts.length < 2 || operators.length < 2) return null

  // Repeatability: pooled within part×operator cells
  const cellKeys = new Map<string, number[]>()
  for (const r of rows) {
    const key = `${r.part}||${r.operator}`
    const list = cellKeys.get(key) ?? []
    list.push(r.value)
    cellKeys.set(key, list)
  }
  let ssE = 0
  let dfE = 0
  let trials = 0
  for (const vals of cellKeys.values()) {
    trials = Math.max(trials, vals.length)
    if (vals.length < 2) continue
    const m = mean(vals)!
    ssE += vals.reduce((s, v) => s + (v - m) ** 2, 0)
    dfE += vals.length - 1
  }
  if (dfE < 1) return null
  const msE = ssE / dfE
  const sigmaRepeatability = Math.sqrt(msE)

  // Operator averages and part averages
  const opMeans = operators.map((op) =>
    mean(rows.filter((r) => r.operator === op).map((r) => r.value))!,
  )
  const partMeans = parts.map((p) =>
    mean(rows.filter((r) => r.part === p).map((r) => r.value))!,
  )
  const grand = mean(rows.map((r) => r.value))!
  const nPerOp = rows.length / operators.length
  const ssOp =
    nPerOp * opMeans.reduce((s, m) => s + (m - grand) ** 2, 0)
  const msOp = ssOp / Math.max(operators.length - 1, 1)
  const sigmaRepro2 = Math.max((msOp - msE) / (parts.length * Math.max(trials, 1)), 0)
  const sigmaReproducibility = Math.sqrt(sigmaRepro2)
  const sigmaGage = Math.sqrt(sigmaRepeatability ** 2 + sigmaReproducibility ** 2)

  const nPerPart = rows.length / parts.length
  const ssPart =
    nPerPart * partMeans.reduce((s, m) => s + (m - grand) ** 2, 0)
  const msPart = ssPart / Math.max(parts.length - 1, 1)
  const sigmaPart2 = Math.max((msPart - msE) / (operators.length * Math.max(trials, 1)), 0)
  const sigmaPart = Math.sqrt(sigmaPart2)
  const sigmaTotal = Math.sqrt(sigmaGage ** 2 + sigmaPart ** 2) || sampleStdDev(rows.map((r) => r.value))!
  const pctGage = sigmaTotal > 0 ? (sigmaGage / sigmaTotal) * 100 : 0
  const pctPart = sigmaTotal > 0 ? (sigmaPart / sigmaTotal) * 100 : 0

  let verdict = 'Marginal — improve the measurement method if you can.'
  if (pctGage < 10) verdict = 'Excellent — the gage looks trustworthy.'
  else if (pctGage < 30) verdict = 'Acceptable for many shops — watch it.'
  else verdict = 'Poor — too much of what you see is measurement noise, not the parts.'

  return {
    parts: parts.length,
    operators: operators.length,
    trials,
    sigmaRepeatability,
    sigmaReproducibility,
    sigmaGage,
    sigmaPart,
    sigmaTotal,
    pctGage,
    pctPart,
    verdict,
  }
}
