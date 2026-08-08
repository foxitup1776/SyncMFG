import * as XLSX from 'xlsx'
import type { CellValue, DataTable } from './types'

function normalizeCell(value: unknown): CellValue {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'boolean') return value ? 1 : 0
  const text = String(value).trim()
  if (text === '') return null
  const asNum = Number(text.replace(/,/g, ''))
  if (text !== '' && Number.isFinite(asNum) && /^-?\d/.test(text.replace(/,/g, ''))) {
    return asNum
  }
  return text
}

function gridToTable(grid: unknown[][]): DataTable {
  const cleaned = grid.filter((row) =>
    row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''),
  )
  if (cleaned.length === 0) {
    return { headers: [], rows: [] }
  }

  const width = Math.max(...cleaned.map((r) => r.length))
  const padded = cleaned.map((row) => {
    const next = [...row]
    while (next.length < width) next.push(null)
    return next.map(normalizeCell)
  })

  const first = padded[0]
  const firstLooksLikeHeader = first.some(
    (cell) => typeof cell === 'string' && Number.isNaN(Number(cell)),
  )

  if (firstLooksLikeHeader) {
    const headers = first.map((cell, i) =>
      cell === null || cell === '' ? `Column ${i + 1}` : String(cell),
    )
    return { headers, rows: padded.slice(1) }
  }

  const headers = Array.from({ length: width }, (_, i) => `Column ${i + 1}`)
  return { headers, rows: padded }
}

/** Parse tab / comma pasted text (Excel copy-paste). */
export function parsePastedText(text: string): DataTable {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd().split('\n')
  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
    return { headers: [], rows: [] }
  }

  const useTabs = lines.some((l) => l.includes('\t'))
  const grid = lines.map((line) => {
    if (useTabs) return line.split('\t')
    // Simple CSV: split on commas not inside quotes
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
        continue
      }
      if (ch === ',' && !inQuotes) {
        cells.push(current)
        current = ''
        continue
      }
      current += ch
    }
    cells.push(current)
    return cells
  })

  return gridToTable(grid)
}

export async function parseFile(file: File): Promise<DataTable> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    const text = await file.text()
    return parsePastedText(text)
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { headers: [], rows: [] }
  const sheet = workbook.Sheets[sheetName]
  const grid = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  })
  return gridToTable(grid)
}
