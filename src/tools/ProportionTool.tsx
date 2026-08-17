import { useMemo } from 'react'
import type { AppView } from '../components/AppShell'
import { InterpretBanner, NextStepCta } from '../components/InterpretBanner'
import { PlainReport } from '../components/PlainReport'
import { ToolGuidePanel } from '../components/ToolGuidePanel'
import type { AnalysisReport } from '../data/types'
import { usePersistedState } from '../hooks/usePersistedState'
import { fmt } from '../stats/descriptive'
import {
  interpretChiSquare,
  interpretOneProportion,
  interpretTwoProportion,
} from '../stats/interpretations'
import {
  chiSquareContingency,
  oneProportionTest,
  twoProportionTest,
} from '../stats/proportions'

type Mode = 'one' | 'two' | 'chi'

const MODES: { id: Mode; label: string; hint: string }[] = [
  {
    id: 'one',
    label: 'One rate vs a target',
    hint: 'We ran 3.5% scrap against a 2% goal — is that a real miss or a noisy week?',
  },
  {
    id: 'two',
    label: 'Two rates',
    hint: 'Shift 1 vs Shift 2, supplier A vs supplier B — both counted pass/fail.',
  },
  {
    id: 'chi',
    label: 'Defect mix by group',
    hint: 'Do shifts (or lines, or suppliers) fail for different reasons — not just more often?',
  },
]

const EXAMPLE_MATRIX = {
  rows: ['Burnt edge', 'Undersize', 'Broken'],
  cols: ['Shift 1', 'Shift 2'],
  cells: [
    [42, 18],
    [12, 31],
    [9, 11],
  ],
}

