import { useMemo, useState } from 'react'
import type { AppView } from '../components/AppShell'
import { suggestTools } from '../guides/suggestTools'
import { SITUATIONS } from '../guides/toolGuides'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  createProject,
  getActiveProject,
  saveProject,
  setActiveProjectId,
} from '../storage/projects'

export function SolvePage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  const [problem, setProblem] = usePersistedState('solve.problem', '')
  const [goal, setGoal] = usePersistedState('solve.goal', '')
  const [situations, setSituations] = usePersistedState<string[]>(
    'solve.situations',
    [],
  )
  const [note, setNote] = useState('')

  const suggestions = useMemo(
    () => suggestTools(problem, situations),
    [problem, situations],
  )

  function toggleSituation(id: string) {
    setSituations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function startProjectFromForm() {
    const name =
      problem.trim().slice(0, 48) ||
      'New problem project'
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

  return (
    <div className="solve-page">
      <section className="panel">
        <h2>What problem are you solving?</h2>
        <p className="lede">
          Write it in plain language, tap what sounds closest, and we’ll suggest
          tools — explained as questions first, jargon second.
        </p>

        <label htmlFor="problem-statement">Problem statement</label>
        <textarea
          id="problem-statement"
          rows={4}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Example: Line 2 scrap jumped this week — mostly burnt edges — and we don’t know if Oven B is worse than Oven A."
        />

        <label htmlFor="problem-goal">What “better” looks like (optional)</label>
        <input
          id="problem-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Example: Cut burnt-edge defects by 50% in 30 days"
        />

        <h3 className="subhead">What’s going on? (pick any that fit)</h3>
        <div className="situation-grid">
          {SITUATIONS.map((s) => {
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
                <span>{s.hint}</span>
              </button>
            )
          })}
        </div>

        <div className="row actions">
          <button
            type="button"
            className="btn primary"
            disabled={problem.trim().length < 8}
            onClick={startProjectFromForm}
          >
            Save into a DMAIC project
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('tools')}
          >
            Browse all tools
          </button>
        </div>
        {note ? <p className="share-note">{note}</p> : null}
      </section>

      <section className="panel soft">
        <h2>Suggested next tools</h2>
        <p className="lede">
          Start at the top. Each card answers: what problem → what it does → how
          to use it.
        </p>
        {suggestions.length === 0 ? (
          <p className="form-error">
            Type a bit more in the problem box or pick a situation above.
          </p>
        ) : (
          <ol className="suggest-list">
            {suggestions.map(({ guide, reasons }, index) => (
              <li key={guide.id} className="suggest-card">
                <div className="suggest-rank">Step {index + 1}</div>
                <h3>{guide.plainName}</h3>
                {guide.alsoCalled ? (
                  <p className="guide-also">Also called: {guide.alsoCalled}</p>
                ) : null}
                <p>
                  <strong>Problem it fits:</strong> {guide.problem}
                </p>
                <p>
                  <strong>What it does:</strong> {guide.does}
                </p>
                <p>
                  <strong>How to use it:</strong>
                </p>
                <ol className="guide-steps compact">
                  {guide.how.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {reasons.length ? (
                  <p className="meta">Why suggested: {reasons.join(' · ')}</p>
                ) : null}
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => onNavigate(guide.id)}
                >
                  Open this tool
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
