import {
  emptyProject,
  type AttachedEvidence,
  type DmaicPhase,
  type DmaicProject,
} from '../projects/types'
import type { AnalysisReport } from '../data/types'
import { RETENTION_MS } from './datasets'

const STORAGE_KEY = 'syncmfg.projects'
const ACTIVE_KEY = 'syncmfg.activeProject'

function readAllRaw(): DmaicProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DmaicProject[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records: DmaicProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function purgeExpiredProjects(now = Date.now()): number {
  const before = readAllRaw()
  const kept = before.filter((p) => p.expiresAt > now)
  if (kept.length !== before.length) writeAll(kept)
  const active = getActiveProjectId()
  if (active && !kept.some((p) => p.id === active)) {
    localStorage.removeItem(ACTIVE_KEY)
  }
  return before.length - kept.length
}

export function listProjects(): DmaicProject[] {
  purgeExpiredProjects()
  return readAllRaw().sort((a, b) => b.createdAt - a.createdAt)
}

export function getProject(id: string): DmaicProject | undefined {
  return listProjects().find((p) => p.id === id)
}

export function saveProject(
  input: Omit<DmaicProject, 'id' | 'createdAt' | 'expiresAt'> & {
    id?: string
    createdAt?: number
  },
): DmaicProject {
  purgeExpiredProjects()
  const now = Date.now()
  const existing = input.id ? readAllRaw().find((p) => p.id === input.id) : undefined
  const record: DmaicProject = {
    ...emptyProject(input.name),
    ...input,
    id: input.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    expiresAt: now + RETENTION_MS,
  }
  const others = readAllRaw().filter((p) => p.id !== record.id)
  writeAll([record, ...others])
  return record
}

export function deleteProject(id: string): void {
  writeAll(readAllRaw().filter((p) => p.id !== id))
  if (getActiveProjectId() === id) localStorage.removeItem(ACTIVE_KEY)
}

export function createProject(name: string): DmaicProject {
  const project = saveProject(emptyProject(name.trim() || 'New DMAIC project'))
  setActiveProjectId(project.id)
  return project
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveProjectId(id: string | null): void {
  if (!id) localStorage.removeItem(ACTIVE_KEY)
  else localStorage.setItem(ACTIVE_KEY, id)
}

export function getActiveProject(): DmaicProject | undefined {
  const id = getActiveProjectId()
  return id ? getProject(id) : undefined
}

export function attachEvidence(
  projectId: string,
  phase: DmaicPhase,
  sourceTool: string,
  report: AnalysisReport,
): DmaicProject | null {
  const project = getProject(projectId)
  if (!project) return null
  const evidence: AttachedEvidence = {
    id: crypto.randomUUID(),
    phase,
    sourceTool,
    attachedAt: Date.now(),
    report,
  }
  return saveProject({
    ...project,
    evidence: [evidence, ...project.evidence],
  })
}

export function removeEvidence(projectId: string, evidenceId: string): void {
  const project = getProject(projectId)
  if (!project) return
  saveProject({
    ...project,
    evidence: project.evidence.filter((e) => e.id !== evidenceId),
  })
}

export function daysUntilProjectExpiry(project: DmaicProject, now = Date.now()): number {
  return Math.max(0, Math.ceil((project.expiresAt - now) / (24 * 60 * 60 * 1000)))
}
