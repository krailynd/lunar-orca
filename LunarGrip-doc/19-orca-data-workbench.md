# Orca Data Workbench

## Concepto

La integración recomendada no es agregar un botón LunarGrip al sidebar y dejar
el trabajo aislado. Es crear un **Data Workbench** que use las primitivas
existentes de Orca:

```text
Workspace Orca
├── Proyectos y worktrees
├── Tasks: request, cambio, incidente, investigación
├── Kanban: flujo de estado y ownership
├── Gantt: dependencias, ventanas y fechas
├── Terminal: dbt, Airflow, Python, SQL CLI, Docker
├── Agentes: análisis, propuesta, revisión y documentación
└── LunarGrip: assets, consultas, calidad, lineage y operaciones
```

## Tipos de tarjeta de datos

| Tipo | Entrada | Entrega |
|---|---|---|
| `data-request` | Pregunta y criterio de éxito | SQL/notebook, resultado y definición |
| `data-investigation` | Síntoma o discrepancia | Hallazgos, evidencia y recomendación |
| `schema-change` | Cambio propuesto | Diff, impacto, migración y rollback |
| `pipeline-change` | Job/modelo afectado | Código, tests, run y lineage |
| `quality-incident` | Fallo de freshness/accuracy | Diagnóstico, mitigación y postmortem |
| `backfill` | Rango temporal y asset | Plan, dry-run, ejecución y validación |
| `performance` | Consulta o SLA degradado | Plan comparado, benchmark y cambio |
| `documentation` | Asset sin definición | Data card, owner, ejemplos y glossary |
| `access-request` | Persona y alcance | Permiso aprobado, expiración y auditoría |

## Kanban orientado a evidencia

El tablero no debe representar solo “pendiente/en curso/hecho”:

```text
Intake → Clarificar → Contextualizar → Diseñar → Validar → Aprobar
       → Ejecutar → Verificar → Documentar → Cerrado
```

Cada transición tiene una condición:

| Transición | Evidencia mínima |
|---|---|
| Intake → Clarificar | Persona solicitante, pregunta y fecha |
| Clarificar → Contextualizar | Asset, entorno, owner y definición |
| Contextualizar → Diseñar | Snapshot, lineage o evidencia de ausencia |
| Diseñar → Validar | Propuesta, riesgo y plan de prueba |
| Validar → Aprobar | Resultado de pruebas y revisión |
| Aprobar → Ejecutar | Aprobación exacta y ventana |
| Ejecutar → Verificar | Run ID, resultado y checks |
| Verificar → Documentar | Impacto, enlaces y conclusión |
| Documentar → Cerrado | Artefacto reproducible y owner |

## Gantt orientado a ventanas de datos

El Gantt debe soportar:

- ventanas de carga y freeze;
- dependencia entre assets, jobs y tareas;
- SLA de frescura;
- mantenimiento y backfill;
- aprobación previa a producción;
- tiempo estimado versus real;
- bloqueo por upstream;
- ejecución paralela limitada por capacidad;
- hitos: snapshot, dry-run, canary, validación y rollback.

No debe fingir precisión: si el sistema no conoce duración histórica, muestra
estimación con incertidumbre y aprende de runs registrados.

## Workspace de incidente

Al fallar un pipeline o test, Orca debe poder crear una vista con:

1. severidad y SLA afectado;
2. asset y consumidores;
3. última ejecución buena y primera mala;
4. cambios recientes en código, esquema y configuración;
5. upstream/downstream lineage;
6. logs y errores correlacionados;
7. tests fallidos y datos afectados;
8. owner y canal de escalamiento;
9. mitigación segura;
10. postmortem y acción preventiva.

## Agentes en el Workbench

| Agente | Puede leer | Entrega | No puede |
|---|---|---|---|
| Analista | catálogo, snapshots, ejemplos aprobados | query/notebook y explicación | exportar sin política |
| Data engineer | runs, lineage, logs, contratos | fix/backfill/plan | aplicar en producción |
| DBA | planes, permisos, sesiones | diagnóstico/migración | ocultar impacto |
| Reviewer | requisitos, diff, tests, riesgo | veredicto | cambiar evidencia |
| Documentador | decisiones y resultados | data card/runbook/postmortem | inventar estado |

Estos roles son de producto. El lifecycle real de agentes sigue siendo
responsabilidad del arnés PI y su contrato existente.

## Integraciones prioritarias

| Sistema | Integración inicial |
|---|---|
| SQL Server/PostgreSQL/MySQL | snapshot, query, plan, permisos, schema diff |
| dbt | manifest, modelos, tests, exposures, docs y run |
| Airflow | DAG, task, asset/dataset, run, log y estado |
| OpenLineage/Marquez | jobs, datasets, runs y facets |
| Airbyte/Fivetran | conexión, schema change, sync, error y release |
| Git | modelo, SQL, migration, PR, commit y blame |
| Notebooks | celdas, parámetros, outputs, entorno y ejecución |
| BI | dashboard, métrica, owner y exposure |
| Orquestación Orca | task, Kanban, Gantt, dependencia y agente |

## UX recomendada

Seleccionar una tarjeta abre un inspector contextual:

```text
Pregunta | Asset | Owner | Entorno | Calidad | Lineage | Código | Runs | Riesgo
```

Así el usuario puede pasar de una petición de negocio a una tabla, de una tabla
a una transformación, de la transformación a un job y del job a un incidente
sin reconstruir el contexto manualmente.

