import type { DataTable } from '../data/types'

export function numericColumn(table: DataTable, columnName: string): number[] {
  const index = table.headers.indexOf(columnName)
  if (index < 0) return []
  const values: number[] = []
  for (const row of table.rows) {
    const cell = row[index]
    if (typeof cell === 'number' && Number.isFinite(cell)) values.push(cell)
  }
  return values
}

export function numericColumnNames(table: DataTable): string[] {
  return table.headers.filter((_, index) =>
    table.rows.some(
      (row) => typeof row[index] === 'number' && Number.isFinite(row[index] as number),
    ),
  )
}
