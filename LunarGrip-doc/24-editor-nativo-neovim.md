# Editor nativo de Orca compatible con Neovim

## Decisión de producto

Lunar Orca debería tener un editor de código **nativo de Orca**, pero
compatible con la configuración y los hábitos de Neovim. “Compatible” no
significa simular una terminal con `nvim` dentro de un panel: significa que
Orca entiende buffers, sesiones, comandos, diagnósticos, worktrees y estado de
Neovim como objetos de primera clase.

El usuario debe poder elegir:

1. **Orca Editor:** editor integrado, con UX gráfica y contrato común.
2. **Neovim Embedded:** instancia gestionada por Orca dentro del workspace.
3. **Neovim External:** Neovim del usuario conectado mediante RPC.
4. **Terminal fallback:** cualquier editor CLI sin integración profunda.

## Qué significa “que Orca lo reconozca”

Al abrir un archivo desde un worktree, Orca registra:

```text
workspace_id
worktree_id
absolute_path
buffer_uri
editor_provider
editor_session_id
language
dirty_state
cursor_position
selection
diagnostics
last_saved_revision
```

El editor predeterminado se resuelve por workspace, proyecto y usuario, en ese
orden. La configuración del usuario no se copia destructivamente: se lee,
versiona y se puede restaurar.

## Arquitectura recomendada

```text
Orca UI
  ├── Editor Host
  │   ├── Orca Editor Provider
  │   └── Neovim Provider
  ├── Workspace State
  ├── Focus/Shortcut Router
  ├── LSP/DAP Coordinator
  └── Agent Context Bridge
          │
          └── Neovim msgpack-RPC / stdio / socket
```

Neovim ofrece una API remota y plugins remotos mediante msgpack-RPC
([documentación oficial de API](https://neovim.io/doc/user/api.html) y
[remote plugins](https://neovim.io/doc/user/remote_plugin.html)). El provider
de Orca debe usar esa frontera pública y no depender de archivos internos o de
la pantalla renderizada.

## Integración por niveles

### Nivel 1 — selección y contexto

- detectar `nvim` disponible;
- detectar versión y configuración;
- abrir el archivo en el worktree correcto;
- enviar `cwd`, branch y entorno;
- detectar cierre y reconexión;
- conservar posición y buffers sucios.

### Nivel 2 — buffers y navegación

- abrir/focalizar buffer;
- crear splits y tabs;
- sincronizar dirty state;
- mostrar diff del worktree;
- go-to-file, symbol y definition;
- quick open unificado;
- link desde una línea a una tarea o comentario de PR.

### Nivel 3 — LSP y Tree-sitter

Neovim documenta un cliente LSP con features como completion, diagnostics,
definition y references
([LSP](https://neovim.io/doc/user/lsp.html)). Orca debe mostrar esos datos en
su UI sin duplicar el servidor:

- diagnostics por archivo y workspace;
- símbolos y referencias;
- code actions;
- rename preview;
- formato con resultado visible;
- parser/syntax awareness mediante Tree-sitter cuando esté instalado.

### Nivel 4 — DAP y terminal

El soporte DAP puede venir de plugins como `nvim-dap`; Orca debe tratar el
debugger como provider opcional. Breakpoints, stack y variables deben asociarse
al worktree y a la sesión, no a una ruta global.

La terminal embebida debe respetar:

- foco;
- resize;
- señales;
- scrollback;
- copy/paste;
- shortcuts configurables;
- aislamiento de proceso.

### Nivel 5 — contexto para agentes

Desde Neovim el usuario puede enviar al agente:

- archivo actual;
- selección;
- diagnostics;
- símbolo;
- diff local;
- test fallido;
- contexto de tarea;
- comentario de PR.

El agente recibe referencias estructuradas, no una captura sin semántica.

## Configuración sin destruir la del usuario

```text
global user config
  ↓
project config (repo)
  ↓
workspace config (Orca)
  ↓
session overrides (temporal)
```

Reglas:

- nunca sobrescribir `init.lua`;
- detectar conflictos y pedir elección;
- mostrar qué configuración está activa;
- guardar un snapshot antes de activar integración;
- permitir “desactivar integración, mantener Neovim intacto”;
- respetar plugins, mappings, colorscheme, LSP y formatter del usuario;
- no inyectar secretos en buffers, comandos o archivos de configuración.

## Teclado y comandos

Orca necesita un command registry único:

```text
command_id
title
keybindings
contexts
priority
source (orca/neovim/plugin)
conflicts
availability
```

Ejemplo de contexto:

```text
editor.normal
editor.insert
terminal
chat
browser
panel
modal
```

La misma acción debe poder dispararse desde command palette, atajo, menú,
Neovim command y API. Si existe conflicto, Orca muestra el conflicto en vez de
consumir silenciosamente la tecla.

## Editor de datos y Neovim

El editor de código y el editor SQL deben compartir primitives, pero no deben
ser el mismo modo sin límites:

- syntax/dialect del SQL;
- conexión y entorno visibles;
- ejecución separada de edición;
- query plan y resultado como pestañas;
- confirmación para mutaciones;
- snippets y completion con metadata segura;
- links entre modelo dbt, tabla, query y tarjeta Orca.

## Criterios de aceptación

- abrir un archivo desde PR, tarea o agente enfoca el buffer correcto;
- dos worktrees con el mismo path relativo no mezclan drafts;
- cerrar y reabrir Orca conserva buffers y dirty state;
- un shortcut se comporta igual o muestra su contexto;
- los diagnostics del LSP llegan al inspector de Orca;
- un agente puede recibir selección y diagnostics sin copiar manualmente;
- desconectar Neovim no pierde el workspace;
- el fallback CLI sigue funcionando.
