# Roadmap documental y de producto

## Fase D0 — Orden documental

**Resultado:** este directorio, vocabulario común, estado de evidencia,
requisitos, riesgos y criterios.  
**Salida:** no requiere código.

## Fase D1 — Decisiones de integración

Confirmar API de panes, persistencia, hosts remoto, lifecycle de agentes,
autorización y primer adaptador.  
**Criterio:** decisiones registradas y preguntas sin dueño identificadas.

## Fase P0 — Contratos y fixtures

Definir snapshot, layout, propuesta y auditoría; crear fixtures sintéticas y
casos de error.  
**Criterio:** contratos versionados y validables sin una base real.

## Fase P0.5 — Experiencia y seguridad base

Definir modos Explorar/Desarrollar/Diagnosticar/Comparar/Operar/Asistir,
clasificación de datos, capacidades del motor, estados de UI, accesibilidad,
redacción y matriz de permisos.  
**Criterio:** cada capacidad tiene actor, permiso, evidencia, estado de error y
prueba de abuso definida.

## Fase P1 — Lectura segura

Conexión explícita, introspección, Object Explorer y resultados por lotes.  
**Criterio:** se puede leer y cancelar una consulta en un entorno de prueba sin
mutaciones implícitas.

## Fase P2 — Diagramas versionables

Generación desde snapshot, navegación por vecindario, layout y exportación
revisada.  
**Criterio:** un cambio de esquema se distingue de un cambio visual en Git.

## Fase P3 — Bridge de agentes

Contexto acotado, propuestas estructuradas, revisión humana y trazabilidad PI.  
**Criterio:** un agente puede explicar y proponer, pero no ejecutar por sí solo.

## Fase P3.5 — Evaluación y observabilidad

Agregar fixtures de prompt injection, snapshots obsoletos, fallos de red,
timeouts, permisos y acciones destructivas; registrar métricas compatibles con
OpenTelemetry y sin datos sensibles.  
**Criterio:** los casos de abuso fallan cerrados y cada propuesta se puede
reconstruir sin guardar secretos.

## Fase P4 — Operaciones controladas

Scripts, backup/restore y tareas administrativas con permisos y guardas.  
**Criterio:** cada acción sensible muestra alcance, preview, riesgo y rollback.

## Fase P5 — Multi-motor

Agregar adaptadores después de estabilizar el contrato común.  
**Criterio:** el mismo conjunto de casos de contrato funciona en más de un motor.

## Regla de prioridad

Primero seguridad, contratos, evidencia y cancelación; después comodidad,
analítica avanzada, centralidad del grafo y automatizaciones.

## Orden recomendado para el Data Workbench

1. Asset + Evidence + Owner.
2. Data Request reproducible.
3. Quality signal + schema diff.
4. Incident workspace.
5. Backfill planner.
6. Integración Kanban/Gantt con dependencias y SLA.
7. Agentes read-only y luego propuestas.
8. Multi-motor y operaciones avanzadas.
