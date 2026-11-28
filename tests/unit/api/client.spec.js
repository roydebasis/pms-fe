import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { buildUrl, createApiClient } from '@/api/client'
import { ApiError } from '@/api/errors'
import { server } from '../../mocks/server'

const BASE = 'http://localhost:8000/api/v1'

describe('buildUrl', () => {
  it('appends only non-empty query values', () => {
    expect(buildUrl(`${BASE}/`, '/payments', { page: 2, q: '', status: null, type: undefined }))
      .toBe(`${BASE}/payments?page=2`)
  })

  it('requires an absolute base URL', () => {
    expect(() => buildUrl('', '/payments')).toThrow()
  })
})

describe('createApiClient', () => {
  it('unwraps the success envelope and sends a bearer token', async () => {
    let authorization = null
    server.use(http.get(`${BASE}/ping`, ({ request }) => {
      authorization = request.headers.get('authorization')
      return HttpResponse.json({ status: 'success', message: 'Success', data: { ok: true } })
    }))

    const client = createApiClient({ baseUrl: BASE, surface: 'staff', token: 'secret-token' })
    await expect(client.get('/ping')).resolves.toEqual({ ok: true })
    expect(authorization).toBe('Bearer secret-token')
  })

  it('serializes JSON bodies with the right content type', async () => {
    let body = null
    let contentType = null
    server.use(http.post(`${BASE}/properties`, async ({ request }) => {
      body = await request.json()
      contentType = request.headers.get('content-type')
      return HttpResponse.json({ status: 'success', message: 'Success', data: { id: 9 } })
    }))

    const client = createApiClient({ baseUrl: BASE, surface: 'staff' })
    await expect(client.post('/properties', { name: 'Maple House' })).resolves.toEqual({ id: 9 })
    expect(body).toEqual({ name: 'Maple House' })
    expect(contentType).toContain('application/json')
  })

  it('throws ApiError with the error_code and calls the 401 hook', async () => {
    server.use(http.get(`${BASE}/secure`, () => HttpResponse.json({
      status: 'error',
      error_code: 'UNAUTHENTICATED',
      message: 'Please sign in',
      errors: null,
    }, { status: 401 })))

    const onUnauthenticated = vi.fn()
    const client = createApiClient({ baseUrl: BASE, surface: 'staff', token: () => 't', onUnauthenticated })

    const error = await client.get('/secure').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.error_code).toBe('UNAUTHENTICATED')
    expect(error.status).toBe(401)
    expect(error.i18nKey).toBe('errors.UNAUTHENTICATED')
    expect(onUnauthenticated).toHaveBeenCalledOnce()
  })

  it('falls back to VALIDATION_ERROR for a bare 422 response', async () => {
    server.use(http.post(`${BASE}/users`, () => HttpResponse.json({}, { status: 422 })))
    const client = createApiClient({ baseUrl: BASE, surface: 'staff' })
    const error = await client.post('/users', {}).catch((e) => e)
    expect(error.error_code).toBe('VALIDATION_ERROR')
    expect(error.i18nKey).toBe('errors.VALIDATION_ERROR')
  })

  it('falls back to SERVER_ERROR for other failures without triggering the 401 hook', async () => {
    server.use(http.get(`${BASE}/broken`, () => new HttpResponse(null, { status: 500 })))
    const onUnauthenticated = vi.fn()
    const client = createApiClient({ baseUrl: BASE, surface: 'staff', onUnauthenticated })
    const error = await client.get('/broken').catch((e) => e)
    expect(error.error_code).toBe('SERVER_ERROR')
    expect(onUnauthenticated).not.toHaveBeenCalled()
  })

  it('wraps network failures as SERVER_ERROR and never exposes the token', async () => {
    const client = createApiClient({
      baseUrl: BASE,
      surface: 'staff',
      token: 'super-secret',
      fetchImpl: () => Promise.reject(new Error('offline')),
    })
    const error = await client.get('/anything').catch((e) => e)
    expect(error.error_code).toBe('SERVER_ERROR')
    expect(String(error)).not.toContain('super-secret')
  })

  it('returns null for a non-JSON success response', async () => {
    server.use(http.get(`${BASE}/raw`, () => new HttpResponse('ok', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    })))
    const client = createApiClient({ baseUrl: BASE, surface: 'staff' })
    await expect(client.get('/raw')).resolves.toBeNull()
  })

  it('honours a caller-provided AbortSignal', async () => {
    let received = false
    server.use(http.get(`${BASE}/abort`, () => {
      received = true
      return HttpResponse.json({ status: 'success', message: 'Success', data: true })
    }))
    const client = createApiClient({ baseUrl: BASE, surface: 'staff' })
    await expect(client.get('/abort', { signal: AbortSignal.timeout(1000) })).resolves.toBe(true)
    expect(received).toBe(true)
  })

  it('exposes put, patch and delete helpers', async () => {
    const seen = []
    for (const method of ['put', 'patch', 'delete']) {
      server.use(http[method](`${BASE}/resource`, () => {
        seen.push(method.toUpperCase())
        return HttpResponse.json({ status: 'success', message: 'Success', data: method.toUpperCase() })
      }))
    }

    const client = createApiClient({ baseUrl: BASE, surface: 'staff' })
    await expect(client.put('/resource', { a: 1 })).resolves.toBe('PUT')
    await expect(client.patch('/resource', { a: 1 })).resolves.toBe('PATCH')
    await expect(client.delete('/resource')).resolves.toBe('DELETE')
    expect(seen).toEqual(['PUT', 'PATCH', 'DELETE'])
  })

  it('resolves a token function on every request', async () => {
    const seen = []
    server.use(http.get(`${BASE}/ping`, ({ request }) => {
      seen.push(request.headers.get('authorization'))
      return HttpResponse.json({ status: 'success', message: 'Success', data: true })
    }))

    let token = 'first'
    const client = createApiClient({ baseUrl: BASE, surface: 'staff', token: () => token })
    await client.get('/ping')
    token = 'second'
    await client.get('/ping')

    expect(seen).toEqual(['Bearer first', 'Bearer second'])
  })
})
