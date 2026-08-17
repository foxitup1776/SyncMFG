import { useEffect, useState, type ReactNode } from 'react'
import { isAuthenticated, touchSession } from './auth/session'
import { AppShell, type AppView } from './components/AppShell'
import { LoginGate } from './components/LoginGate'
import { DataPage } from './pages/DataPage'
import { HomePage } from './pages/HomePage'
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
  const [view, setView] = useState<AppView>('home')

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
    <AppShell view={view} onNavigate={setView}>
      {view === 'home' ? <HomePage onNavigate={setView} /> : null}
      {view === 'solve' ? <SolvePage onNavigate={setView} /> : null}
      {view === 'data' ? <DataPage /> : null}
      {view === 'projects' ? <ProjectsPage onNavigate={setView} /> : null}
      {view === 'tools' ? <ToolsPage onNavigate={setView} /> : null}
      {view === 'settings' ? <SettingsPage /> : null}
      {view === 'visual' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <VisualTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'imr' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <ImrTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'capability' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <CapabilityTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'montecarlo' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <MonteCarloTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'pareto' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <ParetoTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'ttest' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <TTestTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'anova' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <AnovaTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'regression' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <RegressionTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'xbarr' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <XbarRTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'gage' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <GageRrTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'compare' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <CompareTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'fishbone' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <FishboneTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'fivewhys' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <FiveWhysTool />
        </ToolFrame>
      ) : null}
      {view === 'fmea' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <FmeaTool />
        </ToolFrame>
      ) : null}
      {view === 'yield' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <YieldTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'oee' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <OeeTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'beforeafter' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <BeforeAfterTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'wastewalk' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <WasteWalkTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'fives' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <FiveSTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'takt' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <TaktTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'smed' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <SmedTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'copq' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <CopqTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'samplesize' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <SampleSizeTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'sigma' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <SigmaTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'attribute' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <AttributeChartTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
      {view === 'proportions' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <ProportionTool onNavigate={setView} />
        </ToolFrame>
      ) : null}
    </AppShell>
  )
}
