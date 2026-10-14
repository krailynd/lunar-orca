import type { DatabaseConnection, DatabaseSchemaSnapshot } from './lunargrip-types'

export const DEFAULT_DATABASE_CONNECTIONS: DatabaseConnection[] = [
  {
    id: 'conn-local-sqlserver',
    name: 'SQL Server (Docker / Localhost)',
    engine: 'sqlserver',
    host: 'localhost',
    port: 1433,
    database: 'LunarDB',
    username: 'demo_user',
    isRemote: false
  }
]

export const MOCK_DATABASE_SCHEMA: DatabaseSchemaSnapshot = {
  database: 'LunarGrip Demo',
  engine: 'sqlserver',
  generatedAt: Date.now(),
  server: 'Demo local',
  schema: 'dbo',
  source: 'demo',
  status: 'demo',
  tables: [
    {
      schema: 'dbo',
      name: 'Usuarios',
      rowCount: 1420,
      columns: [
        { name: 'id', type: 'INT IDENTITY(1,1)', nullable: false, isPrimaryKey: true },
        { name: 'nombre', type: 'NVARCHAR(120)', nullable: false, isPrimaryKey: false },
        { name: 'email', type: 'NVARCHAR(200)', nullable: false, isPrimaryKey: false },
        { name: 'activo', type: 'BIT', nullable: false, isPrimaryKey: false },
        { name: 'creado_el', type: 'DATETIME2', nullable: false, isPrimaryKey: false }
      ]
    },
    {
      schema: 'dbo',
      name: 'Proyectos',
      rowCount: 85,
      columns: [
        { name: 'id', type: 'INT IDENTITY(1,1)', nullable: false, isPrimaryKey: true },
        {
          name: 'usuario_id',
          type: 'INT',
          nullable: false,
          isPrimaryKey: false,
          isForeignKey: true,
          references: { table: 'Usuarios', column: 'id' }
        },
        { name: 'codigo', type: 'VARCHAR(50)', nullable: false, isPrimaryKey: false },
        { name: 'nombre', type: 'NVARCHAR(150)', nullable: false, isPrimaryKey: false },
        { name: 'estado', type: 'VARCHAR(30)', nullable: false, isPrimaryKey: false }
      ]
    },
    {
      schema: 'dbo',
      name: 'Tareas',
      rowCount: 450,
      columns: [
        { name: 'id', type: 'BIGINT IDENTITY(1,1)', nullable: false, isPrimaryKey: true },
        {
          name: 'proyecto_id',
          type: 'INT',
          nullable: false,
          isPrimaryKey: false,
          isForeignKey: true,
          references: { table: 'Proyectos', column: 'id' }
        },
        { name: 'titulo', type: 'NVARCHAR(250)', nullable: false, isPrimaryKey: false },
        { name: 'arnes_agente', type: 'VARCHAR(40)', nullable: true, isPrimaryKey: false },
        { name: 'columna_kanban', type: 'VARCHAR(30)', nullable: false, isPrimaryKey: false },
        { name: 'fecha_inicio', type: 'DATE', nullable: true, isPrimaryKey: false },
        { name: 'fecha_fin', type: 'DATE', nullable: true, isPrimaryKey: false }
      ]
    },
    {
      schema: 'dbo',
      name: 'BackupsLog',
      rowCount: 38,
      columns: [
        { name: 'id', type: 'BIGINT IDENTITY(1,1)', nullable: false, isPrimaryKey: true },
        { name: 'archivo_bak', type: 'NVARCHAR(500)', nullable: false, isPrimaryKey: false },
        { name: 'tamanio_mb', type: 'DECIMAL(10,2)', nullable: false, isPrimaryKey: false },
        { name: 'completado_el', type: 'DATETIME2', nullable: false, isPrimaryKey: false }
      ]
    }
  ]
}
