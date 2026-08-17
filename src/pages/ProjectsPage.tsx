import { useMemo, useState } from 'react'
import type { AppView } from '../components/AppShell'
import { PlainReport } from '../components/PlainReport'
import type { AnalysisReport } from '../data/types'
import {
  PHASE_LABELS,
  type DmaicPhase,
  type DmaicProject,
} from '../projects/types'
import {
  createProject,
  daysUntilProjectExpiry,
  deleteProject,
  getActiveProjectId,
  listProjects,
  removeEvidence,
  saveProject,
  setActiveProjectId,
} from '../storage/projects'

const PHASES: DmaicPhase[] = [
  'define',
  'measure',
  'analyze',
  'improve',
  'control',
]

const PHASE_HINTS: Record<DmaicPhase, string> = {
  define: 'Charter the problem, CTQ, and SIPOC.',
  measure: 'Pin baseline stats: visual, I-MR, capability, Gage R&R.',
  analyze: 'Fishbone, 5 Whys, FMEA, Pareto, t-test, regression.',
  improve: 'Countermeasures and (optional) Monte Carlo “after” times.',
  control: 'Control plan — what chart/spec keeps the gain.',
}

export function ProjectsPage({
  onNavigate,
}: {
  onNavigate: (v: AppView) => void
}) {
  const [tick, setTick] = useState(0)
  const projects = useMemo(() => {
    void tick
    return listProjects()
  }, [tick])
  const [selectedId, setSelectedId] = useState(
    () => getActiveProjectId() ?? listProjects()[0]?.id ?? '',
  )
  const [newName, setNewName] = useState('')

  const project = selectedId
    ? projects.find((p) => p.id === selectedId)
    : undefined

  function refresh(next?: DmaicProject) {
    if (next) {
      setSelectedId(next.id)
      setActiveProjectId(next.id)
    }
    setTick((n) => n + 1)
  }

  function patch(partial: Partial<DmaicProject>) {
    if (!project) return
    refresh(saveProject({ ...project, ...partial }))
  }

  const a3Report: AnalysisReport | null = useMemo(() => {
    if (!project) return null
    const topFmea = [...project.fmea]
      .filter((r) => r.failureMode.trim())
      .sort(
        (a, b) =>
          b.severity * b.occurrence * b.detection -
          a.severity * a.occurrence * a.detection,
      )[0]
    return {
      title: `A3 / DMAIC — ${project.name}`,
      summary: project.problem.trim()
        ? project.problem.trim()
        : 'Fill the Define section to state the problem in plain language.',
      bullets: [
        project.goal.trim()
          ? `Goal: ${project.goal.trim()}`
          : 'Goal: (not set yet)',
        project.ctq.trim()
          ? `CTQ / metric: ${project.ctq.trim()}`
          : 'CTQ: (not set yet)',
        project.fiveWhys.rootCause.trim()
          ? `Working root cause: ${project.fiveWhys.rootCause.trim()}`
          : project.fishbone.effect.trim()
            ? `Fishbone effect: ${project.fishbone.effect.trim()}`
            : 'Analyze: add Fishbone / 5 Whys.',
        topFmea
          ? `Top FMEA risk: ${topFmea.failureMode} (RPN ${topFmea.severity * topFmea.occurrence * topFmea.detection})`
          : 'FMEA: (none yet)',
        project.countermeasures.trim()
          ? `Improve: ${project.countermeasures.trim()}`
          : 'Improve: list countermeasures.',
        project.controlPlan.trim()
          ? `Control: ${project.controlPlan.trim()}`
          : 'Control: write how you’ll hold the gain.',
        `${project.evidence.length} stats report(s) pinned as evidence.`,
      ],
      termsUsed: ['dmaic', 'a3', 'ctq', 'sipoc'],
    }
  }, [project])

  return (
    <div className="projects-page">
      <section className="panel">
        <h2>DMAIC projects</h2>
        <p className="lede">
          One place for the problem story + pinned stats. Auto-deletes 30 days
          after last save (same as datasets).
        </p>
        <div className="field-grid">
          <div>
            <label htmlFor="new-project">New project name</label>
            <input
              id="new-project"
              value={newName}
              placeholder="e.g. Line 2 scrap DMAIC"
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
        </div>
        <div className="row actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              const p = createProject(newName || 'New DMAIC project')
              setNewName('')
              refresh(p)
            }}
          >
            Create project
          </button>
        </div>
        {projects.length > 0 ? (
          <>
            <label htmlFor="pick-project">Open project</label>
            <select
              id="pick-project"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value)
                setActiveProjectId(e.target.value || null)
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({daysUntilProjectExpiry(p)}d left)
                </option>
              ))}
            </select>
          </>
        ) : null}
      </section>

      {project ? (
        <>
          <section className="panel">
            <div className="tool-head">
              <h2>{project.name}</h2>
              <button
                type="button"
                className="btn ghost danger"
                onClick={() => {
                  deleteProject(project.id)
                  const next = listProjects()[0]
                  setSelectedId(next?.id ?? '')
                  setActiveProjectId(next?.id ?? null)
                  refresh()
                }}
              >
                Delete
              </button>
            </div>
            <label htmlFor="proj-name">Project title</label>
            <input
              id="proj-name"
              value={project.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
            <div className="phase-tabs" role="tablist" aria-label="DMAIC phase">
              {PHASES.map((phase) => (
                <button
                  key={phase}
                  type="button"
                  role="tab"
                  className={
                    project.activePhase === phase
                      ? 'phase-tab active'
                      : 'phase-tab'
                  }
                  onClick={() => patch({ activePhase: phase })}
                >
                  {PHASE_LABELS[phase]}
                </button>
              ))}
            </div>
            <p className="lede">{PHASE_HINTS[project.activePhase]}</p>
          </section>

          {project.activePhase === 'define' ? (
            <section className="panel">
              <h3>Define</h3>
              <label>Problem statement</label>
              <textarea
                rows={3}
                value={project.problem}
                onChange={(e) => patch({ problem: e.target.value })}
                placeholder="What is wrong, where, and how bad?"
              />
              <label>Goal</label>
              <textarea
                rows={2}
                value={project.goal}
                onChange={(e) => patch({ goal: e.target.value })}
                placeholder="By when, to what target?"
              />
              <label>Scope</label>
              <textarea
                rows={2}
                value={project.scope}
                onChange={(e) => patch({ scope: e.target.value })}
                placeholder="In scope / out of scope"
              />
              <label>CTQ (critical to quality metric)</label>
              <input
                value={project.ctq}
                onChange={(e) => patch({ ctq: e.target.value })}
                placeholder="e.g. % burnt edges, Cpk, cycle time"
              />
              <h3 className="subhead">SIPOC (high level)</h3>
              <div className="field-grid">
                {(
                  [
                    ['suppliers', 'Suppliers'],
                    ['inputs', 'Inputs'],
                    ['process', 'Process'],
                    ['outputs', 'Outputs'],
                    ['customers', 'Customers'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label>{label}</label>
                    <textarea
                      rows={2}
                      value={project.sipoc[key]}
                      onChange={(e) =>
                        patch({
                          sipoc: { ...project.sipoc, [key]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {project.activePhase === 'measure' ? (
            <section className="panel">
              <h3>Measure</h3>
              <p className="lede">
                Run a stats tool, then use <strong>Pin to DMAIC project</strong> on
                its report (phase: Measure).
              </p>
              <div className="row actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('visual')}
                >
                  Visual charts
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('imr')}
                >
                  I-MR
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('capability')}
                >
                  Capability
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('gage')}
                >
                  Gage R&R
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('data')}
                >
                  Data
                </button>
              </div>
            </section>
          ) : null}

          {project.activePhase === 'analyze' ? (
            <section className="panel">
              <h3>Analyze</h3>
              <p className="lede">
                Problem-solving tools live on this project. Stats tools can be
                pinned here too.
              </p>
              <div className="row actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => onNavigate('fishbone')}
                >
                  Fishbone
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => onNavigate('fivewhys')}
                >
                  5 Whys
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => onNavigate('fmea')}
                >
                  FMEA
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('pareto')}
                >
                  Pareto
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('ttest')}
                >
                  t-test
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('regression')}
                >
                  Regression
                </button>
              </div>
              <div className="analyze-snapshot">
                <p>
                  <strong>Fishbone effect:</strong>{' '}
                  {project.fishbone.effect.trim() || '—'}
                </p>
                <p>
                  <strong>5 Whys root:</strong>{' '}
                  {project.fiveWhys.rootCause.trim() || '—'}
                </p>
                <p>
                  <strong>FMEA rows:</strong> {project.fmea.length}
                </p>
              </div>
            </section>
          ) : null}

          {project.activePhase === 'improve' ? (
            <section className="panel">
              <h3>Improve</h3>
              <label>Countermeasures</label>
              <textarea
                rows={5}
                value={project.countermeasures}
                onChange={(e) => patch({ countermeasures: e.target.value })}
                placeholder="What will you change? Who owns it? By when?"
              />
              <div className="row actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('montecarlo')}
                >
                  Time-study Monte Carlo
                </button>
              </div>
            </section>
          ) : null}

          {project.activePhase === 'control' ? (
            <section className="panel">
              <h3>Control</h3>
              <label>Control plan</label>
              <textarea
                rows={5}
                value={project.controlPlan}
                onChange={(e) => patch({ controlPlan: e.target.value })}
                placeholder="What will you monitor (chart, spec, audit)? Reaction plan if it drifts?"
              />
              <div className="row actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('imr')}
                >
                  I-MR
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onNavigate('capability')}
                >
                  Capability
                </button>
              </div>
            </section>
          ) : null}

          <section className="panel">
            <h3>Pinned evidence</h3>
            {project.evidence.length === 0 ? (
              <p className="lede">
                No reports pinned yet. Open a stats or problem-solving tool and
                use “Pin to DMAIC project”.
              </p>
            ) : (
              <ul className="evidence-list">
                {project.evidence.map((e) => (
                  <li key={e.id}>
                    <div>
                      <strong className="evidence-source">{e.sourceTool}</strong>
                      <span className="meta">
                        {PHASE_LABELS[e.phase]} ·{' '}
                        {new Date(e.attachedAt).toLocaleString()}
                      </span>
                      <p className="evidence-summary">{e.report.summary}</p>
                    </div>
                    <button
                      type="button"
                      className="btn ghost danger"
                      onClick={() => {
                        removeEvidence(project.id, e.id)
                        refresh(getProjectFresh(project.id))
                      }}
                    >
                      Unpin
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {a3Report ? (
            <PlainReport
              report={a3Report}
              sourceTool="A3 / DMAIC"
              defaultPhase={project.activePhase}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function getProjectFresh(id: string): DmaicProject | undefined {
  return listProjects().find((p) => p.id === id)
}
