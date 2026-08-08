import type { AnalysisReport } from '../data/types'

export type DmaicPhase =
  | 'define'
  | 'measure'
  | 'analyze'
  | 'improve'
  | 'control'

export interface AttachedEvidence {
  id: string
  phase: DmaicPhase
  sourceTool: string
  attachedAt: number
  report: AnalysisReport
}

export interface FishboneBone {
  category: string
  causes: string[]
}

export interface FishboneState {
  effect: string
  bones: FishboneBone[]
}

export interface FiveWhysState {
  problem: string
  whys: string[]
  rootCause: string
}

export interface FmeaRow {
  id: string
  failureMode: string
  effect: string
  cause: string
  severity: number
  occurrence: number
  detection: number
  actions: string
}

export interface SipocState {
  suppliers: string
  inputs: string
  process: string
  outputs: string
  customers: string
}

export interface DmaicProject {
  id: string
  name: string
  createdAt: number
  expiresAt: number
  activePhase: DmaicPhase
  problem: string
  goal: string
  scope: string
  ctq: string
  sipoc: SipocState
  countermeasures: string
  controlPlan: string
  fishbone: FishboneState
  fiveWhys: FiveWhysState
  fmea: FmeaRow[]
  evidence: AttachedEvidence[]
}

export const DEFAULT_BONES: FishboneBone[] = [
  { category: 'Man (People)', causes: [] },
  { category: 'Machine', causes: [] },
  { category: 'Material', causes: [] },
  { category: 'Method', causes: [] },
  { category: 'Measurement', causes: [] },
  { category: 'Environment', causes: [] },
]

export function emptyProject(name = 'New DMAIC project'): Omit<
  DmaicProject,
  'id' | 'createdAt' | 'expiresAt'
> {
  return {
    name,
    activePhase: 'define',
    problem: '',
    goal: '',
    scope: '',
    ctq: '',
    sipoc: {
      suppliers: '',
      inputs: '',
      process: '',
      outputs: '',
      customers: '',
    },
    countermeasures: '',
    controlPlan: '',
    fishbone: { effect: '', bones: DEFAULT_BONES.map((b) => ({ ...b, causes: [] })) },
    fiveWhys: { problem: '', whys: ['', '', '', '', ''], rootCause: '' },
    fmea: [],
    evidence: [],
  }
}

export const PHASE_LABELS: Record<DmaicPhase, string> = {
  define: 'Define',
  measure: 'Measure',
  analyze: 'Analyze',
  improve: 'Improve',
  control: 'Control',
}
