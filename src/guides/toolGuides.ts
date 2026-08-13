import type { AppView } from '../components/AppShell'

export interface ToolGuideQuote {
  text: string
  source: string
}

export interface ToolGuide {
  id: AppView
  /** Everyday name shown first */
  plainName: string
  /** Optional textbook name, shown smaller */
  alsoCalled?: string
  /** The shop-floor question this answers */
  problem: string
  /** What the tool actually does */
  does: string
  /** Short how-to steps */
  how: string[]
  /** Keywords that help match a typed problem statement */
  keywords: string[]
  phase: 'define' | 'measure' | 'analyze' | 'improve' | 'control' | 'data'
  /** Teaching notes from the Obsidian Lean / Six Sigma / Maths vault */
  quotes?: ToolGuideQuote[]
}

/** Plain-language catalog for every major tool. */
export const TOOL_GUIDES: ToolGuide[] = [
  {
    id: 'projects',
    plainName: 'Start a problem project',
    alsoCalled: 'DMAIC / A3 binder',
    problem:
      'I have a real plant problem and need one place to track the story and proof.',
    does: 'Holds your problem statement, SIPOC, Fishbone, 5 Whys, FMEA, and pinned stats reports in Define to Control order.',
    how: [
      'Write the problem in everyday words.',
      'Fill Define (goal, CTQ, SIPOC).',
      'Run measure/analyze tools and pin their reports here.',
      'Write countermeasures and a control plan.',
    ],
    keywords: ['project', 'dmaic', 'a3', 'charter', 'problem statement'],
    phase: 'define',
    quotes: [
      {
        text: 'DMAIC (Define, Measure, Analyze, Improve, Control): The core structured project methodology of Six Sigma used to identify root causes and systematically reduce process variation.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
  },
  {
    id: 'data',
    plainName: 'Bring numbers in',
    alsoCalled: 'Data ingest',
    problem: 'I have Excel / CSV and need it in the app before any chart or test.',
    does: 'Reads pasted Excel or uploaded files, shows a simple summary, and saves locally for 30 days.',
    how: [
      'Copy a table from Excel and paste, or upload CSV/XLSX.',
      'Check the preview looks right.',
      'Save the dataset, then open a suggested tool.',
    ],
    keywords: ['excel', 'csv', 'upload', 'paste', 'data', 'table'],
    phase: 'data',
  },
  {
    id: 'visual',
    plainName: 'See the shape of my data',
    alsoCalled: 'Histogram, box plot, run chart',
    problem:
      'I want a first look: where do values sit, how spread out are they, and do they drift over time?',
    does: 'Shows a photo (histogram), a middle/outlier summary (box plot), and a movie in entry order (run chart).',
    how: [
      'Load or paste a dataset.',
      'Pick one numeric column.',
      'Read the plain-English report at the bottom.',
    ],
    keywords: [
      'shape',
      'histogram',
      'box',
      'run',
      'baseline',
      'look',
      'distribution',
      'outlier',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Think of a histogram as a photograph of your data at one point in time… a run chart is a movie.',
        source: 'Maths · Charts',
      },
      {
        text: 'The median is highly useful early in a project because it is not heavily warped by extreme outliers.',
        source: 'Maths · Descriptive Statistics',
      },
    ],
  },
  {
    id: 'compare',
    plainName: 'Compare groups side by side',
    alsoCalled: 'Multi-column box plots',
    problem: 'I want to eyeball suppliers, shifts, lines, or ovens next to each other.',
    does: 'Draws box plots for two or more numeric columns so you can compare middle and spread quickly.',
    how: [
      'Use a dataset with one column per group.',
      'Check the columns you want to compare.',
      'If the boxes look different, prove it next with “Are these two groups really different?”',
    ],
    keywords: [
      'compare',
      'shift',
      'supplier',
      'line',
      'oven',
      'group',
      'side by side',
    ],
    phase: 'analyze',
  },
  {
    id: 'imr',
    plainName: 'Is this process stable?',
    alsoCalled: 'I-MR control chart + Western Electric rules',
    problem:
      'Numbers jump around — is that normal noise, or did something unusual happen?',
    does: 'Plots each measurement with guardrails from your own data and flags special-cause patterns.',
    how: [
      'Paste one measurement column in time/order.',
      'Look for red points or rule alarms.',
      'Investigate flagged points before chasing every wiggle.',
    ],
    keywords: [
      'stable',
      'stability',
      'control',
      'spc',
      'jump',
      'drift',
      'out of control',
      'special cause',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Control Charts: Used to monitor process stability over time by distinguishing between common cause variation (inherent noise) and special cause variation (assignable events).',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
  },
  {
    id: 'xbarr',
    plainName: 'Are my subgroups stable?',
    alsoCalled: 'X-bar and R chart',
    problem:
      'My Excel is already in batches (for example 5 pieces per hour) and I need a stability check.',
    does: 'Tracks each subgroup average and range with control limits.',
    how: [
      'Each spreadsheet row = one subgroup; columns = pieces in that group.',
      'Open the tool and review both charts.',
      'Fix out-of-control subgroups before capability claims.',
    ],
    keywords: ['subgroup', 'batch', 'xbar', 'x-bar', 'sample of'],
    phase: 'measure',
  },
  {
    id: 'capability',
    plainName: 'Can we hit the customer limits?',
    alsoCalled: 'Cp / Cpk / Pp / Ppk',
    problem:
      'The customer allows a range — are we fitting inside it, and are we aimed at the middle?',
    does: 'Scores how wide your process is versus the spec, and how well it is centered.',
    how: [
      'Confirm the process looks stable first (control chart).',
      'Enter lower and/or upper spec limits.',
      'Read Cpk in plain English — many plants want at least 1.33.',
    ],
    keywords: [
      'spec',
      'specification',
      'customer limit',
      'tolerance',
      'cpk',
      'capability',
      'out of spec',
      'usl',
      'lsl',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Process Capability Analysis (Cp, Cpk): Used to measure how well a process meets customer specifications, assessing both the width of the process variation and how centered it is.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
  },
  {
    id: 'pareto',
    plainName: 'What are the biggest few problems?',
    alsoCalled: 'Pareto chart',
    problem: 'Too many defect types or delays — where should we focus first?',
    does: 'Ranks causes from biggest to smallest and shows how fast you cover most of the pain.',
    how: [
      'Use a category column (and optional count column).',
      'Fix the tallest bars first (vital few).',
      'Send the top bar into Fishbone / 5 Whys.',
    ],
    keywords: [
      'defect',
      'scrap',
      'pareto',
      'vital few',
      'biggest',
      'most frequent',
      'cause',
      'reject',
    ],
    phase: 'analyze',
    quotes: [
      {
        text: 'Pareto Analysis / Pareto Charts: A tool used to determine the biggest disruptions to flow or most frequent causes of defects, isolating the vital few problems.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
  },
  {
    id: 'ttest',
    plainName: 'Are these two groups really different?',
    alsoCalled: '2-sample t-test',
    problem:
      'Oven A looks better than Oven B (or Shift 1 vs Shift 2) — is that real, or just luck?',
    does: 'Compares two averages and tells you the chance you would see a gap this big if nothing real changed (p-value).',
    how: [
      'Put each group in its own numeric column.',
      'Run the comparison.',
      'If p is under 0.05, treat the difference as likely real; if not, you may need more data or a bigger gap.',
    ],
    keywords: [
      'different',
      'versus',
      'vs',
      'compare two',
      'oven',
      'shift',
      'supplier a',
      'better',
      'worse',
      't-test',
      'pvalue',
      'p-value',
      'hypothesis',
    ],
    phase: 'analyze',
    quotes: [
      {
        text: 'Hypothesis testing is a formal way to use sample data to decide between two competing stories about a process.',
        source: 'Maths · Hypothesis Testing',
      },
      {
        text: 'A p-value answers: if the null story were true, how often would luck alone create a difference at least this large?',
        source: 'Maths · Hypothesis Testing',
      },
    ],
  },
  {
    id: 'anova',
    plainName: 'Is at least one group different?',
    alsoCalled: 'One-way ANOVA',
    problem:
      'I have three or more groups (shifts, ovens, suppliers) — is any of them truly different?',
    does: 'Compares averages across 3+ groups at once and reports whether at least one stands out versus normal within-group noise (F-test + p-value).',
    how: [
      'Put each group in its own numeric column (need at least three).',
      'Select the columns and run the test.',
      'If p is under 0.05, dig into which group stands out with box plots; then confirm with a focused two-group check if needed.',
    ],
    keywords: [
      'anova',
      'three',
      'multiple groups',
      'several',
      'ovens',
      'shifts',
      'suppliers',
      'hypothesis',
      'f-test',
    ],
    phase: 'analyze',
    quotes: [
      {
        text: 'ANOVA… is a statistical tool used to compare the averages (means) of three or more groups to see if at least one group is significantly different from the others.',
        source: 'Maths · ANOVA',
      },
      {
        text: 'Instead of doing ten separate t-tests… you run one ANOVA test to ask: “Are the averages of all five groups the same, or is at least one group significantly different?”',
        source: 'Maths · ANOVA',
      },
      {
        text: 'The F-statistic tells you if the differences between your groups are much larger than the natural variation within each group.',
        source: 'Maths · ANOVA',
      },
    ],
  },
  {
    id: 'regression',
    plainName: 'Does this input move with that result?',
    alsoCalled: 'Scatter plot + linear regression + R²',
    problem:
      'I suspect temperature, speed, or sugar content is linked to a result — how strong is the link?',
    does: 'Plots two columns, fits a straight line, and explains how much of the result variation the input explains (R-squared).',
    how: [
      'Pick an input column (X) and a result column (Y).',
      'Look at the scatter and the fit line.',
      'Read R-squared in plain words — closer to 1 means a tighter link (still not automatic proof of cause). Always glance at the p-value too.',
    ],
    keywords: [
      'predict',
      'relationship',
      'correlation',
      'regression',
      'linked',
      'related',
      'r-squared',
      'r2',
      'scatter',
      'temperature',
      'speed',
      'predictive',
    ],
    phase: 'analyze',
    quotes: [
      {
        text: 'At its core, R² represents the percentage of variation in your dependent variable (the outcome) that is explained by your independent variable (the predictor).',
        source: 'Maths · R2',
      },
      {
        text: 'If you only collect two random data points, you can always draw a straight line perfectly through them… you must always look at the p-value alongside your R².',
        source: 'Maths · R2',
      },
      {
        text: 'Linear Regression: Fits a straight line to data points using the least squares method to predict outcomes based on independent variables.',
        source: 'Maths · Hypothesis Testing',
      },
    ],
  },
  {
    id: 'gage',
    plainName: 'Can we trust the measurement?',
    alsoCalled: 'Gage R&R',
    problem:
      'Before I improve the process, I need to know if the gage/people measuring are noisy.',
    does: 'Splits what you see into part-to-part variation vs measurement noise (repeatability + reproducibility).',
    how: [
      'Use Part, Operator, and Measurement columns (with repeats).',
      'Check percent gage contribution.',
      'Under about 10% is excellent; over about 30% fix the measurement method first.',
    ],
    keywords: [
      'gage',
      'gauge',
      'measurement',
      'msa',
      'trust',
      'calibrat',
      'repeatability',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Measurement System Analysis (MSA) / Gauge R&R: A tool used to verify the accuracy and reliability of measurement instruments, such as packaging scales.',
        source: 'Six Sigma · Six Sigma Tools',
      },
      {
        text: 'Gage R&R Variance Partitioning: Divides total observed variance into physical part-to-part variation and measurement system error.',
        source: 'Maths · Descriptive Statistics',
      },
    ],
  },
  {
    id: 'montecarlo',
    plainName: 'What total time should we expect?',
    alsoCalled: 'Time-study Monte Carlo',
    problem:
      'Cycle/changeover time is uncertain — what is likely, and how often will we miss a target?',
    does: 'Runs thousands of what-if days from each step fast/typical/slow times and shows risk.',
    how: [
      'List process steps with min, typical, and max times.',
      'Set an optional target.',
      'Read median, slow-day (P90/P95), and on-time percent.',
    ],
    keywords: [
      'time',
      'cycle',
      'changeover',
      'smed',
      'lead time',
      'monte',
      'simulation',
      'risk',
      'target time',
    ],
    phase: 'improve',
    quotes: [
      {
        text: 'The largest source of Setup and Adjustment time is typically changeovers… which can be addressed through a SMED program.',
        source: 'Lean · Big 6 Losses',
      },
    ],
  },
  {
    id: 'fishbone',
    plainName: 'Brainstorm possible causes',
    alsoCalled: 'Fishbone / Ishikawa (6M)',
    problem: 'We know the bad outcome, but not which cause families to hunt.',
    does: 'Maps possible causes under People, Machine, Material, Method, Measurement, and Environment.',
    how: [
      'Attach it to a DMAIC project.',
      'Write the effect (problem) as the fish head.',
      'Add causes on each bone without judging yet — then prove with data.',
    ],
    keywords: ['cause', 'brainstorm', 'fishbone', 'ishikawa', 'why', 'root'],
    phase: 'analyze',
    quotes: [
      {
        text: 'Cause-and-Effect Diagrams (Fishbone/Ishikawa): A brainstorming and analysis tool applied to trace back the underlying root causes of defects.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
  },
  {
    id: 'fivewhys',
    plainName: 'Dig to a root cause',
    alsoCalled: '5 Whys',
    problem:
      'We keep fixing symptoms; I need a deeper cause we can actually change.',
    does: 'Asks why in a chain until you land on a fixable root cause.',
    how: [
      'Start from a Pareto bar or Fishbone branch.',
      'Fill Why 1 through Why 5 in plain language.',
      'Write the working root cause, then validate with a stats check.',
    ],
    keywords: ['root cause', '5 why', 'five why', 'symptom', 'deeper'],
    phase: 'analyze',
  },
  {
    id: 'fmea',
    plainName: 'Rank failure risks before they hurt us',
    alsoCalled: 'FMEA (RPN)',
    problem: 'What could go wrong, and what should we prevent first?',
    does: 'Scores each failure mode by how bad, how often, and how hard to catch (Severity x Occurrence x Detection).',
    how: [
      'Add failure modes, effects, and causes.',
      'Score S, O, and D from 1 to 10.',
      'Sort by RPN and assign actions to the highest risks.',
    ],
    keywords: ['fmea', 'risk', 'failure', 'prevent', 'rpn', 'severity'],
    phase: 'analyze',
  },
  {
    id: 'yield',
    plainName: 'First-pass yield / scrap',
    alsoCalled: 'FPY · quality rate',
    problem:
      'We made a lot of pieces — how many were good the first time, and is startup worse than steady run?',
    does: 'Turns good vs total counts into first-pass yield % and scrap/rework %. Optional split by period (startup vs run).',
    how: [
      'Enter good (first pass) and total produced for the shift or batch.',
      'Or use By period to compare startup hour vs steady run.',
      'Set an optional FPY target, then Pareto defect reasons if you miss it.',
    ],
    keywords: [
      'yield',
      'scrap',
      'fpy',
      'first pass',
      'rework',
      'startup',
      'reject',
      'quality rate',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Process Defects account for defective parts produced during stable (steady-state) production… OEE measures quality from a First Pass Yield perspective.',
        source: 'Lean · Big 6 Losses',
      },
      {
        text: 'Reduced Yield accounts for defective parts produced from startup until stable production is reached… most commonly tracked after changeovers.',
        source: 'Lean · Big 6 Losses',
      },
    ],
  },
  {
    id: 'oee',
    plainName: 'Is the line effective?',
    alsoCalled: 'OEE lite',
    problem:
      'We feel slow and stopped a lot — where is the real loss: downtime, speed, or quality?',
    does: 'Computes Availability × Performance × Quality and highlights the weakest factor in plain English.',
    how: [
      'Enter planned time, downtime, ideal cycle time, total pieces, and good pieces (same time units).',
      'Read which factor is dragging OEE down.',
      'Attack that loss next (Pareto downtime reasons, small stops, or scrap codes).',
    ],
    keywords: [
      'oee',
      'availability',
      'performance',
      'downtime',
      'slow',
      'efficiency',
      'equipment',
      'six big',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Overall Equipment Effectiveness (OEE): A metric that measures manufacturing efficiency by multiplying availability, performance rate, and quality rate.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Using the Six Big Losses framework creates a concrete path to improve your OEE score.',
        source: 'Lean · Big 6 Losses',
      },
    ],
  },
  {
    id: 'beforeafter',
    plainName: 'Did the fix work?',
    alsoCalled: 'Before vs after check',
    problem:
      'We changed a setting / method / part — did the numbers actually get better, or are we guessing?',
    does: 'Compares Before and After columns, says whether the improvement looks real vs lucky noise, and whether it moved the right direction.',
    how: [
      'Put before samples in one column and after samples in another.',
      'Choose whether lower or higher is better.',
      'If the gain looks real, pin the report and control-chart the after stream.',
    ],
    keywords: [
      'before',
      'after',
      'fix',
      'improvement',
      'kaizen',
      'did it work',
      'countermeasure',
      'validate',
    ],
    phase: 'improve',
    quotes: [
      {
        text: 'Kaizen: A philosophy of continuous, small incremental improvements involving everyone from top management to shop floor personnel.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'PDCA Cycle (Plan-Do-Check-Act): A continuous problem-solving framework used to develop, test, and implement solutions.',
        source: 'Lean · Lean Tools',
      },
    ],
  },
]

export function getToolGuide(id: AppView): ToolGuide | undefined {
  return TOOL_GUIDES.find((g) => g.id === id)
}

export interface SituationOption {
  id: string
  label: string
  /** Everyday description */
  hint: string
  toolIds: AppView[]
}

/** Selectable problem situations for the Solve form. */
export const SITUATIONS: SituationOption[] = [
  {
    id: 'defects',
    label: 'Too many defects / scrap',
    hint: 'Quality issues, rejects, rework',
    toolIds: ['data', 'pareto', 'fishbone', 'fivewhys', 'imr', 'capability'],
  },
  {
    id: 'unstable',
    label: 'Process feels unstable',
    hint: 'Numbers jump, drift, or surprise us',
    toolIds: ['data', 'visual', 'imr', 'xbarr'],
  },
  {
    id: 'specs',
    label: 'Not hitting customer specs',
    hint: 'Parts outside allowed limits',
    toolIds: ['data', 'imr', 'capability', 'visual'],
  },
  {
    id: 'two-groups',
    label: 'Is A really better than B?',
    hint: 'Shifts, ovens, suppliers, lines',
    toolIds: ['data', 'compare', 'ttest', 'anova'],
  },
  {
    id: 'relationship',
    label: 'Does one thing drive another?',
    hint: 'Temperature, speed, settings vs result — predictive / R²',
    toolIds: ['data', 'regression'],
  },
  {
    id: 'causes',
    label: 'Need to find root causes',
    hint: 'Brainstorm then prove',
    toolIds: ['pareto', 'fishbone', 'fivewhys', 'fmea', 'ttest', 'anova'],
  },
  {
    id: 'time',
    label: 'Cycle / changeover time risk',
    hint: 'Long or unpredictable times',
    toolIds: ['montecarlo', 'data', 'visual'],
  },
  {
    id: 'measurement',
    label: 'Not sure we trust the gage',
    hint: 'Measurement noise vs real part differences',
    toolIds: ['gage', 'data'],
  },
  {
    id: 'baseline',
    label: 'Just starting — need a baseline',
    hint: 'First look before deeper analysis',
    toolIds: ['projects', 'data', 'visual', 'imr'],
  },
  {
    id: 'prevent',
    label: 'Prevent failures before they happen',
    hint: 'Risk ranking and controls',
    toolIds: ['fmea', 'projects', 'imr'],
  },
  {
    id: 'red-flag',
    label: 'Something looks wrong right now',
    hint: 'Andon moment — numbers or product look off this shift',
    toolIds: ['visual', 'imr', 'fishbone', 'fivewhys', 'yield'],
  },
  {
    id: 'changeover',
    label: 'Changeover is killing us',
    hint: 'Long setups, make-ready, startup scrap after swaps',
    toolIds: ['montecarlo', 'yield', 'pareto', 'projects'],
  },
  {
    id: 'yield-drop',
    label: 'Yield / scrap jumped',
    hint: 'First-pass yield down — startup or steady run',
    toolIds: ['yield', 'pareto', 'imr', 'fishbone'],
  },
  {
    id: 'fix-check',
    label: 'Did our fix actually work?',
    hint: 'Before vs after proof after a change',
    toolIds: ['beforeafter', 'data', 'imr', 'visual'],
  },
  {
    id: 'slow-line',
    label: 'Line feels slow / blocked',
    hint: 'Downtime, small stops, slow cycles, bottleneck',
    toolIds: ['oee', 'pareto', 'montecarlo', 'data'],
  },
  {
    id: 'messy',
    label: 'Workplace is messy / hard to run',
    hint: '5S, motion waste, tools not at point of use',
    toolIds: ['projects', 'fishbone', 'fivewhys', 'pareto'],
  },
]
