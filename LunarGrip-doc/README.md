# LunarGrip — Centro documental de Lunar Orca

Este directorio contiene la visión, la planificación y la investigación del
futuro módulo **LunarGrip** dentro de **Lunar Orca**. Es documentación de
producto y arquitectura: no es código ejecutable y no reemplaza la
documentación operativa de `docs/` ni `docs-dev/`.

## Cómo leer este espacio

| Necesidad | Documento |
|---|---|
| Entender el producto | `01-vision-del-producto.md` |
| Saber qué existe hoy | `02-estado-actual-y-evidencia.md` |
| Entender la arquitectura objetivo | `03-arquitectura-objetivo.md` y `diagramas/arquitectura.md` |
| Conectar agentes y arnés PI | `04-contrato-de-agentes-y-harness.md` |
| Convertir la visión en trabajo | `05-requisitos-funcionales.md`, `06-requisitos-no-funcionales.md`, `07-roadmap.md` |
| Registrar dudas e investigación | `08-investigacion-y-feedback.md` |
| Tomar decisiones sin perder contexto | `09-decisiones-y-supuestos.md` |
| Consultar riesgos | `10-riesgos-y-guardas.md` |
| Preparar una futura implementación | `11-trazabilidad-y-criterios.md` |
| Consultar términos | `12-glosario.md` |
| Ver investigación externa | `13-investigacion-comparativa.md` |
| Priorizar capacidades profesionales | `14-matriz-de-capacidades.md` |
| Diseñar flujos reales de DBA | `15-flujos-profesionales.md` |
| Gobernar datos, IA y auditoría | `16-gobernanza-de-datos-y-ia.md` |
| Diseñar experiencia de uso | `17-experiencia-y-accesibilidad.md` |
| Resolver problemas de equipos de datos | `18-problemas-investigados-y-oportunidades.md` |
| Unir datos con Kanban/Gantt | `19-orca-data-workbench.md` |
| Diseñar implementaciones por capas | `20-plan-de-implementacion-profesional.md` |
| Medir valor y adopción | `21-metricas-y-evaluacion.md` |
| Revisar señales de comunidad | `22-feedback-comunitario-y-fuentes.md` |
| Problemas reales de Orca | `23-problemas-reales-de-orca.md` |
| Editor nativo compatible con Neovim | `24-editor-nativo-neovim.md` |
| GitHub, PRs y organización | `25-github-prs-y-organizacion.md` |
| Navegación, atajos y diseño | `26-navegacion-atajos-y-diseno.md` |
| Roadmap del editor y plataforma | `27-roadmap-editor-y-plataforma.md` |
| Investigación ampliada de problemas | `28-mapa-ampliado-de-problemas.md` |
| Problemas de remoto, móvil y recuperación | `29-remoto-movil-y-resiliencia.md` |
| Problemas de agentes, automatizaciones y seguridad | `30-agentes-automatizaciones-y-seguridad.md` |
| UX tipo SSMS | `31-especificacion-ux-ssms.md` |
| ERD y snapshots | `32-especificacion-erd.md` |
| Editor SQL | `33-especificacion-editor-sql.md` |
| Estados de conexión y demo | `34-estados-conexion-y-demo.md` |
| Sistema visual | `35-sistema-visual-lunargrip.md` |
| Matriz SSMS/LunarGrip | `36-matriz-ssms-vs-lunargrip.md` |
| Sistema visual global | `37-sistema-visual-global-lunar-orca.md` |
| Tokens y accesibilidad | `38-tokens-light-dark-y-accesibilidad.md` |
| Estado de implementación y trazabilidad | `39-estado-de-implementacion-y-trazabilidad.md` |
| Integración Orca, PI, ODD y trazabilidad | `40-integracion-orca-pi-odd-y-trazabilidad.md` |
| Manuales de entrega | `manual-programador.md`, `manual-administrador.md`, `manual-cliente.md` |

## Estado documental

- **Estado:** la UI de LunarGrip existe como superficie de demostración; el
  motor real de conexión a bases de datos todavía no está implementado.
- **Fuente principal:** documento maestro de LunarGrip compartido el
  2026-10-12/13.
- **Fuente del estado de Lunar Orca:** repositorio actual y sus documentos
  existentes, especialmente `README.md`, `docs-dev/DECISIONES.md`,
  `docs-dev/SYNC.md` y `skill-guides/orchestration/`.
- **Investigación externa:** `13-investigacion-comparativa.md`, basada en
  documentación primaria consultada el 2026-10-13.
- **Regla:** lo que no esté confirmado se marca como `propuesto`, `pendiente`
  o `no verificado`; nunca se presenta como hecho.

## Convenciones

1. Cada cambio de visión debe dejar una decisión o una pregunta abierta.
2. Los agentes pueden leer este directorio, pero no deben alterar contratos,
   código o configuración por inferencia.
3. Una tarea de implementación futura debe apuntar a un requisito, criterio de
   aceptación, riesgo y superficie de edición.
4. Ningún documento de este espacio autoriza por sí solo acciones destructivas,
   ejecución de SQL, despliegues o terminación de procesos.

## Fuera de alcance de esta entrega

- Implementar LunarGrip, lunargrip-core o LunarMind.
- Registrar agentes, cambiar el arnés PI o cambiar Orca.
- Ejecutar consultas contra bases reales.
- El esquema, las filas de resultados y la ejecución mostrados por la UI son
  mock/demo y no representan una conexión real.
- La UI ahora separa explícitamente `Sin conexión` de `DEMO · Sin conexión real`.
- Investigar internet como si una referencia ya hubiese sido validada.
- Prometer compatibilidad, rendimiento o licencias sin una prueba posterior.
