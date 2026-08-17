import type { ReactNode } from 'react'
import type { AppView } from './AppShell'

export function InterpretBanner({
  title,
  plain,
  meta,
  children,
}: {
  title: string
  plain: string
  meta?: string
  children?: ReactNode
}) {
  return (
    <section className="panel soft interpret-banner">
      <p className="guide-kicker">Chart interpretation</p>
      <h3>{title}</h3>
      <p>{plain}</p>
      {meta ? <p className="meta">{meta}</p> : null}
      {children}
    </section>
  )
}

export function NextStepCta({
  label,
  onNavigate,
  view,
}: {
  label: string
  view: AppView
  onNavigate?: (v: AppView) => void
}) {
  if (!onNavigate) return null
  return (
    <div className="next-step-cta no-print">
      <button
        type="button"
        className="btn primary"
        onClick={() => onNavigate(view)}
      >
        {label}
      </button>
    </div>
  )
}
