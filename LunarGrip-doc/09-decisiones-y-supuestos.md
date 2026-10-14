# Decisiones y supuestos

## Decisiones adoptadas para la documentación

| ID | Decisión | Motivo |
|---|---|---|
| DEC-001 | LunarGrip se documenta como producto futuro, no como función existente. | Evita confundir visión con estado real. |
| DEC-002 | La documentación vive aislada en `LunarGrip-doc/`. | No interfiere con docs operativos ni código. |
| DEC-003 | PI conserva el lifecycle de agentes. | Evita duplicar orquestación y romper el arnés actual. |
| DEC-004 | El primer contrato es agnóstico del motor, aunque SQL Server sea candidato inicial. | Permite crecer sin contaminar la UI. |
| DEC-005 | No se fijan umbrales de rendimiento sin fixtures. | Evita requisitos inventados. |

## Supuestos que deben validarse

- Lunar Orca podrá ofrecer un punto de integración nativo sin romper upstream.
- Los contratos de agentes actuales podrán transportar referencias a artefactos.
- El primer caso de uso valioso es lectura, exploración y documentación.
- La persistencia local puede separar secretos, snapshot y layout.
- El producto mantendrá compatibilidad con uso local y SSH.

## Registro futuro

Toda nueva decisión debe incluir: contexto, alternativas, elección, impacto,
reversibilidad, evidencia y fecha.
