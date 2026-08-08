import type { AppView } from '../components/AppShell'

const TOOLS: {
  id: AppView
  name: string
  status: string
  blurb: string
  group: string
}[] = [
  {
    id: 'projects',
    name: 'DMAIC project / A3',
    status: 'Ready',
    group: 'Problem solving',
    blurb: 'Binder for charter, SIPOC, evidence, improve & control plans.',
  },
  {
    id: 'fishbone',
    name: 'Fishbone (Ishikawa)',
    status: 'Ready',
    group: 'Problem solving',
    blurb: '6M cause brainstorm tied to a DMAIC project.',
  },
  {
    id: 'fivewhys',
    name: '5 Whys',
    status: 'Ready',
    group: 'Problem solving',
    blurb: 'Drill from symptom to root cause; seed from Fishbone.',
  },
  {
    id: 'fmea',
    name: 'FMEA',
    status: 'Ready',
    group: 'Problem solving',
    blurb: 'Score Severity × Occurrence × Detection; sort by RPN.',
  },
  {
    id: 'data',
    name: 'Data ingest & summary',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Paste Excel / upload / samples; 30-day save.',
  },
  {
    id: 'visual',
    name: 'Histogram / Box / Run',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Shape, outliers, and trends.',
  },
  {
    id: 'compare',
    name: 'Multi-column compare',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Side-by-side box plots.',
  },
  {
    id: 'imr',
    name: 'I-MR + Western Electric',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Stability + run rules.',
  },
  {
    id: 'xbarr',
    name: 'X̄-R control chart',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Subgrouped Excel rows.',
  },
  {
    id: 'capability',
    name: 'Process capability',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Cp, Cpk, Pp, Ppk.',
  },
  {
    id: 'pareto',
    name: 'Pareto chart',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Vital-few ranking.',
  },
  {
    id: 'ttest',
    name: '2-sample t-test',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Did A differ from B?',
  },
  {
    id: 'regression',
    name: 'Scatter & regression',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Relationship + R².',
  },
  {
    id: 'gage',
    name: 'Gage R&R (lite)',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Is the gage trustworthy?',
  },
  {
    id: 'montecarlo',
    name: 'Time-study Monte Carlo',
    status: 'Ready',
    group: 'Stats',
    blurb: 'Step times → risk.',
  },
]

export function ToolsPage({ onNavigate }: { onNavigate: (v: AppView) => void }) {
  const groups = ['Problem solving', 'Stats']
  return (
    <div className="tools-page">
      <section className="panel">
        <h2>Tools</h2>
        <p className="lede">
          Problem-solving tools live on a DMAIC project. Stats tools can pin
          their reports into that same project.
        </p>
        {groups.map((group) => (
          <div key={group} className="tool-group">
            <h3 className="subhead">{group}</h3>
            <ul className="tool-cards">
              {TOOLS.filter((t) => t.group === group).map((t) => (
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
          </div>
        ))}
      </section>
    </div>
  )
}
