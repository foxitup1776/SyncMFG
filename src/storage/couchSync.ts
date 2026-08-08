import type { DatasetRecord } from '../data/types'
import { listDatasets, purgeExpiredDatasets, saveDataset } from './datasets'
import { loadSettings } from './settings'

function authHeader(): HeadersInit {
  const { couchUser, couchPassword } = loadSettings()
  if (!couchUser) return {}
  const token = btoa(`${couchUser}:${couchPassword}`)
  return { Authorization: `Basic ${token}` }
}

function dbRoot(): string {
  const { couchUrl, couchDb } = loadSettings()
  return `${couchUrl.replace(/\/$/, '')}/${encodeURIComponent(couchDb)}`
}

async function ensureDb(): Promise<void> {
  const res = await fetch(dbRoot(), {
    method: 'PUT',
    headers: authHeader(),
  })
  // 201 created, 412 already exists — both fine
  if (!res.ok && res.status !== 412) {
    const text = await res.text()
    throw new Error(`Could not open database (${res.status}): ${text.slice(0, 120)}`)
  }
}

export async function pushToCouch(): Promise<string> {
  purgeExpiredDatasets()
  await ensureDb()
  const datasets = listDatasets()
  let sent = 0
  for (const ds of datasets) {
    const url = `${dbRoot()}/${encodeURIComponent(ds.id)}`
    const existing = await fetch(url, { headers: authHeader() })
    let rev: string | undefined
    if (existing.ok) {
      const doc = (await existing.json()) as { _rev?: string }
      rev = doc._rev
    }
    const body = {
      _id: ds.id,
      ...(rev ? { _rev: rev } : {}),
      type: 'syncmfg.dataset',
      ...ds,
    }
    const put = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    })
    if (!put.ok) {
      const text = await put.text()
      throw new Error(`Upload failed for ${ds.name}: ${text.slice(0, 120)}`)
    }
    sent += 1
  }
  return `Pushed ${sent} dataset(s) to CouchDB.`
}

export async function pullFromCouch(): Promise<string> {
  await ensureDb()
  const res = await fetch(`${dbRoot()}/_all_docs?include_docs=true`, {
    headers: authHeader(),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Pull failed (${res.status}): ${text.slice(0, 120)}`)
  }
  const payload = (await res.json()) as {
    rows: { doc?: DatasetRecord & { type?: string; _id?: string; _rev?: string } }[]
  }
  const now = Date.now()
  let pulled = 0
  for (const row of payload.rows) {
    const doc = row.doc
    if (!doc || doc.type !== 'syncmfg.dataset') continue
    if (doc.expiresAt && doc.expiresAt <= now) continue
    const { _id: _a, _rev: _b, type: _c, ...rest } = doc as DatasetRecord & {
      _id?: string
      _rev?: string
      type?: string
    }
    if (!rest.id || !rest.table) continue
    saveDataset(rest)
    pulled += 1
  }
  purgeExpiredDatasets()
  return `Pulled ${pulled} dataset(s) from CouchDB (expired docs skipped).`
}

export async function testCouchConnection(): Promise<string> {
  const { couchUrl } = loadSettings()
  const res = await fetch(couchUrl.replace(/\/$/, ''), { headers: authHeader() })
  if (!res.ok) throw new Error(`Server responded ${res.status}`)
  const info = (await res.json()) as { couchdb?: string; version?: string }
  return `Connected to CouchDB ${info.version ?? ''} at ${couchUrl}`
}
