import type { AppView } from '../components/AppShell'

export function HomePage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  return (
    <div className="home">
      <section className="hero-block">
        <p className="eyebrow">Continuous improvement workbench</p>
        <h1>SYNCMFG</h1>
        <p className="hero-copy">
          Paste Excel data, run Lean Six Sigma analyses, and email or print a
          plain-English report — from home or any factory floor.
        </p>
        <div className="row actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => onNavigate('data')}
          >
            Bring data in
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('tools')}
          >
            Open tools
          </button>
        </div>
      </section>

      <section className="panel soft">
        <h2>What you can do</h2>
        <ol className="roadmap">
          <li>
            <strong>Load data</strong> — paste, upload, or install sample
            datasets.
          </li>
          <li>
            <strong>Visualize & control</strong> — hist/box/run, I-MR with
            Western Electric, X̄-R, compare columns.
          </li>
          <li>
            <strong>Decide</strong> — capability, Pareto, t-test, regression,
            Gage R&R, Monte Carlo.
          </li>
          <li>
            <strong>Share</strong> — email, print/PDF, optional server send +
            FoxHome CouchDB sync in Settings.
          </li>
        </ol>
      </section>
    </div>
  )
}
