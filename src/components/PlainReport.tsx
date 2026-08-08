import type { AnalysisReport } from '../data/types'
import { Glossary } from './Glossary'
import { ShareReport } from './ShareReport'

export function PlainReport({
  report,
  share = true,
}: {
  report: AnalysisReport
  share?: boolean
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
      {share ? <ShareReport report={report} /> : null}
    </>
  )
}
