import { useMemo, useState } from 'react'
import type { AppView } from '../components/AppShell'
import { pathwaysForSituations } from '../guides/pathways'
import { flowForTool, type FlowState } from '../guides/toolMap'
import { suggestTools } from '../guides/suggestTools'
import {
  FEATURED_SITUATION_IDS,
  SITUATIONS,
} from '../guides/toolGuides'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  createProject,
  getActiveProject,
  saveProject,
  setActiveProjectId,
} from '../storage/projects'

export function SolvePage({ onNavigate }: { onNavigate: (v: AppView, flow?: FlowState) => void }) {
  const [problem, setProblem] = usePersistedState('solve.problem', '')
  const [goal, setGoal] = usePersistedState('solve.goal', '')
  const [situations, setSituations] = usePersistedState<string[]>(
    'solve.situations',
    [],
  )
  const [note, setNote] = useState('')
  const [showAllSituations, setShowAllSituations] = useState(false)

  const suggestions = useMemo(
    () => suggestTools(problem, situations).slice(0, 4),
    [problem, situations],
  )

  const pathwayHits = useMemo(
    () => pathwaysForSituations(situations).slice(0, 3),
    [situations],
  )

  const visibleSituations = showAllSituations
    ? SITUATIONS
    : SITUATIONS.filter((s) => FEATURED_SITUATION_IDS.includes(s.id))

  const hiddenCount = SITUATIONS.length - FEATURED_SITUATION_IDS.length
  const hiddenSelected = situations.some(
    (id) => !FEATURED_SITUATION_IDS.includes(id),
  )

  function toggleSituation(id: string) {
    setSituations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function startProjectFromForm() {
    const name = problem.trim().slice(0, 48) || 'New problem project'
    const existing = getActiveProject()
    if (existing && !existing.problem.trim()) {
      const updated = saveProject({
        ...existing,
        name: existing.name === 'New DMAIC project' ? name : existing.name,
        problem: problem.trim(),
        goal: goal.trim(),
        activePhase: 'define',
      })
      setActiveProjectId(updated.id)
      setNote(`Saved into project “${updated.name}”.`)
      onNavigate('projects')
      return
    }
    const project = createProject(name)
    saveProject({
      ...project,
      problem: problem.trim(),
      goal: goal.trim(),
      activePhase: 'define',
    })
    setNote(`Created project “${project.name}”.`)
    onNavigate('projects')
  }

  const hasInput = problem.trim().length >= 8 || situations.length > 0

  return (
    <div className="solve-page">
      <section className="panel start-hero">
        <p className="eyebrow">Start here</p>
        <h1>What’s the problem?</h1>
        <p className="lede">
          Write it in plain language and tap what fits. We’ll point at a method
          — not a textbook menu.
        </p>

        <label htmlFor="problem-statement">Problem</label>
        <textarea
          id="problem-statement"
          rows={3}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Example: Line 2 scrap jumped — burnt edges — is Oven B worse than Oven A?"
        />

        <label htmlFor="problem-goal">What “better” looks like (optional)</label>
        <input
          id="problem-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Example: Cut burnt-edge defects by 50% in 30 days"
        />

        <h3 className="subhead">What’s going on?</h3>
        <div className="situation-grid">
          {visibleSituations.map((s) => {
            const on = situations.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                className={on ? 'situation-chip on' : 'situation-chip'}
                onClick={() => toggleSituation(s.id)}
                aria-pressed={on}
              >
                <strong>{s.label}</strong>
              </button>
            )
          })}
        </div>
        {hiddenCount > 0 ? (
          <button
            type="button"
            className="btn ghost"
            onClick={() => setShowAllSituations((v) => !v)}
          >
            {showAllSituations
              ? 'Show fewer'
              : hiddenSelected
                ? `More situations (${hiddenCount}) — some selected`
                : `More situations (${hiddenCount})`}
          </button>
        ) : null}

        <div className="row actions">
          <button
            type="button"
            className="btn primary"
            disabled={problem.trim().length < 8}
            onClick={startProjectFromForm}
          >
            Save as a project
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('tools')}
          >
            Browse methods
          </button>
        </div>
        {note ? <p className="share-note">{note}</p> : null}
      </section>

      {hasInput ? (
        <section className="panel soft">
          <h2>Next step</h2>
          {pathwayHits.length > 0 ? (
            <>
              <p className="lede">Suggested methods</p>
              <div className="pathway-grid compact">
                {pathwayHits.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="pathway-tile"
                    onClick={() => {
                      try {
                        localStorage.setItem(
                          'pathways.selected',
                          JSON.stringify(p.id),
                        )
                      } catch {
                        /* ignore */
                      }
                      onNavigate('tools')
                    }}
                  >
                    <span className="pathway-short">{p.shortLabel}</span>
                    <strong>{p.title}</strong>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {suggestions.length === 0 ? (
            <p className="form-error">
              Type a bit more in the problem box or pick a situation above.
            </p>
          ) : (
            <>
              <p className="lede">Or jump straight to a tool</p>
              <ol className="suggest-list compact">
                {suggestions.map(({ guide, reasons }) => (
                  <li key={guide.id} className="suggest-card compact">
                    <div>
                      <h3>{guide.plainName}</h3>
                      <p>{guide.problem}</p>
                      {reasons.length ? (
                        <p className="meta">{reasons[0]}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() =>
                        onNavigate(guide.id, flowForTool(guide.id) ?? undefined)
                      }
                    >
                      Open
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
