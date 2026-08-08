import { useEffect, useMemo, useState } from 'react'
import { numericColumnNames } from '../stats/column'
import { listDatasets } from '../storage/datasets'
import type { DatasetRecord } from '../data/types'

export function DatasetPicker({
  datasetId,
  column,
  onChange,
  allowManual = false,
}: {
  datasetId: string
  column: string
  onChange: (next: { datasetId: string; column: string; dataset?: DatasetRecord }) => void
  allowManual?: boolean
}) {
  const [datasets, setDatasets] = useState(() => listDatasets())

  useEffect(() => {
    setDatasets(listDatasets())
  }, [])

  const selected = datasets.find((d) => d.id === datasetId)
  const columns = useMemo(
    () => (selected ? numericColumnNames(selected.table) : []),
    [selected],
  )

  if (datasets.length === 0 && !allowManual) {
    return (
      <p className="form-error">
        No saved datasets yet. Go to Data, paste or upload a table, then save it.
      </p>
    )
  }

  return (
    <div className="dataset-picker">
      <div className="field-grid">
        <div>
          <label htmlFor="pick-dataset">Dataset</label>
          <select
            id="pick-dataset"
            value={datasetId}
            onChange={(e) => {
              const id = e.target.value
              const ds = datasets.find((d) => d.id === id)
              const cols = ds ? numericColumnNames(ds.table) : []
              onChange({
                datasetId: id,
                column: cols[0] ?? '',
                dataset: ds,
              })
            }}
          >
            <option value="">Select a saved dataset…</option>
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.table.rows.length} rows)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pick-column">Numeric column</label>
          <select
            id="pick-column"
            value={column}
            disabled={!selected}
            onChange={(e) =>
              onChange({ datasetId, column: e.target.value, dataset: selected })
            }
          >
            <option value="">Select column…</option>
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
