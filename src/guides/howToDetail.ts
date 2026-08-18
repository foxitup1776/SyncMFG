import type { AppView } from '../components/AppShell'

export interface HowToDetail {
  when: string
  need: string[]
  steps: string[]
  doneWhen: string
  watchOuts: string[]
}

/** Long-form floor guides. Short `how` on the tool stays; this is the library. */
export const HOW_TO: Partial<Record<AppView, HowToDetail>> = {
  data: {
    when: 'Before any chart or test. If the numbers are not in SYNCMFG, nothing else is real.',
    need: [
      'A table from Excel, CSV, or XLSX — headers in the first row',
      'One column per thing you measured (weight, oven, defect code)',
    ],
    steps: [
      'Copy the block from Excel, including the header row, and paste — or upload the file.',
      'Check the preview: numbers look like numbers, dates did not turn into codes, empty cells are empty.',
      'Name the dataset so the shift can find it later (Line 2 weights 18 Aug).',
      'Save. Datasets live on this browser for 30 days, then they purge.',
      'Open Methods or Start and pick the tool. Most tools ask you to choose this dataset and a column.',
    ],
    doneWhen: 'You can see row counts and column names, and a tool can pick the column you care about.',
    watchOuts: [
      'Merged cells and two header rows break the paste. Flatten the sheet first.',
      'This is this browser only. A different PC does not have your paste.',
    ],
  },
  projects: {
    when: 'The problem will take more than one tool, or you need a story the plant can read later.',
    need: ['A problem in everyday words', 'A rough “better looks like” if you have it'],
    steps: [
      'Create or open a project. Name it after the line and the pain, not “DMAIC 7”.',
      'Write the problem, goal, and CTQ on Define. Fill SIPOC if people argue about scope.',
      'Run measure and analyze tools, then pin each report to the matching phase.',
      'On Improve, write the change. On Control, write what chart or audit keeps the gain.',
      'Share or print the A3-style summary when you need a meeting pack.',
    ],
    doneWhen: 'Someone who was not in the room can follow problem → proof → change → lock.',
    watchOuts: [
      'A project with no pinned reports is a diary, not a belt story.',
      'Do not start a second project for the same scrap pile — pin more evidence here.',
    ],
  },
  visual: {
    when: 'First look at a numeric column. You do not know the shape, the middle, or whether it drifts.',
    need: ['A saved dataset', 'One numeric column (weights, times, temps)'],
    steps: [
      'Pick the dataset and the column. Ignore textbook names — you want the picture.',
      'Read the histogram (photograph): one hump, two humps, piled on the left or right?',
      'Read the box plot: where is the middle, how long are the whiskers, are there dots far away?',
      'Read the run chart (movie): does it wander, jump, or sit still in entry order?',
      'Use the interpretation banner. If it looks jumpy, go to I-MR next — do not jump to capability.',
    ],
    doneWhen: 'You can say, in one sentence, what the pile of numbers looks like and whether time order matters.',
    watchOuts: [
      'A pretty bell shape with a shift in the middle of the week is not “fine”.',
      'Tiny n makes every shape look dramatic. Paste more of the run if you can.',
    ],
  },
  compare: {
    when: 'You have two or more groups in columns and you want a side-by-side picture before a test.',
    need: ['A dataset with two or more numeric columns (Oven A, Oven B, Shift 1…)'],
    steps: [
      'Pick the dataset and the columns that are the groups — not the defect codes.',
      'Look at the boxes: do the middles sit apart, or do they overlap a lot?',
      'If they look different, prove it with a t-test (two groups) or ANOVA (three+).',
      'If they look the same, you may be arguing about noise. Check sample size before you declare a winner.',
    ],
    doneWhen: 'You know which groups to test, and you are not testing every column “just in case”.',
    watchOuts: ['Comparing a count column to a measurement column is not a group comparison.'],
  },
  imr: {
    when: 'One measurement stream over time — one piece, one reading, in order. “Is this jumping around normal?”',
    need: ['A numeric column in time order (or entry order that matches production)'],
    steps: [
      'Pick the column. Do not shuffle the rows. Order is the point.',
      'Read Individuals first: points vs the guardrails the data built from itself (not from spec).',
      'Read Moving Range: did one step-to-step jump explode?',
      'Honor Western Electric hits — a run or a trend is a special cause even if nothing is “outside”.',
      'If it is unstable, hunt the special cause. Do not calculate Cpk on a process that is still lurching.',
    ],
    doneWhen: 'You can say stable vs not, and point at the first time it broke if it broke.',
    watchOuts: [
      'Specs are not control limits. A process can be in control and still miss the customer.',
      'Subgrouped data (5 per hour already averaged) belongs on X̄-R, not I-MR.',
    ],
  },
  xbarr: {
    when: 'The sheet is already in subgroups — five pieces an hour, three from a cavity, etc.',
    need: ['Rows = subgroups, columns = the pieces in the subgroup (or a layout the tool accepts)'],
    steps: [
      'Load the subgroup table. Check subgroup size is consistent.',
      'X̄ asks: did the average of the bunch move?',
      'R asks: did the spread inside the bunch blow up?',
      'A shift on X̄ with quiet R is a process move. Wild R is inconsistency inside the group.',
      'If either chart is out, treat it as special cause before you talk capability.',
    ],
    doneWhen: 'You know whether the subgroup averages and the within-group spread are both behaving.',
    watchOuts: ['Mixing different subgroup sizes on one chart lies. Keep n the same.'],
  },
  capability: {
    when: 'The process looks stable, and you have customer LSL/USL. “Can we hit the allowed range?”',
    need: ['A stable numeric stream', 'LSL and/or USL from the print or the customer'],
    steps: [
      'Confirm stability on I-MR or X̄-R first. Capability on an unstable process is fiction.',
      'Enter LSL and USL. One-sided specs are allowed.',
      'Read Cpk (short-term, within) vs Ppk (the whole pasted batch). If they disagree, the process moved.',
      'Read the percent outside. That is the floor language for “how often we miss”.',
      'Plant rule of thumb: Cpk ≥ 1.33 is often the gate. Below that, do not promise the customer.',
    ],
    doneWhen: 'You can say whether the voice of the process fits the voice of the customer, and which side it misses.',
    watchOuts: [
      'Never use spec limits as control limits on the I-MR.',
      'A skewed pile makes normal-based Cpk optimistic. Read the shape banner.',
    ],
  },
  attribute: {
    when: 'You counted defectives or defects per day/lot — pass/fail or tick marks, not a continuous measurement.',
    need: ['Daily (or lot) counts', 'Sample size or area if it varies'],
    steps: [
      'Paste date, defectives or defects, and n if the lot size changes.',
      'Let the tool pick p, np, c, or u — or override if you already know the chart.',
      'p/np = defective units. c/u = defects (a unit can have more than one).',
      'Limits step with n on p and u. A small lot can look “out” when it is just a small denominator.',
      'If the rate is unstable, fix that before you compare two weeks with a proportion test.',
    ],
    doneWhen: 'You know whether the defect *rate* is in control, not just whether yesterday felt bad.',
    watchOuts: ['Do not put weights on an attribute chart. That is I-MR.'],
  },
  gage: {
    when: 'People argue with the numbers, or two operators cannot agree, or the chart looks noisy.',
    need: ['The same parts measured by more than one person or more than once (the sample gage set works)'],
    steps: [
      'Load a study with parts, operators, and repeats if you have them.',
      'Read how much of the variation is the gage vs the parts.',
      'If the gage eats a large slice, stop “fixing” the process — fix the measurement.',
      'Then re-run I-MR. Charts on fog are fights, not science.',
    ],
    doneWhen: 'You can say whether the instrument is fit for this job, in plain percent-of-total language.',
    watchOuts: ['A “good” Cpk with a noisy gage is a lucky story, not a capable process.'],
  },
  sigma: {
    when: 'Leadership wants a sigma level, DPMO, or “what is rolled yield through this line?”',
    need: ['Defects and opportunities (or yield per step for RTY)'],
    steps: [
      'Enter units, defects, and opportunities per unit if you have them.',
      'Read DPU, DPMO, and the sigma band (with the usual 1.5σ shift so it matches the table people know).',
      'For a line of steps, enter each step’s first-pass yield. RTY multiplies them — 95% × 95% × 95% is not 95%.',
      'Attack the worst step first. That is the hidden factory.',
    ],
    doneWhen: 'You have a sigma/DPMO number you can defend, or an RTY that names the bottleneck step.',
    watchOuts: ['Garbage opportunities (counting every square inch as an “opp”) make sigma look heroic.'],
  },
  samplesize: {
    when: 'You are about to collect data or run a trial. Decide n before you start, not after the p-value misbehaves.',
    need: ['The gap worth finding', 'A rough spread (or two rates)', 'How sure you want to be'],
    steps: [
      'Pick the comparison: two groups, paired before/after, one rate, or two rates.',
      'Enter the difference that would actually change a decision on the floor.',
      'Enter usual spread (or the two percents). Guess high on spread if unsure.',
      'Read n and the power curve — extra pieces buy less and less.',
      'Write that n on the collection sheet and stop when you hit it.',
    ],
    doneWhen: 'The team has a number of pieces and a reason, before the first measurement.',
    watchOuts: ['Adding parts until p < 0.05 is not analysis. It is shopping.'],
  },
  ttest: {
    when: 'Two groups, numeric data: Oven A vs B, this week vs last, supplier 1 vs 2.',
    need: ['Two numeric columns or two samples', 'Enough pieces that a difference could show (see sample size)'],
    steps: [
      'Pick the two columns. Welch’s test does not assume equal spread — good for plant data.',
      'Read the means, then the p-value in the banner: likely real vs likely luck.',
      'If p is small, the difference is hard to blame on chance. If not, do not run a kaizen on a coin flip.',
      'Follow with before/after after you change something, or I-MR to see if the winner stays stable.',
    ],
    doneWhen: 'You can tell the floor “B is really worse” or “we cannot tell yet” without hiding behind jargon.',
    watchOuts: ['Three groups is ANOVA, not three t-tests. Fishing with many tests finds ghosts.'],
  },
  anova: {
    when: 'Three or more groups: three ovens, four cavities, five shifts.',
    need: ['One numeric column per group, decent n in each'],
    steps: [
      'Select every group column that is in the question.',
      'ANOVA asks only: is at least one group different? It does not name the culprit by itself.',
      'If p is small, look at the means to see which one sits apart, then confirm with a focused t-test or more data.',
      'If p is not small, the ovens may be interchangeable for this CTQ.',
    ],
    doneWhen: 'You know whether grouping matters at all, before you redesign the line around Oven C.',
    watchOuts: ['Empty groups and n=2 make F-statistics loud and meaningless.'],
  },
  proportions: {
    when: 'Rates, not measurements: % defective this week vs target, Line A vs Line B, defect mix by shift.',
    need: ['Counts of events and totals (or a contingency table of categories)'],
    steps: [
      'One rate vs a target → 1-proportion. Two rates → 2-proportion. Mix of types × groups → chi-square.',
      'Enter the counts, not the percents you already rounded.',
      'Read p in plain English. Check expected cell counts on chi-square — tiny expecteds make the test shaky.',
      'If the mix changed, Pareto the codes next. If only the rate changed, look at I-MR or p-chart of the stream.',
    ],
    doneWhen: 'You know whether the rate or the mix really moved.',
    watchOuts: ['Percents without the n they came from are not a test. 1/2 and 50/100 are not the same story.'],
  },
  regression: {
    when: 'You suspect an input (temp, speed, sugar) moves an output (diameter, scrap, time).',
    need: ['Two numeric columns: X you can change, Y you care about'],
    steps: [
      'Scatter first. If it is a cloud, stop. A line will lie.',
      'Read slope (direction) and R² (how tight). The banner says related vs not for a straight line.',
      'Related is not cause. A lurking shift can fake a beautiful R².',
      'Tiny n can fake R² = 1. Get more pairs before you write a standard around the slope.',
    ],
    doneWhen: 'You can say whether X is worth controlling for Y, with the honesty that a line is only a line.',
    watchOuts: ['Do not extrapolate off the end of the data. The oven does not keep that slope forever.'],
  },
  pareto: {
    when: 'Many defect codes, delay reasons, or complaint types. You need the vital few.',
    need: ['A category column (and optional counts if not one row per event)'],
    steps: [
      'Pick the code column. The tool tallies and sorts.',
      'Read the tall bars and the cumulative line. Attack the first one or two unless safety says otherwise.',
      'Take those codes to Fishbone / 5 Whys. Do not fishbone “quality” as a blob.',
      'After a fix, run Pareto again. If the same bar wins, you did not fix the cause.',
    ],
    doneWhen: 'The team agrees which two codes get the next week of attention.',
    watchOuts: ['Twenty tiny bars and no “other” bucket means your codes are too cute. Collapse them.'],
  },
  fishbone: {
    when: 'You know the effect (burnt edges) but not the causes. Need a shared picture before you test.',
    need: ['The effect written as a sentence', 'People who actually run the job'],
    steps: [
      'Write the effect in the fish head. Be specific: “burnt leading edge on SKU 12”, not “quality”.',
      'Walk People, Machine, Material, Method, Measurement, Environment. Tap a bone, add causes.',
      'Vote or mark the causes you will actually check. The rest stay as parking lot.',
      'Prove the top suspects with a test, a walk, or a gage check — the diagram is not proof.',
    ],
    doneWhen: 'You have a short list of checkable causes, not a poster of every idea in the plant.',
    watchOuts: ['A fishbone filled by one engineer in an office is a Rorschach test.'],
  },
  fivewhys: {
    when: 'You have a symptom and need a changeable root, not a blame name.',
    need: ['One event or defect, preferably at the Gemba'],
    steps: [
      'Write the problem as observed, not as a theory.',
      'Ask why, write the answer, ask why again. Stop when the next action would change the system, not the person.',
      'If a why jumps to “operator error”, ask what in the method or the gage allowed it.',
      'Pin this into the project Analyze phase. Pair with Fishbone if you need breadth first.',
    ],
    doneWhen: 'You have a root you can actually change this month.',
    watchOuts: ['Stopping at Why #2 because it is comfortable is how the same scrap returns.'],
  },
  fmea: {
    when: 'You want to rank what could go wrong before it hits the customer — or after a close call.',
    need: ['Process steps', 'Honest severity, occurrence, detection scores from people who run it'],
    steps: [
      'List failure modes per step. One row = one way it fails.',
      'Score S, O, D. RPN = S × O × D. High RPN and high severity both matter — do not hide a death-RPN behind a low occurrence.',
      'Actions should lower occurrence or raise detection. Recalculate after the action exists, not after the meeting.',
      'Put the top RPNs on the control plan.',
    ],
    doneWhen: 'The top few failure modes have owners and a lower RPN plan.',
    watchOuts: ['Scoring everything a 5 to avoid conflict makes FMEA wallpaper.'],
  },
  yield: {
    when: 'You know good vs total (or scrap) and want first-pass yield — especially startup vs steady.',
    need: ['Good pieces and total pieces, optionally by period'],
    steps: [
      'Single batch: enter good and total. FPY is good / total.',
      'Several periods: add rows (startup, hour 2, steady). Compare the rows, not just the overall.',
      'If startup is the hole, that is reduced yield / make-ready, not “the process is bad all day”.',
      'Tie dollars with COPQ and codes with Pareto.',
    ],
    doneWhen: 'You know whether the loss is a startup tax or an all-shift tax.',
    watchOuts: ['Counting rework as good first-pass hides the factory inside the factory.'],
  },
  oee: {
    when: 'The line “runs” but output is disappointing. Split availability, performance, and quality.',
    need: ['Planned time, downtime, ideal cycle, total pieces, good pieces'],
    steps: [
      'Enter the five numbers from the shift sheet. Be honest about planned time (breaks in or out — pick one rule).',
      'OEE = A × P × Q. The tool flags the weakest leg.',
      'Weak A → downtime Pareto / SMED. Weak P → speed, small stops, takt. Weak Q → yield, attributes, scrap.',
      'Do not “improve OEE” as a slogan. Improve the weak leg.',
    ],
    doneWhen: 'The team names which of the three legs to attack this week.',
    watchOuts: ['Capping performance at 100% hides running faster than ideal. If you overspeed, say so separately.'],
  },
  beforeafter: {
    when: 'You changed something and need proof, not a victory lap.',
    need: ['A before column and an after column of the same CTQ'],
    steps: [
      'Paste before and after. Same measurement, same gage if you can.',
      'Read the test: did the average really move, or is it luck?',
      'If it improved, lock it with I-MR on the after stream and a control plan.',
      'If it did not, the countermeasure is a hypothesis, not a standard.',
    ],
    doneWhen: 'You can show the plant a before vs after sentence with a p-value in English.',
    watchOuts: ['Cherry-picking the best after day is not a sample. Take the whole window you promised.'],
  },
  wastewalk: {
    when: 'You are on the station and something about the job is stupid — walking, waiting, searching, extra clicks.',
    need: ['Eyes on the Gemba', 'Ten minutes without a clipboard speech'],
    steps: [
      'Stand where the work is. Tap every waste you see (DOWNTIME).',
      'Log a one-line observation and High/Med/Low impact.',
      'Sort by impact. The top two become 5S, SMED, or a project action — not a 40-item mural.',
      'Come back next week and tap again. If the same chips light up, you documented, you did not change.',
    ],
    doneWhen: 'You have a short, dated list of wastes with impact, not a lecture on TIMWOODS.',
    watchOuts: ['Doing a waste walk from the conference room is a waste walk of imagination.'],
  },
  fives: {
    when: 'The station is hard to run: tools missing, floors sticky, no home for anything.',
    need: ['The actual workplace', 'A 1–5 score you will defend to the next shift'],
    steps: [
      'Score Sort, Set in order, Shine, Standardize, Sustain.',
      'The lowest pillar is the work. If Set in order is a 2, do not buy new shine supplies.',
      'One action per audit. Re-score next week.',
      'Sustain is the trap — a 5 that lasts one Friday is a 2.',
    ],
    doneWhen: 'The weakest S has an owner and a date, and last week’s score is written down.',
    watchOuts: ['Scoring everything 4 to look good trains the next auditor to lie too.'],
  },
  takt: {
    when: 'Demand is known (or guessed) and the line cannot hold the pace, or WIP is piling up.',
    need: ['Available time', 'Demand', 'Cycle time per station if you want the bottleneck named'],
    steps: [
      'Takt = available time / demand. That is the drumbeat. Units can be seconds or hours — stay consistent.',
      'Load stations against takt. The one over takt is Herbie. Speeding everyone else just grows inventory.',
      'Little’s Law: WIP = throughput × lead time. If you know two, you get the third.',
      'If the bottleneck is changeover, go to SMED. If it is downtime, go to OEE.',
    ],
    doneWhen: 'You can point at the station that cannot hold takt, and you know whether WIP is making you late.',
    watchOuts: ['Using scheduled hours as available time when the line is starved is a paper takt.'],
  },
  smed: {
    when: 'Make-ready is eating the shift, or the first hour after a swap is scrapy.',
    need: ['A list of changeover tasks with minutes', 'Honesty about what is done while the machine is down'],
    steps: [
      'List every task. Tag Internal (machine down), External (can do while running), or Waste.',
      'Plan: keep, externalize, eliminate, or shorten.',
      'Read before vs after downtime and % externalized. Externalizing is the SMED lever, not “work faster”.',
      'Check first-hour yield after the new changeover. Speed with scrap is not a win.',
    ],
    doneWhen: 'Internal time dropped, and you know which tasks moved outside the downtime window.',
    watchOuts: ['Calling a task external when it still needs the machine down is creative accounting.'],
  },
  copq: {
    when: 'You need dollars, not defect counts, to get a change funded.',
    need: ['Rough costs: scrap, rework, downtime, warranty, inspection, prevention'],
    steps: [
      'Tap a bucket (internal failure, external failure, appraisal, prevention) and add line items.',
      'Use the starter chips if you are staring at a blank sheet. Edit the dollars — they are yours, not a textbook.',
      'Read $/month, annualized, and cost per defect. The biggest bucket is the argument.',
      'Pin this in Improve. Re-run it in Control after the fix so the saving is not a one-meeting number.',
    ],
    doneWhen: 'A manager can see a monthly number and which bucket it lives in.',
    watchOuts: ['Mixing one-time write-offs with monthly run-rate without saying so will get you caught.'],
  },
  montecarlo: {
    when: 'A job is a chain of steps with min / typical / max times, and you need the odds of hitting a window.',
    need: ['Each step’s three-point times', 'A target total if you have one'],
    steps: [
      'Enter steps with low, typical, high. Triangular draws are a simple stand-in for “it varies”.',
      'Read median, P90, P95, and percent hitting the target.',
      'The long tail is the risk. Averages lie on changeovers and maintenance.',
      'If the tail is the setup, SMED. If it is a process step, go watch that step.',
    ],
    doneWhen: 'You can say how often you will miss the promise time, not just the average you put on the board.',
    watchOuts: ['Garbage min/max (5 and 500 because someone was annoyed) make a science-looking cartoon.'],
  },
}

export function getHowTo(id: AppView): HowToDetail | undefined {
  return HOW_TO[id]
}
