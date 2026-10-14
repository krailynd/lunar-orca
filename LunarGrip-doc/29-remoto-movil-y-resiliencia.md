# Remoto, móvil y resiliencia

## Hallazgo

La promesa de Orca incluye desktop, móvil, web, SSH, paired runtimes y hosts
remotos. El problema más profundo no es conectar: es mantener **paridad de
identidad, estado, permisos y recuperación** cuando el camino cambia.

## Problemas observados

### SSH y servidores headless

- `orca serve` puede no cargar los targets SSH que sí aparecen en desktop,
  dejando workspaces remotos inutilizables
  ([#25886](https://github.com/stablyai/orca/issues/25886)).
- El usuario puede necesitar un desktop/Xvfb para una capacidad que se espera
  headless.
- No siempre se distingue “host desconectado”, “target no registrado” y
  “terminal no creada”.
- La eliminación de un host puede dejar automatizaciones sin destino
  ([#28258](https://github.com/stablyai/orca/issues/28258)).

### Relay y topologías restringidas

- Un teléfono o iPad puede llegar al laptop pero no al servidor SSH.
- El relay desktop existente no siempre se reutiliza para móvil/web
  ([#26291](https://github.com/stablyai/orca/issues/26291)).
- Crear otro túnel puede estar prohibido por política.
- El usuario necesita ver qué tramo de la cadena está caído.

### Móvil e historial

- Móvil puede listar una sesión remota pero negarse a reanudarla porque solo
  busca transcript local
  ([#26818](https://github.com/stablyai/orca/issues/26818)).
- Un mensaje de error puede atribuir la sesión al host equivocado.
- La UI móvil puede mostrar el proyecto por nombre de carpeta y mezclar dos
  proyectos iguales ([#28314](https://github.com/stablyai/orca/issues/28314)).
- No todas las acciones de desktop tienen equivalente móvil.

## Diseño de runtime unificado

```text
Client surface
  ↓ capability negotiation
Paired runtime / desktop relay
  ↓ host registry
Execution host
  ↓ worktree/session identity
Terminal, editor, agent, automation
```

Cada operación devuelve:

```text
operation_id
target_host
target_worktree
capabilities
state
last_seen
retryability
required_approval
```

## Capability matrix

| Operación | Desktop local | Desktop SSH | Mobile paired | Web relay | Headless |
|---|---:|---:|---:|---:|---:|
| Ver workspace | Sí | Sí | Sí | Sí | Sí |
| Crear terminal | Sí | Sí | Condicional | Condicional | Sí |
| Reanudar sesión | Sí | Sí | Requiere transcript remoto | Condicional | Sí |
| Editar archivo | Sí | Sí | No recomendado | Condicional | API |
| Aprobar propuesta | Sí | Sí | Sí | Sí | No |
| Lanzar agente | Sí | Sí | Política | Política | Política |
| Ver logs | Sí | Sí | Resumen | Resumen | Sí |

“Condicional” debe explicar qué capability falta, no mostrar un botón muerto.

## Resiliencia requerida

- reconnect con backoff y límite;
- sesiones reanudables por host;
- operaciones idempotentes;
- outbox local para acciones aprobadas;
- cache con marca de freshness;
- reconciliación después de reconectar;
- cancelación propagada;
- no duplicar agentes por retry;
- export de diagnóstico offline;
- degradación a CLI/SSH directo cuando esté permitido.

## Seguridad del relay

- claves y tokens nunca se muestran en logs;
- cada relay tiene identidad y expiración;
- scopes mínimos por superficie;
- aprobación para ejecutar en host remoto;
- separación de terminales y workspaces;
- audit log de conexión, comando y transferencia;
- advertencia cuando una acción cruza de laptop a producción.

## Criterios de aceptación

- perder red no pierde el estado confirmado;
- reconectar no duplica terminal ni agente;
- móvil puede reanudar una sesión en su host real o explica exactamente por
  qué no;
- el usuario puede ver el trayecto cliente → relay → host;
- un host eliminado produce tareas de recuperación, no automatizaciones
  silenciosamente huérfanas.
