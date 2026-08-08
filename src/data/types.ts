export type CellValue = string | number | null

export interface DataTable {
  headers: string[]
  rows: CellValue[][]
}

export interface DatasetRecord {
  id: string
  name: string
  createdAt: number
  /** Auto-delete after this timestamp (30 days from create). */
  expiresAt: number
  table: DataTable
  source: 'paste' | 'csv' | 'xlsx'
}

export interface ColumnSummary {
  name: string
  count: number
  missing: number
  numericCount: number
  mean: number | null
  median: number | null
  min: number | null
  max: number | null
  stdDev: number | null
}

export interface AnalysisReport {
  title: string
  summary: string
  bullets: string[]
  termsUsed: string[]
}
