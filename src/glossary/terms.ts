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
      'How much of the change in your result is explained by the inputs you modeled. Closer to 1 means the model tracks the data tightly; closer to 0 means it barely helps.',
  },
  'p-value': {
    id: 'p-value',
    term: 'P-value',
    plain:
      'The chance you’d see a difference this big (or bigger) if nothing real changed. In Six Sigma work, below 0.05 is often treated as “likely real, not just luck.”',
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
    term: '2-sample t-test',
    plain:
      'A check for whether two groups’ averages differ by more than random noise would usually allow.',
  },
  correlation: {
    id: 'correlation',
    term: 'Correlation (r)',
    plain:
      'How tightly two measurements move together, from −1 (opposite) through 0 (no line) to +1 (same direction).',
  },
  regression: {
    id: 'regression',
    term: 'Regression',
    plain:
      'Fitting a line (or curve) so you can describe and predict one measurement from another.',
  },
  slope: {
    id: 'slope',
    term: 'Slope',
    plain:
      'How much Y changes when X goes up by one unit on the best-fit line.',
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
