# Riesgos y guardas

| ID | Riesgo | Impacto | Guarda |
|---|---|---:|---|
| R-01 | Ejecutar DDL/DML por una sugerencia de IA. | Crítico | Preview, permiso separado y confirmación humana obligatoria. |
| R-02 | Filtrar credenciales o datos sensibles al modelo. | Crítico | Redacción, minimización, keyring y logs seguros. |
| R-03 | Confundir una desconexión con éxito. | Alto | Estados `live`, `unverifiable`, `exited` y evidencia de host. |
| R-04 | Bloquear la UI con resultados grandes. | Alto | Streaming por lotes, virtualización y cancelación real. |
| R-05 | Romper clientes/hosts de Orca por cambiar contratos. | Alto | Campos opcionales, versionado y negociación. |
| R-06 | Duplicar el orquestador PI. | Alto | LunarGrip produce contexto/propuestas; PI conserva lifecycle. |
| R-07 | Adoptar una licencia incompatible. | Alto | Registro de licencias y revisión antes de integrar. |
| R-08 | Presentar hipótesis como capacidad entregada. | Medio | Etiquetas de estado y matriz de evidencia. |
| R-09 | Hacer introspección costosa o invasiva. | Medio | Niveles lazy, límites, refresh explícito y solo lectura inicial. |
| R-10 | Perder layout al cambiar el esquema. | Medio | Snapshot hash, migración incremental y archivos separados. |

## Prohibiciones documentales

- No incluir contraseñas, tokens, dumps reales ni datos personales.
- No copiar comandos destructivos como procedimiento normal.
- No prometer soporte de un motor sin pruebas.
- No cambiar el arnés PI desde este espacio.

