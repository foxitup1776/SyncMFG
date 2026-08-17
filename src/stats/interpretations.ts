import { fmt } from './descriptive'
import type { RuleHit } from './westernElectric'

export interface Interpretation {
  title: string
  plain: string
  meta?: string
}

/** p-value band + related-gap vs luck coaching. */
export function interpretPValue(p: number): Interpretation {
  let band: string
  let related: string
  if (p < 0.01) {
    band = 'very strong evidence'
    related = 'The gap looks related to a real difference — not lucky noise.'
  } else if (p < 0.05) {
    band = 'strong enough (usual 0.05 cut)'
    related = 'Treat this as a real difference and dig into why.'
  } else if (p < 0.1) {
    band = 'borderline'
    related =
      'Hint of a gap, but still could be luck — collect more data before big spend.'
  } else {
    band = 'weak / not proven'
    related =
      'Related gap vs luck: we cannot yet rule out luck. Don’t bet the process on this alone.'
  }
  return {
    title: `p = ${fmt(p, 4)} — ${band}`,
    plain: related,
    meta: 'Rule of thumb: under 0.05 → usually call it real; always pair with floor knowledge.',
  }
}

export function interpretImr(opts: {
  weHits: RuleHit[]
  outOfControlX: number[]
  outOfControlMr: number[]
}): Interpretation {
  const { weHits, outOfControlX, outOfControlMr } = opts
  const special =
    weHits.length > 0 || outOfControlX.length > 0 || outOfControlMr.length > 0

  if (!special) {
    return {
      title: 'Common cause — process looks stable',
      plain:
        'No Western Electric alarms and no points outside limits. The bounce you see is the voice of the process — improve the system, don’t chase every wiggle.',
      meta: 'Next: capability if you have customer specs.',
    }
  }

  const floorBits = weHits.map((h) => floorMeaning(h.rule, h.plain))
  const mrNote =
    outOfControlMr.length > 0
      ? ` Moving range also flagged ${outOfControlMr.length} jump(s) — sudden step changes between consecutive points.`
      : ''

  return {
    title: 'Special cause — something assignable likely happened',
    plain: `${floorBits.join(' ')}${mrNote} Investigate what changed near those points (tooling, material, shift, method) before changing the whole process.`,
    meta: `${weHits.length || outOfControlX.length} rule/limit signal(s) on the Individuals chart.`,
  }
}

function floorMeaning(rule: string, plain: string): string {
  switch (rule) {
    case 'Rule 1':
      return 'A point outside limits usually means a one-off event or a big shift — check that exact time on the floor.'
    case 'Rule 2':
      return 'Hugging the outer zone (2 of 3 beyond 2σ) often means a short run of unusual settings.'
    case 'Rule 3':
      return '4 of 5 beyond 1σ hints at a mild but persistent bias — look for a slow drift or wrong target.'
    case 'Rule 4':
      return 'A long run on one side of average often means the process shifted and stayed shifted.'
    case 'Rule 5':
      return 'A steady march up or down is a trend — wear, warming up, or a gradual recipe change.'
    default:
      return plain
  }
}

export function interpretXbarR(opts: {
  outX: number[]
  outR: number[]
}): Interpretation {
  const { outX, outR } = opts
  const xFire = outX.length > 0
  const rFire = outR.length > 0

  if (!xFire && !rFire) {
    return {
      title: 'Both X̄ and R look in control',
      plain:
        'Subgroup averages and within-subgroup spread are behaving like common cause. Safe to move on to capability if specs matter.',
      meta: 'X̄ watches the level; R watches the consistency inside each sample.',
    }
  }

  if (xFire && rFire) {
    return {
      title: 'Both average and spread fired',
      plain: `X̄ flagged subgroup(s) ${outX.map((i) => i + 1).join(', ')} and R flagged ${outR.map((i) => i + 1).join(', ')}. Fix the unstable subgroups first — capability will lie until both charts calm down.`,
      meta: 'When R is wild, the process is inconsistent inside the sample; when X̄ is wild with R calm, the level jumped.',
    }
  }

  if (rFire) {
    return {
      title: 'Range (R) chart fired — spread problem',
      plain: `Within-subgroup range went out on subgroup(s) ${outR.map((i) => i + 1).join(', ')}. Something made pieces in the same sample disagree (fixture, operator, mixed lots). Stabilize spread before trusting averages.`,
      meta: 'Next: find what made that sample inconsistent on the floor.',
    }
  }

  return {
    title: 'X̄ chart fired — level problem',
    plain: `Subgroup average went out on subgroup(s) ${outX.map((i) => i + 1).join(', ')} while spread stayed quieter. Often a setup shift, material change, or wrong target — investigate those batches.`,
    meta: 'Next: assignable cause for the level shift, then re-check.',
  }
}

