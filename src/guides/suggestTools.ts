import type { AppView } from '../components/AppShell'
import {
  getToolGuide,
  SITUATIONS,
  TOOL_GUIDES,
  type ToolGuide,
} from './toolGuides'

export interface Suggestion {
  guide: ToolGuide
  score: number
  reasons: string[]
}

export function suggestTools(
  problemStatement: string,
  situationIds: string[],
): Suggestion[] {
  const scores = new Map<AppView, { score: number; reasons: Set<string> }>()

  function bump(id: AppView, points: number, reason: string) {
    const cur = scores.get(id) ?? { score: 0, reasons: new Set<string>() }
    cur.score += points
    cur.reasons.add(reason)
    scores.set(id, cur)
  }

  // Always offer a project home when they typed a problem
  if (problemStatement.trim().length >= 12) {
    bump('projects', 4, 'You wrote a problem — keep the story in a DMAIC project')
    bump('data', 2, 'Most paths need numbers loaded first')
  }

  for (const sitId of situationIds) {
    const sit = SITUATIONS.find((s) => s.id === sitId)
    if (!sit) continue
    sit.toolIds.forEach((id, index) => {
      bump(id, 8 - Math.min(index, 5), `Matches: ${sit.label}`)
    })
  }

  const text = problemStatement.toLowerCase()
  if (text.trim()) {
    for (const guide of TOOL_GUIDES) {
      for (const kw of guide.keywords) {
        if (text.includes(kw.toLowerCase())) {
          bump(guide.id, 3, `Your words mentioned “${kw}”`)
        }
      }
    }
    if (
      /\b(three|3|four|4|five|5)\b/.test(text) &&
      /\b(shift|oven|supplier|line|group|groups)\b/.test(text)
    ) {
      bump('anova', 5, 'You mentioned several groups — try ANOVA')
    }
    if (/\b(r2|r²|r-squared|predict|regression)\b/.test(text)) {
      bump('regression', 5, 'Sounds like predictive analytics / R²')
    }
    if (/\b(oee|downtime|small stop|slow cycle|bottleneck)\b/.test(text)) {
      bump('oee', 5, 'Sounds like line effectiveness / OEE')
    }
    if (/\b(yield|fpy|first.?pass|startup scrap)\b/.test(text)) {
      bump('yield', 5, 'Sounds like first-pass yield / scrap')
    }
    if (/\b(before|after|did (it|the fix) work|kaizen)\b/.test(text)) {
      bump('beforeafter', 5, 'Sounds like a before/after proof check')
    }
    if (/\b(changeover|smed|make.?ready|setup time)\b/.test(text)) {
      bump('montecarlo', 4, 'Changeover time risk')
      bump('yield', 3, 'Watch startup scrap after changeover')
    }
    if (/\b(waste|gemba|timwood|downtime|8 waste|eight waste)\b/.test(text)) {
      bump('wastewalk', 6, 'Sounds like a waste walk')
    }
    if (/\b(5s|five s|messy|housekeeping|sort|shine)\b/.test(text)) {
      bump('fives', 5, 'Sounds like a 5S audit')
    }
    if (
      /\b(how many|sample size|samples do|power analysis|statistical power|enough data|enough samples|plan the study|before we (collect|run))\b/.test(
        text,
      )
    ) {
      bump('samplesize', 6, 'Sounds like “how many samples do I need?”')
    }
    if (/\b(sigma level|dpmo|dpu|defects per (million|unit)|rty|rolled throughput|scorecard)\b/.test(text)) {
      bump('sigma', 6, 'Sounds like a sigma / DPMO scorecard')
      bump('yield', 3, 'Yield is the same counts in floor language')
    }
    if (
      /\b(p chart|np chart|c chart|u chart|attribute|defect rate|defectives|pass.?fail|reject rate|scrap rate)\b/.test(
        text,
      )
    ) {
      bump('attribute', 6, 'Sounds like an attribute control chart')
    }
    if (
      /\b(proportion|percent defective|chi.?square|contingency|defect mix|two rates|rate difference)\b/.test(
        text,
      )
    ) {
      bump('proportions', 6, 'Sounds like a rate / chi-square test')
    }
    if (
      /\b(takt|pace|customer demand|bottleneck|balance|line balance|wip|work in process|lead time|flow|constraint)\b/.test(
        text,
      )
    ) {
      bump('takt', 6, 'Sounds like takt / flow math')
    }
    if (/\b(smed|changeover|make.?ready|setup time|die swap|quick change)\b/.test(text)) {
      bump('smed', 6, 'Sounds like a quick-changeover (SMED) study')
    }
    if (
      /\b(cost|money|dollar|\$|copq|warranty|returns|savings|budget|business case|roi)\b/.test(
        text,
      )
    ) {
      bump('copq', 6, 'Sounds like cost of poor quality')
    }
  }

  // Sensible default starter pack if nothing matched
  if (scores.size === 0) {
    ;(['projects', 'data', 'visual', 'pareto', 'fishbone'] as AppView[]).forEach(
      (id, i) => bump(id, 5 - i, 'Good starting set while you refine the problem'),
    )
  }

  const out: Suggestion[] = []
  for (const [id, { score, reasons }] of scores) {
    const guide = getToolGuide(id)
    if (!guide) continue
    out.push({ guide, score, reasons: [...reasons] })
  }

  return out.sort((a, b) => b.score - a.score).slice(0, 8)
}
