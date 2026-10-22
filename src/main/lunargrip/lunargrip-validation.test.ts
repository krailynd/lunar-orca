import { describe, expect, it } from 'vitest'
import { isProviderError, validateLocalSqlServerConnection } from './lunargrip-validation'

describe('LunarGrip connection validation', () => {
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

  it.each(['100.64.0.1', 'db.example.test', '192.168.1.20'])('accepts remote host %s', (host) => {
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

  it('accepts credentials and TLS options', () => {
    const result = validateLocalSqlServerConnection({
      connectionId: 'demo',
      host: 'db.example.test',
      port: 1433,
      database: 'DemoDb',
      username: 'demo_user',
      password: 'fixture-only',
      encrypt: true,
      trustServerCertificate: true
    })

    expect(isProviderError(result)).toBe(false)
    if (!isProviderError(result)) {
      expect(result.password).toBe('fixture-only')
      expect(result.encrypt).toBe(true)
      expect(result.trustServerCertificate).toBe(true)
    }
  })

  it('rejects connection strings and unknown fields before provider use', () => {
    expect(
      validateLocalSqlServerConnection({
        connectionId: 'demo',
        host: 'localhost',
        port: 1433,
        database: 'DemoDb',
        username: 'demo_user',
        connectionString: 'Server=localhost;User Id=sa'
      })
    ).toEqual({
      code: 'invalid_request',
      message: 'The connection contains unsupported fields.',
      retryable: false
    })
  })

  it('rejects invalid ports, empty identifiers, and oversized passwords', () => {
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

    expect(
      validateLocalSqlServerConnection({
        connectionId: 'demo',
        host: 'localhost',
        port: 1433,
        database: 'DemoDb',
        username: 'demo_user',
        password: 'x'.repeat(257)
      })
    ).toEqual({
      code: 'invalid_request',
      message: 'The connection contains invalid fields.',
      retryable: false
    })
  })
})
