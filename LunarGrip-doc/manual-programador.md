# Manual del programador — LunarGrip

## Alcance

Este manual describe la arquitectura prevista y la superficie UI ya existente.
La UI actual usa datos mock/demo; no contiene un motor real de conexión a bases
de datos.

## Arquitectura y diagrama

La separación UI, contratos, adaptador, LunarMind y PI está en
`03-arquitectura-objetivo.md` y `diagramas/arquitectura.md`.

## Contratos

Los contratos previstos son snapshot, layout, propuesta y auditoría. Deben
versionarse antes de crear adaptadores o vistas.

## Motor de conexión y base de datos

Todavía no hay adaptador ni motor real de conexión a bases de datos. Tampoco
hay una base de datos propia de LunarGrip definida. El DER queda pendiente; no
se deben inventar tablas, PK o FK.

El esquema, las filas de resultados y la ejecución de la UI son mock/demo y
deben seguir identificados como tales hasta que exista una integración real.

## API

No hay API pública ni IPC aprobado. La elección entre stdio JSON-RPC, socket
local u otra alternativa está registrada como decisión pendiente.

## Entorno y setup

La futura implementación debe usar el entorno del repositorio Lunar Orca y sus
reglas de compatibilidad. No se agrega ningún comando nuevo en esta entrega.

## Estrategia Git

La documentación de LunarGrip debe mantenerse en su carpeta. Una futura
implementación debe enlazar cada cambio a requisitos, criterios y evidencia, y
respetar el flujo de worktrees y revisión de Lunar Orca.
