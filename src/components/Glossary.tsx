import { resolveTerms } from '../glossary/terms'

export function Glossary({ termsUsed }: { termsUsed: string[] }) {
  const terms = resolveTerms(termsUsed)
  if (terms.length === 0) return null

  return (
    <section className="glossary" aria-labelledby="glossary-heading">
      <h3 id="glossary-heading">Plain-language definitions</h3>
      <dl>
        {terms.map((t) => (
          <div key={t.id} className="glossary-item">
            <dt>{t.term}</dt>
            <dd>{t.plain}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
