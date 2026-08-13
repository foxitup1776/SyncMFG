import type { AppView } from '../components/AppShell'

export function HomePage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  return (
    <div className="home">
      <section className="hero-block">
        <p className="eyebrow">Continuous improvement workbench</p>
        <h1>SYNCMFG</h1>
        <p className="hero-copy">
          Lean and Six Sigma on the floor — without needing Minitab or advanced
          math. Operators and CI leads: pick a situation (scrap, red flag,
          changeover, yield, OEE…) and follow the walkthrough.
        </p>
        <div className="row actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => onNavigate('solve')}
          >
            Describe a problem
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('tools')}
          >
            Choose a method
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('data')}
          >
            Bring data in
          </button>
        </div>
      </section>

      <section className="panel soft">
        <h2>How SYNCMFG walks you through it</h2>
        <ol className="roadmap">
          <li>
            <strong>What is the problem?</strong> Write it and tap situations that
            fit (Solve) — or open Methods and pick a visual pathway.
          </li>
          <li>
            <strong>Which method?</strong> Hypothesis testing, predictive (R²),
            stability, capability, vital few — each with quotes from your teaching
            notes and a floor example.
          </li>
          <li>
            <strong>How do I run it?</strong> Step-by-step into the calculator,
            plain-English report, pin into a DMAIC project.
          </li>
          <li>
            <strong>Keep the story together</strong> so the plant sees proof, not
            just a chart dump.
          </li>
        </ol>
      </section>
    </div>
  )
}
