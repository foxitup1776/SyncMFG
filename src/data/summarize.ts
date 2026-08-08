import type { AnalysisReport, ColumnSummary, DataTable } from './types'

function numericValues(columnIndex: number, table: DataTable): number[] {
  const values: number[] = []
  for (const row of table.rows) {
    const cell = row[columnIndex]
    if (typeof cell === 'number' && Number.isFinite(cell)) values.push(cell)
  }
  return values
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function sampleStdDev(values: number[]): number | null {
  if (values.length < 2) return null
  const m = mean(values)!
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function summarizeColumns(table: DataTable): ColumnSummary[] {
  return table.headers.map((name, index) => {
    const nums = numericValues(index, table)
    const missing = table.rows.filter(
      (row) => row[index] === null || row[index] === '',
    ).length
    return {
      name,
      count: table.rows.length,
      missing,
      numericCount: nums.length,
      mean: mean(nums),
      median: median(nums),
      min: nums.length ? Math.min(...nums) : null,
      max: nums.length ? Math.max(...nums) : null,
      stdDev: sampleStdDev(nums),
    }
  })
}

function fmt(n: number | null, digits = 3): string {
  if (n === null) return '—'
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(digits)
}

/** Plain-English summary for the data ingest step. */
export function buildDataReport(
  table: DataTable,
  summaries: ColumnSummary[],
  sourceLabel: string,
): AnalysisReport {
  const numericCols = summaries.filter((s) => s.numericCount > 0)
  const bullets: string[] = [
    `We read ${table.rows.length} data rows and ${table.headers.length} columns from ${sourceLabel}.`,
  ]

  if (numericCols.length === 0) {
    bullets.push(
      'None of the columns look like numbers yet. Check that measurement columns are numeric (not text).',
    )
  } else {
    for (const col of numericCols.slice(0, 4)) {
      bullets.push(
        `Column “${col.name}”: ${col.numericCount} numbers — average ${fmt(col.mean)}, middle value (median) ${fmt(col.median)}, spread (standard deviation) ${fmt(col.stdDev)}, from ${fmt(col.min)} to ${fmt(col.max)}.`,
      )
    }
    if (numericCols.length > 4) {
      bullets.push(
        `…and ${numericCols.length - 4} more numeric column(s) with the same kind of summary available in the table above.`,
      )
    }
  }

  const missingTotal = summaries.reduce((s, c) => s + c.missing, 0)
  if (missingTotal > 0) {
    bullets.push(
      `There are ${missingTotal} empty cell(s). Empty cells are skipped when we calculate averages and spreads.`,
    )
  }

  return {
    title: 'What this data looks like',
    summary:
      'This is a first look at your table — how many rows came in, which columns are numbers, and how centered or spread out those numbers are. No process decision yet; that comes from charts and tests you run next.',
    bullets,
    termsUsed: ['mean', 'median', 'standard deviation', 'sample'],
  }
}
