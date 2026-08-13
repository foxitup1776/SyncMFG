import { useMemo } from 'react'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import { BoxPlotChart } from '../components/charts/StatCharts'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { getDataset, listDatasets } from '../storage/datasets'
import { oneWayAnova } from '../stats/anova'
import { numericColumn, numericColumnNames } from '../stats/column'
import { fmt, quartiles } from '../stats/descriptive'

export function AnovaTool() {
  const [datasetId, setDatasetId] = usePersistedState('tool.anova.dataset', '')
  const [selected, setSelected] = usePersistedState<string[]>(
    'tool.anova.cols',
    [],
  )

  const datasets = listDatasets()
  const dataset = datasetId ? getDataset(datasetId) : undefined
  const cols = dataset ? numericColumnNames(dataset.table) : []

  const groups = useMemo(() => {
    if (!dataset) return []
    return selected.map((name) => ({
      name,
      values: numericColumn(dataset.table, name),
    }))
  }, [dataset, selected])

  const result = useMemo(() => oneWayAnova(groups), [groups])
  const boxes = useMemo(
    () =>
      groups
        .map((g) => ({ name: g.name, box: quartiles(g.values) }))
        .filter((g) => g.box),
    [groups],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (!result || !dataset) return null
    const significant = result.pValue < 0.05
    const ranked = result.groupNames
      .map((name, i) => ({ name, mean: result.groupMeans[i] }))
      .sort((a, b) => b.mean - a.mean)
    return {
      title: `Is at least one group different? — ${dataset.name}`,
      summary: significant
        ? `At least one group looks truly different from the others (not just luck). Chance of seeing gaps this big if all groups were the same: ${fmt(result.pValue, 4)}.`
        : `We do not have strong proof that these groups differ. The gaps could still be noise (p = ${fmt(result.pValue, 4)}).`,
      bullets: [
        `Compared ${result.groupNames.length} groups (${result.groupNs.reduce((a, b) => a + b, 0)} total values).`,
        `Highest average: ${ranked[0].name} (${fmt(ranked[0].mean)}). Lowest: ${ranked[ranked.length - 1].name} (${fmt(ranked[ranked.length - 1].mean)}).`,
        `F-score (between-group spread vs within-group noise) = ${fmt(result.f, 3)}.`,
        significant
          ? 'Next: dig into which group stands out (box plots + process knowledge), then confirm with a focused two-group check if needed.'
          : 'Next: collect more data, or accept that these groups may not truly differ.',
        'Quote from your notes: “ANOVA… compare the averages of three or more groups to see if at least one group is significantly different.”',
      ],
      termsUsed: ['p-value', 'anova', 'mean', '2-sample t-test'],
    }
  }, [result, dataset])

  function toggle(col: string) {
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    )
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="anova" />
      <section className="panel">
        <h2>Is at least one group different?</h2>
        <p className="lede">
          For three or more groups (shifts, ovens, suppliers). Pick at least
          three numeric columns.
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
            setSelected(names.slice(0, 3))
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

      {result ? (
        <>
          <div className="stat-strip">
            <div>
              <span>Groups</span>
              <strong>{result.groupNames.length}</strong>
            </div>
            <div>
              <span>F</span>
              <strong>{fmt(result.f)}</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{fmt(result.pValue, 4)}</strong>
            </div>
            <div>
              <span>Overall avg</span>
              <strong>{fmt(result.grandMean)}</strong>
            </div>
          </div>
          <div className="chart-grid">
            {boxes.map((b) =>
              b.box ? (
                <div key={b.name}>
                  <h3 className="subhead">{b.name}</h3>
                  <BoxPlotChart box={b.box} />
                </div>
              ) : null,
            )}
          </div>
          {report ? (
            <PlainReport
              report={report}
              sourceTool="ANOVA"
              defaultPhase="analyze"
            />
          ) : null}
        </>
      ) : datasetId ? (
        <p className="form-error">
          Select at least three numeric columns with 2+ values each.
        </p>
      ) : null}
    </div>
  )
}
