import type {
  LocalSqlServerConnection,
  LunarGripProviderError
} from '../../shared/lunargrip-provider-types'

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const CONNECTION_ID_MAX_LENGTH = 160
const DATABASE_NAME_MAX_LENGTH = 128
const USERNAME_MAX_LENGTH = 128
const ALLOWED_KEYS = new Set(['connectionId', 'host', 'port', 'database', 'username'])

export function validateLocalSqlServerConnection(
  value: unknown
): LocalSqlServerConnection | LunarGripProviderError {
  if (!isRecord(value)) {
    return invalidRequest('A connection object is required.')
  }

  if (Object.keys(value).some((key) => !ALLOWED_KEYS.has(key))) {
    return invalidRequest('The connection contains unsupported fields.')
  }

  const forbiddenKeys = ['password', 'secret', 'token', 'connectionString']
  if (forbiddenKeys.some((key) => key in value)) {
    return invalidRequest('Credentials and connection strings are not accepted by this API.')
  }

  const { connectionId, host, port, database, username } = value
  if (
    !isBoundedString(connectionId, CONNECTION_ID_MAX_LENGTH) ||
    !isBoundedString(host, 255) ||
    !isBoundedInteger(port, 1, 65_535) ||
    !isBoundedString(database, DATABASE_NAME_MAX_LENGTH) ||
    !isBoundedString(username, USERNAME_MAX_LENGTH)
  ) {
    return invalidRequest('The connection contains invalid fields.')
  }

  if (!LOOPBACK_HOSTS.has(host.toLowerCase())) {
    return {
      code: 'remote_host_rejected',
      message: 'Only local SQL Server hosts are allowed in this phase.',
      retryable: false
    }
  }

  return { connectionId, host: host.toLowerCase(), port, database, username }
}

export function isProviderError(
  value: LocalSqlServerConnection | LunarGripProviderError
): value is LunarGripProviderError {
  return 'code' in value
}

function invalidRequest(message: string): LunarGripProviderError {
  return { code: 'invalid_request', message, retryable: false }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength
}

function isBoundedInteger(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}
