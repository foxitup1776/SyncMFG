import { sha256Hex } from './hash'
import { loadSettings, saveSettings } from '../storage/settings'

/**
 * Built-in password digests (SHA-256). Plaintext is not stored in source.
 * Primary site password digest included; add more via Settings after login.
 */
const BUILTIN_HASHES = [
  'a2d254722781ff186051215212f6bf304dec71c1f1c468ff580a1d686097003d',
] as const

export async function isValidPassword(input: string): Promise<boolean> {
  const trimmed = input.trim()
  if (!trimmed) return false
  const digest = await sha256Hex(trimmed)
  const extras = loadSettings().extraPasswordHashes
  return (BUILTIN_HASHES as readonly string[]).includes(digest) || extras.includes(digest)
}

export async function addSharePassword(plain: string): Promise<{ ok: boolean; message: string }> {
  const trimmed = plain.trim()
  if (trimmed.length < 4) {
    return { ok: false, message: 'Use at least 4 characters.' }
  }
  const digest = await sha256Hex(trimmed)
  const settings = loadSettings()
  if (
    (BUILTIN_HASHES as readonly string[]).includes(digest) ||
    settings.extraPasswordHashes.includes(digest)
  ) {
    return { ok: false, message: 'That password is already active.' }
  }
  if (settings.extraPasswordHashes.length >= 3) {
    return {
      ok: false,
      message: 'You already have 3 extra passwords. Remove one first.',
    }
  }
  saveSettings({
    ...settings,
    extraPasswordHashes: [...settings.extraPasswordHashes, digest],
  })
  return { ok: true, message: 'Extra password added. You can hand it to a teammate.' }
}

export function removeSharePasswordAt(index: number): void {
  const settings = loadSettings()
  saveSettings({
    ...settings,
    extraPasswordHashes: settings.extraPasswordHashes.filter((_, i) => i !== index),
  })
}

export function countExtraPasswords(): number {
  return loadSettings().extraPasswordHashes.length
}
