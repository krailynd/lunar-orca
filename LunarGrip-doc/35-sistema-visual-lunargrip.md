# Sistema visual LunarGrip

## Objetivo

LunarGrip debe parecer una herramienta de trabajo de Orca, no una pantalla
cyberpunk. Se reutilizan tokens de `main.css` y primitives existentes.

## Reglas

Superficies principalmente opacas, blur sutil y bordes suaves. El color se
reserva para foco, selección, éxito, advertencia y error. El editor usa
`editor-surface`; no se cambia el tema global. Light y dark mantienen contraste
WCAG AA. Animaciones de 150–220 ms respetan `prefers-reduced-motion`.

## Componentes y accesibilidad

Se usan Button, Badge, Card, Dialog, Tabs, Input, Label, Select, Command,
ScrollArea y Tooltip. Los iconos tienen nombre accesible cuando son acciones.
Focus visible, targets suficientes y contraste son requisitos.

## Rendimiento y aceptación

No se aplica transparencia a toda la UI, no hay glow permanente ni gradientes
decorativos. El terminal y Monaco conservan legibilidad. La pantalla mantiene
su comportamiento con light/dark y reduced motion.

## Fase 1A y fuera de alcance

La especificación solo cambia la presentación. No modifica tokens globales,
IPC, drivers, secretos ni configuración de Orca.
