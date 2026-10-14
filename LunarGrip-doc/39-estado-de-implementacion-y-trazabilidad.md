# Estado de implementación y trazabilidad

## Implementado

| Área | Evidencia |
|---|---|
| Contratos IPC | `src/shared/lunargrip-ipc-contract.ts` y `src/main/ipc/lunargrip.ts` |
| Provider seguro demo | `src/main/lunargrip/lunargrip-provider.ts` |
| Entrada honesta | `LunarGripPage.tsx` y `LunarGripConnectionDialog.tsx` |
| Explorador | `LunarGripObjectExplorer.tsx` |
| Editor | `LunarGripSqlEditor.tsx`, Monaco existente |
| ERD | `LunarGripErdViewer.tsx` |
| Preview SSMS | `LunarGripSsmsWorkbench.tsx` |

## Demo/mock

El esquema, columnas, relaciones, sugerencias, estados de resultados y scripts
se basan en datos sintéticos. Ningún valor representa metadata, filas, duración
o ejecución de un servidor real.

## Contrato preparado

Los estados, errores redactados, cancelación por ciclo de vida del renderer y
validación estricta de loopback están preparados para un provider local
read-only futuro. PI conserva la autoridad sobre agentes, lifecycle, tareas,
aprobaciones y auditoría; LunarGrip no crea un orquestador paralelo.

## Pendiente o bloqueado

Driver SQL Server, almacenamiento seguro, pool, metadata real, ejecución
autorizada, auditoría de mutaciones, Query Store, locks, drift, lineage,
calidad, incidentes, runbooks, integración GitHub/PR, persistencia de tareas y
validación visual Electron/CDP permanecen pendientes. La falta de driver y de
una conexión local aprobada bloquea la fase SQL real.

## No autorizado

Hosts remotos, SahaCloud, Tailscale, SSH, túneles, producción, credenciales
reales, SQL destructivo, cambios en `cloud/`, `mobile/`, `Ideas-lunar/` o PI.
