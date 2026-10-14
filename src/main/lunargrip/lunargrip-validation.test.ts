import { describe, expect, it } from 'vitest'
import { isProviderError, validateLocalSqlServerConnection } from './lunargrip-validation'

describe('LunarGrip local connection validation', () => {
  it.each(['localhost', '127.0.0.1', '::1', 'LOCALHOST'])('accepts loopback host %s', (host) => {
    const result = validateLocalSqlServerConnection({
      connectionId: 'demo',
      host,
      port: 1433,
      database: 'DemoDb',
      username: 'demo_user'
    })

    expect(isProviderError(result)).toBe(false)
    if (!isProviderError(result)) {
      expect(result.host).toBe(host.toLowerCase())
    }
  })

  it.each(['100.64.0.1', 'db.example.test', '192.168.1.20'])('rejects remote host %s', (host) => {
    const result = validateLocalSqlServerConnection({
      connectionId: 'demo',
      host,
      port: 1433,
      database: 'DemoDb',
      username: 'demo_user'
    })

    expect(result).toEqual({
      code: 'remote_host_rejected',
      message: 'Only local SQL Server hosts are allowed in this phase.',
      retryable: false
    })
  })

  it('rejects credentials and unknown fields before provider use', () => {
    expect(
      validateLocalSqlServerConnection({
        connectionId: 'demo',
        host: 'localhost',
        port: 1433,
        database: 'DemoDb',
        username: 'demo_user',
        password: 'fixture-only'
      })
    ).toEqual({
      code: 'invalid_request',
      message: 'The connection contains unsupported fields.',
      retryable: false
    })
  })

  it('rejects invalid ports and empty identifiers', () => {
    expect(
      validateLocalSqlServerConnection({
        connectionId: '',
        host: 'localhost',
        port: 0,
        database: 'DemoDb',
        username: 'demo_user'
      })
    ).toEqual({
      code: 'invalid_request',
      message: 'The connection contains invalid fields.',
      retryable: false
    })
  })
})
