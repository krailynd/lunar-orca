# Roadmap del editor y la plataforma

## Orden recomendado

### E0 — Fundaciones de identidad y foco

- IDs estables para workspace, worktree, session, buffer y PR;
- command registry;
- focus router;
- estado de recuperación;
- workspace health;
- logs y timeline.

**Gate:** dos worktrees con el mismo archivo no mezclan estado ni drafts.

### E1 — Editor integrado funcional

- tabs, splits, quick open;
- dirty state y restore;
- diff;
- búsqueda y navegación;
- terminal con foco correcto;
- configuración por usuario/proyecto/workspace.

**Gate:** reiniciar Orca conserva la sesión sin sobrescribir configuración.

### E2 — Provider Neovim

- detección de Neovim;
- conexión RPC;
- abrir/focalizar buffers;
- sincronizar cursor, selección y dirty state;
- reconexión;
- fallback CLI.

**Gate:** el usuario puede volver a su Neovim sin perder plugins ni mappings.

### E3 — Inteligencia de código

- LSP;
- Tree-sitter;
- referencias;
- code actions;
- formato;
- DAP opcional;
- test runner;
- contexto estructurado para agentes.

**Gate:** un diagnostics o test fallido puede enviarse al agente con evidencia.

### E4 — Git y GitHub profesional

- asociación determinista de PR;
- draft/ready;
- review threads;
- CODEOWNERS;
- checks;
- merge queue;
- simulación de merge;
- conflictos;
- risk view.

**Gate:** ninguna PR puede aparecer como lista para merge si faltan requisitos.

### E5 — Organización de trabajo

- Kanban orientado a estados reales;
- Gantt con dependencias;
- My queue;
- ownership;
- SLA;
- bloqueos;
- automatizaciones recuperables.

**Gate:** una tarea puede seguirse desde intención hasta PR, merge y verificación.

### E6 — LunarGrip conectado

- SQL editor;
- catálogo;
- schema snapshots;
- lineage;
- calidad;
- incidentes;
- backfills;
- tareas de datos.

**Gate:** un incidente de datos abre contexto técnico y tarea sin duplicar el
lifecycle de PI.

## Métricas de éxito

| Área | Métrica |
|---|---|
| Editor | tiempo para abrir archivo y recuperar sesión |
| Foco | porcentaje de comandos entregados al contexto correcto |
| GitHub | PRs correctamente vinculadas sin corrección manual |
| Review | tiempo desde feedback hasta resolución verificable |
| Recovery | sesiones/drafts recuperados sin pérdida |
| Agents | preguntas respondidas sin cambiar de aplicación |
| Organización | tareas con evidencia completa |
| Datos | incidentes con asset, owner, lineage y run asociados |

## Riesgos

- intentar reemplazar Neovim en vez de integrarlo;
- duplicar LSP, DAP o configuraciones del usuario;
- convertir Orca en un segundo orquestador independiente de PI;
- ejecutar acciones GitHub sin scopes y aprobaciones claros;
- mezclar identidad por nombres visibles;
- agregar vistas sin conectarlas a una decisión o acción.

## Regla de diseño

Cada nueva capacidad debe contestar:

1. ¿Qué problema real reduce?
2. ¿Cuál es su objeto e identidad?
3. ¿Qué evidencia conserva?
4. ¿Qué ocurre si falla o se desconecta?
5. ¿Qué permiso necesita?
6. ¿Cómo se integra con editor, agente, tarea y PR?
