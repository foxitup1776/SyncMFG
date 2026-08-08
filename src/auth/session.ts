const SESSION_KEY = 'syncmfg.auth'

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function setAuthenticated(ok: boolean): void {
  if (ok) sessionStorage.setItem(SESSION_KEY, '1')
  else sessionStorage.removeItem(SESSION_KEY)
}
