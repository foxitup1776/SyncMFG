export interface FiveSArea {
  id: string
  name: string
  question: string
  tips: string[]
}

/** 5S audit areas — training-style checklist for the floor. */
export const FIVE_S_AREAS: FiveSArea[] = [
  {
    id: 'sort',
    name: 'Sort (Seiri)',
    question: 'Is only what we need here — red-tag junk removed?',
    tips: ['Obsolete tools/jigs gone', 'Personal items limited', 'Clear floors'],
  },
  {
    id: 'set',
    name: 'Set in order (Seiton)',
    question: 'Does everything have a labeled home at point of use?',
    tips: ['Shadow boards', 'Lines/labels', 'Fast find without asking'],
  },
  {
    id: 'shine',
    name: 'Shine (Seiso)',
    question: 'Is the area clean enough to spot problems early?',
    tips: ['No oil pools/dust hiding leaks', 'Clean as you go', 'Inspection while wiping'],
  },
  {
    id: 'standardize',
    name: 'Standardize (Seiketsu)',
    question: 'Are best practices written and the same every shift?',
    tips: ['Visual standards posted', 'Checklists used', 'Same layout across cells'],
  },
  {
    id: 'sustain',
    name: 'Sustain (Shitsuke)',
    question: 'Do we keep it — audits, coaching, daily habits?',
    tips: ['Layered audits', 'Leaders walk the standard', 'New hires trained on 5S'],
  },
]

export type FiveSScore = 1 | 2 | 3 | 4 | 5

export const SCORE_LABELS: Record<FiveSScore, string> = {
  1: 'Poor',
  2: 'Below avg',
  3: 'OK',
  4: 'Good',
  5: 'Excellent',
}
