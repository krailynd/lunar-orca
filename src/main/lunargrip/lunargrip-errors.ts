import type {
  LunarGripProviderError,
  LunarGripProviderErrorCode
} from '../../shared/lunargrip-provider-types'

const SAFE_MESSAGES: Record<LunarGripProviderErrorCode, string> = {
  invalid_request: 'The LunarGrip request is invalid.',
  remote_host_rejected: 'Only local SQL Server hosts are allowed in this phase.',
  provider_unavailable: 'The real database provider is not implemented.',
  cancelled: 'The LunarGrip request was cancelled.'
}

export function toSafeLunarGripProviderError(value: unknown): LunarGripProviderError {
  if (isProviderErrorLike(value)) {
    return {
      code: value.code,
      message: SAFE_MESSAGES[value.code],
      retryable: value.retryable
    }
  }
  return {
    code: 'provider_unavailable',
    message: SAFE_MESSAGES.provider_unavailable,
    retryable: false
  }
}

function isProviderErrorLike(value: unknown): value is LunarGripProviderError {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return (
    'code' in value &&
    isProviderErrorCode(value.code) &&
    'message' in value &&
    typeof value.message === 'string' &&
    'retryable' in value &&
    typeof value.retryable === 'boolean'
  )
}

function isProviderErrorCode(value: unknown): value is LunarGripProviderErrorCode {
  return (
    value === 'invalid_request' ||
    value === 'remote_host_rejected' ||
    value === 'provider_unavailable' ||
    value === 'cancelled'
  )
}
