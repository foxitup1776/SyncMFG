import { useMemo, useState } from 'react'
import type { AppView } from '../components/AppShell'
import { getHowTo } from '../guides/howToDetail'
import { MAPPED_TOOLS } from '../guides/toolMap'
import { TOOL_GUIDES } from '../guides/toolGuides'

const PHASE_TITLE: Record<string, string> = {
  define: 'Define',
  data: 'Data',
  measure: 'Measure',
  analyze: 'Analyze',
  improve: 'Improve',
  control: 'Control',
}

export function HowToPage({
  onNavigate,
}: {
  onNavigate: (v: AppView) => void
}) {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<AppView | ''>('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOL_GUIDES.filter((g) => {
      if (!q) return true
      const blob = [g.plainName, g.alsoCalled, g.problem, g.does, ...(g.how ?? [])]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [query])

  return (
    <div className="howto-page">
      <section className="panel start-hero">
        <p className="eyebrow">Settings</p>
        <h1>How-to guides</h1>
        <p className="lede">
          Every tool, written as a floor procedure: when to use it, what you
          need, the steps, what “done” looks like, and what usually goes wrong.
          Open the tool when you are ready to run it.
        </p>
        <label htmlFor="guide-search">Find a tool</label>
        <input
          id="guide-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="scrap, t-test, changeover, Cpk…"
        />
        <div className="settings-tabs">
          <button
            type="button"
            className="settings-tab"
            onClick={() => onNavigate('settings')}
          >
            Site
          </button>
          <span className="settings-tab on">How-to guides</span>
        </div>
      </section>

      {list.length === 0 ? (
        <p className="panel soft">No guides match that search.</p>
      ) : (
        list.map((g) => {
          const detail = getHowTo(g.id)
          const mapped = MAPPED_TOOLS.find((t) => t.id === g.id)
          const open = openId === g.id
          return (
            <article key={g.id} className="panel howto-card">
              <button
                type="button"
                className="howto-head"
                aria-expanded={open}
                onClick={() => setOpenId((prev) => (prev === g.id ? '' : g.id))}
              >
                <span>
                  <strong>{g.plainName}</strong>
                  {g.alsoCalled ? (
                    <span className="meta">Also called: {g.alsoCalled}</span>
                  ) : null}
                </span>
                <span className="howto-phase">
                  {PHASE_TITLE[g.phase] ?? g.phase}
                </span>
              </button>

              {open ? (
                <div className="howto-body">
                  <p>
                    <strong>When:</strong> {detail?.when ?? g.problem}
                  </p>
                  <p>
                    <strong>What it does:</strong> {g.does}
                  </p>
                  {mapped ? (
                    <p className="meta">
                      Map: {mapped.domains.join(' · ')} · spectrum:{' '}
                      {mapped.spectrum}
                    </p>
                  ) : null}

                  {detail?.need?.length ? (
                    <>
                      <h3 className="subhead">What you need</h3>
                      <ul className="guide-steps">
                        {detail.need.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  <h3 className="subhead">How to run it</h3>
                  <ol className="guide-steps">
                    {(detail?.steps ?? g.how).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>

                  {detail?.doneWhen ? (
                    <p className="done-when">
                      <strong>You are done when:</strong> {detail.doneWhen}
                    </p>
                  ) : null}

                  {detail?.watchOuts?.length ? (
                    <>
                      <h3 className="subhead">Watch-outs</h3>
                      <ul className="guide-steps">
                        {detail.watchOuts.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {g.quotes && g.quotes.length > 0 ? (
                    <>
                      <h3 className="subhead">From the teaching notes</h3>
                      <ul className="quote-list compact">
                        {g.quotes.map((q) => (
                          <li key={q.text}>
                            <blockquote>“{q.text}”</blockquote>
                            <cite>{q.source}</cite>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {g.id !== 'data' && g.id !== 'projects' ? (
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => onNavigate(g.id)}
                    >
                      Open this tool
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => onNavigate(g.id)}
                    >
                      Open {g.plainName.toLowerCase()}
                    </button>
                  )}
                </div>
              ) : null}
            </article>
          )
        })
      )}
    </div>
  )
}
