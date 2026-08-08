export interface AppSettings {
  sessionHours: number
  extraPasswordHashes: string[]
  couchUrl: string
  couchDb: string
  couchUser: string
  couchPassword: string
  web3formsKey: string
  lastEmail: string
}

const KEY = 'syncmfg.settings'

const DEFAULTS: AppSettings = {
  sessionHours: 8,
  extraPasswordHashes: [],
  couchUrl: 'http://10.0.0.10:5984',
  couchDb: 'syncmfg',
  couchUser: '',
  couchPassword: '',
  web3formsKey: '',
  lastEmail: '',
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(next: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(next))
}
