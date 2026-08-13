import type { AppView } from '../components/AppShell'

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
    ],
    phase: 'analyze',
  },
  {
    id: 'regression',
    plainName: 'Does this input move with that result?',
    alsoCalled: 'Scatter plot + linear regression',
    problem:
      'I suspect temperature, speed, or sugar content is linked to a result — how strong is the link?',
    does: 'Plots two columns, fits a straight line, and explains how much of the result variation the input explains (R-squared).',
    how: [
      'Pick an input column (X) and a result column (Y).',
      'Look at the scatter and the fit line.',
      'Read R-squared in plain words — closer to 1 means a tighter link (still not automatic proof of cause).',
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
    ],
    phase: 'analyze',
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
    toolIds: ['data', 'compare', 'ttest'],
  },
  {
    id: 'relationship',
    label: 'Does one thing drive another?',
    hint: 'Temperature, speed, settings vs result',
    toolIds: ['data', 'regression'],
  },
  {
    id: 'causes',
    label: 'Need to find root causes',
    hint: 'Brainstorm then prove',
    toolIds: ['pareto', 'fishbone', 'fivewhys', 'fmea', 'ttest'],
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
]
