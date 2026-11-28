// Error codes mirror zoniq/app/Enums/ApiErrorCode.php on the backend.
// Never branch on message text — always on `error_code`.

export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'UNAUTHORIZED',
  'NOT_FOUND',
  'ROUTE_NOT_FOUND',
  'METHOD_NOT_ALLOWED',
  'BAD_METHOD_CALL',
  'TOO_MANY_REQUESTS',
  'PLAN_EXPIRED',
  'INSUFFICIENT_CREDIT',
  'INVALID_CREDENTIALS',
  'SERVER_ERROR',
  'RESET_LINK_FAILED',
  'INVALID_RESET_TOKEN',
  'EMAIL_ALREADY_VERIFIED',
  'INVALID_VERIFICATION_LINK',
  'INVITATION_INVALID',
  'EMAIL_NOT_VERIFIED',
  'CONSENT_REQUIRED',
  'ALREADY_LINKED',
]

export function errorKey(code) {
  return ERROR_CODES.includes(code) ? `errors.${code}` : 'errors.SERVER_ERROR'
}

export class ApiError extends Error {
  constructor({ error_code, message, errors = null, status = 0, surface = null, cause = null }) {
    super(message || errorKey(error_code))
    this.name = 'ApiError'
    this.error_code = ERROR_CODES.includes(error_code) ? error_code : 'SERVER_ERROR'
    this.message = message || errorKey(error_code)
    this.errors = errors ?? null
    this.status = status
    this.surface = surface
    this.cause = cause
  }

  get i18nKey() {
    return errorKey(this.error_code)
  }
}
