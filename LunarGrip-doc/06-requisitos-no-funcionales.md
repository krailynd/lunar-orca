# Requisitos no funcionales

| ID | Área | Requisito verificable |
|---|---|---|
| RNF-01 | Seguridad | Ningún secreto aparece en archivos de proyecto, prompts, logs o snapshots. |
| RNF-02 | Seguridad | Toda mutación tiene preview, actor, confirmación y correlación. |
| RNF-03 | Seguridad | El agente no puede convertir una instrucción textual en autorización. |
| RNF-04 | Rendimiento | La UI permanece interactiva durante introspección y consultas cancelables. |
| RNF-05 | Rendimiento | Los resultados grandes se procesan por lotes y con límite visible. |
| RNF-06 | Disponibilidad | Una desconexión muestra estado y última evidencia, sin inventar éxito. |
| RNF-07 | Compatibilidad | Los contratos se versionan y toleran clientes/hosts en versiones mixtas. |
| RNF-08 | Portabilidad | Local, SSH y otros hosts conservan la propiedad de ejecución en el host correspondiente. |
| RNF-09 | Trazabilidad | Cada propuesta puede vincularse a tarea, agente, snapshot y resultado. |
| RNF-10 | Mantenibilidad | El core de datos, UI, contratos y bridge de agentes tienen fronteras claras. |
| RNF-11 | Licencias | Cada dependencia candidata tiene licencia, aviso y compatibilidad revisados. |
| RNF-12 | Privacidad | La telemetría y los datos enviados a modelos son explícitos y configurables. |
| RNF-13 | UX | El entorno, identidad, base y modo de solo lectura permanecen visibles durante la operación. |
| RNF-14 | Accesibilidad | Árbol, editor, grid, diagramas y confirmaciones son navegables por teclado y lector de pantalla. |
| RNF-15 | Resiliencia | UI y core pueden reiniciarse de forma independiente sin convertir una desconexión en éxito. |
| RNF-16 | Gobernanza | Cada herramienta del agente tiene alcance, permisos y validación en el adaptador, no solo en el prompt. |
| RNF-17 | Compatibilidad | La introspección usa adaptadores específicos sin perder un contrato común de snapshot. |
| RNF-18 | Diagnóstico | Consulta, plan, error y operación pueden correlacionarse con tarea y host. |

## Umbrales a definir con pruebas

Todavía no se deben inventar números de latencia, memoria, filas, tamaño de
snapshot o tiempo de cancelación. Estos umbrales deben salir de fixtures
representativas y quedar registrados junto al resultado de la prueba.
