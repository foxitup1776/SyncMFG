import { useEffect, useState, type ReactNode } from 'react'
import { isAuthenticated, touchSession } from './auth/session'
import { AppShell, isToolView, type AppView } from './components/AppShell'
import { LoginGate } from './components/LoginGate'
import type { FlowState } from './guides/toolMap'
import { touchFlow } from './guides/toolMap'
import { usePersistedState } from './hooks/usePersistedState'
import { DataPage } from './pages/DataPage'
import { HowToPage } from './pages/HowToPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SolvePage } from './pages/SolvePage'
import { ToolsPage } from './pages/ToolsPage'
import { purgeExpiredDatasets } from './storage/datasets'
import { purgeExpiredProjects } from './storage/projects'
import { AnovaTool } from './tools/AnovaTool'
import { AttributeChartTool } from './tools/AttributeChartTool'
import { BeforeAfterTool } from './tools/BeforeAfterTool'
import { CapabilityTool } from './tools/CapabilityTool'
import { CopqTool } from './tools/CopqTool'
import { FiveSTool } from './tools/FiveSTool'
import { CompareTool } from './tools/CompareTool'
import { FishboneTool } from './tools/FishboneTool'
import { FiveWhysTool } from './tools/FiveWhysTool'
import { FmeaTool } from './tools/FmeaTool'
import { GageRrTool } from './tools/GageRrTool'
import { ImrTool } from './tools/ImrTool'
import { MonteCarloTool } from './tools/MonteCarloTool'
import { OeeTool } from './tools/OeeTool'
import { ParetoTool } from './tools/ParetoTool'
import { ProportionTool } from './tools/ProportionTool'
import { RegressionTool } from './tools/RegressionTool'
import { SampleSizeTool } from './tools/SampleSizeTool'
import { SigmaTool } from './tools/SigmaTool'
import { SmedTool } from './tools/SmedTool'
import { TaktTool } from './tools/TaktTool'
import { TTestTool } from './tools/TTestTool'
import { VisualTool } from './tools/VisualTool'
import { WasteWalkTool } from './tools/WasteWalkTool'
import { XbarRTool } from './tools/XbarRTool'
import { YieldTool } from './tools/YieldTool'

function ToolFrame({
  onBack,
  children,
}: {
  onBack: () => void
  children: ReactNode
}) {
  return (
    <div>
      <button type="button" className="btn ghost back-link no-print" onClick={onBack}>
        ← Methods
      </button>
      {children}
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated())
  const [view, setView] = useState<AppView>('solve')
  const [flow, setFlow] = usePersistedState<FlowState | null>('flow.v1', null)

  function go(next: AppView, nextFlow?: FlowState) {
    if (nextFlow) {
      setFlow({ ...nextFlow, current: isToolView(next) ? next : nextFlow.current })
    } else {
      setFlow((prev) => touchFlow(prev, next, isToolView(next)))
    }
    setView(next)
  }

  useEffect(() => {
    purgeExpiredDatasets()
    purgeExpiredProjects()
  }, [])

  useEffect(() => {
    if (!authed) return
    const onActivity = () => touchSession()
    const events: (keyof WindowEventMap)[] = [
      'pointerdown',
      'keydown',
      'scroll',
    ]
    for (const ev of events) window.addEventListener(ev, onActivity, { passive: true })
    const timer = window.setInterval(() => {
      if (!isAuthenticated()) {
        setAuthed(false)
      }
    }, 60_000)
    return () => {
      for (const ev of events) window.removeEventListener(ev, onActivity)
      window.clearInterval(timer)
    }
  }, [authed])

  if (!authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <AppShell
      view={view}
      onNavigate={go}
      flow={flow}
      onClearFlow={() => setFlow(null)}
    >
      {view === 'home' || view === 'solve' ? (
        <SolvePage onNavigate={go} />
      ) : null}
      {view === 'data' ? <DataPage /> : null}
      {view === 'projects' ? <ProjectsPage onNavigate={go} /> : null}
      {view === 'tools' ? (
        <ToolsPage onNavigate={go} current={flow?.current} />
      ) : null}
      {view === 'settings' ? <SettingsPage onNavigate={go} /> : null}
      {view === 'guides' ? <HowToPage onNavigate={go} /> : null}
      {view === 'visual' ? (
        <ToolFrame onBack={() => go('tools')}>
          <VisualTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'imr' ? (
        <ToolFrame onBack={() => go('tools')}>
          <ImrTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'capability' ? (
        <ToolFrame onBack={() => go('tools')}>
          <CapabilityTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'montecarlo' ? (
        <ToolFrame onBack={() => go('tools')}>
          <MonteCarloTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'pareto' ? (
        <ToolFrame onBack={() => go('tools')}>
          <ParetoTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'ttest' ? (
        <ToolFrame onBack={() => go('tools')}>
          <TTestTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'anova' ? (
        <ToolFrame onBack={() => go('tools')}>
          <AnovaTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'regression' ? (
        <ToolFrame onBack={() => go('tools')}>
          <RegressionTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'xbarr' ? (
        <ToolFrame onBack={() => go('tools')}>
          <XbarRTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'gage' ? (
        <ToolFrame onBack={() => go('tools')}>
          <GageRrTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'compare' ? (
        <ToolFrame onBack={() => go('tools')}>
          <CompareTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'fishbone' ? (
        <ToolFrame onBack={() => go('tools')}>
          <FishboneTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'fivewhys' ? (
        <ToolFrame onBack={() => go('tools')}>
          <FiveWhysTool />
        </ToolFrame>
      ) : null}
      {view === 'fmea' ? (
        <ToolFrame onBack={() => go('tools')}>
          <FmeaTool />
        </ToolFrame>
      ) : null}
      {view === 'yield' ? (
        <ToolFrame onBack={() => go('tools')}>
          <YieldTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'oee' ? (
        <ToolFrame onBack={() => go('tools')}>
          <OeeTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'beforeafter' ? (
        <ToolFrame onBack={() => go('tools')}>
          <BeforeAfterTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'wastewalk' ? (
        <ToolFrame onBack={() => go('tools')}>
          <WasteWalkTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'fives' ? (
        <ToolFrame onBack={() => go('tools')}>
          <FiveSTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'takt' ? (
        <ToolFrame onBack={() => go('tools')}>
          <TaktTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'smed' ? (
        <ToolFrame onBack={() => go('tools')}>
          <SmedTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'copq' ? (
        <ToolFrame onBack={() => go('tools')}>
          <CopqTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'samplesize' ? (
        <ToolFrame onBack={() => go('tools')}>
          <SampleSizeTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'sigma' ? (
        <ToolFrame onBack={() => go('tools')}>
          <SigmaTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'attribute' ? (
        <ToolFrame onBack={() => go('tools')}>
          <AttributeChartTool onNavigate={go} />
        </ToolFrame>
      ) : null}
      {view === 'proportions' ? (
        <ToolFrame onBack={() => go('tools')}>
          <ProportionTool onNavigate={go} />
        </ToolFrame>
      ) : null}
    </AppShell>
  )
}
