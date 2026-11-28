// Tokens live outside the Pinia $state persistence payload, and each surface
// has its own key so a staff token can never be reused on renter/platform.

export const SURFACES = ['staff', 'renter', 'platform']

const storageKey = (surface) => `zoniq-token-${surface}`

function assertSurface(surface) {
  if (!SURFACES.includes(surface)) throw new Error(`Unknown API surface: ${surface}`)
}

export function getToken(surface) {
  assertSurface(surface)
  try {
    return localStorage.getItem(storageKey(surface)) || null
  } catch {
    return null
  }
}

export function setToken(surface, token) {
  assertSurface(surface)
  if (!token) return
  localStorage.setItem(storageKey(surface), token)
}

export function clearToken(surface) {
  assertSurface(surface)
  localStorage.removeItem(storageKey(surface))
}

export function clearAllTokens() {
  SURFACES.forEach(clearToken)
}

export function hasToken(surface) {
  return Boolean(getToken(surface))
}