export function interpretTTest(opts: {
  pValue: number
  meanDiff: number
  ciLow: number
  ciHigh: number
  labelA?: string
  labelB?: string
}): Interpretation {
  const base = interpretPValue(opts.pValue)
  const a = opts.labelA ?? 'A'
  const b = opts.labelB ?? 'B'
  return {
    title: base.title,
    plain: `${base.plain} Gap (${a} − ${b}) = ${fmt(opts.meanDiff)}. Rough 95% confidence interval for that gap: ${fmt(opts.ciLow)} to ${fmt(opts.ciHigh)}.`,
    meta: base.meta,
  }
}

export function interpretAnova(opts: {
  pValue: number
  groupNames: string[]
  groupMeans: number[]
}): Interpretation & {
  ranked: { name: string; mean: number }[]
  pairwiseHint?: string
} {
  const ranked = opts.groupNames
    .map((name, i) => ({ name, mean: opts.groupMeans[i] }))
    .sort((a, b) => b.mean - a.mean)
  const base = interpretPValue(opts.pValue)
  const significant = opts.pValue < 0.05

  let pairwiseHint: string | undefined
  if (significant && ranked.length >= 2) {
    const hi = ranked[0]
    const lo = ranked[ranked.length - 1]
    const gaps: { a: string; b: string; gap: number }[] = []
    for (let i = 0; i < ranked.length; i++) {
      for (let j = i + 1; j < ranked.length; j++) {
        gaps.push({
          a: ranked[i].name,
          b: ranked[j].name,
          gap: Math.abs(ranked[i].mean - ranked[j].mean),
        })
      }
    }
    gaps.sort((x, y) => y.gap - x.gap)
    const top = gaps[0]
    pairwiseHint = `Biggest average gap to eye-ball: “${top.a}” vs “${top.b}” (${fmt(top.gap)}). Only after ANOVA is significant should you chase pairs — start with that pair (full Tukey can wait). Highest mean: ${hi.name} (${fmt(hi.mean)}); lowest: ${lo.name} (${fmt(lo.mean)}).`
  }

  return {
    title: significant
      ? 'At least one group differs'
      : 'No clear multi-group difference yet',
    plain: significant
      ? `${base.plain} Ranked means (high → low): ${ranked.map((r) => `${r.name} ${fmt(r.mean)}`).join(' · ')}.`
      : `${base.plain} Ranked means still help storytelling: ${ranked.map((r) => `${r.name} ${fmt(r.mean)}`).join(' · ')}.`,
    meta: pairwiseHint ?? base.meta,
    ranked,
    pairwiseHint,
  }
}

export function interpretPareto(opts: {
  topLabel: string
  topPct: number
  vitalCount: number
  cumAtVital: number
}): Interpretation {
  return {
    title: `Vital few ≈ ${opts.vitalCount} cause(s) (~${fmt(opts.cumAtVital, 0)}% cumulative)`,
    plain: `Tallest bar: “${opts.topLabel}” (~${fmt(opts.topPct, 1)}% of the total). Fix the vital few first — then send that top bar to a Fishbone before chasing the long tail.`,
    meta: 'Classic 80/20: the first causes that cross ~80% cumulative are your attack list.',
  }
}

export function interpretGage(pctGage: number): Interpretation {
  if (pctGage < 10) {
    return {
      title: 'Excellent gage (AIAG-style <10%)',
      plain: `%Gage ≈ ${fmt(pctGage, 1)}%. Measurement noise is small — you can trust charts and tests built on these readings.`,
      meta: 'Part-to-part should dominate; keep the method standardized.',
    }
  }
  if (pctGage < 30) {
    return {
      title: 'Marginal gage (10–30%)',
      plain: `%Gage ≈ ${fmt(pctGage, 1)}%. Often usable, but improve fixturing, training, or the instrument if decisions are high-stakes.`,
      meta: 'AIAG rule of thumb: under 10% excellent, under 30% often OK, over 30% fix the gage first.',
    }
  }
  return {
    title: 'Fix the gage first (>30%)',
    plain: `%Gage ≈ ${fmt(pctGage, 1)}%. Too much of what you “see” is measurement fog. Do not chase process tweaks until MSA improves.`,
    meta: 'AIAG-style: over 30% — stop and fix the measurement system.',
  }
}

