import type { AppView } from '../components/AppShell'
import { getToolGuide } from './toolGuides'

/** Where a tool sits on the shop-floor use spectrum. */
export type Spectrum = 'look' | 'prove' | 'act'

export type DomainId = 'spc' | 'hyp' | 'lean'

export const DOMAINS: {
  id: DomainId
  title: string
  short: string
  question: string
}[] = [
  {
    id: 'spc',
    title: 'Statistical process control',
    short: 'SPC',
    question: 'Is this process behaving, or did something break?',
  },
  {
    id: 'hyp',
    title: 'Hypothesis testing',
    short: 'Prove it',
    question: 'Is the difference real, or are we fooling ourselves?',
  },
  {
    id: 'lean',
    title: 'Lean & floor action',
    short: 'Lean',
    question: 'What do we change on the station, the line, or the wallet?',
  },
]

export const SPECTRUM: {
  id: Spectrum
  label: string
  hint: string
}[] = [
  { id: 'look', label: 'Look', hint: 'First picture — no test yet' },
  { id: 'prove', label: 'Prove', hint: 'Limits, p-values, capability' },
  { id: 'act', label: 'Act', hint: 'Change the work, then lock it' },
]

export interface MappedTool {
  id: AppView
  chip: string
  domains: DomainId[]
  spectrum: Spectrum
}

/**
 * Every calculator on the Venn. Overlaps are the teaching point:
 * capability is both SPC and a test against specs; Pareto is used in all three.
 */
export const MAPPED_TOOLS: MappedTool[] = [
  { id: 'visual', chip: 'Shape', domains: ['spc'], spectrum: 'look' },
  { id: 'imr', chip: 'I-MR', domains: ['spc'], spectrum: 'prove' },
  { id: 'xbarr', chip: 'X̄-R', domains: ['spc'], spectrum: 'prove' },
  { id: 'attribute', chip: 'p / np / c / u', domains: ['spc'], spectrum: 'prove' },
  { id: 'capability', chip: 'Cpk', domains: ['spc', 'hyp'], spectrum: 'prove' },
  { id: 'gage', chip: 'Gage', domains: ['spc', 'hyp'], spectrum: 'prove' },
  { id: 'sigma', chip: 'Sigma', domains: ['spc', 'hyp'], spectrum: 'prove' },
  { id: 'ttest', chip: 't-test', domains: ['hyp'], spectrum: 'prove' },
  { id: 'anova', chip: 'ANOVA', domains: ['hyp'], spectrum: 'prove' },
  { id: 'proportions', chip: 'Rates', domains: ['hyp'], spectrum: 'prove' },
  { id: 'regression', chip: 'R²', domains: ['hyp'], spectrum: 'prove' },
  { id: 'compare', chip: 'Compare', domains: ['hyp'], spectrum: 'look' },
  { id: 'samplesize', chip: 'Sample n', domains: ['hyp'], spectrum: 'look' },
  { id: 'beforeafter', chip: 'Before/after', domains: ['hyp', 'lean'], spectrum: 'prove' },
  { id: 'oee', chip: 'OEE', domains: ['spc', 'lean'], spectrum: 'prove' },
  { id: 'yield', chip: 'Yield', domains: ['spc', 'lean'], spectrum: 'prove' },
  { id: 'pareto', chip: 'Pareto', domains: ['spc', 'hyp', 'lean'], spectrum: 'look' },
  { id: 'wastewalk', chip: 'Wastes', domains: ['lean'], spectrum: 'look' },
  { id: 'fishbone', chip: 'Fishbone', domains: ['lean'], spectrum: 'look' },
  { id: 'fivewhys', chip: '5 Whys', domains: ['lean'], spectrum: 'look' },
  { id: 'fmea', chip: 'FMEA', domains: ['lean'], spectrum: 'act' },
  { id: 'fives', chip: '5S', domains: ['lean'], spectrum: 'act' },
  { id: 'smed', chip: 'SMED', domains: ['lean'], spectrum: 'act' },
  { id: 'takt', chip: 'Takt', domains: ['lean'], spectrum: 'act' },
  { id: 'montecarlo', chip: 'Time risk', domains: ['lean'], spectrum: 'prove' },
  { id: 'copq', chip: 'COPQ', domains: ['lean'], spectrum: 'act' },
]

export type VennZone =
  | 'spc'
  | 'hyp'
  | 'lean'
  | 'spc-hyp'
  | 'spc-lean'
  | 'hyp-lean'
  | 'all'

