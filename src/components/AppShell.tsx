import type { ReactNode } from 'react'
import { FlowRail } from './FlowRail'
import { setAuthenticated } from '../auth/session'
import type { FlowState } from '../guides/toolMap'

export type AppView =
  | 'home'
  | 'solve'
  | 'data'
  | 'tools'
  | 'projects'
  | 'settings'
  | 'guides'
  | 'visual'
  | 'imr'
  | 'capability'
  | 'montecarlo'
  | 'pareto'
  | 'ttest'
  | 'anova'
  | 'regression'
  | 'xbarr'
  | 'gage'
  | 'compare'
  | 'fishbone'
  | 'fivewhys'
  | 'fmea'
  | 'yield'
  | 'oee'
  | 'beforeafter'
  | 'wastewalk'
  | 'fives'
  | 'takt'
  | 'smed'
  | 'copq'
  | 'samplesize'
  | 'sigma'
  | 'attribute'
  | 'proportions'

const NAV: { id: AppView; label: string }[] = [
  { id: 'solve', label: 'Start' },
  { id: 'tools', label: 'Methods' },
  { id: 'data', label: 'Data' },
  { id: 'projects', label: 'Projects' },
]

export const TOOL_VIEWS = new Set<AppView>([
  'visual',
  'imr',
  'capability',
  'montecarlo',
  'pareto',
  'ttest',
  'anova',
  'regression',
  'xbarr',
  'gage',
  'compare',
  'fishbone',
  'fivewhys',
  'fmea',
  'yield',
  'oee',
  'beforeafter',
  'wastewalk',
  'fives',
  'takt',
  'smed',
  'copq',
  'samplesize',
  'sigma',
  'attribute',
  'proportions',
])

export function isToolView(view: AppView): boolean {
  return TOOL_VIEWS.has(view)
}

export function AppShell({
  view,
  onNavigate,
  flow,
  onClearFlow,
  children,
}: {
  view: AppView
  onNavigate: (v: AppView, flow?: FlowState) => void
  flow: FlowState | null
  onClearFlow: () => void
  children: ReactNode
}) {
  const navActive = TOOL_VIEWS.has(view)
    ? 'tools'
    : view === 'home'
      ? 'solve'
      : view === 'guides'
        ? 'settings'
        : view

  return (
    <div className="app-shell">
      <header className="topbar no-print">
        <button
          type="button"
          className="brand"
          onClick={() => onNavigate('solve')}
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
        <div className="topbar-end">
          <button
            type="button"
            className={
              view === 'settings' || view === 'guides'
                ? 'nav-icon active'
                : 'nav-icon'
            }
            aria-label="Settings"
            title="Settings"
            onClick={() => onNavigate('settings')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.81 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.93 14.16a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.4.32.64.22l2.39-.96c.5.39 1.04.7 1.63.94l.36 2.54c.05.24.25.42.49.42h3.8c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96c.24.1.51.01.64-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
              />
            </svg>
          </button>
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
        </div>
      </header>
      <FlowRail
        view={view}
        flow={flow}
        onNavigate={onNavigate}
        onClear={onClearFlow}
      />
      <main className="main">{children}</main>
    </div>
  )
}
