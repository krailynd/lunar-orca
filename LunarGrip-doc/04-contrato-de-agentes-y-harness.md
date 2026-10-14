# Contrato de agentes y arnés PI

## Objetivo

Conectar LunarGrip con los agentes existentes sin modificar ni reemplazar el
arnés PI. LunarGrip debe ser un **proveedor de contexto y propuestas**, no un
orquestador paralelo.

## Principios de integración

1. El arnés PI mantiene la propiedad de sesiones, workers, heartbeats,
   preguntas, cancelaciones y finalización.
2. LunarGrip expone artefactos legibles: snapshot, consulta propuesta,
   explicación, plan y evidencia.
3. Un agente recibe el contexto mínimo necesario y una referencia a su fuente.
4. La ausencia de conexión se comunica como dato; no se rellena con
   suposiciones.
5. La confirmación humana queda fuera del modelo y fuera del prompt.

## Flujo recomendado

```text
PI crea tarea
  → agente solicita contexto de LunarGrip
  → LunarGrip entrega snapshot acotado
  → agente devuelve propuesta estructurada
  → persona revisa riesgo y alcance
  → Orca/LunarGrip presenta preview
  → persona autoriza o rechaza
  → adaptador ejecuta, si corresponde
  → resultado y evidencia vuelven a la tarea
```

## Roles

| Rol | Responsabilidad |
|---|---|
| Coordinador PI | Descompone trabajo y conserva el estado de la tarea. |
| Agente explorador | Lee snapshot y produce hallazgos, sin mutar la base. |
| Agente SQL | Propone consultas o scripts con explicación y riesgo. |
| Agente revisor | Comprueba requisitos, compatibilidad y criterios de aceptación. |
| Persona aprobadora | Decide toda acción con efecto sobre datos o esquema. |
| LunarGrip | Mantiene contexto, preview, contratos y trazabilidad. |

## Compatibilidad con el contrato actual de workers

La integración futura debe respetar el contrato documentado en
`skill-guides/orchestration/references/worker-contract.md`: heartbeats tipados,
preguntas mediante el canal del coordinador, lectura de seguimientos,
finalización única y estados explícitos. LunarGrip no debe inventar un segundo
protocolo de lifecycle.

## Permisos conceptuales

| Capacidad | Por defecto |
|---|---|
| Leer metadatos | Permitida con conexión explícita |
| Leer datos | Permitida solo con alcance visible |
| Generar SQL | Permitida como propuesta |
| Ejecutar SELECT | Requiere conexión y alcance explícitos |
| DML/DDL/backup/restore | Bloqueada hasta confirmación humana |
| Credenciales | Nunca se entregan al agente |

