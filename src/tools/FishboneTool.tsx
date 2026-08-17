import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppView } from '../components/AppShell'
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

/** Empty-state prompts per 6M category. */
const EMPTY_PROMPTS: Record<string, string> = {
  'Man (People)': 'Training gap? Staffing? Fatigue? Skill mismatch?',
  Machine: 'Setup? Wear? Settings drift? Wrong tooling?',
  Material: 'Wrong lot? Moisture? Supplier change? Contamination?',
  Method: 'Missing standard? Shortcut? Sequence wrong?',
  Measurement: 'Gage noise? Wrong gauge? Calibration overdue?',
  Environment: 'Temp / humidity? Lighting? Crowding? Housekeeping?',
}

function blankFishbone(): FishboneState {
  return {
    effect: '',
    bones: DEFAULT_BONES.map((b) => ({ ...b, causes: [] })),
  }
}

function promptFor(category: string): string {
  return (
    EMPTY_PROMPTS[category] ??
    Object.entries(EMPTY_PROMPTS).find(([k]) =>
      category.toLowerCase().includes(k.toLowerCase().split(' ')[0]!),
    )?.[1] ??
    'Possible cause?'
  )
}

export function FishboneTool({
  onNavigate: _onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [projectId, setProjectId] = useState(
    () => getActiveProjectId() ?? listProjects()[0]?.id ?? '',
  )
  const [, bump] = useState(0)
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null)
  const boneRefs = useRef<Record<string, HTMLElement | null>>({})
  const projects = listProjects()
  const project = projectId ? getProject(projectId) : undefined
  const fishbone = project?.fishbone ?? blankFishbone()

  useEffect(() => {
    if (!focusedCategory) return
    const el = boneRefs.current[focusedCategory]
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [focusedCategory])

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
          <FishboneDiagram
            fishbone={fishbone}
            onBoneClick={(category) => setFocusedCategory(category)}
          />

          <div className="fish-bones">
            {fishbone.bones.map((bone, bi) => {
              const empty = bone.causes.length === 0
              const focused = focusedCategory === bone.category
              return (
                <section
                  key={bone.category}
                  className={focused ? 'panel bone-card focused' : 'panel bone-card'}
                  ref={(el) => {
                    boneRefs.current[bone.category] = el
                  }}
                >
                  <h3>{bone.category}</h3>
                  {empty ? (
                    <p className="meta">{promptFor(bone.category)}</p>
                  ) : null}
                  {bone.causes.map((cause, ci) => (
                    <div key={ci} className="row bone-row">
                      <input
                        value={cause}
                        placeholder={promptFor(bone.category)}
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
              )
            })}
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
