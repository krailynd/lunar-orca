# Manual del administrador — LunarGrip

## Alcance

LunarGrip todavía no tiene despliegue, servicio ni operación productiva.

## Infraestructura prevista

El adaptador podrá ejecutarse localmente o en un host remoto autorizado, pero
la propiedad de la ejecución debe permanecer en el host que toca la base.
Ver `diagramas/arquitectura.md`.

## Credenciales

Nunca se documentan secretos en Markdown, Git, snapshots, prompts o logs. La
solución futura debe usar el almacén seguro del sistema y permisos mínimos.

## Despliegue

No hay pipeline de LunarGrip definido. Cualquier despliegue futuro debe
separar desarrollo, pruebas y producción, y exigir preview de cambios.

## Backups y restore

Backup/restore es una fase posterior del roadmap. No hay comando aprobado ni
procedimiento operativo en esta entrega.

## Monitoreo y logs

Se requiere auditoría correlacionada, redacción de datos sensibles y estados
explícitos de host. Los nombres concretos de archivos, puertos y servicios
quedan pendientes de la decisión de arquitectura.
