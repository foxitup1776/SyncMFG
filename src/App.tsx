import { useEffect, useState, type ReactNode } from 'react'
import { isAuthenticated } from './auth/session'
import { AppShell, type AppView } from './components/AppShell'
import { LoginGate } from './components/LoginGate'
import { DataPage } from './pages/DataPage'
import { HomePage } from './pages/HomePage'
import { ToolsPage } from './pages/ToolsPage'
import { purgeExpiredDatasets } from './storage/datasets'
import { CapabilityTool } from './tools/CapabilityTool'
import { ImrTool } from './tools/ImrTool'
import { MonteCarloTool } from './tools/MonteCarloTool'
import { VisualTool } from './tools/VisualTool'

function ToolFrame({
  onBack,
  children,
}: {
  onBack: () => void
  children: ReactNode
}) {
  return (
    <div>
      <button type="button" className="btn ghost back-link" onClick={onBack}>
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

  if (!authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <AppShell view={view} onNavigate={setView}>
      {view === 'home' ? <HomePage onNavigate={setView} /> : null}
      {view === 'data' ? <DataPage /> : null}
      {view === 'tools' ? <ToolsPage onNavigate={setView} /> : null}
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
    </AppShell>
  )
}
