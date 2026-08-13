/** Eight wastes — DOWNTIME (common in Lean certification / training). */
export interface WasteDef {
  id: string
  letter: string
  name: string
  short: string
  lookFor: string
}

export const EIGHT_WASTES: WasteDef[] = [
  {
    id: 'defects',
    letter: 'D',
    name: 'Defects',
    short: 'Scrap, rework, wrong info',
    lookFor: 'Fixes, scrap bins, customer complaints, redo loops',
  },
  {
    id: 'overproduction',
    letter: 'O',
    name: 'Overproduction',
    short: 'Making too much / too soon',
    lookFor: 'Extra batches “just in case,” piles ahead of demand',
  },
  {
    id: 'waiting',
    letter: 'W',
    name: 'Waiting',
    short: 'Idle people, parts, or machines',
    lookFor: 'Operators standing, machines starved/blocked, long queues',
  },
  {
    id: 'nonutilized',
    letter: 'N',
    name: 'Non-utilized talent',
    short: 'Ideas and skills unused',
    lookFor: 'Operators not asked, skills mismatched, no problem-solving time',
  },
  {
    id: 'transportation',
    letter: 'T',
    name: 'Transportation',
    short: 'Moving things too far',
    lookFor: 'Long forklift trips, carts zig-zagging, handoffs across aisles',
  },
  {
    id: 'inventory',
    letter: 'I',
    name: 'Inventory',
    short: 'Too much stock / WIP',
    lookFor: 'Overflow racks, WIP covering problems, expired lots',
  },
  {
    id: 'motion',
    letter: 'M',
    name: 'Motion',
    short: 'Extra walking / reaching',
    lookFor: 'Searching for tools, bending, long reaches, scavenger hunts',
  },
  {
    id: 'extra',
    letter: 'E',
    name: 'Extra-processing',
    short: 'More work than customer needs',
    lookFor: 'Double checks, over-polishing, redundant paperwork',
  },
]

export type ImpactLevel = 'low' | 'medium' | 'high'

export interface WasteObservation {
  id: string
  wasteId: string
  note: string
  impact: ImpactLevel
  idea: string
}

export function wasteById(id: string): WasteDef | undefined {
  return EIGHT_WASTES.find((w) => w.id === id)
}
