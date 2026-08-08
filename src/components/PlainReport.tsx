import type { AnalysisReport } from '../data/types'
import type { DmaicPhase } from '../projects/types'
import { AttachToProject } from './AttachToProject'
import { Glossary } from './Glossary'
import { ShareReport } from './ShareReport'

export function PlainReport({
  report,
  share = true,
  sourceTool,
  defaultPhase = 'analyze',
}: {
  report: AnalysisReport
  share?: boolean
  /** When set, shows “Pin to DMAIC project”. */
  sourceTool?: string
  defaultPhase?: DmaicPhase
}) {
  return (
    <>
      <section className="plain-report" aria-labelledby="report-heading">
        <h2 id="report-heading">{report.title}</h2>
        <p className="report-summary">{report.summary}</p>
        <ul className="report-bullets">
          {report.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <Glossary termsUsed={report.termsUsed} />
      </section>
      {sourceTool ? (
        <AttachToProject
          report={report}
          sourceTool={sourceTool}
          defaultPhase={defaultPhase}
        />
      ) : null}
      {share ? <ShareReport report={report} /> : null}
    </>
  )
}
