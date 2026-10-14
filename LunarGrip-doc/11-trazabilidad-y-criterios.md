# Trazabilidad y criterios de aceptación

## Matriz inicial

| Necesidad | Requisitos | Evidencia mínima | Criterio |
|---|---|---|---|
| Conocer el esquema | RF-02, RF-04, RF-08, RNF-09 | Fixture y snapshot versionado | Un agente puede citar el objeto exacto que explica. |
| Consultar sin perder control | RF-05, RF-06, RF-07, RNF-02, RNF-04 | Consulta cancelable y preview | No hay mutación implícita y el usuario ve alcance. |
| Entender relaciones | RF-08, RF-09, RF-10, RNF-10 | Snapshot + layout separados | El diff distingue estructura de presentación. |
| Usar agentes | RF-12–RF-15, RNF-03, RNF-09 | Contrato de propuesta y rechazo | El agente no puede convertir texto en autorización. |
| Operar remoto | RF-03, RNF-06, RNF-08 | Fixture host local/remoto | El resultado identifica dónde se ejecutó. |

## Definición de listo para una fase

- [ ] Requisitos vinculados.
- [ ] Decisiones resueltas o bloqueos explícitos.
- [ ] Fixture y datos sintéticos definidos.
- [ ] Riesgos con guardas.
- [ ] Criterios medibles.
- [ ] Prueba de regresión.
- [ ] Documentación actualizada.

## Evidencia mínima por propuesta de IA

```text
taskId
snapshotId
actor
intent
sql
scope
risk
requiresConfirmation
explanation
```

El formato es conceptual hasta que se formalice el contrato. No implica que
LunarGrip ya lo emita.
