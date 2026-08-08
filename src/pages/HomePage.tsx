import type { AppView } from '../components/AppShell'

export function HomePage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  return (
    <div className="home">
      <section className="hero-block">
        <p className="eyebrow">Continuous improvement workbench</p>
        <h1>SYNCMFG</h1>
        <p className="hero-copy">
          Solve problems with DMAIC tools and prove them with stats — then email
          or print a plain-English A3-style report.
        </p>
        <div className="row actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => onNavigate('projects')}
          >
            Start a DMAIC project
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('data')}
          >
            Bring data in
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('tools')}
          >
            All tools
          </button>
        </div>
      </section>

      <section className="panel soft">
        <h2>Suggested flow</h2>
        <ol className="roadmap">
          <li>
            <strong>Define</strong> — project charter + SIPOC in Projects.
          </li>
          <li>
            <strong>Measure</strong> — paste data; pin I-MR / capability / Gage
            reports.
          </li>
          <li>
            <strong>Analyze</strong> — Fishbone → 5 Whys → FMEA; prove with
            Pareto, t-test, regression.
          </li>
          <li>
            <strong>Improve & Control</strong> — countermeasures, Monte Carlo,
            control plan.
          </li>
        </ol>
      </section>
    </div>
  )
}