export function interpretMonteCarlo(opts: {
  median: number
  p95: number
  hitTargetPct: number | null
  target: number | null
}): Interpretation {
  const risk =
    opts.hitTargetPct == null || opts.target == null
      ? `Plan around P95 ≈ ${fmt(opts.p95, 2)} for a slow-day buffer (median ≈ ${fmt(opts.median, 2)}).`
      : `${fmt(opts.hitTargetPct, 1)}% of simulated runs finish at or under ${fmt(opts.target, 2)}. Median ≈ ${fmt(opts.median, 2)}; P95 ≈ ${fmt(opts.p95, 2)} is your “plan for the slow day” number.`
  return {
    title: 'Median vs P95 risk story',
    plain: risk,
    meta: 'Median = typical day. P95 = most days won’t be worse than this — use it for staffing and promises.',
  }
}

export function interpretOee(opts: {
  oeePct: number
  weakest: 'availability' | 'performance' | 'quality'
  availabilityPct: number
  performancePct: number
  qualityPct: number
}): Interpretation {
  const labels = {
    availability: 'Availability — too much downtime vs plan',
    performance: 'Performance — slow cycles or small stops while “running”',
    quality: 'Quality — scrap / rework hurting first-pass yield',
  } as const
  return {
    title: `Biggest loss: ${labels[opts.weakest]}`,
    plain: `OEE ≈ ${fmt(opts.oeePct, 1)}% = A ${fmt(opts.availabilityPct, 1)}% × P ${fmt(opts.performancePct, 1)}% × Q ${fmt(opts.qualityPct, 1)}%. Attack the weakest leg first — not random tweaks.`,
    meta:
      opts.weakest === 'availability'
        ? 'Next: Pareto downtime reasons (failure vs setup).'
        : opts.weakest === 'performance'
          ? 'Next: log minor stops / reduced speed.'
          : 'Next: Yield + Pareto defect codes.',
  }
}

export function interpretYield(opts: {
  fpyPct: number
  scrapPct: number
  hitTarget: boolean | null
  targetFpyPct: number | null
  startupFpy?: number | null
  steadyFpy?: number | null
}): Interpretation {
  const gap =
    opts.startupFpy != null &&
    opts.steadyFpy != null &&
    Math.abs(opts.startupFpy - opts.steadyFpy) >= 5

  let plain = `First-pass yield ${fmt(opts.fpyPct, 1)}% (scrap/rework ${fmt(opts.scrapPct, 1)}%).`
  if (opts.hitTarget == null) {
    plain += ' No FPY target set — still useful as a baseline.'
  } else if (opts.hitTarget) {
    plain += ` Met the ${fmt(opts.targetFpyPct, 1)}% target.`
  } else {
    plain += ` Missed the ${fmt(opts.targetFpyPct, 1)}% target — send scrap reasons to Pareto.`
  }

  if (gap) {
    plain += ` Startup (${fmt(opts.startupFpy!, 1)}%) vs steady (${fmt(opts.steadyFpy!, 1)}%) gap is large — classic Reduced Yield after changeover vs Process Defects in steady run.`
  }

  return {
    title: gap
      ? 'Startup vs steady quality gap'
      : opts.hitTarget === false
        ? 'Yield miss — dig scrap reasons'
        : 'First-pass yield reading',
    plain,
    meta: gap
      ? 'Different fixes: startup checklist / SMED vs steady-state process control.'
      : 'OEE Quality uses the same first-pass idea — rework counts as not-good.',
  }
}

export function interpretSampleSize(opts: {
  label: string
  nPerGroup: number
  groups: number
  totalN: number
  unitLabel: string
  powerPct: number
  alphaPct: number
  effectSize: number | null
  achievedPowerPct: number | null
  achievedN: number | null
}): Interpretation {
  const groupWord =
    opts.groups > 1
      ? `${opts.nPerGroup} ${opts.unitLabel} (${opts.totalN} total across ${opts.groups} groups)`
      : `${opts.nPerGroup} ${opts.unitLabel}`

  let plain = `Plan on ${groupWord}. That gives you about a ${fmt(opts.powerPct, 0)}% chance of catching the difference you described, while accepting a ${fmt(opts.alphaPct, 0)}% chance of a false alarm.`
  if (opts.effectSize != null) {
    plain += ` Effect size ≈ ${fmt(opts.effectSize, 2)} — that is the gap measured in “normal spreads.”`
  }

  let title = `Collect ${groupWord}`
  if (opts.achievedPowerPct != null && opts.achievedN != null) {
    const short = opts.achievedN < opts.nPerGroup
    plain += ` With the ${opts.achievedN} you already have, power is only about ${fmt(opts.achievedPowerPct, 0)}%${short ? ' — a real difference could easily slip past you' : ''}.`
    if (short) title = `Short by ${opts.nPerGroup - opts.achievedN} — plan ${opts.nPerGroup}`
  }

  return {
    title,
    plain,
    meta: 'Decide the count before you start. Adding “just one more” until p drops under 0.05 (p-hacking) manufactures false positives.',
  }
}

