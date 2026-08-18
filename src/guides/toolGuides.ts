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
    quotes: [
      {
        text: 'Go to the Gemba — bring the real numbers from the floor into one place before you argue about causes.',
        source: 'Lean · Gemba',
      },
    ],
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
    quotes: [
      {
        text: 'Before you run a formal test, put the groups side by side. Your eyes often spot the story the p-value will later confirm.',
        source: 'Maths · Descriptive Statistics',
      },
    ],
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
    quotes: [
      {
        text: 'X-bar and R charts monitor subgroup averages and within-subgroup range so you can see level shifts separately from consistency problems.',
        source: 'Maths · Statistical Process Control',
      },
    ],
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
    quotes: [
      {
        text: 'Ask why repeatedly until you land on a cause you can change — then validate it with data, not opinion alone.',
        source: 'Lean · Problem Solving',
      },
    ],
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
    quotes: [
      {
        text: 'Severity × Occurrence × Detection ranks what to prevent first — not every scary failure is the highest priority.',
        source: 'Six Sigma · FMEA',
      },
    ],
  },
  {
    id: 'samplesize',
    plainName: 'How many samples do I need?',
    alsoCalled: 'Sample size & power analysis',
    problem:
      'Before I start measuring, how many pieces do I need so the answer means something?',
    does: 'Turns the gap you want to find, your usual spread, and how sure you want to be into a sample size — and shows what extra pieces buy you.',
    how: [
      'Pick the kind of comparison (two groups, before/after on the same parts, or rates).',
      'Enter the gap worth finding and your usual spread (or the two rates).',
      'Write the number on the data collection plan and stick to it.',
    ],
    keywords: [
      'sample size',
      'how many',
      'power',
      'power analysis',
      'plan',
      'planning',
      'before i collect',
      'how many parts',
      'alpha',
      'effect size',
      'p-hacking',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'A power analysis is a math-based method used to calculate the minimum sample size you need for an experiment before you start collecting data.',
        source: 'Maths · Power Analysis',
      },
      {
        text: 'Endlessly adding “just one more” data point until you get a significant result dramatically inflates your risk of a false positive… A power analysis is the antidote to p-hacking.',
        source: 'Maths · Power Analysis',
      },
      {
        text: 'If your sampling method is biased, a large sample size won’t save you.',
        source: 'Maths · Sampling',
      },
    ],
  },
  {
    id: 'sigma',
    plainName: 'What sigma level are we running?',
    alsoCalled: 'Process sigma · DPMO · DPU · rolled throughput yield',
    problem:
      'Leadership asks for our sigma level or DPMO, and I need the number without guessing at the conversion table.',
    does: 'Converts defect counts into defects per unit, DPMO, an approximate sigma level (with the 1.5 shift as a clearly-labeled toggle), and rolled yield across multiple steps.',
    how: [
      'Enter units inspected, defects found, and how many ways one unit can go wrong.',
      'Choose whether to add the traditional 1.5 shift — and say which one you quoted.',
      'Switch to Multi-step to see rolled throughput yield and which step is weakest.',
    ],
    keywords: [
      'sigma',
      'sigma level',
      'dpmo',
      'dpu',
      'defects per million',
      'rty',
      'rolled throughput',
      'scorecard',
      'six sigma level',
      'opportunities',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'In Six Sigma terminology, a true “Six Sigma” process is nearly perfect, producing a maximum of only 3.4 defects per million opportunities (DPMO). For comparison, a 3-sigma process has a 93% success rate (producing 66,800 defects per million), which fails 7% of the time on average.',
        source: 'Six Sigma · DMAIC Model',
      },
      {
        text: 'Rolling DPMO (YTD): Tracks cumulative defects over multiple time periods.',
        source: 'Maths · Statistical Process Control',
      },
    ],
  },
  {
    id: 'attribute',
    plainName: 'Is my defect rate stable?',
    alsoCalled: 'Attribute control charts (p / np / c / u)',
    problem:
      'All I have is pass/fail tallies or defect counts — no measurements — but I still need to know if today was really worse.',
    does: 'Charts counted data with limits built from the count model itself, and coaches you on which of the four attribute charts fits what you counted.',
    how: [
      'Say whether you count bad pieces (pass/fail) or defects (a piece can have several).',
      'Say whether you inspect the same amount every time — that picks the chart for you.',
      'Enter one row per day or sample, then read the flagged points before reacting.',
    ],
    keywords: [
      'attribute',
      'p chart',
      'np chart',
      'c chart',
      'u chart',
      'defect rate',
      'defectives',
      'scrap rate over time',
      'counted data',
      'pass fail',
      'proportion chart',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Attribute Control Charts: Used for discrete count data, including the P chart (fraction defective), NP chart (number defective), C chart (total defect counts), and U chart (defects per inspection unit).',
        source: 'Maths · Statistical Process Control',
      },
      {
        text: 'If an operator reports a 7% burnt rate this hour, you don’t guess — you know for a fact that the oven is “Out of Control” because 7% is higher than your UCL of 6.6%.',
        source: 'Maths · Statistics (p-chart worked example)',
      },
    ],
  },
  {
    id: 'proportions',
    plainName: 'Are these rates really different?',
    alsoCalled: '1-proportion · 2-proportion · chi-square',
    problem:
      'Shift 1 scraps 3.6% and Shift 2 scraps 1.7% — is that a real difference, or a busy week?',
    does: 'Tests one rate against a target, two rates against each other (with a confidence range on the gap), and whether the defect mix itself depends on the group.',
    how: [
      'Pick one rate vs a target, two rates, or defect mix by group.',
      'Enter plain counts — bad pieces and pieces inspected.',
      'Read the p-value with the confidence range; the range tells you how big the gap could really be.',
    ],
    keywords: [
      'proportion',
      'rate',
      'percent defective',
      'scrap rate',
      'chi square',
      'chi-square',
      'contingency',
      'defect mix',
      'pass fail test',
      'two rates',
    ],
    phase: 'analyze',
    quotes: [
      {
        text: 'The Chi-Square test helps you distinguish between genuine, systemic deviations and ordinary random variation.',
        source: 'Maths · Chi-Square Test',
      },
      {
        text: 'If there is only a 3.5% chance of this happening by “random luck,” it is more likely that the actual breakage rate on that pallet has spiked above 2%.',
        source: 'Maths · Statistics (binomial spot check)',
      },
      {
        text: 'If your p-value is less than 0.05: you conclude that your results are “statistically significant”. You reject the idea of random chance.',
        source: 'Maths · P Value',
      },
    ],
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
  {
    id: 'wastewalk',
    plainName: 'Waste walk (DOWNTIME)',
    alsoCalled: '8 wastes · TIMWOODS · Gemba walk sheet',
    problem:
      'I need a simple floor form to spot the eight Lean wastes with clickable categories.',
    does: 'Lets you tap Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, and Extra-processing, then log observations and impact.',
    how: [
      'Enter the area and walk a full cycle before asking questions.',
      'Tap a waste tile when you see it, then Log observation.',
      'Mark impact High/Med/Low and optional ideas — pin the report into a project.',
    ],
    keywords: [
      'waste',
      'downtime',
      'timwood',
      'gemba',
      'walk',
      'motion',
      'waiting',
      'inventory',
      '8 waste',
      'eight waste',
    ],
    phase: 'analyze',
    quotes: [
      {
        text: 'Eight Lean Wastes: Transportation, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects, Non-utilized Talent.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Gemba (Gemba Walk): The practice of physically going to the “real place”… to directly observe processes and understand problems firsthand.',
        source: 'Lean · Lean Tools',
      },
    ],
  },
  {
    id: 'fives',
    plainName: '5S workplace audit',
    alsoCalled: 'Sort, Set, Shine, Standardize, Sustain',
    problem:
      'The station is messy or hard to run — I need a scored 5S checklist, not a lecture.',
    does: 'Scores each 5S pillar 1–5 with training-style prompts and highlights the weakest pillar.',
    how: [
      'Name the area.',
      'Tap 1–5 for Sort, Set in order, Shine, Standardize, Sustain.',
      'Write actions for the lowest score and re-audit later.',
    ],
    keywords: ['5s', 'five s', 'sort', 'shine', 'standardize', 'sustain', 'messy', 'housekeeping'],
    phase: 'improve',
    quotes: [
      {
        text: '5S Methodology: A workplace organization system consisting of five steps (Sort, Straighten, Shine, Standardize, Sustain) to perform work safely and eliminate waste.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Point of Use Storage (POUS): Keeping materials, tools, and information physically staged at the exact location where they are needed.',
        source: 'Lean · Lean Tools',
      },
    ],
  },
  {
    id: 'takt',
    plainName: 'Pace the line',
    alsoCalled: 'Takt time · cycle balance · Little’s Law',
    problem:
      'How often does a piece have to come off the line to keep up with the customer — and which station cannot hold that pace?',
    does: 'Turns available time and customer demand into takt, charts each station against it, scores imbalance, and solves WIP ≈ throughput × lead time.',
    how: [
      'Enter real running time (breaks and planned stops already removed) and how many pieces the customer wants in that time.',
      'List each station or operator with its cycle time — bars above the dashed takt line cannot keep up.',
      'Read the bottleneck and imbalance %, then move work off the slowest station instead of asking for speed.',
      'Use Little’s Law to see how much the pile of work in process is stretching lead time.',
    ],
    keywords: [
      'takt',
      'pace',
      'demand',
      'balance',
      'bottleneck',
      'cycle time',
      'lead time',
      'wip',
      'work in process',
      'little',
      'flow',
      'throughput',
      'line balance',
      'constraint',
    ],
    phase: 'measure',
    quotes: [
      {
        text: 'Takt Time: A calculation that sets the pace of production to exactly match the rate of customer demand (Net available time / Customer demand).',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Single Piece Flow (One-Piece Flow): Processing one product unit at a time rather than producing in large batches, reducing wait times and allowing earlier defect detection.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'You don’t yell at the fast kids to run faster. You put Herbie at the very front of the line so he sets the pace for everyone.',
        source: 'Books · The Goal (Theory of Constraints)',
      },
      {
        text: 'Lead Time = Processing Time + Waiting Time + Transport Time.',
        source: 'Maths · Lean Math',
      },
    ],
  },
  {
    id: 'smed',
    plainName: 'Quick changeover sheet',
    alsoCalled: 'SMED · internal vs external setup',
    problem:
      'Make-ready takes forever and the machine sits dead — what can we do while it is still running?',
    does: 'Sorts every changeover task into Internal (machine stopped), External (done while running), or Waste, then shows before/after stopped time and the percent you moved off-line.',
    how: [
      'Walk one real changeover with a stopwatch — do not use the standard time from the binder.',
      'Tap Internal, External, or Waste for each task and enter the minutes it took.',
      'Set a plan per task: move off-line, eliminate, or shorten.',
      'Read the new machine-stop time, then verify on the next two changeovers and watch startup scrap.',
    ],
    keywords: [
      'smed',
      'changeover',
      'setup',
      'make ready',
      'make-ready',
      'die',
      'quick change',
      'internal',
      'external',
      'setup reduction',
      'downtime',
    ],
    phase: 'improve',
    quotes: [
      {
        text: 'SMED (Single-Minute Exchange of Dies) / Quick Changeovers: A method for drastically reducing setup and changeover times by moving “internal” setup tasks to “external” tasks performed while the machine is still running.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'The largest source of Setup and Adjustment time is typically changeovers (also referred to as make ready or setup), which can be addressed through a SMED (Single-Minute Exchange of Die) program.',
        source: 'Lean · Big 6 Losses',
      },
      {
        text: 'SMED (Single-Minute Exchange of Die): Redesigns changeovers to reduce setup times to under 10 minutes, saving vital capacity.',
        source: 'Six Sigma · DMAIC Model',
      },
      {
        text: 'Reduced Yield accounts for defective parts produced from startup until stable production is reached… most commonly tracked after changeovers.',
        source: 'Lean · Big 6 Losses',
      },
    ],
  },
  {
    id: 'copq',
    plainName: 'Money & scrap cost',
    alsoCalled: 'COPQ · cost of poor quality',
    problem:
      'Leadership wants a dollar figure — what is scrap, rework, downtime, and warranty actually costing us?',
    does: 'Adds up internal failure, external failure, appraisal, and prevention costs into $/month and annualized totals, plus cost per defect and share of sales.',
    how: [
      'Tap a bucket and add the cost lines you know — estimates beat blanks.',
      'Use one loaded rate (material + labour + burden) and keep it consistent.',
      'Enter defects per month for a cost-per-defect number people remember.',
      'Compare failure spend against prevention spend, then Pareto the codes behind the biggest line.',
    ],
    keywords: [
      'copq',
      'cost',
      'money',
      'dollar',
      'scrap cost',
      'rework cost',
      'warranty',
      'returns',
      'savings',
      'financial',
      'budget',
      'cost of quality',
      'business case',
      'roi',
    ],
    phase: 'improve',
    quotes: [
      {
        text: 'Process Defects account for defective parts produced during stable (steady-state) production. This includes scrapped parts as well as parts that can be reworked, since OEE measures quality from a First Pass Yield perspective.',
        source: 'Lean · Big 6 Losses',
      },
      {
        text: 'Any deviation from the exact target incurs a loss. Even if a bearing is technically within spec… it might cause slightly more vibration in the final assembly, wear out slightly faster, or increase warranty claims down the line.',
        source: 'Six Sigma · Taguchi Robust Design',
      },
      {
        text: 'If a decision doesn’t increase Throughput, decrease Inventory, or decrease Operational Expense, it is not helping the business.',
        source: 'Books · The Goal',
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
export const FEATURED_SITUATION_IDS = [
  'red-flag',
  'defects',
  'unstable',
  'specs',
  'two-groups',
  'slow-line',
  'changeover',
  'yield-drop',
]

export const SITUATIONS: SituationOption[] = [
  {
    id: 'defects',
    label: 'Too many defects / scrap',
    hint: 'Quality issues, rejects, rework',
    toolIds: [
      'data',
      'pareto',
      'fishbone',
      'fivewhys',
      'imr',
      'capability',
      'sigma',
      'attribute',
    ],
  },
  {
    id: 'unstable',
    label: 'Process feels unstable',
    hint: 'Numbers jump, drift, or surprise us',
    toolIds: ['data', 'visual', 'imr', 'xbarr', 'attribute'],
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
    toolIds: ['data', 'compare', 'ttest', 'anova', 'proportions', 'samplesize'],
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
    id: 'plan-data',
    label: 'About to collect data',
    hint: 'How many samples, from where, before we run the trial',
    toolIds: ['samplesize', 'gage', 'data', 'projects', 'visual'],
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
    toolIds: ['smed', 'montecarlo', 'yield', 'pareto', 'projects'],
  },
  {
    id: 'yield-drop',
    label: 'Yield / scrap jumped',
    hint: 'First-pass yield down — startup or steady run',
    toolIds: ['yield', 'pareto', 'copq', 'sigma', 'attribute', 'imr', 'fishbone'],
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
    toolIds: ['takt', 'oee', 'pareto', 'montecarlo', 'data'],
  },
  {
    id: 'messy',
    label: 'Workplace is messy / hard to run',
    hint: '5S, motion waste, tools not at point of use',
    toolIds: ['wastewalk', 'fives', 'projects', 'fishbone'],
  },
  {
    id: 'cost',
    label: 'Need the dollar figure',
    hint: 'What scrap, rework, downtime, and warranty really cost',
    toolIds: ['copq', 'pareto', 'yield', 'projects'],
  },
  {
    id: 'pace',
    label: 'Cannot keep up with demand',
    hint: 'Takt, bottleneck station, work piling up between steps',
    toolIds: ['takt', 'oee', 'smed', 'montecarlo'],
  },
]
