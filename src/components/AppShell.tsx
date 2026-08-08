import type { ReactNode } from 'react'
import { setAuthenticated } from '../auth/session'

export type AppView =
  | 'home'
  | 'data'
  | 'tools'
  | 'visual'
  | 'imr'
  | 'capability'
  | 'montecarlo'

const NAV: { id: AppView; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'data', label: 'Data' },
  { id: 'tools', label: 'Tools' },
]

export function AppShell({
  view,
  onNavigate,
  children,
}: {
  view: AppView
  onNavigate: (v: AppView) => void
  children: ReactNode
}) {
  const navActive =
    view === 'visual' ||
    view === 'imr' ||
    view === 'capability' ||
    view === 'montecarlo'
      ? 'tools'
      : view

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand"
          onClick={() => onNavigate('home')}
        >
          SYNCMFG
        </button>
        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={navActive === item.id ? 'nav-link active' : 'nav-link'}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setAuthenticated(false)
            window.location.reload()
          }}
        >
          Lock
        </button>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}
