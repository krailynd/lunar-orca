# Especificación Maestra y Arquitectura Unificada: Lunar Orca + LunarGrip

*Fecha de corte: 2026-10-13*  
*Autor: Krailynd / el Gentleman (Architect)*  
*Repositorio: `https://github.com/krailynd/lunar-orca` (rama `mis-mods`)*  
*Licencia base: MIT (Lovecast Inc. / Stably AI) — Atribución: Modified by Krailynd / Lunar Orca (2026)*

---

## 1. Visión y Propósito del Producto

**Lunar Orca** evoluciona de un entorno de ejecución de agentes por worktrees hacia un **Centro de Mando Integral de Ingeniería y Datos (ADE + Data Workbench)**.

El objetivo es erradicar la desconexión existente entre:
1. **El código y los worktrees** (múltiples agentes CLI ejecutándose en paralelo).
2. **Las bases de datos y la analítica** (LunarGrip: exploración, snapshots de esquemas, relaciones ER y consultas seguras).
3. **La gestión del trabajo** (tareas locales orgánicas ODD, tableros Kanban y cronogramas Gantt interactivos).

---

## 2. Identidad Visual de Marca y Nuevo Logo Oficial

### El Emblema Oficial: "La Ardillita / Ratón Lunar en la Luna Creciente"
- **Fuente original**: `/home/krailynd/Downloads/Gemini_Generated_Image_am4fs6am4fs6am4f.jpg`.
- **Composición**: Silueta estilizada de un pequeño roedor / ardillita reposando sobre la curva interior de una luna creciente (crescent moon), con textura sutil y estética xilográfica / minimalista moderna.
- **Paleta de marca adaptativa**:
  - **Lienzo Light**: Silueta en pizarra profundo (`#0F172A`) sobre luna creciente con acento verde esmeralda institucional (`#059669`) o celeste glaciar (`#0284C7`).
  - **Lienzo Dark**: Silueta en blanco cálido sedoso (`#EAEFE9`) sobre luna con acento jade menta neón suave (`#2DD5B7`).
- **Matriz de Assets a Generar**:
  1. `resources/logo.svg`: Vector SVG limpio y nítido para la cabecera del Home Dashboard, modales y SplashScreen.
  2. `resources/build/icon.png`: Master PNG transparente `1024x1024` para el empaquetador de Linux (AppImage / .desktop).
  3. `resources/icon.png` y `resources/icon-dev.png`: PNGs runtime `256x256`.
  4. `resources/build/icon.ico`: Master multi-resolución para compatibilidad de sistema.
  5. `resources/app-icons/`: Variantes para el selector de apariencia de Orca.

---

## 3. Arquitectura Visual de Paneles Flotantes (Soft Glassmorphism)

### 3.1 Light Mode — Soft Glassmorphism & Clean Cloud (Fintech / Operaciones)
- **Lienzo ambiental**: Fondo con degradado multidireccional suave `#EDF2F7 → #E2E8F0 → #F0FDF4`.
- **Barras laterales**: Translúcidas esmeriladas `rgba(255, 255, 255, 0.70)` con `backdrop-filter: blur(20px)` y borde `rgba(255, 255, 255, 0.6)`.
- **Cuerpo central (Área de trabajo)**: Superficie **blanca pura elevada (`#FFFFFF`)**, esquinas redondeadas de `20px` a `24px`, con sombra ambiental difusa (`box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.02)`).
- **Botones y navegación activa (Pill `9999px`)**: Cápsula blanca pura `#FFFFFF` elevada con micro-sombra y acento verde esmeralda institucional (`#059669`).
- **Terminal**: Fondo blanco puro `#FFFFFF` con texto pizarra profundo `#0F172A`, cursor `#059669`, sin shaders que generen lag.

### 3.2 Dark Mode — Minimalista Elegante Cálido/Frío (Sin sobre-saturación)
- **Lienzo ambiental**: Negro jade profundo y sólido (`#0c1412` / `rgba(10, 16, 14, 0.94)`). Cero transparencia lavada que dificulte la lectura.
- **Laterales**: Cristal oscuro esmerilado con desenfoque suave (`backdrop-filter: blur(24px)`).
- **Acentos**: Toques finos y precisos de jade menta (`#2DD5B7`, `#549e6a`) en botones activos, estados y bordes.
- **Tipografía**: Blanco cálido sedoso (`#EAEFE9`) y crema suave (`#F7E8B2`).
- **Terminal (Rendimiento 60 FPS)**: Fondo descansado `#0c1512` con opacidad `0.88-0.92`, `backdrop-filter: none` en el viewport para garantizar cero latencia al escribir o scrollear en Pi.

---

## 4. El Motor de Tareas: Local Tasks + Kanban + Diagrama de Gantt

### 4.1 Doble Motor de Tareas
1. **Tareas de Proveedores (GitHub, Linear, Jira, GitLab)**: Sincronización remota nativa con issues del repositorio.
2. **Tareas Locales Personalizadas (Proyectos Locales / ODD)**: Motor local indexado por proyecto (`projectId` y ruta) para trabajar sin conexión o en proyectos que no usan GitHub.

