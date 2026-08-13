import { useMemo } from 'react'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  FIVE_S_AREAS,
  SCORE_LABELS,
  type FiveSScore,
} from '../lean/fiveS'
import { fmt } from '../stats/descriptive'

type Scores = Record<string, FiveSScore | null>

const EMPTY: Scores = {
  sort: null,
  set: null,
  shine: null,
  standardize: null,
  sustain: null,
}

export function FiveSTool() {
  const [area, setArea] = usePersistedState('tool.fives.area', '')
  const [notes, setNotes] = usePersistedState('tool.fives.notes', '')
  const [scores, setScores] = usePersistedState<Scores>('tool.fives.scores', EMPTY)

  const filled = FIVE_S_AREAS.filter((a) => scores[a.id] != null)
  const avg =
    filled.length === 0
      ? null
      : filled.reduce((s, a) => s + (scores[a.id] as number), 0) / filled.length

  const report: AnalysisReport | null = useMemo(() => {
    if (filled.length === 0) return null
    const weakest = [...FIVE_S_AREAS]
      .filter((a) => scores[a.id] != null)
      .sort((a, b) => (scores[a.id]! as number) - (scores[b.id]! as number))[0]
    return {
      title: `5S audit — ${area.trim() || 'workplace'}`,
      summary: `Scored ${filled.length}/5 pillars. Average ≈ ${fmt(avg, 1)} / 5. Weakest right now: ${weakest.name} (${scores[weakest.id]}/5 — ${SCORE_LABELS[scores[weakest.id] as FiveSScore]}).`,
      bullets: [
        ...FIVE_S_AREAS.map((a) => {
          const sc = scores[a.id]
          return sc == null
            ? `${a.name}: not scored yet.`
            : `${a.name}: ${sc}/5 (${SCORE_LABELS[sc]}).`
        }),
        weakest
          ? `Focus first on “${weakest.name}”: ${weakest.tips.join(' · ')}.`
          : '',
        'Sustain is where audits die — schedule a quick re-check next week.',
      ].filter(Boolean),
      termsUsed: ['5s', 'gemba', 'eight wastes'],
    }
  }, [filled.length, scores, area, avg])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="fives" />
      <section className="panel">
        <h2>5S workplace audit</h2>
        <p className="lede">
          Tap a score for each pillar. Built like a training checklist — Sort,
          Set in order, Shine, Standardize, Sustain.
        </p>
        <label>
          Area / cell
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Wrapper station"
          />
        </label>
      </section>

      <div className="fives-grid">
        {FIVE_S_AREAS.map((a) => (
          <section key={a.id} className="panel fives-card">
            <h3>{a.name}</h3>
            <p className="lede">{a.question}</p>
            <ul className="tip-list">
              {a.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="score-row" role="group" aria-label={`${a.name} score`}>
              {([1, 2, 3, 4, 5] as FiveSScore[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={
                    scores[a.id] === n ? 'score-chip on' : 'score-chip'
                  }
                  onClick={() =>
                    setScores((prev) => ({
                      ...prev,
                      [a.id]: prev[a.id] === n ? null : n,
                    }))
                  }
                  title={SCORE_LABELS[n]}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="meta">
              {scores[a.id]
                ? SCORE_LABELS[scores[a.id] as FiveSScore]
                : 'Tap 1 (poor) to 5 (excellent)'}
            </p>
          </section>
        ))}
      </div>

      <section className="panel">
        <label>
          Notes / actions
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Red-tag list, owners, due dates…"
          />
        </label>
        {avg != null ? (
          <div className="stat-strip">
            <div>
              <span>Average</span>
              <strong>{fmt(avg, 1)} / 5</strong>
            </div>
            <div>
              <span>Scored</span>
              <strong>
                {filled.length} / {FIVE_S_AREAS.length}
              </strong>
            </div>
          </div>
        ) : null}
      </section>

      {report ? (
        <PlainReport report={report} sourceTool="5S audit" defaultPhase="improve" />
      ) : null}
    </div>
  )
}
