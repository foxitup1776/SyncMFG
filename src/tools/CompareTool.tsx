import { useMemo } from 'react'
import { PlainReport } from '../components/PlainReport'
import { BoxPlotChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset, listDatasets } from '../storage/datasets'
import { numericColumn, numericColumnNames } from '../stats/column'
import { fmt, mean, median, quartiles, sampleStdDev } from '../stats/descriptive'

export function CompareTool() {
  const [datasetId, setDatasetId] = usePersistedState('tool.compare.dataset', '')
  const [selected, setSelected] = usePersistedState<string[]>(
    'tool.compare.cols',
    [],
  )

  const datasets = listDatasets()
  const dataset = datasetId ? getDataset(datasetId) : undefined
  const cols = dataset ? numericColumnNames(dataset.table) : []

  const boxes = useMemo(() => {
    if (!dataset) return []
    return selected
      .map((name) => {
        const values = numericColumn(dataset.table, name)
        const box = quartiles(values)
        if (!box || values.length < 2) return null
        return {
          name,
          values,
          box,
          mean: mean(values),
          median: median(values),
          std: sampleStdDev(values),
        }
      })
      .filter(Boolean) as {
      name: string
      values: number[]
      box: NonNullable<ReturnType<typeof quartiles>>
      mean: number | null
      median: number | null
      std: number | null
    }[]
  }, [dataset, selected])

  const report: AnalysisReport | null = useMemo(() => {
    if (!dataset || boxes.length < 2) return null
    const ranked = [...boxes].sort(
      (a, b) => (b.mean ?? 0) - (a.mean ?? 0),
    )
    return {
      title: `Compare groups — ${dataset.name}`,
      summary: `Side-by-side box plots for ${boxes.length} columns. Highest average: “${ranked[0].name}” (${fmt(ranked[0].mean)}). Lowest: “${ranked[ranked.length - 1].name}” (${fmt(ranked[ranked.length - 1].mean)}).`,
      bullets: boxes.map(
        (b) =>
          `${b.name}: n=${b.values.length}, average ${fmt(b.mean)}, median ${fmt(b.median)}, stdev ${fmt(b.std)}, outliers ${b.box.outliers.length}.`,
      ),
      termsUsed: ['box plot', 'median', 'mean', 'outlier'],
    }
  }, [dataset, boxes])

  function toggle(col: string) {
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    )
  }

  return (
    <div className="tool-view">
      <section className="panel">
        <h2>Multi-column compare</h2>
        <p className="lede">
          Pick two or more numeric columns (shifts, suppliers, lines) and compare
          their box plots.
        </p>
        <label>Dataset</label>
        <select
          value={datasetId}
          onChange={(e) => {
            const id = e.target.value
            setDatasetId(id)
            const names = getDataset(id)
              ? numericColumnNames(getDataset(id)!.table)
              : []
            setSelected(names.slice(0, 2))
          }}
        >
          <option value="">Select…</option>
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <div className="check-grid">
          {cols.map((c) => (
            <label key={c} className="check-item">
              <input
                type="checkbox"
                checked={selected.includes(c)}
                onChange={() => toggle(c)}
              />
              {c}
            </label>
          ))}
        </div>
      </section>

      {boxes.length >= 2 ? (
        <>
          <div className="chart-grid">
            {boxes.map((b) => (
              <div key={b.name}>
                <h3 className="subhead">{b.name}</h3>
                <BoxPlotChart box={b.box} />
              </div>
            ))}
          </div>
          {report ? <PlainReport report={report} /> : null}
        </>
      ) : datasetId ? (
        <p className="form-error">Select at least two numeric columns.</p>
      ) : null}
    </div>
  )
}
