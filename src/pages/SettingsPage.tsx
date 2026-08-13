import { useState } from 'react'
import {
  addSharePassword,
  countExtraPasswords,
  removeSharePasswordAt,
} from '../auth/passwords'
import { sessionMinutesLeft } from '../auth/session'
import { loadSettings, saveSettings, type AppSettings } from '../storage/settings'

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [newPassword, setNewPassword] = useState('')
  const [note, setNote] = useState('')

  function persist(next: AppSettings) {
    setSettings(next)
    saveSettings(next)
  }

  async function handleAddPassword() {
    const result = await addSharePassword(newPassword)
    setNote(result.message)
    if (result.ok) {
      setNewPassword('')
      setSettings(loadSettings())
    }
  }

  return (
    <div className="settings-page">
      <section className="panel">
        <h2>Settings</h2>
        <p className="lede">
          Session left: about {sessionMinutesLeft()} minutes. Passwords are
          stored as irreversible digests — not plain text in the public code.
        </p>

        <label htmlFor="session-hours">Stay signed in (hours)</label>
        <input
          id="session-hours"
          type="number"
          min={1}
          max={72}
          value={settings.sessionHours}
          onChange={(e) =>
            persist({ ...settings, sessionHours: Number(e.target.value) || 8 })
          }
        />
      </section>

      <section className="panel">
        <h3>Extra share passwords</h3>
        <p className="lede">
          Built-in password still works. You can add up to 3 extras for
          teammates ({countExtraPasswords()} / 3 used).
        </p>
        <label htmlFor="extra-pass">New password</label>
        <input
          id="extra-pass"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="button" className="btn secondary" onClick={handleAddPassword}>
          Add password
        </button>
        {settings.extraPasswordHashes.length > 0 ? (
          <ul className="dataset-list">
            {settings.extraPasswordHashes.map((_, i) => (
              <li key={i}>
                <div>
                  <strong>Extra password #{i + 1}</strong>
                  <span className="meta">Digest stored on this device</span>
                </div>
                <button
                  type="button"
                  className="btn ghost danger"
                  onClick={() => {
                    removeSharePasswordAt(i)
                    setSettings(loadSettings())
                    setNote('Removed extra password.')
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="panel">
        <h3>Email send key (optional)</h3>
        <p className="lede">
          Free option: create an access key at{' '}
          <a href="https://web3forms.com" target="_blank" rel="noreferrer">
            web3forms.com
          </a>
          , paste it here, then use “Send from SYNCMFG” on any report. Without a
          key, Email still opens your mail app.
        </p>
        <label htmlFor="w3f">Web3Forms access key</label>
        <input
          id="w3f"
          value={settings.web3formsKey}
          onChange={(e) => persist({ ...settings, web3formsKey: e.target.value.trim() })}
          placeholder="Your access key"
        />
      </section>

      {note ? <p className="share-note panel soft">{note}</p> : null}
    </div>
  )
}