export function interpretSigmaLevel(opts: {
  dpmo: number
  sigmaLevel: number
  shiftApplied: boolean
  yieldPct: number
  dpu: number
  band: 'world-class' | 'strong' | 'typical' | 'weak'
}): Interpretation {
  const bandPlain = {
    'world-class': 'That is world-class territory — protect it with controls, don’t re-engineer it.',
    strong: 'Strong performance. Squeezing further usually needs variation reduction, not more inspection.',
    typical:
      'This is where most plants live. A 3-sigma process still fails several percent of the time, which the customer feels.',
    weak: 'Well below typical — expect visible customer pain. Attack the biggest defect family first.',
  } as const

  return {
    title: `≈ ${fmt(opts.sigmaLevel, 2)} sigma · ${Math.round(opts.dpmo).toLocaleString()} DPMO`,
    plain: `${fmt(opts.dpu, 3)} defects per unit, and ${fmt(opts.yieldPct, 3)}% of check points came out clean. ${bandPlain[opts.band]}`,
    meta: opts.shiftApplied
      ? 'Sigma level includes the traditional 1.5 shift, so it matches the “6 sigma = 3.4 DPMO” table most certifications quote.'
      : 'Shift is OFF — this is the long-term sigma straight from your data. Turn the 1.5 shift on to compare against the classic table.',
  }
}

export function interpretRty(opts: {
  rtyPct: number
  weakestLabel: string | null
  weakestYieldPct: number | null
  stepCount: number
  hiddenFactoryPct: number
  finalStepYieldPct: number | null
}): Interpretation {
  const weak =
    opts.weakestLabel != null && opts.weakestYieldPct != null
      ? ` Weakest step: “${opts.weakestLabel}” at ${fmt(opts.weakestYieldPct, 1)}% — fix that before anything else.`
      : ''
  const hidden =
    opts.hiddenFactoryPct > 5
      ? ` Your best single step looks ${fmt(opts.hiddenFactoryPct, 1)} points better than the real end-to-end number — that gap is the hidden factory of rework nobody reports.`
      : ''

  return {
    title: `Rolled throughput yield ≈ ${fmt(opts.rtyPct, 1)}%`,
    plain: `Out of 100 units started, about ${fmt(opts.rtyPct, 0)} walk all ${opts.stepCount} step(s) with no rework and no scrap.${weak}${hidden}`,
    meta: 'Each step multiplies, so several “good” steps still add up to a poor whole. Nine steps at 95% each land near 63%.',
  }
}

export function interpretAttributeChart(opts: {
  kind: 'p' | 'np' | 'c' | 'u'
  outCount: number
  outLabels: string[]
  center: number
  unitLabel: string
  longestRun: number
  variableLimits: boolean
}): Interpretation {
  const centerText = `Center line sits at ${fmt(opts.center, 2)} ${opts.unitLabel}.`
  const runNote =
    opts.longestRun >= 7
      ? ` Also watch a run of ${opts.longestRun} points on one side of the center line — that pattern usually means the rate shifted and stayed shifted.`
      : ''
  const limitNote = opts.variableLimits
    ? 'Sample sizes differ, so the limits step in and out — a small sample gets wider guardrails, which is exactly right.'
    : 'Every sample was the same size, so the limits stay flat.'

  if (opts.outCount === 0) {
    return {
      title: 'Counts look stable — common cause only',
      plain: `No sample crossed a control limit. The day-to-day bounce in your counts is the normal noise of the process, so chasing single bad days will just add churn.${runNote} ${centerText}`,
      meta: limitNote,
    }
  }

  return {
    title: `${opts.outCount} sample(s) out of control — special cause`,
    plain: `Out-of-limit sample(s): ${opts.outLabels.join(', ')}. Something assignable happened there (material lot, new operator, tooling, inspection change). Investigate those specific times before touching the whole process.${runNote} ${centerText}`,
    meta: limitNote,
  }
}

