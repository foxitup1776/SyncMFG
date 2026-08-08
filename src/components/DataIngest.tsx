import { useMemo, useState, type ChangeEvent } from 'react'
import { parseFile, parsePastedText } from '../data/parseTable'
import { buildDataReport, summarizeColumns } from '../data/summarize'
import type { DataTable } from '../data/types'
import { installSampleDatasets } from '../data/samples'
import {
  daysUntilExpiry,
  deleteDataset,
  listDatasets,
  saveDataset,
} from '../storage/datasets'
import { PlainReport } from './PlainReport'

function fmt(n: number | null): string {
  if (n === null) return '—'
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(3)
}

export function DataIngest() {
  const [paste, setPaste] = useState('')
  const [table, setTable] = useState<DataTable | null>(null)
  const [source, setSource] = useState<'paste' | 'csv' | 'xlsx'>('paste')
  const [name, setName] = useState('Untitled dataset')
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [library, setLibrary] = useState(() => listDatasets())

  const summaries = useMemo(
    () => (table ? summarizeColumns(table) : []),
    [table],
  )

  const report = useMemo(() => {
    if (!table) return null
    const label =
      source === 'paste'
        ? 'your paste (Excel copy)'
        : source === 'csv'
          ? 'a CSV file'
          : 'an Excel file'
    return buildDataReport(table, summaries, label)
  }, [table, summaries, source])

  function applyTable(next: DataTable, nextSource: 'paste' | 'csv' | 'xlsx') {
    if (next.headers.length === 0) {
      setError('No usable rows found. Paste a table or pick a file with data.')
      setTable(null)
      return
    }
    setError('')
    setTable(next)
    setSource(nextSource)
    setSavedId(null)
  }

  function handleParsePaste() {
    applyTable(parsePastedText(paste), 'paste')
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const next = await parseFile(file)
      const kind = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx'
      setName(file.name.replace(/\.[^.]+$/, ''))
      applyTable(next, kind)
    } catch {
      setError('Could not read that file. Try CSV or a simple Excel sheet.')
    }
    e.target.value = ''
  }

  function handleSave() {
    if (!table) return
    const record = saveDataset({
      id: savedId ?? undefined,
      name: name.trim() || 'Untitled dataset',
      table,
      source,
    })
    setSavedId(record.id)
    setLibrary(listDatasets())
  }

  function handleLoad(id: string) {
    const record = library.find((d) => d.id === id)
    if (!record) return
    setTable(record.table)
    setName(record.name)
    setSource(record.source)
    setSavedId(record.id)
    setError('')
    setPaste('')
  }

  function handleDelete(id: string) {
    deleteDataset(id)
    setLibrary(listDatasets())
    if (savedId === id) setSavedId(null)
  }

  return (
    <div className="data-ingest">
      <section className="panel">
        <h2>Bring data in</h2>
        <p className="lede">
          Copy a range from Excel and paste it below, or upload a CSV / Excel
          file. Math runs in this browser so it works on any factory Wi‑Fi.
          Saved tables stay on this device for up to 30 days, then auto-delete.
        </p>

        <label htmlFor="dataset-name">Dataset name</label>
        <input
          id="dataset-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="paste-area">Paste from Excel</label>
        <textarea
          id="paste-area"
          rows={8}
          placeholder="Select cells in Excel → Copy → Paste here"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
        />
        <div className="row actions">
          <button type="button" className="btn primary" onClick={handleParsePaste}>
            Read pasted table
          </button>
          <label className="btn secondary file-btn">
            Upload CSV / Excel
            <input
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFile}
              hidden
            />
          </label>
          {table ? (
            <button type="button" className="btn secondary" onClick={handleSave}>
              Save locally (30 days)
            </button>
          ) : null}
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              const names = installSampleDatasets()
              setLibrary(listDatasets())
              setError('')
              setName(names[0] ?? 'Sample dataset')
            }}
          >
            Load sample datasets
          </button>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {library.length > 0 ? (
        <section className="panel">
          <h2>Saved on this device</h2>
          <p className="lede">
            Datasets auto-delete 30 days after they were saved.
          </p>
          <ul className="dataset-list">
            {library.map((d) => (
              <li key={d.id}>
                <div>
                  <strong>{d.name}</strong>
                  <span className="meta">
                    {d.table.rows.length} rows · {daysUntilExpiry(d)} days left
                  </span>
                </div>
                <div className="row">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => handleLoad(d.id)}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="btn ghost danger"
                    onClick={() => handleDelete(d.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {table && report ? (
        <>
          <section className="panel">
            <h2>Preview</h2>
            <p className="lede">
              Showing up to 20 of {table.rows.length} rows. Scroll sideways on
              phone if needed.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {table.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.slice(0, 20).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell === null ? '' : String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="subhead">Numeric column snapshot</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Count</th>
                    <th>Average</th>
                    <th>Median</th>
                    <th>Std. dev.</th>
                    <th>Min</th>
                    <th>Max</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries
                    .filter((s) => s.numericCount > 0)
                    .map((s) => (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        <td>{s.numericCount}</td>
                        <td>{fmt(s.mean)}</td>
                        <td>{fmt(s.median)}</td>
                        <td>{fmt(s.stdDev)}</td>
                        <td>{fmt(s.min)}</td>
                        <td>{fmt(s.max)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <PlainReport report={report} />
        </>
      ) : null}
    </div>
  )
}
