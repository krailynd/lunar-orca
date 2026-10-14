# Estado actual y evidencia

## Resumen verificable

| Área | Estado | Evidencia |
|---|---|---|
| Producto base | `confirmado` | `README.md` describe Lunar Orca como fork de Orca. |
| Worktrees y agentes | `confirmado` | `README.md`, `docs-dev/DECISIONES.md` y `docs/site/content/docs/model/worktrees.mdx`. |
| Pi y otros harnesses | `confirmado` como integración existente | `docs-dev/DECISIONES.md` registra Pi, OpenCode, Hermes, Claude, Codex y Antigravity. |
| Home e historial multi-harness | `confirmado` en documentación del repo | `docs-dev/DECISIONES.md`. |
| Automatizaciones | `confirmado` en documentación del repo | `docs-dev/DECISIONES.md` y `docs/site/content/docs/cli/automations.mdx`. |
| SSH remoto | `confirmado` en documentación del repo | `docs-dev/DECISIONES.md`, `docs/site/content/docs/ssh.mdx`. |
| Contratos de workers | `confirmado` | `skill-guides/orchestration/references/worker-contract.md`. |
| LunarGrip UI | `confirmado` | Existe la superficie UI en `src/renderer/src/components/lunargrip/`; usa datos mock/demo. |
| lunargrip-core Rust | `propuesto` | Documento maestro compartido; no se encontró un módulo implementado. |
| LunarMind | `propuesto` | Documento maestro compartido; no se encontró un módulo implementado. |
| Motor real de conexión | `pendiente` | La UI existe, pero todavía no hay adaptador ni conexión real a bases de datos. |
| Base de datos de LunarGrip | `pendiente` | No hay esquema persistente real aportado para este producto. |

## Lo que hizo el arnés hasta ahora

El material compartido describe una visión técnica de cliente SQL profesional:

- comparación de SSMS, DataGrip y herramientas open source;
- arquitectura UI/core con JSON-RPC;
- Object Explorer y acciones contextuales;
- diagrama ERD con esquema canónico y layout separado;
- introspección T-SQL basada en `sys.*`;
- core Rust con conexiones, streaming y cancelación;
- LunarMind con confirmación humana;
- roadmap F0–F10 y reparto tentativo entre persona y agentes;
- riesgos de memoria, credenciales, licencias y seguridad.

Esto se conserva como **visión de referencia**, no como inventario de funciones
ya entregadas. La UI actual es una superficie mock/demo: el esquema, las filas
de resultados y la ejecución no consultan una base real.

## Gaps de evidencia

1. No hay una especificación de integración de LunarGrip con APIs reales de
   Lunar Orca.
2. No hay decisión sobre si el primer entregable será una vista nativa, una
   extensión, una CLI o un servicio local.
3. No hay fixtures de esquemas ni conexión real de prueba definida; la UI usa
   datos mock/demo.
4. No hay mediciones de latencia, memoria, streaming o cancelación.
5. No hay validación jurídica de las licencias de dependencias candidatas.
