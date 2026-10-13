import type {
  AttachDatabaseOptions,
  BackupDatabaseOptions,
  DetachDatabaseOptions,
  RestoreDatabaseOptions
} from './lunargrip-types'

function escapeSqlIdentifier(name: string): string {
  return `[${name.replace(/\]/g, ']]')}]`
}

function escapeSqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

/** Generates T-SQL for creating a full database backup (.BAK) */
export function generateBackupDatabaseSql(options: BackupDatabaseOptions): string {
  const db = escapeSqlIdentifier(options.database)
  const path = escapeSqlString(options.targetBakPath)
  const withClauses: string[] = []

  if (options.formatMedia) {
    withClauses.push('FORMAT', "INIT, MEDIANAME = 'LunarGrip_Backup'")
  }
  if (options.backupName) {
    withClauses.push(`NAME = ${escapeSqlString(options.backupName)}`)
  } else {
    withClauses.push(`NAME = ${escapeSqlString(`LunarGrip Full Backup of ${options.database}`)}`)
  }
  if (options.compression) {
    withClauses.push('COMPRESSION')
  }
  if (options.checksum) {
    withClauses.push('CHECKSUM')
  }
  withClauses.push('STATS = 10')

  return `BACKUP DATABASE ${db}\nTO DISK = ${path}\nWITH ${withClauses.join(', ')};\nGO`
}

/** Generates T-SQL for inspecting a .BAK backup file header and logical file list */
export function generateInspectBakFileSql(bakPath: string): string {
  const path = escapeSqlString(bakPath)
  return `-- Inspeccionar metadatos de cabecera del archivo de copia de seguridad\nRESTORE HEADERONLY FROM DISK = ${path};\nGO\n\n-- Listar nombres lógicos de archivos (.mdf de datos y .ldf de registro)\nRESTORE FILELISTONLY FROM DISK = ${path};\nGO`
}

/** Generates T-SQL for restoring a database from a .BAK file with optional relocation */
export function generateRestoreDatabaseSql(options: RestoreDatabaseOptions): string {
  const db = escapeSqlIdentifier(options.targetDatabase)
  const path = escapeSqlString(options.sourceBakPath)
  const clauses: string[] = []

  if (options.moveDataLogical && options.moveDataToMdf) {
    clauses.push(
      `MOVE ${escapeSqlString(options.moveDataLogical)} TO ${escapeSqlString(options.moveDataToMdf)}`
    )
  }
  if (options.moveLogLogical && options.moveLogToLdf) {
    clauses.push(
      `MOVE ${escapeSqlString(options.moveLogLogical)} TO ${escapeSqlString(options.moveLogToLdf)}`
    )
  }
  if (options.replace) {
    clauses.push('REPLACE')
  }
  clauses.push(options.recoveryMode === 'NORECOVERY' ? 'NORECOVERY' : 'RECOVERY')
  clauses.push('STATS = 5')

  return `-- Forzar desconexión de usuarios existentes antes de restaurar\nALTER DATABASE ${db} SET SINGLE_USER WITH ROLLBACK IMMEDIATE;\nGO\n\nRESTORE DATABASE ${db}\nFROM DISK = ${path}\nWITH ${clauses.join(',\n     ')};\nGO\n\nALTER DATABASE ${db} SET MULTI_USER;\nGO`
}

/** Generates T-SQL for attaching an existing MDF (and optional LDF) database file */
export function generateAttachDatabaseSql(options: AttachDatabaseOptions): string {
  const db = escapeSqlIdentifier(options.databaseName)
  const mdf = escapeSqlString(options.mdfPath)

  if (options.rebuildLog || !options.ldfPath) {
    return `CREATE DATABASE ${db}\nON (FILENAME = ${mdf})\nFOR ATTACH_REBUILD_LOG;\nGO`
  }

  const ldf = escapeSqlString(options.ldfPath)
  return `CREATE DATABASE ${db}\nON (FILENAME = ${mdf}),\n   (FILENAME = ${ldf})\nFOR ATTACH;\nGO`
}

/** Generates T-SQL for cleanly detaching an existing database */
export function generateDetachDatabaseSql(options: DetachDatabaseOptions): string {
  const db = escapeSqlIdentifier(options.databaseName)
  const prefix = options.dropConnections
    ? `ALTER DATABASE ${db} SET SINGLE_USER WITH ROLLBACK IMMEDIATE;\nGO\n\n`
    : ''
  const skipChecks = options.updateStatistics ? "'false'" : "'true'"
  return `${prefix}EXEC master.dbo.sp_detach_db @dbname = ${escapeSqlString(options.databaseName)}, @skipchecks = ${skipChecks};\nGO`
}
