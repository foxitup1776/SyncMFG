import { useState, type FormEvent } from 'react'
import { isValidPassword } from '../auth/passwords'
import { setAuthenticated } from '../auth/session'

export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isValidPassword(password)) {
      setAuthenticated(true)
      onSuccess()
      return
    }
    setError('That password did not match. Try again.')
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <p className="brand-mark">SYNCMFG</p>
        <h1>Sign in</h1>
        <p className="login-sub">
          Private Lean Six Sigma workbench. Enter the shared site password to
          continue.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="site-password">Password</label>
          <input
            id="site-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            autoFocus
          />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" className="btn primary">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
