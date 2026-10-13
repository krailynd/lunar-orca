# Solución al Error de Tareas en Proyectos sin Remoto GitHub

## 1. Contexto y Problema Detectado

En proyectos locales sin origen o remoto configurado en GitHub (como `provocos`), al ingresar a la vista de Tareas (`TaskPage`) en modo por defecto (GitHub), el sistema intentaba resolver el origen del repositorio mediante `window.api.git.history` o consultas a GitHub.

Al no existir upstream ni `gitRemoteIdentity` apuntando a GitHub:
- El repositorio quedaba clasificado en `unresolvedSourceRepos` (`null-source`).
- Se presentaba una barra de aviso que indicaba:
  > *"No GitHub source detected for provocos — it may have no GitHub remote, or the source could not be resolved. [Retry]"*
- Si el usuario pulsaba `Retry`, el proceso fallaba nuevamente de forma indefinida porque el proyecto es 100% local o git puro sin remoto en GitHub.
- El usuario quedaba bloqueado sin una vía directa de 1 clic para aprovechar la suite de tareas locales (Kanban, Gantt, dispatch a agentes IA).

Referencia visual: `Ideas-lunar/orca-paste-1791912081213-9a42d9c1-96b2-4b91-a43e-604d9eb2ce14.png`.

---

## 2. Causa Raíz (Root Cause)

1. **Dependencia por defecto de GitHub como proveedor de tareas:**
   La pantalla de tareas iniciaba con `localTasksMode: false` a menos que se activara explícitamente desde la botonera superior o desde el selector de Proyectos Locales.
2. **Ausencia de acción contextual inmediata:**
   El componente de lista (`src/renderer/src/components/task-page/github/List.tsx`) solo ofrecía un botón de *"Retry"*, omitiendo la acción más lógica y útil para el desarrollador: **conmutar inmediatamente a tareas locales** para ese proyecto.
3. **Falta de aviso proactivo en el encabezado de tareas (`ListChrome.tsx`):**
   No se informaba en la barra de controles que el proyecto activo carecía de GitHub y que podía gestionarse con el tablero Kanban / Gantt local.

---

## 3. Solución Implementada

### A. Fallback Automático e Inteligente (`use-task-page-provider-state.ts`)
- Se configuró la inicialización de `localTasksMode`:
  Si el repositorio seleccionado carece de remoto (`!upstream && !gitRemoteIdentity`) o viene con `pageData.localTasksMode: true`, se activa directamente el modo de tareas locales sin obligar al usuario a dar vueltas.

### B. Selector y Acción Rápida en el Banner de Error (`github/List.tsx`)
- En el banner de repositorio sin fuente GitHub (`unresolvedSourceRepos.map`), se integró:
  1. Un mensaje explicativo en lenguaje claro:
     *"Este proyecto es local. Podés gestionar sus tareas locales con Kanban y Diagrama de Gantt."*
  2. Un botón destacado y visible:
     **`"Cambiar a Tareas Locales / Proyectos Locales"`** (con icono `FolderKanban`), que invoca `setLocalTasksMode(true)`.
  3. Mantiene el botón de `Retry` como opción secundaria en caso de que fuera una falla transitoria de red en un repositorio remoto.

### C. Banner Superior en `ListChrome.tsx`
- Cuando hay repositorios no resueltos para GitHub y el usuario aún está en modo GitHub, se presenta un banner amigable que invita a conmutar a Tareas Locales con 1 clic.

---

## 4. Verificación y Resultados

- **Eslint max-lines y code quality:**
  `pnpm run check:max-lines-ratchet` pasó exitosamente sin nuevos bypasses.
  `pnpm run check:code-quality:changed` pasó con 0 issues.
- **Pruebas unitarias:**
  Se ejecutó Vitest sobre `HomePage.test.tsx` y componentes de tareas con resultado 100% verde (PASS).
