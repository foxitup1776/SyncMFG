/**
 * Shared site passwords. Add more entries when you hand access to someone else.
 * Client-side only for now — later this check can move to the FoxHome Pi.
 */
export const SITE_PASSWORDS = ['Goldratt'] as const

export function isValidPassword(input: string): boolean {
  const trimmed = input.trim()
  return SITE_PASSWORDS.some((p) => p === trimmed)
}
