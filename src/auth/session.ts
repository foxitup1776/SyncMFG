import { loadSettings } from '../storage/settings'

const SESSION_KEY = 'syncmfg.auth.v2'

interface SessionPayload {
  expiresAt: number
}

export function isAuthenticated(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as SessionPayload
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

export function setAuthenticated(ok: boolean): void {
  if (!ok) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  const hours = loadSettings().sessionHours
  const expiresAt = Date.now() + hours * 60 * 60 * 1000
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt }))
}

/** Extend the session on activity (keeps you signed in while working). */
export function touchSession(): void {
  if (!isAuthenticated()) return
  setAuthenticated(true)
}

export function sessionMinutesLeft(): number {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return 0
    const { expiresAt } = JSON.parse(raw) as SessionPayload
    return Math.max(0, Math.round((expiresAt - Date.now()) / 60000))
  } catch {
    return 0
  }
}
