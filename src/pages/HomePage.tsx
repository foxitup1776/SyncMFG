import type { AppView } from '../components/AppShell'

export function HomePage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  return (
    <div className="home">
      <section className="hero-block">
        <p className="eyebrow">Continuous improvement workbench</p>
        <h1>SYNCMFG</h1>
        <p className="hero-copy">
          Start with the problem in plain language. We’ll suggest tools that fit —
          then walk you through what each one does and how to use it.
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
            onClick={() => onNavigate('data')}
          >
            Bring data in
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onNavigate('tools')}
          >
            Browse tools
          </button>
        </div>
      </section>

      <section className="panel soft">
        <h2>How SYNCMFG walks you through it</h2>
        <ol className="roadmap">
          <li>
            <strong>What is the problem?</strong> Write it and tap situations that
            fit (Solve).
          </li>
          <li>
            <strong>Which tools help?</strong> See suggestions as everyday
            questions, not jargon first.
          </li>
          <li>
            <strong>How do I use the tool?</strong> Each tool opens with a short
            guide, then the working screen.
          </li>
          <li>
            <strong>Keep the story together</strong> in a DMAIC project and pin
            proof along the way.
          </li>
        </ol>
      </section>
    </div>
  )
}
