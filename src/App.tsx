import { useEffect, useState, type ReactNode } from 'react'
import { isAuthenticated, touchSession } from './auth/session'
import { AppShell, type AppView } from './components/AppShell'
import { LoginGate } from './components/LoginGate'
import { DataPage } from './pages/DataPage'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from './pages/SettingsPage'
import { ToolsPage } from './pages/ToolsPage'
import { purgeExpiredDatasets } from './storage/datasets'
import { CapabilityTool } from './tools/CapabilityTool'
import { CompareTool } from './tools/CompareTool'
import { GageRrTool } from './tools/GageRrTool'
import { ImrTool } from './tools/ImrTool'
import { MonteCarloTool } from './tools/MonteCarloTool'
import { ParetoTool } from './tools/ParetoTool'
import { RegressionTool } from './tools/RegressionTool'
import { TTestTool } from './tools/TTestTool'
import { VisualTool } from './tools/VisualTool'
import { XbarRTool } from './tools/XbarRTool'

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
        ← All tools
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
      {view === 'data' ? <DataPage /> : null}
      {view === 'tools' ? <ToolsPage onNavigate={setView} /> : null}
      {view === 'settings' ? <SettingsPage /> : null}
      {view === 'visual' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <VisualTool />
        </ToolFrame>
      ) : null}
      {view === 'imr' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <ImrTool />
        </ToolFrame>
      ) : null}
      {view === 'capability' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <CapabilityTool />
        </ToolFrame>
      ) : null}
      {view === 'montecarlo' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <MonteCarloTool />
        </ToolFrame>
      ) : null}
      {view === 'pareto' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <ParetoTool />
        </ToolFrame>
      ) : null}
      {view === 'ttest' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <TTestTool />
        </ToolFrame>
      ) : null}
      {view === 'regression' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <RegressionTool />
        </ToolFrame>
      ) : null}
      {view === 'xbarr' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <XbarRTool />
        </ToolFrame>
      ) : null}
      {view === 'gage' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <GageRrTool />
        </ToolFrame>
      ) : null}
      {view === 'compare' ? (
        <ToolFrame onBack={() => setView('tools')}>
          <CompareTool />
        </ToolFrame>
      ) : null}
    </AppShell>
  )
}
