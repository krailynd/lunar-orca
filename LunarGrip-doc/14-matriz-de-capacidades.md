# Matriz de capacidades profesionales

## Modos del producto

| Modo | Pregunta del profesional | Capacidades mínimas | Prioridad |
|---|---|---|---:|
| Explorar | ¿Qué existe y cómo se relaciona? | árbol lazy, búsqueda, metadatos, dependencias, ERD | P0 |
| Desarrollar | ¿Cómo escribo y valido SQL? | editor, diagnóstico, completion, navegación, resultados | P0 |
| Diagnosticar | ¿Por qué está lenta o bloqueada? | explain, plan, waits, sesiones, Query Store/adaptador | P1 |
| Comparar | ¿Qué cambió entre entornos? | snapshot, schema diff, drift, script reversible | P0 |
| Operar | ¿Cómo hago una tarea administrativa? | preview, permisos, backup/restore, progreso, rollback | P1 |
| Documentar | ¿Cómo dejo conocimiento reutilizable? | comentarios, data dictionary, diagramas, exportación, ADR | P1 |
| Asistir | ¿Cómo uso IA sin perder control? | contexto acotado, propuesta, riesgo, aprobación, auditoría | P0 |

## Capacidades que faltaban

### 1. Conexión profesional

- perfiles por entorno con colores y warning inequívoco;
- autenticación integrada, secret store, certificado, TLS y timeout;
- prueba de conexión sin ejecutar consultas de negocio;
- sesiones separadas por workspace;
- desconexión, expiración, reconexión y reautenticación;
- capacidad negociada del motor;
- permisos efectivos visibles en vez de asumirlos.

### 2. Editor SQL real

- completion contextual por alias, schema y motor;
- hover con tipo, nullabilidad, comentario y definición;
- go-to-definition y find-usages;
- rename semántico solo como propuesta;
- format/lint por dialecto;
- selección de statement y ejecución parcial;
- múltiples resultados, mensajes, warnings y errores con línea/columna;
- historial local buscable y recuperación tras cierre;
- parámetros seguros y modo de resultados sensibles;
- consulta estimada versus real, plan gráfico y plan textual.

### 3. Resultados y datos

- virtualización y streaming;
- pinning de columnas, resize, orden, filtros y export;
- copiar con redacción configurable;
- tipos ricos: JSON, XML, binario, geometría, fechas y null;
- diferencias entre dos resultados;
- paginación explícita y límite de filas;
- edición en celda solo en modo protegido, con diff de cambios y script;
- transacción visible, commit/rollback explícito y timeout.

### 4. Modelo de esquema

- tablas, vistas, materialized views cuando existan, rutinas, tipos, secuencias,
  triggers, índices, constraints, particiones, permisos, comentarios y jobs;
- origen de cada dato y nivel de confianza;
- dependencias directas e indirectas;
- relaciones físicas y virtuales separadas visualmente;
- snapshot hash, versión del motor y capabilities;
- introspección configurable por schema/objeto para evitar sobrecarga.

### 5. Diagramas de primera clase

- completo, selección, vecindario y dependencias;
- Crow's Foot, IDEF1X y notación simple;
- layout reproducible y layout manual;
- minimapa, búsqueda, filtros, grupos y notas;
- visibilidad de PK/FK, índices, nullabilidad, tipos y comentarios;
- doble clic a DDL, query y objeto;
- diff visual entre snapshots;
- export a SVG/PNG/Mermaid/PlantUML/GraphML tras revisión legal;
- relaciones virtuales con advertencia de que no existen físicamente.

### 6. Operaciones de DBA

- sesiones, locks, bloqueos, waits y consultas costosas;
- explain y comparación de planes;
- estadísticas y sugerencias con evidencia;
- backup/restore guiado, sin ocultar el script;
- generate scripts y schema compare;
- import/export con mapping, preview y validación;
- mantenimiento separado por nivel de permiso;
- modo de solo lectura global y por conexión.

### 7. Integración con Git y worktrees

- scripts y migraciones ligados al proyecto;
- binding declarativo sin secretos;
- comparación de snapshot contra archivo;
- revisión como diff;
- historial de quién generó una propuesta;
- compatibilidad con carpeta sin Git y worktrees;
- artefactos que no contaminan ramas sin intención.

### 8. Agentes

- herramientas read-only separadas de herramientas de propuesta;
- schema context con presupuesto y redacción;
- respuesta estructurada;
- citación de objetos;
- evaluación contra fixtures;
- aprobación por acción exacta;
- rechazo, expiración y revocación;
- auditoría y replay de la decisión.

### 9. Calidad del producto

- teclado completo y atajos configurables;
- navegación para lector de pantalla;
- estados vacíos, loading, offline, error y permisos insuficientes;
- recuperación ante caída del core;
- métricas de latencia y memoria;
- logs diagnósticos sin secretos;
- importación/exportación de configuración sin credenciales.

