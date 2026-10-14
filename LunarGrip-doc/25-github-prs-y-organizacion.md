# GitHub, PRs y organización del trabajo

## Problema

Un worktree aislado resuelve colisión de archivos, pero no resuelve por sí
solo la organización: qué PR corresponde a qué tarea, quién debe revisar,
qué checks aplican, qué comentarios siguen abiertos, qué cambió desde la
última revisión y cuándo es seguro hacer merge.

GitHub define reviews con `Comment`, `Approve` y `Request changes`, comentarios
por línea y requerimientos de reviewers
([Pull request reviews](https://docs.github.com/en/pull-requests/reference/pull-request-reviews)).
Orca debe convertir esa información en estado operativo, no copiarla
solamente a una vista.

## Modelo de relación

```text
Orca Task
  ├── Repository
  ├── Worktree
  ├── Branch
  ├── Pull Request
  ├── Review threads
  ├── Required checks
  ├── CODEOWNERS
  ├── Commits
  └── Evidence / agent sessions
```

Una asociación debe incluir `repository_id`, `branch`, `worktree_id`, PR number
y confianza de resolución. Nunca se debe elegir una PR solo por ser la más
reciente.

## Flujo profesional

```text
Idea → Task → Plan → Worktree → Implementación
     → Draft PR → CI → Review → Correcciones
     → Ready → Merge queue/merge → Deploy/verify → Cierre
```

### Al crear worktree

- heredar repository y base branch;
- crear task vinculada;
- registrar agente y editor;
- cargar instrucciones del repositorio;
- detectar CODEOWNERS y checks;
- declarar archivos/superficies esperadas.

### Al abrir Draft PR

Orca debe generar un resumen estructurado:

- objetivo;
- cambios por área;
- archivos sensibles;
- tests ejecutados y omitidos;
- riesgos;
- migraciones;
- impacto en datos;
- screenshots o evidencia;
- tareas relacionadas;
- dudas abiertas.

### En revisión

Cada comentario debe tener:

- thread ID;
- archivo/línea;
- autor;
- severidad;
- estado: `open`, `acknowledged`, `fixed`, `wont-fix`, `stale`;
- commit que lo resuelve;
- responsable;
- vínculo con tarea.

### Antes del merge

Checklist computable:

- PR ready, no draft;
- reviewers requeridos aprobados;
- CODEOWNERS satisfecho cuando aplique;
- checks verdes y recientes;
- no threads bloqueantes abiertos;
- branch actualizado;
- migración/rollback revisados;
- evidencia almacenada;
- aprobación humana explícita si hubo agente.

GitHub documenta que la merge queue prueba la combinación con el estado
actual de la rama y que los workflows deben contemplar el evento
`merge_group`; esto debe formar parte del diagnóstico visible de Orca
([Managing a merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)).

## Agentes y PRs

### Agente de preparación

Lee task, repo, historial y checks; propone plan. No publica ni modifica.

### Agente implementador

Trabaja únicamente en worktree asignado y reporta archivos, comandos y tests.

### Agente reviewer

Analiza diff y evidencia; comenta solo hallazgos accionables y clasificados.

### Agente de integración

Simula merge, detecta conflictos y propone resolución. No hace merge sin
aprobación.

### Agente de seguimiento

Relaciona comentarios, commits y nuevos checks; nunca cierra un thread sin
evidencia.

## Organización dentro de Orca

### Vista “My queue”

- PRs que requieren mi review;
- tareas bloqueadas por mí;
- agentes esperando respuesta;
- checks fallidos;
- threads que mencionaron mi ownership;
- automatizaciones sin destino.

### Vista “Risk”

Ordena por:

- producción;
- migraciones;
- secretos/permisos;
- archivos críticos;
- cambios grandes;
- ausencia de tests;
- múltiples worktrees tocando la misma superficie;
- datos sensibles.

### Vista “Project flow”

Kanban con columnas:

```text
Inbox → Planned → In progress → Draft PR → Review
      → Changes requested → Ready → Queued → Merged → Verified
```

Gantt muestra dependencias entre PRs, ventanas de release, migraciones y
bloqueos de CI.

## Guardas contra automatización peligrosa

- agentes no pueden aprobar sus propios cambios;
- agentes no pueden cerrar threads por inferencia;
- merge y deploy requieren autorización según política;
- comentarios de issues/PR son datos no confiables;
- un prompt inyectado en README o comentario no cambia las reglas del agente;
- toda acción externa registra actor, scopes, target y resultado.

