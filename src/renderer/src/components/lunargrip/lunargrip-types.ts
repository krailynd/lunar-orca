export type DatabaseEngine = 'sqlserver' | 'postgres' | 'mysql' | 'sqlite'

export type DatabaseConnection = {
  id: string
  name: string
  engine: DatabaseEngine
  host: string
  port: number
  database: string
  username: string
  isRemote: boolean
  lastConnected?: number
}

export type LunarGripUiState =
  | 'disconnected'
  | 'configuring'
  | 'connected'
  | 'loading'
  | 'partial'
  | 'stale'
  | 'failed'
  | 'demo'

export type TableColumn = {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
  isForeignKey?: boolean
  references?: { table: string; column: string }
}

export type SchemaTable = {
  schema: string
  name: string
  columns: TableColumn[]
  rowCount?: number
}

export type DatabaseSchemaSnapshot = {
  database: string
  engine: DatabaseEngine
  tables: SchemaTable[]
  generatedAt: number
  server: string
  schema: string
  source: 'demo' | 'real'
  status: Extract<LunarGripUiState, 'connected' | 'partial' | 'stale' | 'demo'>
}

export type BakFileInspection = {
  databaseName: string
  backupType: 'Full' | 'Differential' | 'Log'
  backupStartDate: string
  backupFinishDate: string
  dataLogicalName: string
  dataFilePhysical: string
  logLogicalName: string
  logFilePhysical: string
}

export type BackupDatabaseOptions = {
  database: string
  targetBakPath: string
  backupName?: string
  formatMedia?: boolean
  compression?: boolean
  checksum?: boolean
}

export type RestoreDatabaseOptions = {
  targetDatabase: string
  sourceBakPath: string
  moveDataLogical?: string
  moveDataToMdf?: string
  moveLogLogical?: string
  moveLogToLdf?: string
  replace?: boolean
  recoveryMode?: 'RECOVERY' | 'NORECOVERY'
}

export type AttachDatabaseOptions = {
  databaseName: string
  mdfPath: string
  ldfPath?: string
  rebuildLog?: boolean
}

export type DetachDatabaseOptions = {
  databaseName: string
  dropConnections?: boolean
  updateStatistics?: boolean
}
