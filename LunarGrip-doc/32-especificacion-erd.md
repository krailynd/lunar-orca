# Especificación ERD

## Problema y objetivo

Un conjunto de tarjetas sin contexto puede confundirse con un esquema vivo.
Cada diagrama debe identificar servidor, base, schema, snapshot, fecha y estado.

## Comportamiento

El encabezado muestra `Servidor`, `Base`, `Schema`, `Snapshot` y `Estado`.
Las tablas contienen columnas alineadas, tipo, nulabilidad, PK y FK. Las
relaciones se dibujan únicamente desde referencias declaradas en el snapshot.
El primer layout es determinista; el algoritmo automático queda pendiente.

## Estados, accesibilidad y rendimiento

Hay estados vacío, demo, real, partial y stale. Zoom, pan, centrar y fit deben
tener botones etiquetados y alternativa de lectura textual. Un diagrama grande
debe limitar el trabajo inicial y evitar recalcular el layout en cada tecla.

## Criterios y datos

No se muestran tablas sin contexto. El snapshot sintético se marca `DEMO · Sin
conexión real`; no se inventan relaciones, índices ni conteos reales.

## Fase 1A y fuera de alcance

Fase 1A aporta estados y contratos seguros. No se consulta SQL Server, no se
persiste el snapshot y no se implementa un driver.
