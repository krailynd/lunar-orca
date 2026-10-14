# Especificación UX tipo SSMS

## Problema y objetivo

La UI no debe aparentar que una base está conectada. LunarGrip adopta la
jerarquía conceptual de SSMS (conexión, explorador, editor, resultados) con
componentes Orca y sin copiar datos de las referencias visuales.

## Comportamiento y estados

La entrada es `Sin conexión`. `Nueva conexión` abre un formulario local;
`Abrir demo local` es una acción separada. La demo muestra `DEMO`, `Datos
sintéticos` y `Sin conexión real`. Los estados soportados son disconnected,
configuring, connected, loading, partial, stale, failed y demo.

## Componentes y accesibilidad

Usar diálogo con retorno de foco, árbol navegable por teclado, tabs semánticas,
labels asociados y mensajes que no dependan solo del color. El explorador
separa servidor, base, schema y objeto.

## Rendimiento y datos

No se ejecuta SQL ni se conecta un servidor en esta fase. Monaco y el ERD deben
montarse de forma acotada. Los conteos y resultados sintéticos deben estar
etiquetados.

## Criterios de aceptación

- Ninguna base aparece conectada al iniciar.
- Demo y conexión real son visualmente distinguibles.
- Error, vacío, carga, partial, stale y demo tienen representación explícita.

## Fase 1A y fuera de alcance

La UI consume la semántica de los contratos de Fase 1A, pero no añade driver,
pool, credenciales, persistencia, ejecución SQL ni metadata `sys.*`.
