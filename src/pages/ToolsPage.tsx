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
    blurb: 'Paste Excel or upload CSV/XLSX, then save for 30 days on this device.',
  },
  {
    id: 'visual',
    name: 'Histogram / Box / Run',
    status: 'Ready',
    blurb: 'Shape, outliers, and trends over the order you entered.',
  },
  {
    id: 'imr',
    name: 'I-MR control chart',
    status: 'Ready',
    blurb: 'Stability check for one measurement column from a pasted batch.',
  },
  {
    id: 'capability',
    name: 'Process capability',
    status: 'Ready',
    blurb: 'Cp, Cpk, Pp, Ppk against your customer spec limits.',
  },
  {
    id: 'montecarlo',
    name: 'Time-study Monte Carlo',
    status: 'Ready',
    blurb: 'Enter step times, simulate thousands of runs, see miss-target risk.',
  },
]

export function ToolsPage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  return (
    <div className="tools-page">
      <section className="panel">
        <h2>Analysis tools</h2>
        <p className="lede">
          Each tool ends with a plain-English report you can email to any
          address, download, or copy — works from factory Wi‑Fi or home.
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
