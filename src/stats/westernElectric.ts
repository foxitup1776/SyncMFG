/** Western Electric / zone rules for a control chart (Individuals). */
export interface RuleHit {
  rule: string
  plain: string
  indexes: number[]
}

export function westernElectricHits(
  values: number[],
  center: number,
  ucl: number,
  lcl: number,
): RuleHit[] {
  if (values.length === 0) return []
  const sigma = (ucl - center) / 3
  const hits: RuleHit[] = []

  const beyond: number[] = []
  values.forEach((v, i) => {
    if (v > ucl || v < lcl) beyond.push(i)
  })
  if (beyond.length) {
    hits.push({
      rule: 'Rule 1',
      plain: 'A point sits outside the control limits.',
      indexes: beyond,
    })
  }

  // Rule: 2 of 3 beyond 2σ on same side
  const twoOfThree: number[] = []
  for (let i = 2; i < values.length; i++) {
    const window = [i - 2, i - 1, i]
    const high = window.filter((idx) => values[idx] > center + 2 * sigma)
    const low = window.filter((idx) => values[idx] < center - 2 * sigma)
    if (high.length >= 2) twoOfThree.push(...high)
    if (low.length >= 2) twoOfThree.push(...low)
  }
  if (twoOfThree.length) {
    hits.push({
      rule: 'Rule 2',
      plain: '2 out of 3 points in a row hug the outer zone (beyond 2σ).',
      indexes: [...new Set(twoOfThree)],
    })
  }

  // 4 of 5 beyond 1σ same side
  const fourOfFive: number[] = []
  for (let i = 4; i < values.length; i++) {
    const window = [i - 4, i - 3, i - 2, i - 1, i]
    const high = window.filter((idx) => values[idx] > center + sigma)
    const low = window.filter((idx) => values[idx] < center - sigma)
    if (high.length >= 4) fourOfFive.push(...high)
    if (low.length >= 4) fourOfFive.push(...low)
  }
  if (fourOfFive.length) {
    hits.push({
      rule: 'Rule 3',
      plain: '4 out of 5 points in a row sit beyond 1σ on the same side.',
      indexes: [...new Set(fourOfFive)],
    })
  }

  // 8 in a row on one side of center (classic WE; your notes also mention 7)
  const runSide: number[] = []
  let streak = 1
  let side = Math.sign(values[0] - center) || 1
  for (let i = 1; i < values.length; i++) {
    const s = Math.sign(values[i] - center)
    if (s === 0) {
      streak = 0
      side = 0
      continue
    }
    if (s === side) {
      streak += 1
      if (streak >= 8) {
        for (let k = 0; k < 8; k++) runSide.push(i - k)
      }
    } else {
      side = s
      streak = 1
    }
  }
  if (runSide.length) {
    hits.push({
      rule: 'Rule 4',
      plain: '8 points in a row fall entirely on one side of the average.',
      indexes: [...new Set(runSide)],
    })
  }

  // 7 consecutive up or down
  const trend: number[] = []
  let dir = 0
  let tStreak = 1
  for (let i = 1; i < values.length; i++) {
    const d = Math.sign(values[i] - values[i - 1])
    if (d === 0) {
      tStreak = 1
      dir = 0
      continue
    }
    if (d === dir) {
      tStreak += 1
      if (tStreak >= 6) {
        // 7 points = 6 steps
        for (let k = 0; k < 7; k++) trend.push(i - k)
      }
    } else {
      dir = d
      tStreak = 1
    }
  }
  if (trend.length) {
    hits.push({
      rule: 'Rule 5',
      plain: '7 points in a row march steadily up or steadily down.',
      indexes: [...new Set(trend)].filter((i) => i >= 0),
    })
  }

  return hits
}