export const VENN_ZONES: {
  id: VennZone
  title: string
  hint: string
  domains: DomainId[]
}[] = [
  { id: 'spc', title: 'SPC only', hint: 'Watch the process', domains: ['spc'] },
  {
    id: 'spc-hyp',
    title: 'SPC ∩ prove',
    hint: 'Specs, gage, sigma',
    domains: ['spc', 'hyp'],
  },
  { id: 'hyp', title: 'Hypothesis only', hint: 'Is the gap real?', domains: ['hyp'] },
  {
    id: 'spc-lean',
    title: 'SPC ∩ lean',
    hint: 'Line losses as numbers',
    domains: ['spc', 'lean'],
  },
  {
    id: 'all',
    title: 'All three',
    hint: 'Used in every method',
    domains: ['spc', 'hyp', 'lean'],
  },
  {
    id: 'hyp-lean',
    title: 'Prove ∩ lean',
    hint: 'Did the change work?',
    domains: ['hyp', 'lean'],
  },
  { id: 'lean', title: 'Lean only', hint: 'Walk, change, cost', domains: ['lean'] },
]

export function zoneOf(tool: MappedTool): VennZone {
  const d = [...tool.domains].sort().join('-')
  if (d === 'spc') return 'spc'
  if (d === 'hyp') return 'hyp'
  if (d === 'lean') return 'lean'
  if (d === 'hyp-spc' || d === 'spc-hyp') return 'spc-hyp'
  if (d === 'lean-spc' || d === 'spc-lean') return 'spc-lean'
  if (d === 'hyp-lean' || d === 'lean-hyp') return 'hyp-lean'
  return 'all'
}

export function toolsInZone(zone: VennZone): MappedTool[] {
  return MAPPED_TOOLS.filter((t) => zoneOf(t) === zone)
}

export function toolsInDomain(domain: DomainId): MappedTool[] {
  return MAPPED_TOOLS.filter((t) => t.domains.includes(domain))
}

const DOMAIN_FLOW: Record<DomainId, AppView[]> = {
  spc: ['visual', 'imr', 'capability', 'attribute'],
  hyp: ['samplesize', 'compare', 'ttest', 'anova', 'beforeafter'],
  lean: ['wastewalk', 'takt', 'oee', 'smed'],
}

export interface FlowStep {
  toolId: AppView
  label: string
}

export interface FlowState {
  title: string
  source: 'domain' | 'pathway'
  sourceId: string
  steps: FlowStep[]
  current: AppView
  /** Opened a tool that is not on this flow — still stay on the rail. */
  detour?: AppView
}

function labelFor(id: AppView): string {
  const mapped = MAPPED_TOOLS.find((t) => t.id === id)
  if (mapped) return mapped.chip
  return getToolGuide(id)?.plainName ?? id
}

export function flowFromDomain(domain: DomainId, current?: AppView): FlowState {
  const meta = DOMAINS.find((d) => d.id === domain)!
  const ids = DOMAIN_FLOW[domain]
  const steps = ids.map((toolId) => ({ toolId, label: labelFor(toolId) }))
  const now =
    current && ids.includes(current)
      ? current
      : current && toolsInDomain(domain).some((t) => t.id === current)
        ? current
        : ids[0]
  const extra =
    now && !ids.includes(now)
      ? [...steps, { toolId: now, label: labelFor(now) }]
      : steps
  return {
    title: meta.title,
    source: 'domain',
    sourceId: domain,
    steps: extra,
    current: now,
  }
}

export function flowFromPathway(
  title: string,
  pathwayId: string,
  toolIds: AppView[],
  current: AppView,
): FlowState {
  const unique = toolIds.filter((id, i, arr) => arr.indexOf(id) === i)
  return {
    title,
    source: 'pathway',
    sourceId: pathwayId,
    steps: unique.map((toolId) => ({ toolId, label: labelFor(toolId) })),
    current,
  }
}

export function flowForTool(view: AppView): FlowState | null {
  const mapped = MAPPED_TOOLS.find((t) => t.id === view)
  if (!mapped) return null
  const preferred: DomainId =
    mapped.domains[0] === 'spc'
      ? 'spc'
      : mapped.domains.includes('hyp')
        ? 'hyp'
        : mapped.domains[0]
  return flowFromDomain(preferred, view)
}

export function touchFlow(
  prev: FlowState | null,
  view: AppView,
  isTool: boolean,
): FlowState | null {
  if (!isTool) return prev
  if (!prev) return flowForTool(view)
  if (prev.steps.some((s) => s.toolId === view)) {
    return { ...prev, current: view, detour: undefined }
  }
  return { ...prev, current: view, detour: view }
}
