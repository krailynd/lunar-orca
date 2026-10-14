# Diagrama conceptual de arquitectura

```mermaid
flowchart LR
  U[Persona] --> O[Lunar Orca]
  O --> UI[LunarGrip UI]
  UI --> C[Contratos versionados]
  UI --> A[Adaptador / core de datos]
  UI --> M[LunarMind]
  M --> C
  M --> P[Propuesta estructurada]
  P --> V[Preview y confirmación humana]
  V --> A
  A --> DB[(Motor de base de datos)]
  PI[Arnés PI] --> T[Tarea y lifecycle]
  T --> M
  M --> T
```

## Lectura del diagrama

- PI coordina tareas y agentes; no se duplica dentro de LunarGrip.
- LunarGrip conserva contexto y presenta propuestas.
- El adaptador es el único límite que toca la base.
- La confirmación humana queda entre propuesta y mutación.
- El contrato permite que UI, agente y resultado se correlacionen.

## Diagrama de datos pendiente

No se genera un DER porque no se aportó una base de datos de LunarGrip ni un
esquema persistente decidido. Crear uno ahora sería inventar estructura. Cuando
se defina la persistencia, debe documentarse el DER con PK/FK y ciclo de vida.

