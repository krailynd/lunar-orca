# Investigación comparativa para un cliente SQL profesional

*Fecha: 2026-10-13 · Alcance: SSMS, DataGrip, DBeaver, SQL Tools Service,
seguridad de asistentes, introspección, migraciones y observabilidad.*

## Resumen ejecutivo

La referencia correcta no es solo “un editor SQL con un diagrama”. Un producto
profesional combina seis sistemas: conexión y seguridad, editor/language
service, ejecución y resultados, comprensión del esquema, operaciones
administrativas y gobierno del cambio. SSMS destaca por la administración
profunda de SQL Server; DataGrip por introspección, navegación, consolas e
integración del editor; DBeaver por diagramas, edición visual y variedad de
motores. La oportunidad de LunarGrip es unir esas capacidades con el workspace,
worktrees y agentes de Lunar Orca, manteniendo una frontera de seguridad más
fuerte que la de un simple chat con base de datos.

## Hallazgos por producto

### SSMS: profundidad administrativa

La documentación de Microsoft presenta Object Explorer, Query Editor,
IntelliSense, planes de ejecución, Activity Monitor, Query Store, backup/restore,
Database Diagrams y comparación de esquemas como superficies distintas de una
misma herramienta. Esto indica que LunarGrip debe separar “desarrollo de
consultas”, “diagnóstico” y “operaciones administrativas” en modos con permisos
visibles, no esconder todo en un menú contextual.

**Aplicación:** añadir un centro de rendimiento, un centro operativo y un
generador de scripts con preview; no limitarse al ERD.

### DataGrip: comprensión del contexto

DataGrip documenta introspección configurable, filtros de esquemas, múltiples
consolas, historial local, navegación desde usos hacia DDL, análisis en el
editor, explain plan y diagramas con niveles de detalle. Su lección principal
es que el árbol, el editor, el resultado y el diagrama deben compartir el mismo
modelo de metadatos y navegación.

**Aplicación:** cualquier objeto debe abrirse desde varias superficies: árbol,
query, resultado, diagrama, dependencia y documentación.

### DBeaver: diagramas que no obligan a mutar

DBeaver documenta diagramas de tablas, vistas y esquemas; notas, palette,
auto-layout, búsqueda, minimapa, notaciones, exportación y un modo de edición
separado. El modo de edición convierte acciones visuales en SQL revisable antes
de aplicarlo. También contempla diagramas personalizados y relaciones virtuales.

**Aplicación:** el diagrama de LunarGrip debe ser de solo lectura por defecto;
los cambios visuales han de generar una propuesta de script, nunca tocar la
base de forma implícita.

### SQL Tools Service: patrón de proceso separado

La documentación del SQL Tools SDK describe un host separado por workspace,
comunicación por stdin/stdout con JSON-RPC, mensajes request/response/event,
gestión de conexiones, ejecución y capacidades de language service. Es un
patrón probado para que el editor sobreviva a la caída del servicio y para
aislar las responsabilidades de UI y datos.

**Aplicación:** el core de LunarGrip debe tener lifecycle independiente de la
UI y contratos con correlación, errores tipados, cancelación y eventos de
progreso.

### OWASP: la IA necesita una frontera de herramientas

OWASP identifica prompt injection directa e indirecta, exfiltración, contenido
codificado, envenenamiento de recuperación y excessive agency. Un texto en una
descripción de tabla, comentario, issue, página web o resultado SQL es dato no
confiable; no puede convertirse en instrucciones para el agente. La defensa
real debe estar en permisos y límites de herramienta, no solo en prompts.

**Aplicación:** el agente nunca recibe credenciales ni un canal de ejecución
directo; la autorización se verifica de nuevo en el adaptador con la acción
exacta, objetivo exacto y sesión exacta.

### OpenTelemetry: observabilidad interoperable

Las convenciones SQL de OpenTelemetry definen atributos como sistema, namespace,
operación, resumen, query, procedimiento almacenado, servidor, estado de
respuesta y filas devueltas. También recomiendan distinguir información
recomendable de información opt-in, especialmente parámetros y texto SQL.

**Aplicación:** diseñar telemetría redactable y de bajo cardinality, con
captura del SQL completo solo bajo una política explícita.

## Conclusiones de diseño

1. LunarGrip necesita **modos operativos**, no una sola pantalla:
   explorar, desarrollar, diagnosticar, comparar, operar y documentar.
2. El objeto canónico debe incluir más que tablas: vistas, rutinas, tipos,
   triggers, jobs cuando el motor los exponga, permisos, dependencias,
   comentarios, estadísticas y capacidades del servidor.
3. El layout es un artefacto, pero el producto también necesita artefactos de
   consulta, explain plan, diff, migración, auditoría y documentación.
4. El bridge con agentes debe ser un sistema de propuestas verificables, no una
   caja de texto que pueda ejecutar comandos.
5. La primera versión debe ser excelente en lectura, navegación, diagnóstico y
   generación de scripts; backup/restore y DDL asistido van después.

## Fuentes primarias consultadas

1. [Microsoft Learn — Components and features in SSMS](https://learn.microsoft.com/en-us/ssms/components-features)
   — superficie funcional de SSMS.
2. [Microsoft Learn — SSMS](https://learn.microsoft.com/en-us/ssms/)
   — documentación general y administración.
3. [JetBrains — Database diagrams](https://www.jetbrains.com/help/datagrip/creating-diagrams.html)
   — diagramas y navegación visual.
4. [JetBrains — Introspection](https://www.jetbrains.com/help/datagrip/introspection.html)
   — metadatos y rendimiento de introspección.
5. [JetBrains — Running queries](https://www.jetbrains.com/help/datagrip/running-queries.html)
   — consolas y ejecución.
6. [DBeaver — ER diagrams](https://dbeaver.com/docs/dbeaver/ER-Diagrams/)
   — diagramas, edición y exportación.
7. [Microsoft SQL Tools SDK — JSON-RPC](https://microsoft.github.io/sqltoolssdk/guide/jsonrpc_protocol.html)
   — separación host/editor y protocolo.
8. [OWASP — LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
   — amenazas y defensas.
9. [OpenTelemetry — SQL database semantic conventions](https://opentelemetry.io/docs/specs/semconv/db/sql/)
   — atributos de trazas SQL.
10. [PostgreSQL — Information Schema](https://www.postgresql.org/docs/current/information-schema.html)
    y [System Catalogs](https://www.postgresql.org/docs/current/catalogs.html).
11. [MySQL — INFORMATION_SCHEMA](https://dev.mysql.com/doc/refman/8.4/en/information-schema.html).
12. [Microsoft Learn — Catalog Views](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/catalog-views-transact-sql)
    — catálogo específico de SQL Server.
13. [Flyway — Migrations](https://documentation.red-gate.com/fd/migrations-271585107.html)
    y [Liquibase — Changelog](https://docs.liquibase.com/concepts/changelog.html)
    — historial y control del cambio.

## Límites de la investigación

La búsqueda web directa entregó documentación primaria y resúmenes de
resultados; no se ejecutaron benchmarks, pruebas de compatibilidad ni auditoría
de licencias de cada dependencia. Los enlaces son evidencia para diseñar
requisitos, no autorización para copiar código o afirmar paridad completa.
