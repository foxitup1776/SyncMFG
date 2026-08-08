import type { DatasetRecord } from '../data/types'

const STORAGE_KEY = 'syncmfg.datasets'
export const RETENTION_MS = 30 * 24 * 60 * 60 * 1000

function readAllRaw(): DatasetRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DatasetRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records: DatasetRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

/** Drop anything older than 30 days. Call on app load and before saves. */
export function purgeExpiredDatasets(now = Date.now()): number {
  const before = readAllRaw()
  const kept = before.filter((d) => d.expiresAt > now)
  if (kept.length !== before.length) writeAll(kept)
  return before.length - kept.length
}

export function listDatasets(): DatasetRecord[] {
  purgeExpiredDatasets()
  return readAllRaw().sort((a, b) => b.createdAt - a.createdAt)
}

export function getDataset(id: string): DatasetRecord | undefined {
  return listDatasets().find((d) => d.id === id)
}

export function saveDataset(
  input: Omit<DatasetRecord, 'id' | 'createdAt' | 'expiresAt'> & { id?: string },
): DatasetRecord {
  purgeExpiredDatasets()
  const now = Date.now()
  const record: DatasetRecord = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    table: input.table,
    source: input.source,
    createdAt: now,
    expiresAt: now + RETENTION_MS,
  }
  const others = readAllRaw().filter((d) => d.id !== record.id)
  writeAll([record, ...others])
  return record
}

export function deleteDataset(id: string): void {
  writeAll(readAllRaw().filter((d) => d.id !== id))
}

export function daysUntilExpiry(record: DatasetRecord, now = Date.now()): number {
  return Math.max(0, Math.ceil((record.expiresAt - now) / (24 * 60 * 60 * 1000)))
}
