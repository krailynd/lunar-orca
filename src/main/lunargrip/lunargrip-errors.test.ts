import { describe, expect, it } from 'vitest'
import { toSafeLunarGripProviderError } from './lunargrip-errors'

describe('LunarGrip provider errors', () => {
  it('redacts arbitrary provider messages', () => {
    const result = toSafeLunarGripProviderError({
      code: 'provider_unavailable',
      message: 'password=fixture-only host=localhost',
      retryable: false
    })

    expect(result).toEqual({
      code: 'provider_unavailable',
      message: 'The real database provider is not implemented.',
      retryable: false
    })
    expect(JSON.stringify(result)).not.toContain('fixture-only')
  })

  it('normalizes unknown errors to a safe provider error', () => {
    expect(toSafeLunarGripProviderError(new Error('driver details'))).toEqual({
      code: 'provider_unavailable',
      message: 'The real database provider is not implemented.',
      retryable: false
    })
  })
})
