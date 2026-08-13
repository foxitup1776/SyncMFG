import type { AppView } from './AppShell'
import { getToolGuide } from '../guides/toolGuides'

/** Plain-language walkthrough at the top of each tool. */
export function ToolGuidePanel({ toolId }: { toolId: AppView }) {
  const guide = getToolGuide(toolId)
  if (!guide) return null

  return (
    <section className="tool-guide panel soft" aria-labelledby={`guide-${toolId}`}>
      <p className="guide-kicker">How to use this tool</p>
      <h2 id={`guide-${toolId}`}>{guide.plainName}</h2>
      {guide.alsoCalled ? (
        <p className="guide-also">Also called: {guide.alsoCalled}</p>
      ) : null}

      <div className="guide-grid">
        <div>
          <h3>What problem is this for?</h3>
          <p>{guide.problem}</p>
        </div>
        <div>
          <h3>What does it do?</h3>
          <p>{guide.does}</p>
        </div>
      </div>

      <h3>How to use it</h3>
      <ol className="guide-steps">
        {guide.how.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {guide.quotes && guide.quotes.length > 0 ? (
        <>
          <h3 className="subhead">From your teaching notes</h3>
          <ul className="quote-list compact">
            {guide.quotes.map((q) => (
              <li key={q.text}>
                <blockquote>“{q.text}”</blockquote>
                <cite>{q.source}</cite>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}
