# Problemas investigados y oportunidades de solución

*Fecha de corte: 2026-10-13. Las señales de comunidad se separan de la
evidencia de documentación oficial; no se presentan como una encuesta
estadística propia.*

## Hallazgo central

Un analista no sufre solo porque escribir SQL sea difícil. Sufre porque la
pregunta, la definición del dato, el permiso, la consulta, el resultado, el
dashboard y la decisión quedan repartidos entre chat, hojas de cálculo,
tickets, notebooks, SSMS, Airflow, dbt y carpetas sin relación. Un data
engineer sufre porque, cuando algo falla, tiene que reconstruir manualmente qué
cambió, qué datos afectó, quién es dueño y cómo repetir o revertir la ejecución.

LunarGrip debe resolver el **ciclo completo de trabajo de datos**, no competir
con cada plataforma de almacenamiento u orquestación.

## Problemas de analistas y solución propuesta

| Problema | Señal recurrente | Solución en Lunar Orca |
|---|---|---|
| Solicitudes repetitivas | Peticiones ad hoc y aclaraciones constantes | Data Request como tarea con plantilla, definición de éxito, SQL y resultado reutilizable |
| No saber qué tabla usar | Catálogos y nombres poco confiables | Búsqueda semántica sobre metadatos, comentarios, ejemplos y lineage |
| Métricas contradictorias | “Ingresos” cambia entre reportes | Metric Card con definición, fórmula, filtros, owner y versión |
| Dashboard sin confianza | Números sin freshness, calidad ni origen | Evidence panel: última actualización, checks, lineage y query |
| Esperar a ingeniería | Acceso y modelos bloquean respuestas | Self-service seguro: modelos certificados y consultas read-only acotadas |
| Rehacer análisis | No se conserva contexto ni supuestos | SQL notebook reproducible, con parámetros, snapshot y resultado |
| Exportaciones manuales | Copiar datos a CSV sin trazabilidad | Export job con alcance, redacción, expiración y auditoría |
| Requisitos ambiguos | Re-trabajo por pedidos mal definidos | Plantilla de Request: pregunta, población, periodo, métrica, decisión y aceptación |
| No poder explicar el número | Falta de datos de procedencia | “Explain this number”: consulta, modelos, filtros, fuentes y calidad |
| Conocimiento en personas | Onboarding lento | Data cards y documentación viva ligada a objetos reales |

## Problemas de data engineers y solución propuesta

| Problema | Consecuencia | Solución en Lunar Orca |
|---|---|---|
| Schema drift | Pipelines rotos o columnas mal mapeadas | Contratos de esquema, diff antes del cambio y clasificación breaking/non-breaking |
| Backfills peligrosos | Duplicados, huecos, costos y errores | Backfill Planner con particiones, idempotencia, dry-run, checkpoint y rollback |
| Fallas silenciosas | Datos stale o parciales llegan a consumidores | Quality gates de freshness, volumen, nulls, unicidad, distribución y completeness |
| DAG/pipeline sprawl | Dependencias difíciles de comprender | Grafo de assets, runs, jobs y tareas vinculado al plan y al código |
| Logs aislados | RCA lenta | Incident workspace que combina run, log, snapshot, lineage, cambios y owner |
| Alert fatigue | Se ignoran señales útiles | Alertas por impacto y SLA, deduplicadas por causa raíz |
| Ownership difuso | Nadie responde por un dato | Owner, steward, SLA, escalamiento y aceptación en cada asset |
| Lógica duplicada | Resultados diferentes y mantenimiento doble | Detector de SQL/modelos similares y promoción a modelo certificado |
| Entornos divergentes | “Funciona en dev” | Snapshot compare, environment health y promoción con evidencia |
| Dependencias externas | APIs o conectores cambian sin aviso | Connector watch, schema contract y runbook vinculado |
| Costos invisibles | Consultas y jobs caros se repiten | Cost estimate, query budget y costo por asset/tarea cuando el motor lo permita |
| Deuda documental | Cambios inseguros | Definition of Done que exige owner, tests, lineage y runbook |

## Problemas de programadores que trabajan con datos

- El SQL vive separado del código de aplicación y no se valida en CI.
- Una migración no muestra impacto en consumidores.
- No hay preview confiable de locks, duración, compatibilidad y rollback.
- Los ambientes locales no reproducen tipos, permisos ni datos representativos.
- El bug report no conserva query, plan, parámetros seguros y versión del
  esquema.
- El PR revisa archivos, pero no la consecuencia sobre assets y métricas.

**Oportunidad:** una tarea de datos debe poder enlazar commit, migración,
snapshot, tests, plan, ejecución, incidente y resultado.

## Problemas organizativos que Orca puede resolver

Orca ya tiene el lugar natural para coordinar el trabajo. La oportunidad es
hacer que una tarjeta no sea solo texto:

1. **Asset:** qué tabla, modelo, archivo, dashboard o pipeline está involucrado.
2. **Owner:** quién responde y quién aprueba.
3. **Dependencias:** qué debe ocurrir antes.
4. **Evidencia:** snapshot, query, run, test, log o PR.
5. **Riesgo:** datos sensibles, producción, costo o mutación.
6. **SLA:** cuándo debe estar disponible o actualizado.
7. **Resultado:** qué se entregó y cómo se verificó.

## Priorización

### P0 — Diferenciador fuerte

- contexto de asset conectado a tarjetas y Gantt;
- catálogo y lineage read-only;
- request reproducible;
- schema diff y drift;
- incident workspace;
- quality gates y freshness;
- propuestas de agente con aprobación.

### P1 — Valor profesional

- backfill planner;
- data contracts;
- metric cards y semantic definitions;
- explain plan y query performance;
- cost hints;
- connector/source health;
- runbooks y postmortems.

### P2 — Expansión

- notebooks multi-lenguaje;
- data marketplace interno;
- experimentos de impacto;
- optimización automática con benchmark;
- conectores externos sofisticados;
- colaboración y revisión avanzada.

## Lo que no conviene construir

- Un warehouse propio.
- Un reemplazo completo de Airflow, dbt, Spark o Databricks.
- Un catálogo que pretenda saberlo todo sin conectores.
- Un “agente autónomo” con permisos de producción.
- Un dashboard genérico sin una pregunta o decisión asociada.

