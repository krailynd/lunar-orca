# Visión de LunarGrip

## Resumen

**LunarGrip** será una experiencia nativa de gestión de bases de datos dentro
de Lunar Orca: conectar, explorar, consultar, visualizar relaciones, generar
documentación y recibir asistencia de agentes sin salir del entorno de trabajo.

La idea central no es clonar SSMS o DataGrip. Es unir el flujo de agentes,
worktrees, terminal y documentación de Lunar Orca con una interfaz de datos
segura, auditable y versionable.

## Problema

Hoy el trabajo de código y el trabajo de base de datos suelen quedar separados.
Eso provoca cambio de contexto, scripts sin dueño, diagramas difíciles de
versionar y consultas generadas por IA sin suficiente contexto ni revisión.

## Propuesta de valor

| Valor | Cómo se expresa |
|---|---|
| Continuidad | El proyecto, su conexión documentada y sus scripts viven en el mismo workspace. |
| Comprensión | El esquema real alimenta explorador, diagramas, autocompletado y agentes. |
| Seguridad | La IA propone; una persona revisa y confirma cualquier operación con impacto. |
| Reproducibilidad | Esquema, layout, decisiones y consultas de referencia son texto versionable. |
| Eficiencia | La introspección es incremental y la UI no se bloquea durante una consulta. |

## Usuario principal

Ingenieros de software, administradores de bases, estudiantes avanzados y
operadores que trabajan con agentes y necesitan entender una base sin perder el
control de sus datos.

## Principios

1. **Copiloto, no autoridad:** ninguna propuesta de IA se ejecuta implícitamente.
2. **Lectura antes que mutación:** explorar y generar un script precede a aplicar cambios.
3. **Estructura separada de presentación:** el esquema y el layout del diagrama son artefactos distintos.
4. **Contratos explícitos:** UI, core y agentes se comunican mediante formatos versionados.
5. **Degradación segura:** sin conexión, el producto conserva contexto local y explica qué no pudo verificar.
6. **Primero una experiencia excelente:** SQL Server puede ser el primer adaptador, pero el contrato no debe encerrarlo.
7. **Observabilidad sin filtración:** logs y diagnósticos no deben exponer secretos ni datos de negocio innecesarios.

## No objetivos iniciales

- Ser un reemplazo completo de administración empresarial.
- Ejecutar migraciones automáticas en producción.
- Resolver todos los motores desde el primer hito.
- Embebir código con licencia incompatible sin revisión.
- Convertir al arnés PI en un runtime dependiente de LunarGrip.
