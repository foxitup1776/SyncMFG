import type { AppView } from '../components/AppShell'

export function HomePage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  return (
    <div className="home">
      <section className="hero-block">
        <p className="eyebrow">Continuous improvement workbench</p>
        <h1>SYNCMFG</h1>
        <p className="hero-copy">
          Paste Excel data, run Lean Six Sigma analyses, and email a
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
        <h2>Ready to use</h2>
        <ol className="roadmap">
          <li>
            <strong>Data + summary</strong> — paste or upload; auto-delete after
            30 days on this device.
          </li>
          <li>
            <strong>Histogram, box plot, run chart</strong> — first look at
            shape and order.
          </li>
          <li>
            <strong>I-MR control chart</strong> — is this batch stable?
          </li>
          <li>
            <strong>Process capability</strong> — Cp / Cpk vs customer limits.
          </li>
          <li>
            <strong>Time-study Monte Carlo</strong> — step times in, risk out.
          </li>
        </ol>
      </section>
    </div>
  )
}
