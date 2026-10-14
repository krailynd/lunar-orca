# Arquitectura objetivo

## Vista de alto nivel

```text
Lunar Orca
├── LunarGrip UI
│   ├── conexiones y contexto
│   ├── Object Explorer
│   ├── editor y resultados
│   ├── diagramas
│   └── LunarMind
├── Contratos versionados
│   ├── schema snapshot
│   ├── diagram layout
│   ├── query proposal
│   └── agent task
└── Adaptador local
    └── core de datos (propuesto)
        ├── conexión
        ├── introspección
        ├── ejecución por lotes
        ├── cancelación
        └── credenciales del sistema
```

## Límites de responsabilidad

| Componente | Hace | No hace |
|---|---|---|
| UI | Presenta contexto, edita consultas y solicita acciones. | No guarda secretos ni decide ejecutar una mutación por sí sola. |
| Contratos | Estabilizan el intercambio y la trazabilidad. | No reemplazan validación del motor. |
| Core/adaptador | Conecta, inspecciona y transmite resultados. | No interpreta una sugerencia de IA como autorización. |
| LunarMind | Explica y propone SQL/documentación. | No ejecuta ni inventa objetos ausentes del snapshot. |
| Arnés PI | Coordina agentes y tareas del entorno. | No debe quedar acoplado a la disponibilidad de una base. |

## Contratos que deben existir antes de programar

1. **Snapshot de esquema:** motor, servidor identificado sin secretos, base,
   versión del contrato, objetos, columnas, índices, relaciones y hash.
2. **Layout de diagrama:** referencia a snapshot, posiciones, filtros,
   anotaciones y versión.
3. **Propuesta de consulta:** intención, SQL, explicación, riesgo, alcance y
   `requiereConfirmacion`.
4. **Evento de auditoría:** actor, acción, objeto, resultado, timestamp y
   correlación; nunca contraseña ni payload completo por defecto.

## Decisiones de diseño pendientes

- transporte UI-core: stdio JSON-RPC, socket local u otra opción;
- primer motor y driver;
- modelo de caché y expiración;
- política de datos sensibles en resultados;
- integración visual con la arquitectura de panes de Orca;
- límites de ejecución y cancelación por host local/remoto.

## Diagrama formal

Ver `diagramas/arquitectura.md`. Es deliberadamente conceptual hasta que se
confirmen los puntos anteriores.
