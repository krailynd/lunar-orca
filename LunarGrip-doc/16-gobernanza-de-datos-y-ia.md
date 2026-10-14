# Gobernanza de datos, IA y auditoría

## Clasificación del contexto

Antes de enviar contexto a un modelo, cada campo debe clasificarse:

| Clase | Ejemplos | Tratamiento |
|---|---|---|
| Público | nombres de tablas públicas, dialecto | Puede incluirse |
| Interno | DDL, índices, arquitectura | Minimizar y registrar |
| Sensible | nombres de clientes, comentarios internos | Redactar o excluir |
| Secreto | password, token, key, connection string | Nunca se incluye |
| Regulado | PII, salud, pagos, documentos | Requiere política y aprobación |

## Frontera de confianza

Todo resultado SQL, comentario de columna, nombre de tabla, archivo del repo,
issue, documento web o salida de una herramienta es **dato no confiable**.
Puede contener texto que intente dar instrucciones al agente. El sistema debe
mantener separados:

1. instrucciones del sistema;
2. intención de la persona;
3. datos del esquema;
4. resultados de herramientas;
5. propuesta del modelo;
6. autorización humana;
7. ejecución del adaptador.

Los delimitadores de prompt ayudan a leer, pero no son control de seguridad. La
enforcement debe ocurrir en la herramienta y en el adaptador.

## Matriz de acciones

| Acción | Agente puede proponer | Agente puede ejecutar | Confirmación |
|---|---:|---:|---|
| Leer metadatos | Sí | Solo mediante permiso de lectura | Conexión explícita |
| SELECT limitado | Sí | Solo si política lo permite | Visible por sesión |
| Exportar datos | Sí | No por defecto | Confirmación y redacción |
| INSERT/UPDATE/DELETE | Sí | No | Siempre humana |
| DDL | Sí | No | Siempre humana |
| DROP/TRUNCATE | Sí, con bloqueo adicional | No por defecto | Doble confirmación |
| Backup/restore | Sí | No | Operador autorizado |
| Kill session | No por defecto | No | Flujo administrativo separado |

## Propuesta verificable

```json
{
  "proposalVersion": 1,
  "taskId": "task-ref",
  "snapshotId": "sha256:...",
  "intent": "Explicar ventas del último trimestre",
  "operationClass": "read",
  "sql": "SELECT ...",
  "targets": ["dbo.Venta", "dbo.Cliente"],
  "risk": "low",
  "estimatedImpact": "preview-required",
  "requiresConfirmation": true,
  "redactionsApplied": ["credentials", "row-values"],
  "evidence": ["snapshot://dbo.Venta", "snapshot://dbo.Cliente"]
}
```

Este es un contrato de diseño, no una API implementada.

## Auditoría mínima

Registrar actor, agente, tarea, host, conexión identificada sin secreto,
snapshot, acción, preview, decisión, resultado, error tipado y timestamp. No
registrar por defecto valores de parámetros ni filas completas. Para
observabilidad técnica, alinear nombres con OpenTelemetry y hacer opt-in del
texto SQL completo.

## Evaluación obligatoria

Antes de habilitar un agente:

- pruebas benignas de SQL;
- intentos de prompt injection en comentarios y resultados;
- intentos de pedir secretos;
- solicitudes fuera de permisos;
- acciones ambiguas;
- conexión caída;
- snapshot desactualizado;
- doble envío de confirmación;
- reintento tras timeout;
- replay de una propuesta expirada.