### 4.2 Las Tres Vistas Integradas
- **Vista Lista**: Tabla compacta con ordenamiento por prioridad (`Alta`, `Media`, `Baja`), fecha y estado.
- **Vista Kanban**: 4 columnas (`Todo`, `In Progress`, `In Review`, `Done`) con drag-and-drop nativo y botones rápidos de transición.
- **Diagrama de Gantt Interactivo (Estilo Notion / Lark)**:
  - Cronograma con navegación temporal (`-7d`, `Hoy`, `+7d`).
  - Barras horizontales arrastrables con el cursor para mover fechas de inicio/fin y duración en tiempo real.
  - Indicador de progreso porcentual (`0%` a `100%`) y color por estado.

### 4.3 Delegación a Agentes (Multi-Agent Dispatch)
- Botón **"Delegar"** en cada tarea (Lista, Kanban y Gantt) con selector para los 6 arneses:
  `Pi Agent` | `OpenCode` | `Antigravity (Agy)` | `Claude Code` | `Codex CLI` | `Hermes Agent`
- Al asignar una tarea:
  1. El estado pasa automáticamente a `In Progress`.
  2. Se abre el compositor de Worktrees preseleccionando el arnés elegido.
  3. Se inyecta el prompt de coordinación **Lunar Orca Intercom** con el ID de la tarea, objetivo y reglas de reporte.

---

## 5. El Data Workbench (LunarGrip — Integración Nativa)

Basado en los 23 capítulos de `LunarGrip-doc/`, LunarGrip se incorpora no como una app externa, sino como una vista de primer nivel dentro de Lunar Orca:

```text
Lunar Orca
├── Object Explorer (Árbol de esquemas, tablas, vistas, funciones)
├── SQL Editor con autocompletado consciente del esquema
├── Visualizador ERD Interactivo (Diagramas entidad-relación generados desde snapshot)
├── LunarMind (Copiloto de IA para análisis de datos)
└── Registro de Auditoría de Consultas
```

### Principios Inquebrantables de LunarGrip:
1. **Copiloto, no autoridad**: Los agentes pueden sugerir consultas o análisis de índices, pero **ningún cambio destructivo (DML/DDL) se ejecuta de forma implícita**.
2. **Preview obligatorio**: Cualquier mutación (`UPDATE`, `DELETE`, `DROP`, `ALTER`) exige confirmación humana interactiva mostrando el script exacto y el análisis de impacto.
3. **Esquema separado de presentación**: El snapshot del esquema se guarda como texto versionable en Git, y el layout visual del diagrama (coordenadas de nodos) se guarda de forma independiente.
4. **Primer motor soportado**: Microsoft SQL Server (conectores T-SQL basados en `sys.*` para Docker local y SahaCloud VPS).

---

## 6. Automatizaciones Cron Inteligentes

- **Scheduler en segundo plano**: Tareas desatendidas tipo cron vinculadas a los arneses de IA locales:
  - `Pi ODD Daily Sync & Engram Audit` (Auditoría diaria ODD y sincronización de memoria).
  - `Hermes Remote Intelligence & Security Recon` (Reconocimiento y alertas periódicas en SahaCloud).
  - `OpenCode & Multi-Harness PR / Issue Triage` (Clasificación de issues y preparación de worktree fixes).
- **Ejecución limpia**: Se ejecutan en worktrees efímeros sin robar el foco de la pantalla, registrando los logs y evidencias en la pestaña **"Runs"**.

---

## 7. Plan de Ejecución por Etapas

| Etapa | Alcance Principal | Entregable |
|---|---|---|
| **Etapa 1: Branding & Logo Vectorial** | Procesar `Gemini_Generated_Image...jpg`, recortar silueta lunar y ardillita, generar SVG vectorial limpio y empaquetar set de íconos PNG/ICO/ICNS. | Logo oficial en Home, Titlebar, Favicon y AppImage. |
| **Etapa 2: Refinamiento Estético Final** | Aplicar el soft glassmorphism en Light Mode (tarjeta central `#FFFFFF` elevada y pills `9999px`) y pulir Dark Mode hacia negro jade minimalista descansado. | CSS limpio, validado con `check:dead-classes` y cero lag en xterm. |
| **Etapa 3: Estabilización de Tareas & Gantt** | Asegurar sincronización reactiva bidireccional entre Tareas Locales, Kanban, Gantt y Dashboard Home con delegación multi-arnés. | Flujo fluido sin crashes de React. |
| **Etapa 4: Andamiaje de LunarGrip (Data Workbench)** | Integrar la vista de LunarGrip en el Shell con Object Explorer y contratos de snapshot de esquema T-SQL. | Pestaña de base de datos funcional en Lunar Orca. |
| **Etapa 5: Empaquetado y Publicación** | Build completo de producción, verificación de suites de tests, creación del AppImage v1.4.224-lunar.3 y push con tag a GitHub. | Release lista y funcional en el sistema. |
