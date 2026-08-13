export interface AppSettings {
  sessionHours: number
  extraPasswordHashes: string[]
  web3formsKey: string
  lastEmail: string
}

const KEY = 'syncmfg.settings'

const DEFAULTS: AppSettings = {
  sessionHours: 8,
  extraPasswordHashes: [],
  web3formsKey: '',
  lastEmail: '',
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      sessionHours: parsed.sessionHours ?? DEFAULTS.sessionHours,
      extraPasswordHashes: parsed.extraPasswordHashes ?? [],
      web3formsKey: parsed.web3formsKey ?? '',
      lastEmail: parsed.lastEmail ?? '',
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(next: AppSettings): void {
  // Persist only public-safe settings (no home-server fields).
  const clean: AppSettings = {
    sessionHours: next.sessionHours,
    extraPasswordHashes: next.extraPasswordHashes,
    web3formsKey: next.web3formsKey,
    lastEmail: next.lastEmail,
  }
  localStorage.setItem(KEY, JSON.stringify(clean))
}
