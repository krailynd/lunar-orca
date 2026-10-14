# Índice y método de trabajo

## Objetivo

Mantener una única vista de producto para LunarGrip sin mezclar tres planos:

1. **Hecho:** observable en Lunar Orca o en la documentación existente.
2. **Decisión:** acuerdo de diseño que guía una futura implementación.
3. **Hipótesis:** idea que todavía requiere investigación, prototipo o prueba.

## Flujo documental

```text
Evidencia → Hallazgo → Requisito → Decisión → Criterio de aceptación → Trabajo
```

Si falta evidencia, el resultado no pasa de hipótesis. Si falta criterio de
aceptación, no debe entrar al roadmap de implementación.

## Especificaciones de Data Workbench

Los documentos 31–36 describen el rediseño visual y funcional de LunarGrip.
Son especificaciones de interfaz; no autorizan drivers, conexiones, ejecución
SQL, persistencia de secretos ni cambios fuera de las superficies aprobadas.
Los documentos 37–38 describen la capa visual compartida de Lunar Orca y sus
guardas de accesibilidad; no cambian la arquitectura funcional.

## Convención de estado

| Estado | Significado |
|---|---|
| `confirmado` | Está respaldado por el repo o una fuente primaria revisada. |
| `propuesto` | Forma parte de la visión, pero aún no existe. |
| `pendiente` | Falta una decisión o una comprobación concreta. |
| `bloqueado` | No puede avanzar sin resolver una dependencia. |
| `descartado` | Se conserva el registro para no reabrir la discusión sin nueva evidencia. |

## Checklist de cada futura actualización

- [ ] Se indica la fuente y fecha.
- [ ] Se separan hechos de propuestas.
- [ ] Se actualizan requisitos afectados.
- [ ] Se actualizan riesgos y decisiones.
- [ ] Se agrega criterio de aceptación medible.
- [ ] Se evita tocar código o configuración si la tarea es documental.
