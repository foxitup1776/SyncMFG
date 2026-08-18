import type { AppView } from './AppShell'
import type { FlowState } from '../guides/toolMap'
import { getToolGuide } from '../guides/toolGuides'

export function FlowRail({
  view,
  flow,
  onNavigate,
  onClear,
}: {
  view: AppView
  flow: FlowState | null
  onNavigate: (v: AppView, flow?: FlowState) => void
  onClear: () => void
}) {
  if (!flow) return null

  const detourGuide = flow.detour ? getToolGuide(flow.detour) : undefined

  return (
    <div className="flow-rail no-print" role="navigation" aria-label="Problem-solving flow">
      <div className="flow-rail-inner">
        <div className="flow-rail-title">
          <p className="guide-kicker">You are here</p>
          <strong>{flow.title}</strong>
        </div>
        <ol className="flow-steps">
          {flow.steps.map((step, i) => {
            const here = flow.current === step.toolId && !flow.detour
            return (
              <li key={step.toolId}>
                {i > 0 ? <span className="flow-arrow" aria-hidden="true">→</span> : null}
                <button
                  type="button"
                  className={here ? 'flow-chip on' : 'flow-chip'}
                  aria-current={here ? 'step' : undefined}
                  onClick={() => onNavigate(step.toolId)}
                >
                  <span className="flow-num">{i + 1}</span>
                  {step.label}
                </button>
              </li>
            )
          })}
          {flow.detour ? (
            <li>
              <span className="flow-arrow" aria-hidden="true">↗</span>
              <button
                type="button"
                className="flow-chip detour"
                aria-current="step"
                onClick={() => onNavigate(flow.detour!)}
              >
                Side step: {detourGuide?.plainName ?? flow.detour}
              </button>
            </li>
          ) : null}
        </ol>
        <div className="flow-rail-end">
          {view !== 'tools' ? (
            <button
              type="button"
              className="btn ghost"
              onClick={() => onNavigate('tools')}
            >
              Map
            </button>
          ) : null}
          <button type="button" className="btn ghost" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
