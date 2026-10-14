# Plan de implementación profesional

## Estrategia

Construir por capas verticales, con lectura antes de escritura y fixtures
sintéticas. Cada fase debe entregar una capacidad usable y observable. No se
debe iniciar por el agente ni por el diagrama: sin contratos, permisos y
evidencia, ambas superficies amplifican errores.

## Fase 0 — Descubrimiento del workspace

**Investigar:** APIs nativas de Orca para Tasks, Kanban, Gantt, worktrees,
terminal, sesiones, permisos, notificaciones y artefactos.

**Entregables documentales:**

- mapa de integración;
- límites entre LunarGrip y PI;
- tipos de tarjeta;
- eventos y enlaces;
- matriz de host local/SSH.

**No implementar aún:** ningún adaptador de base real.

## Fase 1 — Contratos y fixture lake

Crear contratos de diseño para:

- Asset;
- Schema Snapshot;
- Pipeline Run;
- Quality Check;
- Data Request;
- Incident;
- Proposal;
- Evidence;
- Approval.

Fixtures deben incluir SQL Server, PostgreSQL, archivo, modelo dbt y DAG
ficticios, además de schema drift, dato stale y fallo parcial.

## Fase 2 — Catálogo local y exploración read-only

Implementar primero el camino:

```text
conectar → snapshot → buscar asset → ver detalle → abrir tarea
```

Debe funcionar sin IA y sin mutaciones. La calidad se mide por exactitud de
metadata, tiempo de navegación y mensajes de permiso.

## Fase 3 — SQL workspace y notebooks

Agregar:

- consultas guardadas;
- parámetros;
- historial;
- resultados reproducibles;
- explain/plan;
- celdas SQL y, después, Python;
- export seguro;
- links desde resultado a asset y tarea.

## Fase 4 — Lineage y quality signals

Consumir manifests/events existentes antes de inventar un formato incompatible.
Mostrar lineage de tabla/columna cuando la fuente lo soporte y marcar la
granularidad real. Añadir freshness, volumen, nullability, uniqueness,
referential integrity y schema checks.

## Fase 5 — Schema diff, contratos y drift

Comparar snapshots por entorno. Clasificar cambios:

- aditivo compatible;
- cambio de tipo;
- cambio de nullability;
- rename probable;
- eliminación;
- cambio de constraint;
- cambio con impacto incierto.

Generar propuesta y plan de verificación; no aplicar automáticamente.

## Fase 6 — Integración Kanban/Gantt

Convertir la evidencia en tareas y dependencias:

- incidentes desde quality failures;
- schema changes desde diffs;
- backfills con ventana;
- PR y runs como artefactos;
- SLA y owner en tarjetas;
- postmortem como condición de cierre.

## Fase 7 — Incidentes y backfills

Backfill debe exigir rango, partición, estrategia de idempotencia, dry-run,
estimación, límites, validación antes/después y rollback. Incident workspace
debe agrupar eventos y sugerir causas sin declarar certeza falsa.

## Fase 8 — Agentes gobernados

Primero agentes read-only para:

- explicar asset;
- encontrar lineage;
- resumir run;
- sugerir tests;
- redactar documentación.

Después agentes de propuesta para SQL, dbt, DAG y migraciones. La ejecución
queda fuera del agente y bajo aprobación.

## Fase 9 — Operación y multi-motor

Añadir acciones DBA, conectores y motores solo cuando existan:

- permisos;
- fixture;
- pruebas de compatibilidad;
- métrica de rendimiento;
- documentación de errores;
- rollback o mitigación.

## Gates por fase

| Gate | Pregunta |
|---|---|
| Correctitud | ¿La metadata y el resultado son fieles? |
| Seguridad | ¿Qué puede ver y hacer cada actor? |
| Reproducibilidad | ¿Se puede repetir con el mismo snapshot? |
| Operabilidad | ¿Se puede cancelar, reintentar y recuperar? |
| Integración | ¿Queda trazado en Orca sin duplicar PI? |
| Accesibilidad | ¿El flujo es usable sin ratón y con estados claros? |
| Valor | ¿Reduce trabajo real o solo agrega una vista? |

