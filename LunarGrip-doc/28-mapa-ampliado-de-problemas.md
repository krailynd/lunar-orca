# Mapa ampliado de problemas de Orca

*Corte de investigación: 2026-10-13. La evidencia principal proviene del
issue tracker público de Orca y se complementa con documentación de GitHub,
Neovim y prácticas de IDE. Un issue demuestra que existe un caso reportado; no
permite inferir su frecuencia total.*

## 1. Identidad y estado

### Problemas

- Dos worktrees pueden compartir nombre visible, basename o path relativo.
- Un editor restaurado puede perder el ID de buffer y mezclar drafts.
- Una sesión puede pertenecer a un agente, host o workspace distinto del que
  la UI muestra.
- Una PR puede asociarse por recencia y no por branch/worktree.
- Un chat, una terminal y un archivo pueden tener nombres parecidos pero
  propietarios diferentes.
- El estado “terminado” del agente no siempre equivale a “revisado” o
  “verificado”.
- El estado visual puede quedar atrasado respecto del proceso real.

### Soluciones

- IDs inmutables y nombres solo decorativos.
- Relaciones explícitas entre repository, host, worktree, session, buffer,
  branch, PR y task.
- Máquina de estados con eventos y evidencia.
- Resolución explicable: “se vinculó esta PR porque…”.
- Timeline auditable y reconciliación periódica.

## 2. Editor, foco y buffers

### Problemas

