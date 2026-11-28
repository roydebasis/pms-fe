import { ApiError } from './errors'

const DEFAULT_TIMEOUT = 15000

export function buildUrl(baseUrl, path, query = {}) {
  const root = String(baseUrl || '').replace(/\/+$/, '')
  const url = new URL(`${root}/${String(path).replace(/^\/+/, '')}`)

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function buildHeaders({ token, body, headers }) {
  return {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }
}

/**
 * One HTTP client per API surface. Tokens are passed in (never logged) and may
 * be supplied as a function so a token created after login is picked up.
 */
export function createApiClient({
  baseUrl,
  surface,
  token = null,
  onUnauthenticated = null,
  timeout = DEFAULT_TIMEOUT,
  fetchImpl = globalThis.fetch,
}) {
  async function request(method, path, { body, query, headers, signal } = {}) {
    const activeToken = typeof token === 'function' ? token() : token

    let response
    try {
      response = await fetchImpl(buildUrl(baseUrl, path, query), {
        method,
        headers: buildHeaders({ token: activeToken, body, headers }),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal ?? AbortSignal.timeout(timeout),
      })
    } catch (cause) {
      throw new ApiError({
        error_code: 'SERVER_ERROR',
        message: 'Network request failed',
        status: 0,
        surface,
        cause,
      })
    }

    let payload = null
    try {
      payload = await response.json()
    } catch {
      // A non-JSON response is still an error path below.
    }

    if (payload?.status === 'error' || !response.ok) {
      const fallback = response.status === 401
        ? 'UNAUTHENTICATED'
        : response.status === 422
          ? 'VALIDATION_ERROR'
          : 'SERVER_ERROR'
      const error = new ApiError({
        error_code: payload?.error_code ?? fallback,
        message: payload?.message,
        errors: payload?.errors,
        status: response.status,
        surface,
      })
      if (error.error_code === 'UNAUTHENTICATED') onUnauthenticated?.(error)
      throw error
    }

    return payload ? payload.data : null
  }

  return {
    request,
    get: (path, options) => request('GET', path, options),
    post: (path, body, options = {}) => request('POST', path, { ...options, body }),
    put: (path, body, options = {}) => request('PUT', path, { ...options, body }),
    patch: (path, body, options = {}) => request('PATCH', path, { ...options, body }),
    delete: (path, options) => request('DELETE', path, options),
  }
}
