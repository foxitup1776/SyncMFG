import type { AppView } from '../components/AppShell'

export interface PathwayQuote {
  text: string
  source: string
}

export interface PathwayStep {
  title: string
  detail: string
  toolId?: AppView
}

export interface Pathway {
  id: string
  title: string
  shortLabel: string
  subtitle: string
  floorQuestion: string
  whyItMatters: string
  quotes: PathwayQuote[]
  example: { title: string; story: string }
  steps: PathwayStep[]
  relatedSituations: string[]
}

/**
 * Visual method pathways — shop-floor jobs first, math second.
 * Quotes adapted from the Obsidian Lean / Six Sigma / Maths vault.
 */
export const PATHWAYS: Pathway[] = [
  {
    id: 'see-data',
    title: 'See your data first',
    shortLabel: 'See data',
    subtitle: 'Baseline look before any fancy test',
    floorQuestion: 'What does this process look like right now?',
    whyItMatters:
      'Before you claim a fix worked, you need a clear picture of center, spread, and order. This is the “photograph + movie” of your numbers.',
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
    example: {
      title: 'Cookie weights off the cooling rack',
      story:
        'You weigh 30 cookies. The histogram shows most sit near 50g, the box plot flags one 52.8g outlier, and the run chart shows when that spike happened. Now you know what “normal” looks like before changing the scoop.',
    },
    steps: [
      {
        title: 'Bring numbers in',
        detail: 'Paste Excel or upload CSV/XLSX so the app can read your columns.',
        toolId: 'data',
      },
      {
        title: 'See shape, middle, and order',
        detail: 'Use histogram (photo), box plot (middle 50% + outliers), and run chart (movie).',
        toolId: 'visual',
      },
      {
        title: 'Compare groups by eye',
        detail: 'If you have shifts or suppliers in separate columns, compare box plots side by side.',
        toolId: 'compare',
      },
    ],
    relatedSituations: ['baseline', 'unstable', 'defects'],
  },
  {
    id: 'stability',
    title: 'Is the process stable?',
    shortLabel: 'Stability',
    subtitle: 'Common cause vs special cause',
    floorQuestion: 'Is this jumping around normal — or did something break?',
    whyItMatters:
      'If the process is unstable, capability scores and “before/after” claims can lie. Stabilize first, then optimize.',
    quotes: [
      {
        text: 'SPC monitors the mean and standard deviation of a process over time to detect special cause variation (abnormal shifts) versus common cause variation (natural system noise).',
        source: 'Maths · Statistical Process Control',
      },
      {
        text: 'Statistical Process Control (SPC) / Control Charts: Graphical tools used to monitor process behavior over time and distinguish between common cause and special cause variation.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
    example: {
      title: 'Hourly bake weight samples',
      story:
        'An I-MR chart shows one point above the upper control limit after a dough change. That is a special cause — investigate that change. Do not “average it away” and declare the process fine.',
    },
    steps: [
      {
        title: 'One measurement stream',
        detail: 'Use I-MR when you paste one column in time order (individuals).',
        toolId: 'imr',
      },
      {
        title: 'Already in subgroups?',
        detail: 'If each Excel row is a batch of 2–10 pieces, use X̄-R instead.',
        toolId: 'xbarr',
      },
      {
        title: 'Then check customer fit',
        detail: 'Only after stability looks OK, ask whether you hit specs.',
        toolId: 'capability',
      },
    ],
    relatedSituations: ['unstable', 'baseline', 'specs'],
  },
  {
    id: 'capability',
    title: 'Can we hit customer specs?',
    shortLabel: 'Specs',
    subtitle: 'Cp, Cpk, Pp, Ppk without the fog',
    floorQuestion: 'Are we fitting inside the customer’s allowed range?',
    whyItMatters:
      'A tight process aimed wrong still makes scrap. Capability separates “narrow enough” from “aimed well enough.”',
    quotes: [
      {
        text: 'Cp and Cpk answer: “Is the natural spread of our process narrow enough to theoretically fit inside the limits?” and “Are we actually hitting the target, or are we drifting dangerously close to one of the edges?”',
        source: 'Maths · CC CPK',
      },
      {
        text: 'Although your Cp is great, your average weight is 52g instead of the 50g target… Your Cpk will be poor because your process is off-center.',
        source: 'Maths · CC CPK (cookie analogy)',
      },
      {
        text: 'Ppk is the true measurement of what your customers actually experienced… over that month.',
        source: 'Maths · CC CPK',
      },
    ],
    example: {
      title: 'Cookies 45g–55g',
      story:
        'Master-chef sample: every cookie 52g → high Cp (tight), weak Cpk (heavy). Month of real production spreads wider → Ppk tells the customer’s real experience.',
    },
    steps: [
      {
        title: 'Confirm stability',
        detail: 'Run a control chart so you are not scoring a moving target.',
        toolId: 'imr',
      },
      {
        title: 'Score against specs',
        detail: 'Enter LSL/USL and read Cp/Cpk (short-term) and Pp/Ppk (overall) in plain English.',
        toolId: 'capability',
      },
    ],
    relatedSituations: ['specs', 'defects'],
  },
  {
    id: 'hypothesis',
    title: 'Hypothesis testing',
    shortLabel: 'Prove it',
    subtitle: 'Is the difference real — or just luck?',
    floorQuestion: 'Did Oven B really get worse, or are we fooling ourselves?',
    whyItMatters:
      'Floor teams see patterns everywhere. Hypothesis tests are a fairness check against random noise before you spend money on a “fix.”',
    quotes: [
      {
        text: 'In the Analyze Phase, you use statistical tests to differentiate real, systematic effects from random background noise.',
        source: 'Maths · Hypothesis Testing',
      },
      {
        text: 'If there is absolutely no real difference between my groups, what is the probability that I would randomly get a result as extreme as (or more extreme than) the one I just observed?',
        source: 'Maths · P Value',
      },
      {
        text: 'If your p-value is less than 0.05: you conclude that your results are “statistically significant”. You reject the idea of random chance.',
        source: 'Maths · P Value',
      },
      {
        text: 'While a t-test is excellent for comparing just two groups… ANOVA is what you use when you have multiple categories to compare all at once.',
        source: 'Maths · ANOVA',
      },
    ],
    example: {
      title: 'Oven A vs Oven B bake time',
      story:
        'Averages look different. A two-group test gives p = 0.02 → treat it as real and dig into settings. If you also have Oven C and D, use the multi-group test (ANOVA) so you are not running a pile of pairwise comparisons.',
    },
    steps: [
      {
        title: 'Eyeball the groups',
        detail: 'Side-by-side box plots — do the middles and spreads even look different?',
        toolId: 'compare',
      },
      {
        title: 'Two groups?',
        detail: 'Ask “Are these two groups really different?” (t-test). Read the p-value in plain words.',
        toolId: 'ttest',
      },
      {
        title: 'Three or more groups?',
        detail: 'Ask “Is at least one group different?” (ANOVA) instead of ten separate t-tests.',
        toolId: 'anova',
      },
    ],
    relatedSituations: ['two-groups', 'causes', 'defects'],
  },
  {
    id: 'predictive',
    title: 'Predictive analytics',
    shortLabel: 'Predict',
    subtitle: 'Does X help explain Y? (regression + R²)',
    floorQuestion: 'If I change temperature / speed / sugar, what happens to the result?',
    whyItMatters:
      'You want a simple line and a honest score for how much of the result that line explains — without needing Minitab fluency.',
    quotes: [
      {
        text: 'At its core, R² represents the percentage of variation in your dependent variable (the outcome) that is explained by your independent variable (the predictor).',
        source: 'Maths · R2',
      },
      {
        text: 'An R² of 0.81 means… 81% of the variation in mouse weight is explained by its size. The remaining 19% is “unexplained noise.”',
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
    example: {
      title: 'Sugar grams → cookie diameter',
      story:
        'You plot sugar vs diameter, fit a line, and get R² ≈ 0.9. That means sugar explains most of the diameter spread in this sample. Still check you have enough points — two lucky points can fake a perfect line.',
    },
    steps: [
      {
        title: 'Bring paired columns in',
        detail: 'Need an input column (X) and a result column (Y).',
        toolId: 'data',
      },
      {
        title: 'Fit the line and read R²',
        detail: 'Scatter + best-fit line. R² tells how much of Y’s up-and-down X explains.',
        toolId: 'regression',
      },
    ],
    relatedSituations: ['relationship'],
  },
  {
    id: 'vital-few',
    title: 'Vital few & root causes',
    shortLabel: 'Causes',
    subtitle: 'Focus, brainstorm, dig deeper',
    floorQuestion: 'Where should we attack first — and why is it happening?',
    whyItMatters:
      'You cannot boil the ocean on a production line. Rank the pain, brainstorm causes, then dig to something you can change.',
    quotes: [
      {
        text: 'Pareto Analysis / Pareto Charts: A tool used to determine the biggest disruptions to flow or most frequent causes of defects, isolating the vital few problems.',
        source: 'Six Sigma · Six Sigma Tools',
      },
      {
        text: 'Cause-and-Effect Diagrams (Fishbone/Ishikawa): A brainstorming and analysis tool applied to trace back the underlying root causes of defects.',
        source: 'Six Sigma · Six Sigma Tools',
      },
      {
        text: 'DMAIC… used to identify root causes and systematically reduce process variation.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
    example: {
      title: 'Burnt edges dominate scrap',
      story:
        'Pareto shows burnt edges are ~40% of defects. Fishbone lists oven, belt speed, dough temp. 5 Whys lands on a drifting thermostat. Next: prove with data, then fix and control.',
    },
    steps: [
      {
        title: 'Rank the biggest few',
        detail: 'Pareto chart of defect types or delay causes.',
        toolId: 'pareto',
      },
      {
        title: 'Brainstorm cause families',
        detail: 'Fishbone (6M) on the top bar.',
        toolId: 'fishbone',
      },
      {
        title: 'Dig to a root cause',
        detail: '5 Whys on the most believable branch — then validate with a test.',
        toolId: 'fivewhys',
      },
      {
        title: 'Prove with data',
        detail: 'If two settings/groups are in play, run a hypothesis test.',
        toolId: 'ttest',
      },
    ],
    relatedSituations: ['defects', 'causes'],
  },
  {
    id: 'measurement',
    title: 'Trust the measurement',
    shortLabel: 'Gage',
    subtitle: 'Is the noise from parts — or from the gage?',
    floorQuestion: 'Before I “fix” the process, can I trust the numbers?',
    whyItMatters:
      'If the gage is noisy, every chart and test is arguing with fog. Check the measurement system early.',
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
    example: {
      title: 'Two operators, five parts, two repeats',
      story:
        'If % gage is high, train the method or fix the instrument before chasing process tweaks. If % part dominates, the gage is good enough to study the process.',
    },
    steps: [
      {
        title: 'Load a Gage study table',
        detail: 'Columns for Part, Operator, and Measurement (with repeats).',
        toolId: 'data',
      },
      {
        title: 'Run Gage R&R (lite)',
        detail: 'Read % gage vs % part in plain English.',
        toolId: 'gage',
      },
    ],
    relatedSituations: ['measurement'],
  },
  {
    id: 'time-risk',
    title: 'Time & risk',
    shortLabel: 'Time',
    subtitle: 'Changeover / cycle time uncertainty',
    floorQuestion: 'How often will we miss the target time if steps vary?',
    whyItMatters:
      'Single “standard times” hide risk. A simple simulation shows the slow-day reality without advanced math.',
    quotes: [
      {
        text: 'The largest source of Setup and Adjustment time is typically changeovers… which can be addressed through a SMED program.',
        source: 'Lean · Big 6 Losses',
      },
      {
        text: 'Setup and Adjustments accounts for any significant periods of time in which equipment is scheduled for production but is not running due to a changeover or other equipment adjustment.',
        source: 'Lean · Big 6 Losses',
      },
    ],
    example: {
      title: 'Three-step changeover',
      story:
        'Load 8–15 min, cycle 20–35, inspect 5–12. After 5,000 simulated runs you see median total time, P95 “plan for the slow day,” and % of runs that beat a 60-minute target.',
    },
    steps: [
      {
        title: 'List steps with min / typical / max',
        detail: 'Enter the time study ranges you already know from the floor.',
        toolId: 'montecarlo',
      },
      {
        title: 'Optionally pin into Improve',
        detail: 'Save the report into your DMAIC project’s Improve phase.',
        toolId: 'projects',
      },
    ],
    relatedSituations: ['time'],
  },
  {
    id: 'prevent',
    title: 'Prevent failures',
    shortLabel: 'Prevent',
    subtitle: 'FMEA risk ranking before scrap hits',
    floorQuestion: 'What could go wrong — and what do we prevent first?',
    whyItMatters:
      'Not every scary failure is the highest priority. Score severity, how often, and how hard to catch — then act.',
    quotes: [
      {
        text: 'Finding an effect is not enough; you must use ANOVA… to prove if the change was statistically significant compared to the random error… Look for a p-value lower than 0.05.',
        source: 'Six Sigma · DOE',
      },
      {
        text: 'DMAIC… used to identify root causes and systematically reduce process variation.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
    example: {
      title: 'Chocolate bloom vs metal shavings',
      story:
        'Metal in dough is terrifying (high severity) but rare and easy to detect. Bloom happens often and is caught late — higher RPN, so storage/climate may be the first fix.',
    },
    steps: [
      {
        title: 'Score failure modes',
        detail: 'FMEA table: Severity × Occurrence × Detection → RPN.',
        toolId: 'fmea',
      },
      {
        title: 'Keep it in the project',
        detail: 'Track actions in your DMAIC Control / Improve notes.',
        toolId: 'projects',
      },
    ],
    relatedSituations: ['prevent', 'causes'],
  },
  {
    id: 'dmaic',
    title: 'Run a DMAIC project',
    shortLabel: 'DMAIC',
    subtitle: 'One binder for the whole story',
    floorQuestion: 'How do we solve this end-to-end without losing the thread?',
    whyItMatters:
      'Tools alone scatter. DMAIC keeps Define → Measure → Analyze → Improve → Control in one place with pinned proof.',
    quotes: [
      {
        text: 'DMAIC (Define, Measure, Analyze, Improve, Control): The core structured project methodology of Six Sigma used to identify root causes and systematically reduce process variation.',
        source: 'Six Sigma · Six Sigma Tools',
      },
    ],
    example: {
      title: 'Line 2 scrap project',
      story:
        'Write the problem on Solve, save into a project, pin I-MR + Pareto, complete Fishbone/5 Whys, then countermeasures and a control chart plan.',
    },
    steps: [
      {
        title: 'Describe the problem',
        detail: 'Use Solve so the app suggests methods from your words.',
        toolId: 'solve',
      },
      {
        title: 'Open the project binder',
        detail: 'Charter, SIPOC, pinned evidence, improve & control plans.',
        toolId: 'projects',
      },
    ],
    relatedSituations: ['baseline', 'defects', 'causes'],
  },
  {
    id: 'red-flag',
    title: 'Something looks wrong right now',
    shortLabel: 'Red flag',
    subtitle: 'Andon / special-cause response for operators',
    floorQuestion: 'Product or numbers look off this shift — what do I do first?',
    whyItMatters:
      'Guessing burns time. A short path: see the data, check stability, then dig causes — so you escalate with facts, not vibes.',
    quotes: [
      {
        text: 'Visual Management / Andon: The use of visual aids, lights, or sounds to communicate production status, goals, and alert operators to immediately intervene when problems occur.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Jidoka (Intelligent Automation): …ensuring that machines automatically stop when abnormalities or defects are detected.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Gemba (Gemba Walk): The practice of physically going to the “real place”… to directly observe processes and understand problems firsthand.',
        source: 'Lean · Lean Tools',
      },
    ],
    example: {
      title: 'Burn smell on Line 2 at 10:15',
      story:
        'Operator stops and tags the lot. Quick visual + I-MR on bake weight shows a special-cause spike after a dough change. Fishbone points to thermostat drift — maintenance confirms. Without the chart, the team might have “tweaked” belt speed all afternoon.',
    },
    steps: [
      {
        title: 'Photograph the numbers',
        detail: 'Histogram / box / run chart on the measurement that looks weird.',
        toolId: 'visual',
      },
      {
        title: 'Is it special cause?',
        detail: 'I-MR control chart — red points mean investigate that event, not every wiggle.',
        toolId: 'imr',
      },
      {
        title: 'If scrap jumped, score FPY',
        detail: 'Good vs total for the shift (and startup vs steady if you can split it).',
        toolId: 'yield',
      },
      {
        title: 'Brainstorm then dig',
        detail: 'Fishbone the effect, 5 Whys on the strongest branch — then prove with data.',
        toolId: 'fishbone',
      },
    ],
    relatedSituations: ['red-flag', 'unstable', 'defects'],
  },
  {
    id: 'changeover',
    title: 'Changeover is killing us',
    shortLabel: 'Changeover',
    subtitle: 'SMED thinking + time risk + startup scrap',
    floorQuestion: 'Why does make-ready take forever — and why is the first hour scrapy?',
    whyItMatters:
      'Changeovers are usually the biggest planned stop. Cutting them frees capacity; fixing startup scrap protects first-pass yield.',
    quotes: [
      {
        text: 'SMED (Single-Minute Exchange of Dies) / Quick Changeovers: A method for drastically reducing setup and changeover times by moving “internal” setup tasks to “external” tasks performed while the machine is still running.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'The largest source of Setup and Adjustment time is typically changeovers… which can be addressed through a SMED program.',
        source: 'Lean · Big 6 Losses',
      },
      {
        text: 'Reduced Yield… is most commonly tracked after changeovers.',
        source: 'Lean · Big 6 Losses',
      },
    ],
    example: {
      title: 'SKU swap on the cookie line',
      story:
        'Monte Carlo on load / cycle / inspect shows P95 over the 45-minute target. Startup FPY is 88% vs 97% steady. Team externalizes die staging (SMED) and adds a first-piece checklist — changeover median drops and startup scrap falls.',
    },
    steps: [
      {
        title: 'Model the time risk',
        detail: 'Min / typical / max for each changeover step — see how often you miss the target.',
        toolId: 'montecarlo',
      },
      {
        title: 'Score startup vs steady yield',
        detail: 'Split first-pass yield by period so Reduced Yield is visible.',
        toolId: 'yield',
      },
      {
        title: 'Rank delay / scrap reasons',
        detail: 'Pareto the biggest time or defect codes during make-ready.',
        toolId: 'pareto',
      },
      {
        title: 'Track the kaizen in a project',
        detail: 'Internal vs external task list, owners, and before/after proof.',
        toolId: 'projects',
      },
    ],
    relatedSituations: ['changeover', 'time', 'yield-drop'],
  },
  {
    id: 'yield-path',
    title: 'Yield & startup scrap',
    shortLabel: 'Yield',
    subtitle: 'First-pass yield without Minitab',
    floorQuestion: 'Are we losing good parts at startup — or all shift long?',
    whyItMatters:
      'Scrap feels the same on the floor whether it is startup or steady-state — but the fix is different. Split them before you boil the ocean.',
    quotes: [
      {
        text: 'Process Defects account for defective parts produced during stable (steady-state) production. This includes scrapped parts as well as parts that can be reworked, since OEE measures quality from a First Pass Yield perspective.',
        source: 'Lean · Big 6 Losses',
      },
      {
        text: 'Reduced Yield accounts for defective parts produced from startup until stable (steady-state) production is reached.',
        source: 'Lean · Big 6 Losses',
      },
    ],
    example: {
      title: 'Monday after weekend clean',
      story:
        'Overall FPY looks “okay” at 94%. Split: startup hour 82%, steady 97%. Pareto on startup shows wrong oven recipe after clean. Fix is a startup checklist — not a full process redesign.',
    },
    steps: [
      {
        title: 'Calculate first-pass yield',
        detail: 'Good vs total; use By period for startup vs run.',
        toolId: 'yield',
      },
      {
        title: 'Rank defect codes',
        detail: 'Pareto the vital few scrap reasons.',
        toolId: 'pareto',
      },
      {
        title: 'Check if quality is stable',
        detail: 'I-MR on a key CTQ or scrap rate over time.',
        toolId: 'imr',
      },
      {
        title: 'Dig the top bar',
        detail: 'Fishbone / 5 Whys on the biggest defect family.',
        toolId: 'fishbone',
      },
    ],
    relatedSituations: ['yield-drop', 'defects', 'changeover'],
  },
  {
    id: 'fix-check',
    title: 'Did the fix work?',
    shortLabel: 'Prove it',
    subtitle: 'Before vs after for operators',
    floorQuestion: 'We changed something — did the numbers actually get better?',
    whyItMatters:
      'Celebration without proof trains bad habits. A simple before/after check (and a control chart after) closes the PDCA loop.',
    quotes: [
      {
        text: 'Kaizen: A philosophy of continuous, small incremental improvements involving everyone from top management to shop floor personnel.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'PDCA Cycle (Plan-Do-Check-Act): A continuous problem-solving framework used to develop, test, and implement solutions.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Standardized Work: Documenting and consistently applying best practices for any process to reduce variation and train operators.',
        source: 'Lean · Lean Tools',
      },
    ],
    example: {
      title: 'New scoop size for dough',
      story:
        'Before weights avg 51.2g; after 50.1g with p under 0.05 and lower-is-better. Team updates standardized work and watches I-MR for two weeks so the gain sticks.',
    },
    steps: [
      {
        title: 'Load before & after columns',
        detail: 'Paste the old samples and the new samples side by side.',
        toolId: 'data',
      },
      {
        title: 'Run the before/after check',
        detail: 'See if the average moved the right way for real (not luck).',
        toolId: 'beforeafter',
      },
      {
        title: 'Lock the gain',
        detail: 'Control-chart the after stream and update the standard.',
        toolId: 'imr',
      },
    ],
    relatedSituations: ['fix-check', 'two-groups'],
  },
  {
    id: 'speed-flow',
    title: 'Speed & flow (OEE)',
    shortLabel: 'Speed',
    subtitle: 'Downtime vs slow cycles vs quality',
    floorQuestion: 'Why does the line feel slow even when it is “running”?',
    whyItMatters:
      'OEE splits the fog into Availability, Performance, and Quality so operators and leads attack the right loss — not random tweaks.',
    quotes: [
      {
        text: 'Overall Equipment Effectiveness (OEE): A metric that measures manufacturing efficiency by multiplying availability, performance rate, and quality rate.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Idling and Minor Stops… usually includes stops that are well under five minutes… The underlying problems are often chronic… which can make operators somewhat blind to their impact.',
        source: 'Lean · Big 6 Losses',
      },
      {
        text: 'Reduced Speed accounts for time where equipment runs slower than the Ideal Cycle Time…',
        source: 'Lean · Big 6 Losses',
      },
    ],
    example: {
      title: 'Packaging cell “always behind”',
      story:
        'OEE shows Performance is the weak leg. Operators clear jams every few minutes but never log them. Logging small stops for three days + Pareto points to a worn rail — fix recovers more output than chasing changeovers.',
    },
    steps: [
      {
        title: 'Score OEE lite',
        detail: 'Planned time, downtime, ideal cycle, total & good pieces.',
        toolId: 'oee',
      },
      {
        title: 'Pareto the biggest loss reasons',
        detail: 'Downtime codes or jam reasons — vital few first.',
        toolId: 'pareto',
      },
      {
        title: 'If changeover time dominates',
        detail: 'Simulate step times and attack the longest internal tasks.',
        toolId: 'montecarlo',
      },
    ],
    relatedSituations: ['slow-line', 'time', 'changeover'],
  },
  {
    id: 'waste-5s',
    title: 'Waste walk / 5S',
    shortLabel: '5S',
    subtitle: 'Make the job easier to do right',
    floorQuestion: 'What on this station gets in the way of doing the work?',
    whyItMatters:
      'Motion, searching for tools, and messy standards create defects and slow cycles. Operators see this first — capture it before it becomes “just how we work.”',
    quotes: [
      {
        text: '5S Methodology: A workplace organization system consisting of five steps (Sort, Straighten, Shine, Standardize, Sustain) to perform work safely and eliminate waste.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Eight Lean Wastes: …Transportation, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects, Non-utilized Talent.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Point of Use Storage (POUS): Keeping materials, tools, and information physically staged at the exact location where they are needed.',
        source: 'Lean · Lean Tools',
      },
      {
        text: 'Poka-Yoke (Mistake Proofing): The practice of designing processes or equipment to prevent human errors from occurring, or highlighting them so they aren’t passed downstream.',
        source: 'Lean · Lean Tools',
      },
    ],
    example: {
      title: 'Wrapper station scavenger hunt',
      story:
        'Operators walk the cell and list wastes: film rolls stored two aisles away (motion/transport), three obsolete jigs on the bench (sort), no shadow board (straighten). After 5S + POUS, changeover and minor stops drop — then they prove it with before/after.',
    },
    steps: [
      {
        title: 'Run a waste walk',
        detail: 'Tap DOWNTIME wastes as you see them — log observations and impact.',
        toolId: 'wastewalk',
      },
      {
        title: 'Score 5S',
        detail: 'Sort → Sustain checklist with 1–5 taps; fix the weakest pillar first.',
        toolId: 'fives',
      },
      {
        title: 'Cluster causes if needed',
        detail: 'Fishbone on the biggest waste theme (often Motion or Waiting).',
        toolId: 'fishbone',
      },
      {
        title: 'Keep actions in a project',
        detail: 'Owners, due dates, and before/after proof.',
        toolId: 'projects',
      },
    ],
    relatedSituations: ['messy', 'causes', 'changeover'],
  },
]

export function getPathway(id: string): Pathway | undefined {
  return PATHWAYS.find((p) => p.id === id)
}

export function pathwaysForSituations(situationIds: string[]): Pathway[] {
  if (situationIds.length === 0) return PATHWAYS
  const scored = PATHWAYS.map((p) => {
    const hits = p.relatedSituations.filter((s) => situationIds.includes(s)).length
    return { p, hits }
  })
  return scored
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((x) => x.p)
}
