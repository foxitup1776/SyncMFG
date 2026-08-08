import type { AppView } from '../components/AppShell'

const TOOLS: {
  id: AppView
  name: string
  status: string
  blurb: string
}[] = [
  {
    id: 'data',
    name: 'Data ingest & summary',
    status: 'Ready',
    blurb: 'Paste Excel / upload CSV·XLSX, sample datasets, 30-day save.',
  },
  {
    id: 'visual',
    name: 'Histogram / Box / Run',
    status: 'Ready',
    blurb: 'Shape, outliers, and trends over entry order.',
  },
  {
    id: 'compare',
    name: 'Multi-column compare',
    status: 'Ready',
    blurb: 'Side-by-side box plots for shifts, suppliers, or lines.',
  },
  {
    id: 'imr',
    name: 'I-MR + Western Electric',
    status: 'Ready',
    blurb: 'Stability for one column, including run rules.',
  },
  {
    id: 'xbarr',
    name: 'X̄-R control chart',
    status: 'Ready',
    blurb: 'When Excel rows are already subgroups of 2–10.',
  },
  {
    id: 'capability',
    name: 'Process capability',
    status: 'Ready',
    blurb: 'Cp, Cpk, Pp, Ppk against customer specs.',
  },
  {
    id: 'pareto',
    name: 'Pareto chart',
    status: 'Ready',
    blurb: 'Vital-few ranking of defects or causes.',
  },
  {
    id: 'ttest',
    name: '2-sample t-test',
    status: 'Ready',
    blurb: 'Did group A really differ from group B?',
  },
  {
    id: 'regression',
    name: 'Scatter & regression',
    status: 'Ready',
    blurb: 'Relationship + R² in plain English.',
  },
  {
    id: 'gage',
    name: 'Gage R&R (lite)',
    status: 'Ready',
    blurb: 'Is the measurement system trustworthy?',
  },
  {
    id: 'montecarlo',
    name: 'Time-study Monte Carlo',
    status: 'Ready',
    blurb: 'Step times → risk and likely total time.',
  },
]

export function ToolsPage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  return (
    <div className="tools-page">
      <section className="panel">
        <h2>Analysis tools</h2>
        <p className="lede">
          Each tool remembers your last dataset choices, ends with a
          plain-English report, and lets you email, print/PDF, or sync later
          from Settings.
        </p>
        <ul className="tool-cards">
          {TOOLS.map((t) => (
            <li key={t.name}>
              <div className="tool-head">
                <h3>{t.name}</h3>
                <span className={`status status-${t.status.toLowerCase()}`}>
                  {t.status}
                </span>
              </div>
              <p>{t.blurb}</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => onNavigate(t.id)}
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
