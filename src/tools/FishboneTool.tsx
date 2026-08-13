import { useMemo, useState } from 'react'
import { FishboneDiagram } from '../components/FishboneDiagram'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { DEFAULT_BONES, type FishboneState } from '../projects/types'
import {
  getActiveProjectId,
  getProject,
  listProjects,
  saveProject,
  setActiveProjectId,
} from '../storage/projects'

function blankFishbone(): FishboneState {
  return {
    effect: '',
    bones: DEFAULT_BONES.map((b) => ({ ...b, causes: [] })),
  }
}

export function FishboneTool() {
  const [projectId, setProjectId] = useState(
    () => getActiveProjectId() ?? listProjects()[0]?.id ?? '',
  )
  const [, bump] = useState(0)
  const projects = listProjects()
  const project = projectId ? getProject(projectId) : undefined
  const fishbone = project?.fishbone ?? blankFishbone()

  function update(next: FishboneState) {
    if (!project) return
    saveProject({ ...project, fishbone: next, activePhase: 'analyze' })
    setActiveProjectId(project.id)
    bump((n) => n + 1)
  }

  function addCause(boneIndex: number) {
    const bones = fishbone.bones.map((b, i) =>
      i === boneIndex ? { ...b, causes: [...b.causes, ''] } : b,
    )
    update({ ...fishbone, bones })
  }

  function setCause(boneIndex: number, causeIndex: number, value: string) {
    const bones = fishbone.bones.map((b, i) => {
      if (i !== boneIndex) return b
      const causes = b.causes.map((c, j) => (j === causeIndex ? value : c))
      return { ...b, causes }
    })
    update({ ...fishbone, bones })
  }

  function removeCause(boneIndex: number, causeIndex: number) {
    const bones = fishbone.bones.map((b, i) => {
      if (i !== boneIndex) return b
      return { ...b, causes: b.causes.filter((_, j) => j !== causeIndex) }
    })
    update({ ...fishbone, bones })
  }

  const report: AnalysisReport | null = useMemo(() => {
    if (!project) return null
    const filled = fishbone.bones.flatMap((b) =>
      b.causes.filter((c) => c.trim()).map((c) => `${b.category}: ${c}`),
    )
    return {
      title: `Fishbone — ${project.name}`,
      summary: fishbone.effect.trim()
        ? `Cause-and-effect map for: “${fishbone.effect.trim()}”. ${filled.length} possible cause(s) listed across the 6M categories.`
        : 'Name the effect (problem) at the fish head, then add causes on each bone.',
      bullets: [
        filled.length
          ? `Candidates to investigate: ${filled.slice(0, 5).join(' · ')}${filled.length > 5 ? '…' : ''}.`
          : 'No causes entered yet — brainstorm without judging, then verify with data.',
        'Use Pareto or an I-MR special-cause flag to choose the effect, then prove top causes with a t-test or regression.',
        'Next: run 5 Whys on the most likely branch, then FMEA if you need to prioritize risk.',
      ],
      termsUsed: ['fishbone', 'root cause', '6m'],
    }
  }, [project, fishbone])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="fishbone" />
      <section className="panel">
        <h2>Brainstorm possible causes</h2>
        <p className="lede">
          Map ideas under People, Machine, Material, Method, Measurement, and
          Environment — then prove the vital few with stats.
        </p>
        <label htmlFor="fb-project">DMAIC project</label>
        <select
          id="fb-project"
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
        {!project ? (
          <p className="form-error">
            Create or open a project under Projects first.
          </p>
        ) : (
          <>
            <label htmlFor="fb-effect">Effect / problem (fish head)</label>
            <input
              id="fb-effect"
              value={fishbone.effect}
              placeholder="e.g. High scrap on Line 2"
              onChange={(e) => update({ ...fishbone, effect: e.target.value })}
            />
          </>
        )}
      </section>

      {project ? (
        <>
          <FishboneDiagram fishbone={fishbone} />

          <div className="fish-bones">
            {fishbone.bones.map((bone, bi) => (
              <section key={bone.category} className="panel bone-card">
                <h3>{bone.category}</h3>
                {bone.causes.map((cause, ci) => (
                  <div key={ci} className="row bone-row">
                    <input
                      value={cause}
                      placeholder="Possible cause"
                      onChange={(e) => setCause(bi, ci, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn ghost danger"
                      onClick={() => removeCause(bi, ci)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => addCause(bi)}
                >
                  Add cause
                </button>
              </section>
            ))}
          </div>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="Fishbone"
              defaultPhase="analyze"
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
