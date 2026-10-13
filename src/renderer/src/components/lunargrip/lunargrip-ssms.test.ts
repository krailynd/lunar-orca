import { describe, expect, it } from 'vitest'
import {
  generateAttachDatabaseSql,
  generateBackupDatabaseSql,
  generateDetachDatabaseSql,
  generateInspectBakFileSql,
  generateRestoreDatabaseSql
} from './lunargrip-ssms-generator'

describe('LunarGrip SSMS Generator', () => {
  it('generates valid full database backup T-SQL', () => {
    const sql = generateBackupDatabaseSql({
      database: 'LunarDB',
      targetBakPath: '/var/opt/mssql/data/LunarDB.bak',
      formatMedia: true,
      compression: true,
      checksum: true
    })
    expect(sql).toContain('BACKUP DATABASE [LunarDB]')
    expect(sql).toContain("TO DISK = '/var/opt/mssql/data/LunarDB.bak'")
    expect(sql).toContain('FORMAT')
    expect(sql).toContain('COMPRESSION')
    expect(sql).toContain('CHECKSUM')
  })

  it('generates inspect statements for .BAK headers', () => {
    const sql = generateInspectBakFileSql('/backups/prod.bak')
    expect(sql).toContain("RESTORE HEADERONLY FROM DISK = '/backups/prod.bak'")
    expect(sql).toContain("RESTORE FILELISTONLY FROM DISK = '/backups/prod.bak'")
  })

  it('generates restore database T-SQL with file relocation', () => {
    const sql = generateRestoreDatabaseSql({
      targetDatabase: 'LunarDB_Restored',
      sourceBakPath: '/backups/prod.bak',
      moveDataLogical: 'Lunar_Data',
      moveDataToMdf: '/var/opt/mssql/data/Lunar_Data.mdf',
      moveLogLogical: 'Lunar_Log',
      moveLogToLdf: '/var/opt/mssql/data/Lunar_Log.ldf',
      replace: true
    })
    expect(sql).toContain(
      'ALTER DATABASE [LunarDB_Restored] SET SINGLE_USER WITH ROLLBACK IMMEDIATE'
    )
    expect(sql).toContain('RESTORE DATABASE [LunarDB_Restored]')
    expect(sql).toContain("MOVE 'Lunar_Data' TO '/var/opt/mssql/data/Lunar_Data.mdf'")
    expect(sql).toContain("MOVE 'Lunar_Log' TO '/var/opt/mssql/data/Lunar_Log.ldf'")
    expect(sql).toContain('REPLACE')
    expect(sql).toContain('ALTER DATABASE [LunarDB_Restored] SET MULTI_USER')
  })

  it('generates attach and detach database T-SQL', () => {
    const attachSql = generateAttachDatabaseSql({
      databaseName: 'LunarDB_Attached',
      mdfPath: '/var/opt/mssql/data/LunarDB.mdf',
      ldfPath: '/var/opt/mssql/data/LunarDB_log.ldf'
    })
    expect(attachSql).toContain('CREATE DATABASE [LunarDB_Attached]')
    expect(attachSql).toContain("ON (FILENAME = '/var/opt/mssql/data/LunarDB.mdf')")
    expect(attachSql).toContain('FOR ATTACH')

    const detachSql = generateDetachDatabaseSql({
      databaseName: 'LunarDB_Attached',
      dropConnections: true
    })
    expect(detachSql).toContain(
      'ALTER DATABASE [LunarDB_Attached] SET SINGLE_USER WITH ROLLBACK IMMEDIATE'
    )
    expect(detachSql).toContain("sp_detach_db @dbname = 'LunarDB_Attached'")
  })
})
