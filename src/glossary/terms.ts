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
  'sample size': {
    id: 'sample-size',
    term: 'Sample size (n)',
    plain:
      'How many pieces you plan to measure. Decide it before you start: too few hides a real improvement, too many wastes production.',
  },
  'statistical power': {
    id: 'statistical-power',
    term: 'Power',
    plain:
      'Your chance of actually spotting a real difference if one exists. 80% is the usual target — meaning you would still miss it 1 time in 5.',
  },
  alpha: {
    id: 'alpha',
    term: 'Alpha (significance level)',
    plain:
      'How much false-alarm risk you accept. Alpha 0.05 means a 5% chance of shouting “it changed!” when nothing did.',
  },
  'effect size': {
    id: 'effect-size',
    term: 'Effect size',
    plain:
      'The gap you care about, measured in “normal spreads.” A gap of 10 in a process that normally wanders ±6.5 is an effect size of about 1.5 — easy to see. A gap smaller than the noise needs a lot of pieces.',
  },
  'confidence interval': {
    id: 'confidence-interval',
    term: 'Confidence range (interval)',
    plain:
      'The believable range for the real value, based on your sample. Wide range = you do not have much data yet. If the range covers “no difference,” you cannot claim a difference.',
  },
  dpmo: {
    id: 'dpmo',
    term: 'DPMO',
    plain:
      'Defects Per Million Opportunities. Scales your defect count to a per-million basis so a small trial and a full year can be compared. A “six sigma” process runs 3.4 DPMO.',
  },
  dpu: {
    id: 'dpu',
    term: 'DPU',
    plain:
      'Defects Per Unit — total defects divided by units made. One unit can carry several defects, so DPU can be above 1.',
  },
  'sigma level': {
    id: 'sigma-level',
    term: 'Sigma level',
    plain:
      'A single score for how defect-free a process is. 3 sigma ≈ 66,800 DPMO (fails about 7% of the time); 6 sigma ≈ 3.4 DPMO. Most published tables include a 1.5 shift, so always say whether yours does.',
  },
  rty: {
    id: 'rty',
    term: 'Rolled throughput yield (RTY)',
    plain:
      'The share of units that get through every single step with no rework and no scrap. Step yields multiply, so nine steps at 95% each land near 63%.',
  },
  'hidden factory': {
    id: 'hidden-factory',
    term: 'Hidden factory',
    plain:
      'The rework and touch-ups absorbed at each station that never show up on the final report. Rolled throughput yield is what exposes it.',
  },
  'attribute data': {
    id: 'attribute-data',
    term: 'Attribute data',
    plain:
      'Counted data instead of measured: pass/fail tallies, defect counts, go/no-go checks. Cheaper to collect but carries far less information, so it needs bigger samples.',
  },
  'p chart': {
    id: 'p-chart',
    term: 'p chart (share that failed)',
    plain:
      'A control chart of the percent of each sample that failed. Handles changing sample sizes by widening the limits when you inspected less.',
  },
  'u chart': {
    id: 'u-chart',
    term: 'u chart (defects per unit)',
    plain:
      'A control chart of defects divided by how much you inspected. Use it when a single piece can carry several defects and the inspected amount moves around.',
  },
  proportion: {
    id: 'proportion',
    term: 'Proportion (rate)',
    plain:
      'The share that failed — bad pieces divided by pieces inspected. Reported as a percent, tested with a rate test rather than a t-test.',
  },
  'chi-square': {
    id: 'chi-square',
    term: 'Chi-square test',
    plain:
      'Compares what you counted against what you would expect if the group made no difference. Answers “do these groups fail for different reasons?” — not just “do they fail more often?”',
  },
  'distribution shape': {
    id: 'distribution-shape',
    term: 'Distribution shape',
    plain:
      'How values pile up on a histogram: bell-shaped, skewed (long tail), flat, or two humps (often mixed groups). Shape guides which “typical” number to trust.',
  },
  'takt time': {
    id: 'takt-time',
    term: 'Takt time',
    plain:
      'The customer’s drumbeat: available running time divided by how many pieces the customer wants. If takt is 54 seconds, one good piece has to finish every 54 seconds — it is set by demand, not by how fast the machine can go.',
  },
  'cycle time': {
    id: 'cycle-time',
    term: 'Cycle time',
    plain:
      'How long one station actually needs to finish one piece. Compare it to takt: shorter than takt means the station can keep up, longer means it cannot.',
  },
  'line balance': {
    id: 'line-balance',
    term: 'Line balance / imbalance %',
    plain:
      'How evenly the work is spread across stations. Total work divided by (stations × slowest station) is the balance score; the leftover percent is imbalance — people standing and waiting on the bottleneck.',
  },
  bottleneck: {
    id: 'bottleneck',
    term: 'Bottleneck (constraint)',
    plain:
      'The slowest step. The whole line can only go as fast as this one station, so improving anything else just builds a bigger pile in front of it.',
  },
  "little's law": {
    id: 'littles-law',
    term: 'Little’s Law',
    plain:
      'WIP ≈ throughput × lead time. Know any two and you can work out the third. The practical lesson: start fewer jobs at once and lead time drops without anyone working faster.',
  },
  'work in process': {
    id: 'work-in-process',
    term: 'Work in process (WIP)',
    plain:
      'Pieces that have been started but not finished — everything sitting between the first and last step. Extra WIP hides problems and stretches lead time.',
  },
  throughput: {
    id: 'throughput',
    term: 'Throughput',
    plain:
      'Finished good pieces per hour, shift, or day. Started-but-stuck work is inventory, not throughput.',
  },
  'lead time': {
    id: 'lead-time',
    term: 'Lead time',
    plain:
      'How long one piece takes to get all the way through, waiting included: processing + waiting + transport. Usually far longer than the hands-on time.',
  },
  smed: {
    id: 'smed',
    term: 'SMED (quick changeover)',
    plain:
      'Single-Minute Exchange of Dies — cut setup time by moving tasks from “machine stopped” to “machine still running,” then deleting or shortening what is left. The classic target is a stop under ten minutes.',
  },
  'internal setup': {
    id: 'internal-setup',
    term: 'Internal setup',
    plain:
      'Changeover work that can only happen with the machine stopped, such as unbolting a die. Every internal minute is lost production time.',
  },
  'external setup': {
    id: 'external-setup',
    term: 'External setup',
    plain:
      'Changeover work you can do while the machine is still running, such as staging the next die or pre-kitting tools. Basically free time — the goal is to move as much here as possible.',
  },
  changeover: {
    id: 'changeover',
    term: 'Changeover (make-ready)',
    plain:
      'Switching the line from one product to the next. Usually the biggest planned stop in the plant, and the first hour after it is often the scrappiest.',
  },
  copq: {
    id: 'copq',
    term: 'COPQ (cost of poor quality)',
    plain:
      'The money poor quality already cost you: internal failures (scrap, rework, quality downtime) plus external failures (returns, warranty, credits). Reported per month and annualized so it lands in a budget conversation.',
  },
  'internal failure cost': {
    id: 'internal-failure-cost',
    term: 'Internal failure cost',
    plain:
      'Defects you caught yourself — scrap, rework hours, sorting, and line stopped for quality. Painful, but cheaper than letting it ship.',
  },
  'external failure cost': {
    id: 'external-failure-cost',
    term: 'External failure cost',
    plain:
      'Defects the customer caught — returns, warranty, credits, premium freight, lost orders. The same defect costs far more out here than it did on your floor.',
  },
  'appraisal cost': {
    id: 'appraisal-cost',
    term: 'Appraisal cost',
    plain:
      'What you spend checking: inspection labour, testing, audits, gage calibration. Necessary, but inspection never actually makes a part good.',
  },
  'prevention cost': {
    id: 'prevention-cost',
    term: 'Prevention cost',
    plain:
      'What you spend stopping defects up front: training, preventive maintenance, mistake-proofing, standard work, capability studies. Almost always the cheapest dollar in the quality budget.',
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
