import { describe, expect, it } from 'vitest'
import { DemoLunarGripProvider, LunarGripProviderAbortError } from './lunargrip-provider'

const connection = {
  connectionId: 'demo',
  host: 'localhost',
  port: 1433,
  database: 'DemoDb',
  username: 'demo_user'
}

describe('DemoLunarGripProvider', () => {
  it('never opens a connection and reports the real provider as unavailable', async () => {
    const provider = new DemoLunarGripProvider()

    await expect(
      provider.testConnection(connection, new AbortController().signal)
    ).resolves.toEqual({
      status: 'failed',
      connectionId: 'demo',
      error: {
        code: 'provider_unavailable',
        message: 'The real database provider is not implemented.',
        retryable: false
      }
    })
    await expect(provider.readSchema(connection, new AbortController().signal)).resolves.toEqual(
      expect.objectContaining({
        status: 'stale',
        connectionId: 'demo',
        database: 'DemoDb',
        tables: []
      })
    )
  })

  it('cancels before doing provider work', async () => {
    const provider = new DemoLunarGripProvider()
    const controller = new AbortController()
    controller.abort()

    await expect(provider.testConnection(connection, controller.signal)).rejects.toBeInstanceOf(
      LunarGripProviderAbortError
    )
  })

  it('keeps provider DTOs safe to serialize', async () => {
    const provider = new DemoLunarGripProvider()
    const result = await provider.testConnection(connection, new AbortController().signal)

    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
    expect(JSON.stringify(result)).not.toContain('password')
  })
})
