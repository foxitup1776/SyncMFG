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
