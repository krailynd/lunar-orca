import type {
  LocalSqlServerConnection,
  LunarGripProviderError
} from '../../shared/lunargrip-provider-types'

const CONNECTION_ID_MAX_LENGTH = 160
const DATABASE_NAME_MAX_LENGTH = 128
const USERNAME_MAX_LENGTH = 128
const PASSWORD_MAX_LENGTH = 256
const HOST_MAX_LENGTH = 255
const ALLOWED_KEYS = new Set([
  'connectionId',
  'host',
  'port',
  'database',
  'username',
  'password',
  'encrypt',
  'trustServerCertificate'
])

export function validateLocalSqlServerConnection(
  value: unknown
): LocalSqlServerConnection | LunarGripProviderError {
  if (!isRecord(value)) {
    return invalidRequest('A connection object is required.')
  }

  if (Object.keys(value).some((key) => !ALLOWED_KEYS.has(key))) {
    return invalidRequest('The connection contains unsupported fields.')
  }

  const forbiddenKeys = ['secret', 'token', 'connectionString']
  if (forbiddenKeys.some((key) => key in value)) {
    return invalidRequest('Credentials and connection strings are not accepted by this API.')
  }

  const {
    connectionId,
    host,
    port,
    database,
    username,
    password,
    encrypt,
    trustServerCertificate
  } = value
  if (
    !isBoundedString(connectionId, CONNECTION_ID_MAX_LENGTH) ||
    !isBoundedString(host, HOST_MAX_LENGTH) ||
    !isBoundedInteger(port, 1, 65_535) ||
    !isBoundedString(database, DATABASE_NAME_MAX_LENGTH) ||
    !isBoundedString(username, USERNAME_MAX_LENGTH) ||
    !isOptionalPassword(password) ||
    !isOptionalBoolean(encrypt) ||
    !isOptionalBoolean(trustServerCertificate)
  ) {
    return invalidRequest('The connection contains invalid fields.')
  }

  const connection: LocalSqlServerConnection = {
    connectionId,
    host: host.toLowerCase(),
    port,
    database,
    username
  }
  if (typeof password === 'string') {
    connection.password = password
  }
  if (typeof encrypt === 'boolean') {
    connection.encrypt = encrypt
  }
  if (typeof trustServerCertificate === 'boolean') {
    connection.trustServerCertificate = trustServerCertificate
  }
  return connection
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

// Why: SQL logins may use an empty password; only bound the length here.
function isOptionalPassword(value: unknown): value is string | undefined {
  return value === undefined || (typeof value === 'string' && value.length <= PASSWORD_MAX_LENGTH)
}

function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === 'boolean'
}
