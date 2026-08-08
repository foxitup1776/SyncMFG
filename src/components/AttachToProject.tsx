import { useState } from 'react'
import type { AnalysisReport } from '../data/types'
import {
  PHASE_LABELS,
  type DmaicPhase,
} from '../projects/types'
import {
  attachEvidence,
  getActiveProjectId,
  listProjects,
  setActiveProjectId,
} from '../storage/projects'

const PHASES: DmaicPhase[] = [
  'define',
  'measure',
  'analyze',
  'improve',
  'control',
]

export function AttachToProject({
  report,
  sourceTool,
  defaultPhase = 'analyze',
}: {
  report: AnalysisReport
  sourceTool: string
  defaultPhase?: DmaicPhase
}) {
  const projects = listProjects()
  const [projectId, setProjectId] = useState(
    () => getActiveProjectId() ?? projects[0]?.id ?? '',
  )
  const [phase, setPhase] = useState<DmaicPhase>(defaultPhase)
  const [note, setNote] = useState('')

  if (projects.length === 0) {
    return (
      <p className="attach-hint lede">
        Tip: create a DMAIC project under <strong>Projects</strong>, then you can
        pin this report to it.
      </p>
    )
  }

  function handleAttach() {
    if (!projectId) {
      setNote('Pick a project first.')
      return
    }
    const updated = attachEvidence(projectId, phase, sourceTool, report)
    if (!updated) {
      setNote('Could not attach — project missing.')
      return
    }
    setActiveProjectId(projectId)
    setNote(
      `Pinned to “${updated.name}” under ${PHASE_LABELS[phase]}. Open Projects to see the A3 binder.`,
    )
  }

  return (
    <section className="attach-panel no-print">
      <h3>Pin to DMAIC project</h3>
      <p className="lede">
        Keep this stats result with your problem-solving story (Fishbone, 5 Whys,
        FMEA, A3).
      </p>
      <div className="field-grid">
        <div>
          <label htmlFor="attach-project">Project</label>
          <select
            id="attach-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="attach-phase">DMAIC phase</label>
          <select
            id="attach-phase"
            value={phase}
            onChange={(e) => setPhase(e.target.value as DmaicPhase)}
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {PHASE_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="button" className="btn secondary" onClick={handleAttach}>
        Pin this report
      </button>
      {note ? <p className="share-note">{note}</p> : null}
    </section>
  )
}