- Atajos globales no funcionan si terminal o chat captura el foco
  ([#28308](https://github.com/stablyai/orca/issues/28308)).
- Atajos de macOS se traducen de forma diferente dentro de TUI
  ([#28330](https://github.com/stablyai/orca/issues/28330)).
- Copiar/pegar puede depender del tipo de payload del portapapeles
  ([#28245](https://github.com/stablyai/orca/issues/28245)).
- IME puede enviar teclas candidatas además del texto confirmado
  ([PR relacionada a #28275](https://github.com/stablyai/orca/pull/28275)).
- Selección por doble click depende de word separators
  ([#28335](https://github.com/stablyai/orca/issues/28335)).
- Las pestañas de editor pueden perder drafts divergentes
  ([#28302](https://github.com/stablyai/orca/issues/28302)).
- No siempre queda claro si se está editando local, SSH, WSL o un worktree.
- El usuario debe repetir contexto al pasar del editor al agente.

### Soluciones

- Router de foco visible y command registry contextual.
- Soporte IME, RTL, CJK y portapapeles como requisitos, no parches.
- Buffer identity por host/worktree/path/instance.
- Autosave con snapshots recuperables y diff de drafts.
- Breadcrumb con host, repo, worktree y branch.
- Context pack para agente: selección, símbolo, diagnostics, diff y task.

## 3. Terminal y procesos

### Problemas

- Un proceso OOM puede terminar el scope completo y todos los terminales
  ([#28320](https://github.com/stablyai/orca/issues/28320)).
- WSL o el host puede morir durante standby y dejar la UI bloqueada
  ([#28278](https://github.com/stablyai/orca/issues/28278)).
- Una terminal puede reanudar una conversación equivocada o quedar ligada a
  un chat incorrecto.
- El output puede perderse o no tener paginación.
- Los enlaces de archivos pueden dejar de ser clicables si una alternativa
  falla ([PR relacionada a #28272](https://github.com/stablyai/orca/pull/28272)).
- Comandos largos no muestran si están ejecutando, detenidos o desconectados.
- El usuario no tiene siempre una forma segura de recuperar un proceso.

### Soluciones

- Supervisor por terminal, no solo por daemon.
- Límites de CPU/memoria y circuit breaker.
- Heartbeat, estado de proceso y último output persistido.
- Scrollback acotado con export bajo demanda.
- Cancelación por señal y kill explícito con confirmación.
- Recovery individual sin tumbar todo el workspace.
- Diagnóstico exportable con host, PID, shell y runtime.

## 4. Búsqueda, indexación e historial

### Problemas

- Unicode/CJK puede indexarse como un único token
  ([#28256](https://github.com/stablyai/orca/issues/28256)).
- Timestamps con offset pueden ordenarse como strings
  ([#28253](https://github.com/stablyai/orca/issues/28253)).
- Transcripts con `cwd` o `updatedAt` nulos se excluyen o quedan mal ordenados
  ([#28255](https://github.com/stablyai/orca/issues/28255)).
- El historial puede no incluir formatos o agentes nuevos
  ([#28266](https://github.com/stablyai/orca/issues/28266)).
- Buscar en muchos worktrees produce resultados duplicados o ambiguos.
- Indexar repositorios grandes consume recursos y puede competir con agentes.
- No siempre se explica por qué un resultado no aparece.

### Soluciones

- Índice por fuente, formato, host y versión de parser.
- Timestamps normalizados como instantes.
- Tokenización Unicode-aware y búsqueda exacta/fuzzy explícita.
- Estado `partial`, `stale`, `failed` y acción “reindex”.
- Resultados con scope, origen y fecha.
- Exclusiones configurables y presupuesto de indexación.
- Búsqueda unificada de código, sesiones, tasks, PRs y assets de datos.

## 5. Plugins y extensibilidad

### Problemas

- Un plugin puede leer un archivo distinto del que el usuario seleccionó
  (la existencia de una corrección específica lo evidencia:
  [PR #28339](https://github.com/stablyai/orca/pull/28339)).
- Cambios de versión rompen contratos de plugins.
- Comandos de plugin pueden no tener icono, scope o descripción clara
  ([#28300](https://github.com/stablyai/orca/issues/28300)).
- Plugins que duermen o el equipo cambia de reloj pueden ser reaped
  incorrectamente ([#28291](https://github.com/stablyai/orca/issues/28291)).
- Los plugins pueden recibir demasiado contexto o permisos.
- No siempre hay aislamiento, cuota, logs ni rollback.

### Soluciones

- Manifest versionado y capability negotiation.
- Sandbox por plugin, permisos por recurso y allowlist.
- Contrato de lectura con path/handle verificable.
- Timeout basado en monotonic clock.
- Worker aislado, límite de memoria y reinicio individual.
- Logs, health, versión, migración y desinstalación limpia.
- UI de permisos: qué lee, qué escribe, qué ejecuta y en qué host.

## 6. Configuración y proveedores

### Problemas

- Una cuenta gestionada puede ser sobrescrita por login externo
  ([#28287](https://github.com/stablyai/orca/issues/28287)).
- Modelos o modos de permiso seleccionados pueden perderse al cambiar de
  provider ([PR #28268](https://github.com/stablyai/orca/pull/28268)).
- Un runtime WSL puede requerir reparación y el agente no ser utilizable
  ([PR #28232](https://github.com/stablyai/orca/pull/28232)).
- Un harness que cambia el título puede no alcanzar readiness
  ([#28273](https://github.com/stablyai/orca/issues/28273)).
- Recetas de entorno pueden ejecutarse en un contexto de cuenta equivocado
  ([PR #28305](https://github.com/stablyai/orca/pull/28305)).
- El usuario no siempre sabe qué configuración gana entre global, proyecto,
  worktree y sesión.

### Soluciones

- Cuenta, provider, modelo y permiso como identidad separada.
- Preflight visible de runtime, shell, PATH, versión y autenticación.
- Configuración por capas con origen y precedencia.
- Snapshot antes de migrar o aplicar receta.
- Readiness por protocolo, no por título.
- Fallback explícito y mensaje accionable.

## 7. UX, accesibilidad y localización

### Problemas

- Texto genérico puede ocultar el último mensaje útil del agente
  ([#28328](https://github.com/stablyai/orca/issues/28328)).
- Filas no leídas pueden seguir en negrita o limpiarse de forma inconsistente
  ([#28306](https://github.com/stablyai/orca/issues/28306)).
- Nombres largos se truncan aunque haya espacio disponible
  ([#28341](https://github.com/stablyai/orca/issues/28341)).
- Falta de RTL/BiDi está registrada como feature pendiente
  ([#28271](https://github.com/stablyai/orca/issues/28271)).
- La misma acción puede tener labels diferentes entre desktop, móvil y CLI.
- Notificaciones numerosas hacen difícil separar urgencia de ruido.

### Soluciones

- Mensaje de agente con fallback semántico y link a transcript.
- Unread state definido por evento y superficie.
- Tooltips, truncado con copia y quick open.
- RTL, escala, contraste, foco, lector de pantalla y motion reduction.
- Centro de notificaciones con severidad, agrupación y mute por workspace.
- Glosario y traducciones versionadas.

## 8. Datos y observabilidad

Orca no debe limitarse a “agente completó”. Debe mostrar:

- consumo de CPU/memoria;
- tiempo de espera del provider;
- costo o cuota cuando exista;
- comandos ejecutados;
- archivos tocados;
- tests y checks;
- preguntas pendientes;
- cambios de permisos;
- estado de host, terminal y plugin;
- qué evidencia respalda el resultado.

Sin esa capa, el usuario no puede distinguir un agente lento de un agente
bloqueado, un test fallido de un test no ejecutado o un resultado incompleto de
uno validado.

