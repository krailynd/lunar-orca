# Tokens light/dark y accesibilidad

## Tokens implementados

| Rol | Light | Dark |
|---|---|---|
| Canvas | `#F5F7FA` | `#111817` |
| Superficie | `#FFFFFF` | `#17211F` |
| Elevada | `rgba(255,255,255,.78)` | `#1D2A27` |
| Texto | `#17212B` | `#E7F0EC` |
| Secundario | `#64748B` | `#9AAEA7` |
| Borde | `rgba(15,23,42,.10)` | `rgba(231,240,236,.12)` |
| Jade | `#0F8F73` | `#55C7A5` |
| Celeste | `#2B7BBB` | `#70B7E8` |

## Implementado

Los valores viven en `src/renderer/src/assets/main.css` y alimentan los
primitives existentes. LunarGrip usa estas superficies sin crear una paleta
paralela.

## Parcial y pendiente

Los tonos warning/error/éxito heredados aún requieren una revisión completa de
contraste por componente. La auditoría visual por pantalla y snapshots de
Electron queda pendiente.

## Guardas

No usar color como única señal, mantener foco visible, respetar reduced motion,
evitar blur mayor de 16px y no aplicar transparencia al editor o terminal.
No se agregan dependencias ni se modifica configuración funcional.
