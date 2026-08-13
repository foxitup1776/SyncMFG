export interface GlossaryTerm {
  id: string
  term: string
  plain: string
}

/** Everyday definitions for stats terms used in reports. */
export const GLOSSARY: Record<string, GlossaryTerm> = {
  mean: {
    id: 'mean',
    term: 'Mean (average)',
    plain:
      'Add up all the numbers and divide by how many there are. One extreme value can pull this up or down a lot.',
  },
  median: {
    id: 'median',
    term: 'Median',
    plain:
      'Line the numbers up from smallest to largest and pick the middle one. Outliers affect this less than the average.',
  },
  'standard deviation': {
    id: 'standard-deviation',
    term: 'Standard deviation',
    plain:
      'A consistency score: how far numbers usually sit from the average. Low means tight and repeatable; high means all over the place.',
  },
  sample: {
    id: 'sample',
    term: 'Sample',
    plain:
      'The rows you measured or pasted — not every unit ever made, just the group you are studying right now.',
  },
  'control limit': {
    id: 'control-limit',
    term: 'Control limit',
    plain:
      'A guardrail calculated from your own process data. Points outside it suggest something unusual happened — not the same thing as a customer spec limit.',
  },
  'common cause': {
    id: 'common-cause',
    term: 'Common cause variation',
    plain:
      'The normal background noise of a stable process. Fixing it usually means changing the system, not blaming one operator.',
  },
  'special cause': {
    id: 'special-cause',
    term: 'Special cause variation',
    plain:
      'An unusual event (broken tool, wrong material, power blip). Find and fix that specific issue.',
  },
  'moving range': {
    id: 'moving-range',
    term: 'Moving range',
    plain:
      'How much one point jumped from the point before it. Used to estimate short-term process noise on an I-MR chart.',
  },
  'i-mr': {
    id: 'i-mr',
    term: 'I-MR chart',
    plain:
      'Individuals and Moving Range chart — a stability check when you have one measurement at a time (or one column from a pasted batch).',
  },
  cp: {
    id: 'cp',
    term: 'Cp',
    plain:
      'Can the process spread fit inside the customer limits if it were perfectly centered? Ignores aiming errors.',
  },
  cpk: {
    id: 'cpk',
    term: 'Cpk',
    plain:
      'How well your process fits inside the customer’s allowed range, including whether you are aimed at the center. Higher is better; many plants want at least 1.33.',
  },
  pp: {
    id: 'pp',
    term: 'Pp',
    plain:
      'Like Cp, but using the overall long-run spread of the whole dataset you pasted.',
  },
  ppk: {
    id: 'ppk',
    term: 'Ppk',
    plain:
      'Like Cpk, but using overall long-run spread. Often the more honest “how are we really doing?” score.',
  },
  'specification limit': {
    id: 'specification-limit',
    term: 'Specification limit (USL / LSL)',
    plain:
      'The customer’s allowed range — upper (USL) and/or lower (LSL). Different from control limits, which come from your process data.',
  },
  histogram: {
    id: 'histogram',
    term: 'Histogram',
    plain:
      'A bar chart “photo” of your data: where values clump, how wide they spread, and whether the shape looks lopsided.',
  },
  'box plot': {
    id: 'box-plot',
    term: 'Box plot',
    plain:
      'Shows the middle 50% as a box, the median as a line, whiskers for the normal reach, and dots for outliers.',
  },
  'run chart': {
    id: 'run-chart',
    term: 'Run chart',
    plain:
      'Points plotted in time or entry order — a “movie” that reveals trends, shifts, or cycles.',
  },
  outlier: {
    id: 'outlier',
    term: 'Outlier',
    plain:
      'A point sitting unusually far from the rest. Worth a second look — it may be a real special event or a typo.',
  },
  'r-squared': {
    id: 'r-squared',
    term: 'R-squared (R²)',
    plain:
      'Imagine guessing the result using only the average. R-squared asks: how much better do we guess when we also use the input? 0 = no help; 1 = the input explains all the up-and-down.',
  },
  'p-value': {
    id: 'p-value',
    term: 'P-value',
    plain:
      'If nothing real changed, what’s the chance you’d still see a gap this big by luck? Small p (under 0.05) means “probably real.” Big p means “could still be noise.”',
  },
  'monte carlo': {
    id: 'monte-carlo',
    term: 'Monte Carlo',
    plain:
      'A computer runs thousands of “what if” trials with random but realistic times or values, then shows the range of likely outcomes and risk.',
  },
  percentile: {
    id: 'percentile',
    term: 'Percentile',
    plain:
      'A cut point in the results. Example: the 90th percentile means 90% of runs were at or below that time.',
  },
  'triangular distribution': {
    id: 'triangular-distribution',
    term: 'Triangular distribution',
    plain:
      'A simple uncertainty model using three numbers you know from the floor: fastest, typical, and slowest time for a step.',
  },
  pareto: {
    id: 'pareto',
    term: 'Pareto',
    plain:
      'Rank problems from biggest to smallest. Often a few causes create most of the pain — the “vital few.”',
  },
  'vital few': {
    id: 'vital-few',
    term: 'Vital few',
    plain:
      'The small number of causes that create most of the defects or delay. Fix these before the long tail of tiny issues.',
  },
  '2-sample t-test': {
    id: 'two-sample-t',
    term: 'Are two groups really different? (t-test)',
    plain:
      'Compares two averages and asks: is this gap bigger than normal luck would usually create? Everyday name first; “t-test” is the textbook name.',
  },
  anova: {
    id: 'anova',
    term: 'Is at least one group different? (ANOVA)',
    plain:
      'Compares three or more group averages at once. If the p-value is small, at least one group stands out from the pack — then dig into which one with plots or a focused two-group check.',
  },
  correlation: {
    id: 'correlation',
    term: 'Do they move together? (correlation)',
    plain:
      'From −1 (opposite directions) through 0 (no clear line) to +1 (same direction). Tight clustering means a stronger link.',
  },
  regression: {
    id: 'regression',
    term: 'Does X help explain Y? (regression)',
    plain:
      'Draws the best straight line through your points so you can describe the pattern and make a rough prediction.',
  },
  slope: {
    id: 'slope',
    term: 'Slope',
    plain:
      'On the best-fit line: when the input goes up by 1, how much does the result move?',
  },
  'xbar-r': {
    id: 'xbar-r',
    term: 'X̄-R chart',
    plain:
      'Control charts for subgrouped data: X̄ tracks the subgroup average, R tracks the spread inside each subgroup.',
  },
  'western electric': {
    id: 'western-electric',
    term: 'Western Electric rules',
    plain:
      'Extra alarm patterns on a control chart (runs, trends, points near the edge) — not only “outside the limit.”',
  },
  'gage rr': {
    id: 'gage-rr',
    term: 'Gage R&R',
    plain:
      'A study that splits measurement noise into repeatability (same person) and reproducibility (different people).',
  },
  repeatability: {
    id: 'repeatability',
    term: 'Repeatability',
    plain:
      'How much a measurement jumps when the same person measures the same part again with the same gage.',
  },
  reproducibility: {
    id: 'reproducibility',
    term: 'Reproducibility',
    plain:
      'How much measurements disagree between different people using the same gage.',
  },
  fishbone: {
    id: 'fishbone',
    term: 'Fishbone (Ishikawa)',
    plain:
      'A cause-and-effect diagram. The “head” is the problem; the “bones” are categories of possible causes.',
  },
  '6m': {
    id: 'six-m',
    term: '6M',
    plain:
      'Common fishbone categories: Man (people), Machine, Material, Method, Measurement, and Environment (Mother Nature).',
  },
  'root cause': {
    id: 'root-cause',
    term: 'Root cause',
    plain:
      'The deeper reason a problem keeps happening — something you can change to stop the symptom from returning.',
  },
  '5 whys': {
    id: 'five-whys',
    term: '5 Whys',
    plain:
      'Ask “why?” repeatedly (often five times) to move from a surface symptom to a fixable root cause.',
  },
  fmea: {
    id: 'fmea',
    term: 'FMEA',
    plain:
      'Failure Mode and Effects Analysis — list how something can fail, score the risk, and prioritize fixes.',
  },
  rpn: {
    id: 'rpn',
    term: 'RPN',
    plain:
      'Risk Priority Number = Severity × Occurrence × Detection (each usually 1–10). Higher means fix sooner.',
  },
  dmaic: {
    id: 'dmaic',
    term: 'DMAIC',
    plain:
      'Define, Measure, Analyze, Improve, Control — the main Six Sigma project roadmap for fixing an existing process.',
  },
  a3: {
    id: 'a3',
    term: 'A3',
    plain:
      'A one-page story of a problem: background, analysis, countermeasures, and follow-up — named after A3 paper size.',
  },
  ctq: {
    id: 'ctq',
    term: 'CTQ',
    plain:
      'Critical to Quality — the specific measurable thing the customer cares about (the metric your project aims to move).',
  },
  sipoc: {
    id: 'sipoc',
    term: 'SIPOC',
    plain:
      'Suppliers, Inputs, Process, Outputs, Customers — a high-level map of who and what surrounds your process.',
  },
  'first-pass yield': {
    id: 'first-pass-yield',
    term: 'First-pass yield (FPY)',
    plain:
      'Percent of pieces that are good the first time — scrap and rework both count against you. Same idea OEE uses for the quality rate.',
  },
  oee: {
    id: 'oee',
    term: 'OEE',
    plain:
      'Overall Equipment Effectiveness = Availability × Performance × Quality. Shows whether losses are mostly downtime, slow running, or bad pieces.',
  },
  'six big losses': {
    id: 'six-big-losses',
    term: 'Six Big Losses',
    plain:
      'A breakdown of why OEE suffers: equipment failure, setup/changeover, small stops, slow cycles, process defects, and startup (reduced) yield.',
  },
  kaizen: {
    id: 'kaizen',
    term: 'Kaizen',
    plain:
      'Continuous small improvements by everyone on the floor — not only big projects. Prove each change with before/after data.',
  },
  'eight wastes': {
    id: 'eight-wastes',
    term: 'Eight wastes (DOWNTIME)',
    plain:
      'Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra-processing — non-value work to spot on a Gemba walk.',
  },
  gemba: {
    id: 'gemba',
    term: 'Gemba',
    plain:
      'The real place where work happens (the floor). A Gemba walk means go look — don’t improve from the conference room alone.',
  },
  '5s': {
    id: 'five-s',
    term: '5S',
    plain:
      'Sort, Set in order, Shine, Standardize, Sustain — a workplace organization system so work is safer and waste is easier to see.',
  },
  'distribution shape': {
    id: 'distribution-shape',
    term: 'Distribution shape',
    plain:
      'How values pile up on a histogram: bell-shaped, skewed (long tail), flat, or two humps (often mixed groups). Shape guides which “typical” number to trust.',
  },
}

export function resolveTerms(ids: string[]): GlossaryTerm[] {
  const seen = new Set<string>()
  const out: GlossaryTerm[] = []
  for (const raw of ids) {
    const key = raw.toLowerCase()
    const term = GLOSSARY[key]
    if (term && !seen.has(term.id)) {
      seen.add(term.id)
      out.push(term)
    }
  }
  return out
}
