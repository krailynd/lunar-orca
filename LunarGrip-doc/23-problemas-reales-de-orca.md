# Problemas reales de Orca y oportunidades para Lunar Orca

*Investigación basada en el issue tracker público de `stablyai/orca`,
documentación oficial y patrones repetidos de herramientas de desarrollo. Los
issues son evidencia de casos reportados, no una medición estadística de todos
los usuarios.*

## Resumen

Orca ya resuelve la parte difícil de ejecutar agentes en worktrees. Los
problemas que quedan no son solo “agregar más botones”: son problemas de
identidad, estado, foco, recuperación, observabilidad y coordinación entre
agente, editor, terminal, GitHub y usuario.

## Problemas observados en issues públicos

| Problema | Evidencia | Qué debería hacer Lunar Orca |
|---|---|---|
| Drafts divergentes se pierden o mezclan | [#28302](https://github.com/stablyai/orca/issues/28302) reporta registros de editor sin identidad estable al restaurar | ID persistente por buffer/sesión/worktree, historial de drafts y recuperación explícita |
| PR cerrada o archivada se autovincula incorrectamente | [#28324](https://github.com/stablyai/orca/issues/28324) | Resolver PR por estado, branch, repository y antigüedad; mostrar por qué se eligió |
| Atajos no llegan bien a terminales embebidos | [#28308](https://github.com/stablyai/orca/issues/28308) y [#28330](https://github.com/stablyai/orca/issues/28330) | Router de comandos con foco, prioridad y diagnóstico visible |
| Estado de revisión no expresa el trabajo real | [#28304](https://github.com/stablyai/orca/issues/28304) | Estados `working`, `waiting-review`, `changes-requested`, `verified`, `blocked` |
| Sesiones aparecen fuera de los índices esperados | [#28266](https://github.com/stablyai/orca/issues/28266) | Índice versionado, migraciones, health check y reconstrucción manual |
| Automatización queda huérfana al eliminar SSH host | [#28258](https://github.com/stablyai/orca/issues/28258) | Dependencias explícitas, alerta de destino inválido y política de recuperación |
| Automatización falla sin notificar ni ofrecer recuperación | [#28252](https://github.com/stablyai/orca/issues/28252) | Run state, error accionable, retry controlado y notificación |
| Un proceso OOM puede tumbar el scope de terminales | [#28320](https://github.com/stablyai/orca/issues/28320) | Aislamiento por terminal, límites, supervisor y recuperación individual |
| Navegación de hosts puede ejecutar la acción equivocada | [#28343](https://github.com/stablyai/orca/issues/28343) | Separar hit target de accordion y tests de interacción |
| Búsqueda no funciona bien con CJK o timestamps | [#28256](https://github.com/stablyai/orca/issues/28256), [#28253](https://github.com/stablyai/orca/issues/28253) | Unicode-aware indexing y timestamps como instantes, no strings |
| Proyectos con el mismo nombre se mezclan en móvil | [#28314](https://github.com/stablyai/orca/issues/28314) | Identidad por URI/canonical path, no por basename |
| Mucha memoria o UI puede degradarse al fallar runtime | [#28278](https://github.com/stablyai/orca/issues/28278) | Error boundary por runtime, degradación parcial y recovery |

## Principios de solución

### Identidad, no nombres

Todo objeto debe tener un ID estable y un origen:

```text
repository_id + worktree_id + session_id + editor_buffer_id + branch_ref
```

Los nombres visibles son etiquetas. Nunca deben ser la clave primaria de
restauración, asociación de PR, búsqueda o sincronización móvil.

### Estado como máquina explícita

El estado de un workspace no debe inferirse solo del título o de si un proceso
está vivo:

```text
created → preparing → working → waiting-review
       → changes-requested → verifying → ready
       → blocked / failed / cancelled / completed
```

Cada transición registra actor, timestamp, evidencia y causa.

### Recuperación como funcionalidad

Para cada proceso o integración debe existir:

- último heartbeat;
- último estado persistido;
- acción de reintento;
- acción de cancelar;
- logs conservados;
- explicación de qué se perdió;
- export del diagnóstico;
- degradación a terminal/CLI si la UI falla.

### Foco como recurso global

El foco debe ser observable. El usuario debe saber si el atajo se está
interpretando en:

1. navegador/editor;
2. terminal;
3. chat del agente;
4. panel;
5. diálogo modal.

## Oportunidades de diferenciación

- **Workspace health:** una vista de salud de procesos, sesiones, worktrees,
  indexación, SSH y plugins.
- **Session timeline:** mensajes, comandos, commits, PR, tests y cambios de
  estado en una línea de tiempo.
- **Recovery center:** drafts, sesiones, terminales y automatizaciones
  recuperables desde una sola superficie.
- **Evidence-first review:** toda afirmación del agente enlaza a diff, comando,
  test, log o archivo.
- **Policy-aware actions:** antes de ejecutar, Orca muestra riesgo, alcance,
  host, branch y aprobación necesaria.

## Fuentes

- [Orca issues](https://github.com/stablyai/orca/issues)
- [#28302 editor restore identity](https://github.com/stablyai/orca/issues/28302)
- [#28324 PR autolinking](https://github.com/stablyai/orca/issues/28324)
- [#28320 terminal OOM scope](https://github.com/stablyai/orca/issues/28320)
- [#28252 automation failure](https://github.com/stablyai/orca/issues/28252)
