# Agentes, automatizaciones y seguridad operacional

## Problemas adicionales

### Agentes

- Readiness basada en heurísticas puede fallar con forks de Pi o harnesses que
  cambian el título ([#28273](https://github.com/stablyai/orca/issues/28273)).
- Un agente puede heredar accidentalmente identidad de la terminal que lo
  lanzó ([PR #28267](https://github.com/stablyai/orca/pull/28267)).
- Cambiar modelo o esfuerzo puede alterar el modo de permisos
  ([PR #28268](https://github.com/stablyai/orca/pull/28268)).
- Una sesión nativa puede no estar visible para el selector `/resume` del CLI
  ([#28322](https://github.com/stablyai/orca/issues/28322)).
- El usuario no sabe si el agente espera respuesta, está idle, está trabajando
  o terminó con error.
- El agente puede generar demasiado ruido en chats, boards o PRs.
- Un reintento ciego puede duplicar comandos, commits o ejecuciones.

### Automatizaciones

- Un cambio de hooks puede hacer fallar todas las ejecuciones programadas sin
  alerta ni recovery ([#28252](https://github.com/stablyai/orca/issues/28252)).
- Los resultados grandes pueden superar el límite de respuesta y el CLI no
  ofrecer paginación ([#28254](https://github.com/stablyai/orca/issues/28254)).
- Las automatizaciones pueden quedar vinculadas a un host inexistente
  ([#28258](https://github.com/stablyai/orca/issues/28258)).
- Una receta de entorno puede mutar estado antes de que el intent quede
  persistido ([PR #28290](https://github.com/stablyai/orca/pull/28290)).
- Reintentar una tarea no siempre significa reintentar solo el paso fallido.

### Seguridad

- Un plugin o agente puede recibir secretos por contexto innecesario.
- Un comentario de PR, README o issue puede contener prompt injection.
- Las credenciales gestionadas pueden entrar en conflicto con logins externos
  ([#28287](https://github.com/stablyai/orca/issues/28287)).
- Una acción remota puede tener más alcance que el usuario cree.
- Un agente puede leer un archivo fuera del worktree si el provider no limita
  el path.
- La UI puede mostrar “seguro” cuando en realidad solo terminó el proceso, no
  la validación.

## Contrato mínimo de agente

Cada agente debe declarar:

```text
agent_id
harness
provider
model
permission_mode
host
worktree
task
allowed_paths
allowed_commands
network_policy
approval_policy
heartbeat
cancel_token
```

## Máquina de estados propuesta

```text
created → preflight → ready → working → waiting-user
       → proposed → awaiting-approval → executing
       → verifying → completed
       → failed / cancelled / expired / blocked
```

`completed` exige evidencia. `executing` exige autorización. `waiting-user`
debe explicar la pregunta y permitir responder sin buscar la conversación.

## Automatización segura

1. Persistir el intent.
2. Validar provider, host, branch, cwd y permisos.
3. Mostrar preview y alcance.
4. Ejecutar con timeout y límites.
5. Guardar stdout/stderr resumidos y referencias.
6. Emitir heartbeat.
7. Verificar resultado.
8. Notificar éxito, fallo o estado incierto.
9. Habilitar retry idempotente o explicar por qué no.

## Seguridad de contexto

- Todo contenido externo es dato, no instrucción.
- Separar prompt del agente, contexto del repo y contenido de usuario.
- Marcar comentarios, páginas web y archivos desconocidos como no confiables.
- No enviar secretos, tokens ni dumps de datos a providers sin política.
- Redactar logs y transcripts.
- Mostrar qué contexto fue enviado.
- Permitir exclusiones por ruta, etiqueta y clasificación de datos.

## Observabilidad de agentes

Dashboard mínimo:

- latencia por etapa;
- tokens/cuota cuando esté disponible;
- comandos;
- archivos;
- errores;
- preguntas;
- retries;
- permisos;
- costo estimado;
- resultado verificado;
- diff y commit.

## Fuentes

- [GitHub best practices for repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories)
- [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Orca issues](https://github.com/stablyai/orca/issues)
- [Orca #28252](https://github.com/stablyai/orca/issues/28252)
- [Orca #28254](https://github.com/stablyai/orca/issues/28254)
- [Orca #28287](https://github.com/stablyai/orca/issues/28287)
