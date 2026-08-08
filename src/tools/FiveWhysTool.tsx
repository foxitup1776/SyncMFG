import { useMemo, useState } from 'react'
import { PlainReport } from '../components/PlainReport'
import type { AnalysisReport } from '../data/types'
import type { FiveWhysState } from '../projects/types'
import {
  getActiveProjectId,
  getProject,
  listProjects,
  saveProject,
  setActiveProjectId,
} from '../storage/projects'

const WHY_LABELS = ['Why 1', 'Why 2', 'Why 3', 'Why 4', 'Why 5']

export function FiveWhysTool() {
  const [projectId, setProjectId] = useState(
    () => getActiveProjectId() ?? listProjects()[0]?.id ?? '',
  )
  const [, bump] = useState(0)
  const projects = listProjects()
  const project = projectId ? getProject(projectId) : undefined
  const fiveWhys: FiveWhysState = project?.fiveWhys ?? {
    problem: '',
    whys: ['', '', '', '', ''],
    rootCause: '',
  }

  function update(next: FiveWhysState) {
    if (!project) return
    saveProject({ ...project, fiveWhys: next, activePhase: 'analyze' })
    setActiveProjectId(project.id)
    bump((n) => n + 1)
  }

  function setWhy(index: number, value: string) {
    const whys = fiveWhys.whys.map((w, i) => (i === index ? value : w))
    update({ ...fiveWhys, whys })
  }

  function seedFromFishbone() {
    if (!project) return
    const effect = project.fishbone.effect.trim()
    const firstCause = project.fishbone.bones
      .flatMap((b) => b.causes)
      .find((c) => c.trim())
    update({
      ...fiveWhys,
      problem: effect || fiveWhys.problem,
      whys: [
        firstCause?.trim() || fiveWhys.whys[0],
        ...fiveWhys.whys.slice(1),
      ],
    })
  }

  const report: AnalysisReport | null = useMemo(() => {
    if (!project) return null
    const chain = fiveWhys.whys.filter((w) => w.trim())
    return {
      title: `5 Whys — ${project.name}`,
      summary: fiveWhys.rootCause.trim()
        ? `Working root cause: “${fiveWhys.rootCause.trim()}”. Drill path had ${chain.length} why-step(s).`
        : 'Ask why up to five times to move from the symptom to a fixable root cause.',
      bullets: [
        fiveWhys.problem.trim()
          ? `Starting problem: ${fiveWhys.problem.trim()}`
          : 'Write the problem (often the fish head or top Pareto bar).',
        ...chain.map((w, i) => `Why ${i + 1}: ${w}`),
        fiveWhys.rootCause.trim()
          ? `Root cause to act on: ${fiveWhys.rootCause.trim()}`
          : 'Fill the root-cause box when the chain stops at something you can change.',
        'Validate with data: attach an I-MR, t-test, or regression report to this project’s Analyze phase.',
      ],
      termsUsed: ['5 whys', 'root cause'],
    }
  }, [project, fiveWhys])

  return (
    <div className="tool-view">
      <section className="panel">
        <h2>5 Whys</h2>
        <p className="lede">
          Dig from a symptom to a root cause. Best after a Pareto bar or Fishbone
          branch looks suspicious.
        </p>
        <label htmlFor="fw-project">DMAIC project</label>
        <select
          id="fw-project"
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value)
            setActiveProjectId(e.target.value || null)
          }}
        >
          <option value="">Select a project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {project ? (
          <div className="row actions">
            <button type="button" className="btn secondary" onClick={seedFromFishbone}>
              Start from Fishbone
            </button>
          </div>
        ) : (
          <p className="form-error">Create or open a project under Projects first.</p>
        )}
      </section>

      {project ? (
        <>
          <section className="panel">
            <label htmlFor="fw-problem">Problem / symptom</label>
            <input
              id="fw-problem"
              value={fiveWhys.problem}
              placeholder="e.g. Burnt edges are #1 defect"
              onChange={(e) => update({ ...fiveWhys, problem: e.target.value })}
            />
            {WHY_LABELS.map((label, i) => (
              <div key={label}>
                <label htmlFor={`why-${i}`}>{label}</label>
                <input
                  id={`why-${i}`}
                  value={fiveWhys.whys[i] ?? ''}
                  placeholder={
                    i === 0
                      ? 'Because… (first reason)'
                      : 'Because… (deeper reason)'
                  }
                  onChange={(e) => setWhy(i, e.target.value)}
                />
              </div>
            ))}
            <label htmlFor="fw-root">Working root cause</label>
            <textarea
              id="fw-root"
              rows={3}
              value={fiveWhys.rootCause}
              placeholder="The cause we will try to fix…"
              onChange={(e) =>
                update({ ...fiveWhys, rootCause: e.target.value })
              }
            />
          </section>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="5 Whys"
              defaultPhase="analyze"
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
