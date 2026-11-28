import { describe, expect, it } from 'vitest'
import { ApiError, errorKey, ERROR_CODES } from '@/api/errors'

describe('errorKey', () => {
  it('maps known backend codes to i18n keys', () => {
    expect(errorKey('INVALID_CREDENTIALS')).toBe('errors.INVALID_CREDENTIALS')
    expect(ERROR_CODES).toContain('PLAN_EXPIRED')
  })

  it('falls back to SERVER_ERROR for unknown codes', () => {
    expect(errorKey('SOMETHING_NEW')).toBe('errors.SERVER_ERROR')
  })
})

describe('ApiError', () => {
  it('carries error_code, errors, status and surface', () => {
    const error = new ApiError({
      error_code: 'VALIDATION_ERROR',
      message: 'Invalid',
      errors: { email: ['required'] },
      status: 422,
      surface: 'renter',
    })
    expect(error).toBeInstanceOf(Error)
    expect(error.error_code).toBe('VALIDATION_ERROR')
    expect(error.errors).toEqual({ email: ['required'] })
    expect(error.status).toBe(422)
    expect(error.surface).toBe('renter')
    expect(error.i18nKey).toBe('errors.VALIDATION_ERROR')
  })

  it('normalizes unknown codes instead of trusting the message', () => {
    const error = new ApiError({ error_code: 'FUTURE_CODE', message: 'ignore me' })
    expect(error.error_code).toBe('SERVER_ERROR')
    expect(error.i18nKey).toBe('errors.SERVER_ERROR')
  })
})
