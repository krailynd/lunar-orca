# Sistema visual global de Lunar Orca

## Objetivo

Aplicar una identidad sobria y consistente al shell, sidebar, Home, tareas,
terminal, editor, GitHub/PRs, automatizaciones, diálogos, tablas y LunarGrip
sin cambiar su arquitectura ni comportamiento funcional.

## Implementado

Los tokens canónicos de `main.css` usan un canvas claro `#F5F7FA`, superficies
blancas opacas, texto pizarra y jade como acento; en dark usan canvas
`#111817`, superficies `#17211F`/`#1D2A27`, texto verdoso claro y jade suave.
Las superficies compartidas heredan estos tokens automáticamente.

## Reglas

La mayor parte de la aplicación es opaca y legible. Glass y blur quedan
reservados para overlays y paneles laterales; no hay glow permanente, text
shadow decorativo ni degradados técnicos. Controles usan radios contenidos,
cards radios mayores y sombras solo para elevación real. Estados combinan
texto, icono y contraste.

## Parcial y pendiente

Los componentes existentes conservan clases históricas en algunas superficies;
su migración individual debe hacerse de forma incremental, con pruebas de
regresión. El comportamiento funcional, layout de datos y arquitectura no se
modifican en este trabajo.

## Accesibilidad y rendimiento

La paleta mantiene contraste AA, el foco visible se conserva y las animaciones
globales existentes respetan `prefers-reduced-motion`. El terminal y editor
mantienen superficies opacas para evitar pérdida de legibilidad.

## Fuera de alcance

No se agregan dependencias, no se toca cloud/mobile/PI, no se altera el tema
por plataforma y no se incorporan conexiones o datos reales.
