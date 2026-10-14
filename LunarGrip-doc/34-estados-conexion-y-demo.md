# Estados de conexión y demo

## Problema y objetivo

La UI anterior mezclaba datos sintéticos con lenguaje de conexión real. El
estado visual debe ser una fuente honesta de contexto.

## Estados

| Estado | Significado |
|---|---|
| Sin conexión | No existe sesión ni snapshot activo. |
| Configurando | El usuario completa el formulario. |
| Conectando | Reservado para el provider real; no se activa en la demo. |
| Conectada | Reservado para un provider real validado. |
| Cargando metadata | Se solicita metadata real. |
| Partial / Stale | Snapshot incompleto o desactualizado. |
| Fallida | La operación no pudo completarse; se explica sin secretos. |
| Demo | Datos sintéticos, sin conexión real. |

## Accesibilidad, rendimiento y aceptación

Cada estado combina texto, badge y contexto. El cambio de estado no debe
depender de animaciones. Demo debe poder abandonarse sin conservar credenciales.
Nunca se anuncia una consulta, duración o fila como real si es sintética.

## Relación con Fase 1A

Los nombres de estado coinciden con los contratos tipados existentes. No se
agrega persistencia, safeStorage ni conexión.
