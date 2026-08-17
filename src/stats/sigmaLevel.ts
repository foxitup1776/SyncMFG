import { normalQuantile } from './normal'

/**
 * Six Sigma scorecard math: defects per unit, DPMO, an approximate sigma
 * level, and rolled throughput yield across a multi-step process.
 *
 * The 1.5 sigma shift is deliberately a toggle, not a hidden constant — plants
 * argue about it, and belts should know which number they are quoting.
 */

export interface SigmaInput {
  /** Units inspected. */
  units: number
  /** Defects found (a unit can carry more than one). */
  defects: number
  /** Ways one unit can go wrong (check points per unit). */
  opportunitiesPerUnit: number
  /** Add the classic 1.5 sigma shift to report a short-term sigma level. */
  applyShift: boolean
}

export interface SigmaResult {
  units: number
  defects: number
  opportunitiesPerUnit: number
  totalOpportunities: number
  /** Defects per unit. */
  dpu: number
  /** Defects per opportunity (0–1). */
  dpo: number
  /** Defects per million opportunities. */
  dpmo: number
  /** Percent of opportunities that came out clean. */
  yieldPct: number
  /** Chance a whole unit is defect-free, from the Poisson model. */
  firstPassYieldPct: number
  /** Sigma implied straight from the data (long-term, no shift). */
  zLongTerm: number
  /** What we report: long-term z, plus 1.5 if the shift is on. */
  sigmaLevel: number
  shiftApplied: boolean
  band: SigmaBand
}

export type SigmaBand = 'world-class' | 'strong' | 'typical' | 'weak'

/** Reference row so people can sanity-check the sigma number they get. */
export const SIGMA_TABLE: { sigma: number; dpmo: number; yieldPct: number }[] = [
  { sigma: 6, dpmo: 3.4, yieldPct: 99.99966 },
  { sigma: 5, dpmo: 233, yieldPct: 99.977 },
  { sigma: 4, dpmo: 6210, yieldPct: 99.379 },
  { sigma: 3, dpmo: 66807, yieldPct: 93.32 },
  { sigma: 2, dpmo: 308538, yieldPct: 69.15 },
  { sigma: 1, dpmo: 690000, yieldPct: 31 },
]

export function calcSigmaLevel(input: SigmaInput): SigmaResult | null {
  const { units, defects, opportunitiesPerUnit, applyShift } = input
  if (
    !Number.isFinite(units) ||
    !Number.isFinite(defects) ||
    !Number.isFinite(opportunitiesPerUnit)
  ) {
    return null
  }
  if (units <= 0 || opportunitiesPerUnit <= 0 || defects < 0) return null

  const totalOpportunities = units * opportunitiesPerUnit
  const dpu = defects / units
  const dpo = Math.min(defects / totalOpportunities, 0.999999)
  const dpmo = dpo * 1_000_000
  const yieldPct = (1 - dpo) * 100
  const firstPassYieldPct = Math.exp(-dpu) * 100

  const zLongTerm =
    dpo <= 0 ? 6 : Math.max(-1, Math.min(6, normalQuantile(1 - dpo)))
  const sigmaLevel = applyShift ? zLongTerm + 1.5 : zLongTerm

  return {
    units,
    defects,
    opportunitiesPerUnit,
    totalOpportunities,
    dpu,
    dpo,
    dpmo,
    yieldPct,
    firstPassYieldPct,
    zLongTerm,
    sigmaLevel,
    shiftApplied: applyShift,
    band: bandFor(sigmaLevel),
  }
}

function bandFor(sigma: number): SigmaBand {
  if (sigma >= 5) return 'world-class'
  if (sigma >= 4) return 'strong'
  if (sigma >= 3) return 'typical'
  return 'weak'
}

export interface RtyStep {
  label: string
  units: number
  defects: number
}

export interface RtyStepResult {
  label: string
  units: number
  defects: number
  dpu: number
  /** Percent of units that left this step good the first time. */
  yieldPct: number
}

export interface RtyResult {
  steps: RtyStepResult[]
  /** Chance a unit clears every step with no rework. */
  rtyPct: number
  /** Per-step average yield that would produce the same RTY. */
  normalizedYieldPct: number
  weakest: RtyStepResult | null
  /** Best single step minus RTY — the gap a one-station report card hides. */
  hiddenFactoryPct: number
  /** What the last inspection alone would have told you. */
  finalStepYieldPct: number | null
}

/** Rolled throughput yield across the steps a part actually walks through. */
export function calcRty(steps: RtyStep[]): RtyResult | null {
  const clean: RtyStepResult[] = []
  for (const s of steps) {
    if (!Number.isFinite(s.units) || !Number.isFinite(s.defects)) continue
    if (s.units <= 0 || s.defects < 0 || s.defects > s.units) continue
    clean.push({
      label: s.label,
      units: s.units,
      defects: s.defects,
      dpu: s.defects / s.units,
      yieldPct: ((s.units - s.defects) / s.units) * 100,
    })
  }
  if (clean.length === 0) return null

  const rty = clean.reduce((acc, s) => acc * (s.yieldPct / 100), 1)
  const rtyPct = rty * 100
  const normalizedYieldPct = Math.pow(rty, 1 / clean.length) * 100
  const weakest = clean.reduce(
    (worst, s) => (worst == null || s.yieldPct < worst.yieldPct ? s : worst),
    null as RtyStepResult | null,
  )
  const best = clean.reduce(
    (top, s) => (top == null || s.yieldPct > top.yieldPct ? s : top),
    null as RtyStepResult | null,
  )

  return {
    steps: clean,
    rtyPct,
    normalizedYieldPct,
    weakest,
    hiddenFactoryPct: best ? best.yieldPct - rtyPct : 0,
    finalStepYieldPct: clean[clean.length - 1]?.yieldPct ?? null,
  }
}
