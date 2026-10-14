# Feedback comunitario y fuentes

## Cómo interpretar estas señales

Se consultaron resultados de búsquedas web sobre Reddit, Stack Overflow,
YouTube, documentación de herramientas y reportes de la industria. Los
resultados comunitarios son **señales cualitativas**, no un muestreo
representativo. Antes de tomar una decisión comercial deben validarse con
entrevistas o una encuesta propia.

## Señales repetidas

### Comunidades y discusiones

- La gente describe frustración por calidad de datos, ownership difuso,
  pipelines que fallan o quedan atascados y ausencia de lineage accionable.
- Aparece rechazo al “tooling por moda” cuando no resuelve fundamentos:
  contratos, tests, freshness, documentación e incident response.
- Se repite la tensión entre construir features y mantener pipelines.
- Schema drift, datos tardíos, duplicados y backfills aparecen como problemas
  operativos de alto costo.

**Fuentes de señal:** [Reddit r/dataengineering — challenges](https://www.redditmedia.com/r/dataengineering/comments/1e14hpe/what_are_the_biggest_challenges_in_data/),
[Stack Overflow — debugging database query performance](https://stackoverflow.com/questions/3161315/how-to-debug-a-database-query-for-performance).

### Videos

Los videos de “day in the life” y experiencia real suelen mostrar el ciclo
mañana: revisar jobs, atender alertas, investigar logs, hablar con owners,
reparar pipeline y documentar. Sirven para diseñar escenarios de uso, no para
medir frecuencia.

**Fuentes exploratorias:** [Day in the Life of a Data Engineer](https://www.youtube.com/watch?v=4mCTFnhARpI),
[My real-time experience as a Data Engineer](https://www.youtube.com/watch?v=PAahb7HO13M),
[From Chaos to Clarity](https://www.youtube.com/watch?v=I2x4Hu1HwW0).

### Documentación y reportes

- dbt documenta semantic layer, lineage, tests, exposures, contracts y
  orchestration: son patrones para centralizar significado y dependencias.
- Airflow documenta scheduling basado en assets/datasets: el evento de datos
  puede ser la causa del workflow, no solo un horario.
- OpenLineage modela jobs, datasets, runs y facets: una base útil para unir
  ejecución con lineage.
- Databricks documenta lineage y monitoring de calidad: impacto y causa raíz
  necesitan metadata histórica, no solo un catálogo estático.
- Airbyte y Fivetran documentan que schema changes y updates de conectores
  requieren visibilidad y decisiones; la automatización opaca complica el
  diagnóstico.
- Microsoft Fabric muestra la convergencia de lakehouse, notebooks, pipelines,
  Git y despliegue.

## Fuentes primarias

1. [dbt Semantic Layer](https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl)
2. [dbt Tests](https://docs.getdbt.com/docs/build/tests)
3. [dbt Exposures](https://docs.getdbt.com/docs/build/exposures)
4. [dbt Model Contracts](https://docs.getdbt.com/reference/model-contracts)
5. [dbt Orchestration](https://docs.getdbt.com/docs/deploy/orchestration)
6. [Airflow Asset-aware Scheduling](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/asset-scheduling.html)
7. [OpenLineage Getting Started](https://openlineage.io/getting-started/)
8. [Databricks Unity Catalog Lineage](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage)
9. [Databricks Quality Monitoring](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-quality-monitoring/)
10. [Airbyte Schema Change Management](https://docs.airbyte.com/platform/using-airbyte/schema-change-management)
11. [Fivetran Connection Schemas](https://fivetran.com/docs/getting-started/fivetran-dashboard/connectors/schema)
12. [Microsoft Fabric Data Engineering](https://learn.microsoft.com/en-us/fabric/data-engineering/)
13. [Great Expectations Freshness](https://docs.greatexpectations.io/docs/reference/learn/data_quality_use_cases/freshness/)
14. [Great Expectations Schema](https://docs.greatexpectations.io/docs/reference/learn/data_quality_use_cases/schema/)

## Plan de validación con usuarios reales

1. Entrevistar cinco perfiles: analista, analytics engineer, data engineer,
   DBA y desarrollador de aplicación.
2. Pedir el último incidente o request real, no una opinión general.
3. Medir cuánto tardaron en encontrar asset, owner, query, causa y resultado.
4. Observar qué herramientas cambiaron durante el proceso.
5. Probar un prototipo documental con el mismo caso.
6. Registrar qué automatización reduce trabajo y qué automatización genera
   desconfianza.

## Preguntas de entrevista

- ¿Qué tarea repetís cada semana porque nadie la convirtió en flujo?
- ¿Cuándo fue la última vez que un dato “verde” estaba mal?
- ¿Cómo encontraste la causa raíz?
- ¿Qué información te faltó en la primera hora?
- ¿Qué cambios de esquema te enteraste tarde?
- ¿Cómo hacés un backfill y cómo comprobás que no duplicaste?
- ¿Qué parte de tu trabajo vive en chat o en tu memoria?
- ¿Qué nunca dejarías que un agente ejecute?
- ¿Qué debería abrir una tarjeta de Orca automáticamente?
- ¿Qué evidencia necesitás para confiar en un resultado?