export function interpretOneProportion(opts: {
  pValue: number
  pHatPct: number
  targetPct: number
  ciLowPct: number
  ciHighPct: number
  higher: boolean
  largeSampleOk: boolean
}): Interpretation {
  const base = interpretPValue(opts.pValue)
  const direction = opts.higher ? 'above' : 'below'
  const covers =
    opts.ciLowPct <= opts.targetPct && opts.targetPct <= opts.ciHighPct
  return {
    title: base.title,
    plain: `You measured ${fmt(opts.pHatPct, 2)}%, which is ${direction} the ${fmt(opts.targetPct, 2)}% target. ${base.plain} The true rate is likely between ${fmt(opts.ciLowPct, 2)}% and ${fmt(opts.ciHighPct, 2)}%${covers ? ' — and that range still contains your target, so you cannot claim you beat (or missed) it yet' : ', which does not contain the target'}.`,
    meta: opts.largeSampleOk
      ? 'Confidence range uses the Wilson method, which stays honest on small counts.'
      : 'Caution: fewer than about 5 expected each way. Inspect more pieces before you act on this p-value.',
  }
}

export function interpretTwoProportion(opts: {
  pValue: number
  p1Pct: number
  p2Pct: number
  ciLowPct: number
  ciHighPct: number
  label1: string
  label2: string
  largeSampleOk: boolean
}): Interpretation {
  const base = interpretPValue(opts.pValue)
  const straddlesZero = opts.ciLowPct <= 0 && opts.ciHighPct >= 0
  return {
    title: base.title,
    plain: `${opts.label1} ran ${fmt(opts.p1Pct, 2)}% and ${opts.label2} ran ${fmt(opts.p2Pct, 2)}%. ${base.plain} The gap is likely between ${fmt(opts.ciLowPct, 2)} and ${fmt(opts.ciHighPct, 2)} percentage points${straddlesZero ? ' — that range crosses zero, so “no real difference” is still on the table' : ''}.`,
    meta: opts.largeSampleOk
      ? 'Pass/fail counts carry less information than measurements — if you can measure the feature instead, you will need far fewer pieces.'
      : 'Caution: expected failures under about 5 in a group. Collect more before betting on this.',
  }
}

export function interpretChiSquare(opts: {
  pValue: number
  chiSq: number
  df: number
  cramersV: number
  topCell: { row: string; col: string; observed: number; expected: number } | null
  lowExpectedWarning: boolean
}): Interpretation {
  const significant = opts.pValue < 0.05
  const strength =
    opts.cramersV < 0.1
      ? 'barely there'
      : opts.cramersV < 0.3
        ? 'modest'
        : opts.cramersV < 0.5
          ? 'strong'
          : 'very strong'
  const cellNote = opts.topCell
    ? ` Biggest mismatch: ${describeCell(opts.topCell)}.`
    : ''

  return {
    title: significant
      ? 'The mix really does depend on the group'
      : 'No proven link between group and category',
    plain: significant
      ? `χ² = ${fmt(opts.chiSq, 2)} on ${opts.df} degrees of freedom, p = ${fmt(opts.pValue, 4)}. The defect mix is not the same across groups — the differences are too big to be normal shuffling. Link strength looks ${strength} (Cramér’s V ${fmt(opts.cramersV, 2)}).${cellNote}`
      : `χ² = ${fmt(opts.chiSq, 2)} on ${opts.df} degrees of freedom, p = ${fmt(opts.pValue, 4)}. What you observed is close enough to what you would expect by ordinary random variation, so treat the groups as behaving the same for now.${cellNote}`,
    meta: opts.lowExpectedWarning
      ? 'Caution: at least one expected count is under 5. Combine small categories (an “Other” bucket) or collect more before quoting this p-value.'
      : 'Chi-square compares what you counted against what the table implies you should have counted if group made no difference.',
  }
}

function describeCell(c: {
  row: string
  col: string
  observed: number
  expected: number
}): string {
  const more = c.observed > c.expected ? 'more' : 'fewer'
  return `${c.row} in ${c.col} — ${c.observed} seen vs ${fmt(c.expected, 1)} expected (${more} than expected)`
}

/** Heuristic: run chart looks jumpy enough to warrant I-MR. */
export function looksJumpy(values: number[]): boolean {
  if (values.length < 8) return false
  const diffs: number[] = []
  for (let i = 1; i < values.length; i++) {
    diffs.push(Math.abs(values[i] - values[i - 1]))
  }
  const avg = diffs.reduce((s, d) => s + d, 0) / Math.max(diffs.length, 1)
  const big = diffs.filter((d) => d > avg * 2.5).length
  const range = Math.max(...values) - Math.min(...values)
  const mid = values.reduce((s, v) => s + v, 0) / values.length
  const relative = mid !== 0 ? range / Math.abs(mid) : range
  return big >= 3 || relative > 0.15
}
