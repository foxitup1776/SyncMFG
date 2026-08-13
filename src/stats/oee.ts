export interface OeeInput {
  /** Time the line was scheduled to run (any consistent unit) */
  plannedTime: number
  /** Downtime in the same units as plannedTime */
  downtime: number
  /** Ideal time per piece in the same units as run time */
  idealCycleTime: number
  /** Total pieces produced (good + scrap/rework) */
  totalPieces: number
  /** Pieces that passed first time (no rework) */
  goodPieces: number
}

export interface OeeResult {
  runTime: number
  plannedTime: number
  downtime: number
  availability: number
  performance: number
  quality: number
  oee: number
  availabilityPct: number
  performancePct: number
  qualityPct: number
  oeePct: number
  weakest: 'availability' | 'performance' | 'quality'
  idealPiecesPossible: number
}

/**
 * Classic OEE = Availability × Performance × Quality.
 * Availability = runTime / plannedTime
 * Performance = (idealCycle × totalPieces) / runTime
 * Quality = goodPieces / totalPieces
 */
export function calcOee(input: OeeInput): OeeResult | null {
  const {
    plannedTime,
    downtime,
    idealCycleTime,
    totalPieces,
    goodPieces,
  } = input
  if (
    ![plannedTime, downtime, idealCycleTime, totalPieces, goodPieces].every(
      (v) => Number.isFinite(v),
    )
  ) {
    return null
  }
  if (plannedTime <= 0 || idealCycleTime <= 0 || totalPieces < 0 || goodPieces < 0) {
    return null
  }
  if (goodPieces > totalPieces) return null
  if (downtime < 0 || downtime > plannedTime) return null

  const runTime = plannedTime - downtime
  if (runTime <= 0) return null

  const availability = runTime / plannedTime
  const idealPiecesPossible = runTime / idealCycleTime
  let performance =
    totalPieces > 0 ? (idealCycleTime * totalPieces) / runTime : 0
  if (performance > 1.5) performance = 1.5
  const quality = totalPieces > 0 ? goodPieces / totalPieces : 0
  const oee = availability * performance * quality

  const scores = { availability, performance, quality } as const
  let weakest: OeeResult['weakest'] = 'availability'
  let min = availability
  for (const key of ['performance', 'quality'] as const) {
    if (scores[key] < min) {
      min = scores[key]
      weakest = key
    }
  }

  return {
    runTime,
    plannedTime,
    downtime,
    availability,
    performance,
    quality,
    oee,
    availabilityPct: availability * 100,
    performancePct: performance * 100,
    qualityPct: quality * 100,
    oeePct: oee * 100,
    weakest,
    idealPiecesPossible,
  }
}