export function ProportionTool({
  onNavigate,
}: { onNavigate?: (v: AppView) => void } = {}) {
  const [mode, setMode] = usePersistedState<Mode>('tool.prop.mode', 'one')

  const [x1Raw, setX1Raw] = usePersistedState('tool.prop.x1', '18')
  const [n1Raw, setN1Raw] = usePersistedState('tool.prop.n1', '500')
  const [targetRaw, setTargetRaw] = usePersistedState('tool.prop.target', '2')

  const [x2Raw, setX2Raw] = usePersistedState('tool.prop.x2', '8')
  const [n2Raw, setN2Raw] = usePersistedState('tool.prop.n2', '480')
  const [label1, setLabel1] = usePersistedState('tool.prop.label1', 'Shift 1')
  const [label2, setLabel2] = usePersistedState('tool.prop.label2', 'Shift 2')

  const [rowLabels, setRowLabels] = usePersistedState<string[]>(
    'tool.prop.chiRows',
    EXAMPLE_MATRIX.rows,
  )
  const [colLabels, setColLabels] = usePersistedState<string[]>(
    'tool.prop.chiCols',
    EXAMPLE_MATRIX.cols,
  )
  const [cells, setCells] = usePersistedState<number[][]>(
    'tool.prop.chiCells',
    EXAMPLE_MATRIX.cells,
  )

  const one = useMemo(
    () =>
      oneProportionTest(
        Number(x1Raw),
        Number(n1Raw),
        Number(targetRaw) / 100,
      ),
    [x1Raw, n1Raw, targetRaw],
  )

  const two = useMemo(
    () =>
      twoProportionTest(
        Number(x1Raw),
        Number(n1Raw),
        Number(x2Raw),
        Number(n2Raw),
      ),
    [x1Raw, n1Raw, x2Raw, n2Raw],
  )

  const chi = useMemo(
    () => chiSquareContingency(rowLabels, colLabels, cells),
    [rowLabels, colLabels, cells],
  )

  const oneInterp = useMemo(
    () =>
      one
        ? interpretOneProportion({
            pValue: one.pValue,
            pHatPct: one.pHat * 100,
            targetPct: one.p0 * 100,
            ciLowPct: one.ciLow * 100,
            ciHighPct: one.ciHigh * 100,
            higher: one.higher,
            largeSampleOk: one.largeSampleOk,
          })
        : null,
    [one],
  )

  const twoInterp = useMemo(
    () =>
      two
        ? interpretTwoProportion({
            pValue: two.pValue,
            p1Pct: two.p1 * 100,
            p2Pct: two.p2 * 100,
            ciLowPct: two.ciLow * 100,
            ciHighPct: two.ciHigh * 100,
            label1,
            label2,
            largeSampleOk: two.largeSampleOk,
          })
        : null,
    [two, label1, label2],
  )

  const chiInterp = useMemo(
    () =>
      chi
        ? interpretChiSquare({
            pValue: chi.pValue,
            chiSq: chi.chiSq,
            df: chi.df,
            cramersV: chi.cramersV,
            topCell: chi.topCells[0] ?? null,
            lowExpectedWarning: chi.lowExpectedWarning,
          })
        : null,
    [chi],
  )

  const report: AnalysisReport | null = useMemo(() => {
    if (mode === 'one') {
      if (!one) return null
      return {
        title: 'One rate vs a target',
        summary: `${one.x} of ${one.n} failed = ${fmt(one.pHat * 100, 2)}%, against a target of ${fmt(one.p0 * 100, 2)}%. p = ${fmt(one.pValue, 4)}.`,
        bullets: [
          `${fmt(one.confidencePct, 0)}% confidence range for the true rate: ${fmt(one.ciLow * 100, 2)}% to ${fmt(one.ciHigh * 100, 2)}%.`,
          one.ciLow <= one.p0 && one.p0 <= one.ciHigh
            ? 'That range still includes your target, so you cannot honestly claim the target was beaten or missed from this sample alone.'
            : 'The target sits outside that range, so the difference from target looks real, not noise.',
          `z = ${fmt(one.z, 3)} — how many standard errors your measured rate sits from the target.`,
          one.largeSampleOk
            ? 'Sample is big enough for the normal approximation (at least about 5 expected each way).'
             : 'Caution: fewer than about 5 expected failures (or passes). Inspect more pieces before acting on this p-value.',
          'Next: if the rate is worse than target, chart it over time so you know whether it is one bad day or the new normal.',
        ],
        termsUsed: ['proportion', 'p-value', 'confidence interval', 'sample'],
      }
    }
    if (mode === 'two') {
      if (!two) return null
      return {
        title: 'Two rates side by side',
        summary: `${label1}: ${two.x1}/${two.n1} = ${fmt(two.p1 * 100, 2)}%. ${label2}: ${two.x2}/${two.n2} = ${fmt(two.p2 * 100, 2)}%. Gap = ${fmt(two.diff * 100, 2)} percentage points, p = ${fmt(two.pValue, 4)}.`,
        bullets: [
          `${fmt(two.confidencePct, 0)}% confidence range for the gap: ${fmt(two.ciLow * 100, 2)} to ${fmt(two.ciHigh * 100, 2)} percentage points.`,
          two.ciLow <= 0 && two.ciHigh >= 0
            ? 'That range crosses zero, which means “no real difference” is still a live possibility. Do not re-staff a line on this evidence.'
            : 'The range does not cross zero, so one group really is running worse.',
          two.ratio != null
            ? `Put another way, ${label1} is running about ${fmt(two.ratio, 2)}× the rate of ${label2}.`
            : 'Second group had zero failures, so a ratio is not meaningful.',
          two.largeSampleOk
            ? 'Counts are large enough for the normal approximation.'
            : 'Caution: expected failures under about 5 in a group — collect more before quoting this.',
          'Next: if the gap is real, Fishbone what differs between the two groups (people, setup, material lot, standard work).',
        ],
        termsUsed: ['proportion', 'p-value', 'confidence interval'],
      }
    }
    if (!chi) return null
    return {
      title: 'Defect mix by group (chi-square)',
      summary: `χ² = ${fmt(chi.chiSq, 2)} on ${chi.df} degrees of freedom across ${chi.total.toLocaleString()} counted items, p = ${fmt(chi.pValue, 4)}.`,
      bullets: [
        chi.pValue < 0.05
          ? 'The mix of reasons is not the same across groups — the groups fail differently, not just more or less often.'
          : 'The mix of reasons looks the same across groups within normal random variation.',
        `Link strength (Cramér’s V) = ${fmt(chi.cramersV, 2)} on a 0–1 scale, where under 0.1 is barely there and above 0.3 is strong.`,
        ...chi.topCells.map(
          (c) =>
            `${c.row} in ${c.col}: ${c.observed} seen vs ${fmt(c.expected, 1)} expected (${fmt(c.contribution, 2)} of the total χ²).`,
        ),
        chi.lowExpectedWarning
          ? `Smallest expected count is ${fmt(chi.minExpected, 2)} — under 5. Combine rare categories into “Other” or collect more data before you quote this.`
          : 'All expected counts are at least 5, so the test is on solid ground.',
        'Chi-square tells you the mix differs; it does not tell you why. Pareto each group separately, then Fishbone the reason that jumps.',
      ],
      termsUsed: ['chi-square', 'p-value', 'attribute data', 'pareto'],
    }
  }, [mode, one, two, chi, label1, label2])

  function fillExample() {
    if (mode === 'one') {
      setX1Raw('18')
      setN1Raw('500')
      setTargetRaw('2')
    } else if (mode === 'two') {
      setLabel1('Shift 1')
      setLabel2('Shift 2')
      setX1Raw('18')
      setN1Raw('500')
      setX2Raw('8')
      setN2Raw('480')
    } else {
      setRowLabels(EXAMPLE_MATRIX.rows)
      setColLabels(EXAMPLE_MATRIX.cols)
      setCells(EXAMPLE_MATRIX.cells)
    }
  }

  const matrixStyle = {
    gridTemplateColumns: `minmax(7rem, 1.4fr) repeat(${colLabels.length}, minmax(4.5rem, 1fr)) auto`,
  }

  return (
    <div className="tool-view">
      <ToolGuidePanel toolId="proportions" />
      <section className="panel">
        <h2>Are these rates really different?</h2>
        <p className="lede">
          Hypothesis tests for counted data — scrap rates, pass/fail tallies, and
          defect mixes. No measurements needed.
        </p>
        <div className="row actions">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={mode === m.id ? 'btn primary' : 'btn secondary'}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
          <button type="button" className="btn secondary" onClick={fillExample}>
            Fill example
          </button>
        </div>
        <p className="meta">{MODES.find((m) => m.id === mode)?.hint}</p>

        {mode === 'one' ? (
          <div className="form-grid">
            <label>
              Bad pieces found
              <input
                type="number"
                min={0}
                value={x1Raw}
                onChange={(e) => setX1Raw(e.target.value)}
              />
            </label>
            <label>
              Pieces inspected
              <input
                type="number"
                min={1}
                value={n1Raw}
                onChange={(e) => setN1Raw(e.target.value)}
              />
            </label>
            <label>
              Target / historical rate %
              <input
                type="number"
                min={0.01}
                max={99.99}
                step="any"
                value={targetRaw}
                onChange={(e) => setTargetRaw(e.target.value)}
              />
            </label>
          </div>
        ) : null}

        {mode === 'two' ? (
          <>
            <div className="form-grid">
              <label>
                Group 1 name
                <input
                  value={label1}
                  onChange={(e) => setLabel1(e.target.value)}
                />
              </label>
              <label>
                Group 1 bad pieces
                <input
                  type="number"
                  min={0}
                  value={x1Raw}
                  onChange={(e) => setX1Raw(e.target.value)}
                />
              </label>
              <label>
                Group 1 inspected
                <input
                  type="number"
                  min={1}
                  value={n1Raw}
                  onChange={(e) => setN1Raw(e.target.value)}
                />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Group 2 name
                <input
                  value={label2}
                  onChange={(e) => setLabel2(e.target.value)}
                />
              </label>
              <label>
                Group 2 bad pieces
                <input
                  type="number"
                  min={0}
                  value={x2Raw}
                  onChange={(e) => setX2Raw(e.target.value)}
                />
              </label>
              <label>
                Group 2 inspected
                <input
                  type="number"
                  min={1}
                  value={n2Raw}
                  onChange={(e) => setN2Raw(e.target.value)}
                />
              </label>
            </div>
          </>
        ) : null}

        {mode === 'chi' ? (
          <>
            <p className="meta">
              Rows are the defect reasons; columns are the groups you want to
              compare. Enter plain counts — the tool works out what each cell
              should have been if the group made no difference.
            </p>
            <div className="matrix-edit">
              <div className="matrix-edit-row head" style={matrixStyle}>
                <span>Reason</span>
                {colLabels.map((c, j) => (
                  <input
                    key={j}
                    value={c}
                    placeholder={`Group ${j + 1}`}
                    onChange={(e) =>
                      setColLabels((prev) =>
                        prev.map((v, k) => (k === j ? e.target.value : v)),
                      )
                    }
                  />
                ))}
                <span />
              </div>
              {rowLabels.map((r, i) => (
                <div key={i} className="matrix-edit-row" style={matrixStyle}>
                  <input
                    value={r}
                    placeholder={`Reason ${i + 1}`}
                    onChange={(e) =>
                      setRowLabels((prev) =>
                        prev.map((v, k) => (k === i ? e.target.value : v)),
                      )
                    }
                  />
                  {colLabels.map((_, j) => (
                    <input
                      key={j}
                      type="number"
                      min={0}
                      value={cells[i]?.[j] ?? 0}
                      onChange={(e) =>
                        setCells((prev) =>
                          prev.map((row, k) =>
                            k === i
                              ? row.map((v, l) =>
                                  l === j ? Number(e.target.value) || 0 : v,
                                )
                              : row,
                          ),
                        )
                      }
                    />
                  ))}
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      setRowLabels((prev) => prev.filter((_, k) => k !== i))
                      setCells((prev) => prev.filter((_, k) => k !== i))
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="row actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setRowLabels((prev) => [...prev, ''])
                  setCells((prev) => [...prev, colLabels.map(() => 0)])
                }}
              >
                Add reason
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setColLabels((prev) => [...prev, ''])
                  setCells((prev) => prev.map((row) => [...row, 0]))
                }}
              >
                Add group
              </button>
              {colLabels.length > 2 ? (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setColLabels((prev) => prev.slice(0, -1))
                    setCells((prev) => prev.map((row) => row.slice(0, -1)))
                  }}
                >
                  Remove last group
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </section>

      {mode === 'one' && one ? (
        <>
          {oneInterp ? (
            <InterpretBanner
              title={oneInterp.title}
              plain={oneInterp.plain}
              meta={oneInterp.meta}
            >
              <NextStepCta
                label="Chart this rate over time"
                view="attribute"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>Measured rate</span>
              <strong>{fmt(one.pHat * 100, 2)}%</strong>
            </div>
            <div>
              <span>Target</span>
              <strong>{fmt(one.p0 * 100, 2)}%</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{fmt(one.pValue, 4)}</strong>
            </div>
            <div>
              <span>{fmt(one.confidencePct, 0)}% range</span>
              <strong>
                {fmt(one.ciLow * 100, 2)}–{fmt(one.ciHigh * 100, 2)}%
              </strong>
            </div>
          </div>
        </>
      ) : null}

      {mode === 'two' && two ? (
        <>
          {twoInterp ? (
            <InterpretBanner
              title={twoInterp.title}
              plain={twoInterp.plain}
              meta={twoInterp.meta}
            >
              <NextStepCta
                label={
                  two.pValue < 0.05
                    ? 'Open Fishbone on what differs'
                    : 'Plan a bigger sample'
                }
                view={two.pValue < 0.05 ? 'fishbone' : 'samplesize'}
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>{label1 || 'Group 1'}</span>
              <strong>{fmt(two.p1 * 100, 2)}%</strong>
            </div>
            <div>
              <span>{label2 || 'Group 2'}</span>
              <strong>{fmt(two.p2 * 100, 2)}%</strong>
            </div>
            <div>
              <span>Gap</span>
              <strong>{fmt(two.diff * 100, 2)} pts</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{fmt(two.pValue, 4)}</strong>
            </div>
          </div>
        </>
      ) : null}

      {mode === 'chi' && chi ? (
        <>
          {chiInterp ? (
            <InterpretBanner
              title={chiInterp.title}
              plain={chiInterp.plain}
              meta={chiInterp.meta}
            >
              <NextStepCta
                label="Open Pareto per group"
                view="pareto"
                onNavigate={onNavigate}
              />
            </InterpretBanner>
          ) : null}
          <div className="stat-strip">
            <div>
              <span>Chi-square</span>
              <strong>{fmt(chi.chiSq, 2)}</strong>
            </div>
            <div>
              <span>Degrees of freedom</span>
              <strong>{chi.df}</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{fmt(chi.pValue, 4)}</strong>
            </div>
            <div>
              <span>Link strength (V)</span>
              <strong>{fmt(chi.cramersV, 2)}</strong>
            </div>
          </div>
          <section className="panel soft">
            <h3 className="subhead">Expected vs seen (biggest mismatches)</h3>
            <ul className="period-list">
              {chi.topCells.map((c) => (
                <li key={`${c.row}-${c.col}`}>
                  <strong>
                    {c.row} · {c.col}
                  </strong>
                  <span>
                    Seen {c.observed} · expected {fmt(c.expected, 1)} ·{' '}
                    {c.observed > c.expected ? 'over' : 'under'} by{' '}
                    {fmt(Math.abs(c.observed - c.expected), 1)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {report ? (
        <PlainReport
          report={report}
          sourceTool={
            mode === 'chi'
              ? 'Chi-square (defect mix)'
              : mode === 'two'
                ? '2-proportion test'
                : '1-proportion test'
          }
          defaultPhase="analyze"
        />
      ) : (
        <p className="form-error">
          {mode === 'chi'
            ? 'Need at least 2 reasons and 2 groups, with every row and column adding up to more than zero.'
            : 'Bad pieces must be between zero and the number inspected, and inspected must be greater than zero.'}
        </p>
      )}
    </div>
  )
}
