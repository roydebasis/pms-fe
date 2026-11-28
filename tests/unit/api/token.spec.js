import { describe, expect, it, vi } from 'vitest'
import { clearAllTokens, clearToken, getToken, hasToken, setToken } from '@/api/token'

describe('token storage', () => {
  it('keeps each surface token separate', () => {
    setToken('staff', 'staff-token')
    setToken('renter', 'renter-token')

    expect(getToken('staff')).toBe('staff-token')
    expect(getToken('renter')).toBe('renter-token')
    expect(getToken('platform')).toBeNull()
  })

  it('never writes a token into the Pinia state payload', () => {
    setToken('staff', 'staff-token')
    expect(localStorage.getItem('zoniq-ui-state-v1')).toBeNull()
    expect(Object.keys(localStorage)).toContain('zoniq-token-staff')
  })

  it('clears one or all surfaces', () => {
    setToken('staff', 's')
    setToken('renter', 'r')
    clearToken('staff')
    expect(hasToken('staff')).toBe(false)
    expect(getToken('renter')).toBe('r')
    clearAllTokens()
    expect(getToken('renter')).toBeNull()
  })

  it('ignores empty tokens', () => {
    setToken('staff', '')
    expect(getToken('staff')).toBeNull()
  })

  it('returns null when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('storage blocked')
      },
    })
    expect(getToken('staff')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('rejects unknown surfaces', () => {
    expect(() => getToken('webhooks')).toThrow()
    expect(() => setToken('webhooks', 'x')).toThrow()
  })
})
