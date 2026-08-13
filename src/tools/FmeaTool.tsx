import { useMemo, useState } from 'react'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import type { FmeaRow } from '../projects/types'
import {
  getActiveProjectId,
  getProject,
  listProjects,
  saveProject,
  setActiveProjectId,
} from '../storage/projects'

function newRow(): FmeaRow {
  return {
    id: crypto.randomUUID(),
    failureMode: '',
    effect: '',
    cause: '',
    severity: 5,
    occurrence: 5,
    detection: 5,
    actions: '',
  }
}

function rpn(row: FmeaRow): number {
  return row.severity * row.occurrence * row.detection
}

export function FmeaTool() {
  const [projectId, setProjectId] = useState(
    () => getActiveProjectId() ?? listProjects()[0]?.id ?? '',
  )
  const [, bump] = useState(0)
  const projects = listProjects()
  const project = projectId ? getProject(projectId) : undefined
  const rows = project?.fmea ?? []

  function updateRows(next: FmeaRow[]) {
    if (!project) return
    saveProject({ ...project, fmea: next, activePhase: 'analyze' })
    setActiveProjectId(project.id)
    bump((n) => n + 1)
  }

  function patch(id: string, patch: Partial<FmeaRow>) {
    updateRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const ranked = useMemo(
    () => [...rows].sort((a, b) => rpn(b) - rpn(a)),
    [rows],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!project) return null
    const top = ranked.filter((r) => r.failureMode.trim())[0]
    return {
      title: `FMEA — ${project.name}`,
      summary: top
        ? `Highest risk (RPN ${rpn(top)}): “${top.failureMode}” — Severity ${top.severity} × Occurrence ${top.occurrence} × Detection ${top.detection}.`
        : 'List how the process can fail, score risk, and fix the highest RPN items first.',
      bullets: [
        `${rows.length} failure mode row(s) in the table.`,
        ...ranked
          .filter((r) => r.failureMode.trim())
          .slice(0, 5)
          .map(
            (r) =>
              `RPN ${rpn(r)}: ${r.failureMode}${r.actions.trim() ? ` → action: ${r.actions.trim()}` : ''}`,
          ),
        'RPN is a priority helper, not a law of physics — still use judgment for safety-critical failures.',
      ],
      termsUsed: ['fmea', 'rpn'],
    }
  }, [project, rows, ranked])

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="fmea" />
      <section className="panel">
        <h2>Rank failure risks before they hurt us</h2>
        <p className="lede">
          Brainstorm what can go wrong, score Severity × Occurrence × Detection
          (1–10), fix high RPN first.
        </p>
        <label htmlFor="fmea-project">DMAIC project</label>
        <select
          id="fmea-project"
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
            <button
              type="button"
              className="btn secondary"
              onClick={() => updateRows([...rows, newRow()])}
            >
              Add failure mode
            </button>
          </div>
        ) : (
          <p className="form-error">Create or open a project under Projects first.</p>
        )}
      </section>

      {project ? (
        <>
          <div className="steps-table-wrap">
            <table className="steps-table fmea-table">
              <thead>
                <tr>
                  <th>Failure mode</th>
                  <th>Effect</th>
                  <th>Cause</th>
                  <th>S</th>
                  <th>O</th>
                  <th>D</th>
                  <th>RPN</th>
                  <th>Actions</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ranked.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        value={row.failureMode}
                        onChange={(e) =>
                          patch(row.id, { failureMode: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={row.effect}
                        onChange={(e) => patch(row.id, { effect: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={row.cause}
                        onChange={(e) => patch(row.id, { cause: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={row.severity}
                        onChange={(e) =>
                          patch(row.id, {
                            severity: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={row.occurrence}
                        onChange={(e) =>
                          patch(row.id, {
                            occurrence: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={row.detection}
                        onChange={(e) =>
                          patch(row.id, {
                            detection: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                          })
                        }
                      />
                    </td>
                    <td>
                      <strong>{rpn(row)}</strong>
                    </td>
                    <td>
                      <input
                        value={row.actions}
                        onChange={(e) =>
                          patch(row.id, { actions: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn ghost danger"
                        onClick={() =>
                          updateRows(rows.filter((r) => r.id !== row.id))
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 ? (
            <p className="lede">No rows yet — add a failure mode to start.</p>
          ) : null}
          {report ? (
            <PlainReport report={report} sourceTool="FMEA" defaultPhase="analyze" />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
