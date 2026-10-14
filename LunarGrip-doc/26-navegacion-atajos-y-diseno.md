# Navegación, atajos y diseño de la experiencia

## Objetivo

Orca debe sentirse como una herramienta profesional de alta densidad, no como
un navegador de pestañas que contiene muchas aplicaciones. La navegación debe
responder tres preguntas en menos de unos segundos:

1. ¿En qué proyecto/worktree estoy?
2. ¿Qué está esperando mi atención?
3. ¿Cuál es la acción segura siguiente?

## Estructura de navegación

```text
Command Center
├── Workspaces
├── Tasks / Kanban / Gantt
├── Editor
├── Terminals
├── Agents
├── GitHub / PRs
├── Data Workbench
├── Runs / Automations
└── Settings / Health
```

### Command Center

Inicio orientado a trabajo:

- tareas bloqueadas;
- PRs pendientes;
- agentes esperando;
- checks fallidos;
- sesiones recuperables;
- hosts desconectados;
- incidentes de datos;
- actividad reciente.

### Context bar persistente

Siempre visible:

```text
repo · worktree · branch · host · editor · agent · dirty · risk
```

Un click abre el contexto completo; no depender del título de la pestaña.

### Quick Open

Buscar con una sola entrada:

- archivo;
- símbolo;
- tarea;
- PR;
- issue;
- agente;
- terminal;
- comando;
- asset de datos;
- sesión histórica.

Cada resultado indica tipo, scope y origen para evitar colisiones.

## Atajos recomendados

Los valores son propuestas; deben ser configurables y respetar el sistema
operativo. Las acciones tienen nombres estables aunque cambie la tecla.

| Acción | Atajo sugerido |
|---|---|
| Quick Open | `Ctrl/Cmd+P` |
| Command Palette | `Ctrl/Cmd+Shift+P` |
| Buscar en workspace | `Ctrl/Cmd+Shift+F` |
| Ir a archivo/línea | `Ctrl/Cmd+G` |
| Ir a símbolo | `Ctrl/Cmd+Shift+O` |
| Siguiente error | `F8` |
| Anterior error | `Shift+F8` |
| Abrir terminal | `` Ctrl/Cmd+` `` |
| Nuevo worktree | `Ctrl/Cmd+Shift+W` |
| Cambiar workspace | `Ctrl/Cmd+K Ctrl/Cmd+W` |
| Ver diff | `Ctrl/Cmd+Shift+D` |
| Abrir PR vinculada | `Ctrl/Cmd+Shift+R` |
| Enviar selección al agente | `Ctrl/Cmd+Shift+Enter` |
| Mostrar health | `Ctrl/Cmd+Shift+H` |
| Navegar paneles | `Ctrl/Cmd+1..9` |
| Reenfocar contenido | `Esc` |

El router debe declarar qué ocurre si el foco está en terminal, editor, chat,
browser o modal. La solución a los conflictos no es robar teclas: es mostrar
el contexto y permitir remapear.

## Navegador integrado

El navegador de Orca debe ser un panel de trabajo, no un navegador genérico:

- URL y título con repository/workspace scope;
- permisos por origen;
- indicador de contenido externo no confiable;
- guardar página como evidencia;
- seleccionar DOM y enviarlo al agente con URL y timestamp;
- consola/logs aislados;
- red y cookies no compartidas accidentalmente con otros workspaces;
- back/forward y pestañas recuperables;
- bloqueo de descargas o formularios peligrosos por política.

## Estados visuales

Todo objeto debe distinguir:

- `active`;
- `waiting`;
- `attention`;
- `blocked`;
- `failed`;
- `offline`;
- `stale`;
- `dirty`;
- `read-only`.

No depender solo del color. Usar icono, texto, tooltip, aria-label y orden de
prioridad.

## Diseño para alta densidad

- paneles redimensionables y layout guardado por workspace;
- split editor/terminal/chat sin perder foco;
- tabs con tipo de objeto y estado dirty;
- breadcrumbs de repo/worktree/archivo/símbolo;
- minimap opcional;
- diff inline y side-by-side;
- inspector contextual;
- command palette como vía universal;
- modo compacto para operadores;
- modo accesible con foco visible y navegación completa por teclado.

## Diseño móvil

El móvil debe ser de supervisión, no un IDE reducido:

- aprobar/rechazar propuesta;
- responder pregunta de agente;
- revisar estado y logs;
- ver diff resumido;
- pausar/reanudar;
- abrir PR;
- recibir alertas;
- recuperar sesión.

Editar archivos grandes o resolver conflictos complejos debe derivar al
desktop/remote workspace.

