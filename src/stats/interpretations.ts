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
