import { createApiClient } from './client'
import { getToken } from './token'

export const apiMode = import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'demo'
export const isLive = apiMode === 'live'

const baseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

function clientFor(surface, suffix = '') {
  return createApiClient({
    baseUrl: `${baseUrl}${suffix}`,
    surface,
    token: () => getToken(surface),
  })
}

export const staffApi = clientFor('staff')
export const renterApi = clientFor('renter', '/renter')
export const platformApi = clientFor('platform', '/platform')
