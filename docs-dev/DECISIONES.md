# Decisiones Arquitecturales y Configuración del Entorno — Lunar Orca

Documento vivo de decisiones técnicas, arquitectura del entorno y procedimientos operativos para el workspace de Lunar Orca en Omarchy Arch Linux.

---

## 1. Desactivación de Telemetría (Zero Outbound Analytics)

- **Decisión en código**: `src/main/telemetry/client.ts` tiene `const TELEMETRY_ENABLED = false`.
- **Efecto de compilación**: `verify-telemetry-constants.mjs` valida que el transport está eliminado por dead-code-elimination y no emite claves hacia el binario final.
- **Perfil de usuario**: En `profile-state.db` y `orca-data.json`, `settings.telemetry.optedIn = false`.
- **Resultado en red**: Cero requests salientes a PostHog u otros agregadores.

---

## 2. Presets de CLI Agents para Worktrees Aislados

Se registraron en `settings.terminalQuickCommands` los 4 CLI agents principales del entorno:

| ID Preset | Label | Comando | Scope | Append Enter |
|---|---|---|---|---|
| `preset-claude-code` | Claude Code (Worktree) | `claude --dangerously-skip-permissions` | Global | `true` |
| `preset-codex` | Codex CLI (Worktree) | `codex --dangerously-bypass-approvals-and-sandbox` | Global | `true` |
| `preset-opencode` | OpenCode (Worktree) | `opencode` | Global | `true` |
| `preset-pi` | Pi Agent (Worktree) | `pi` | Global | `true` |

Además, `claude`, `codex`, `opencode` y `pi` son ciudadanos de primer orden en el catálogo de agentes TUI (`TUI_AGENT_AUTO_PICK_ORDER`), permitiendo inicializar worktrees y terminales vinculados automáticamente.

---

## 3. Editores y Estética Visual Osaka Jade Neon

- **Editor predeterminado**: Zed (`id: 'zed'`, `command: 'zed'`) agregado como primera opción en `DEFAULT_OPEN_IN_APPLICATIONS`, seguido de VS Code (`code`).
- **Tema de terminal y eliminación de lag**: `Osaka Jade Neon` con fondo sólido/nítido `#0c1512`, `terminalBackgroundOpacity: 0.88` y `windowBackgroundBlur: true`. Se eliminaron shaders costosos del viewport de `xterm` para garantizar latencia cero de renderizado, potenciando el contraste de texto y bordes neon estilo Osaka Jade.
- **Tipografía**: `Iosevka Nerd Font Mono` a `12px` con ligaduras activas (`on`).
- **Sidebar**: Modo `match-terminal` con tinte `#111c18` y opacidad `0.18`.
- **Divisores**: Acento jade `#2DD5B7`.
- **Regla Hyprland**: Ventana de clase `^orca$` con opacidad `0.94 0.88`, regla de apertura `animation = "windows, 1, 7, iosSpring, slide"` en `~/.config/hypr/looknfeel.lua`.

---

## 5. Mejoras de Experiencia Multi-Harness y Productividad (Bloques 1–4)

### 5.1. Eliminación de Lag en Terminal y Contraste Osaka Jade (Bloque 1)
- **Viewport de terminal nítido**: Fondo base `#0c1512` con `terminalBackgroundOpacity: 0.88`.
- **Rendimiento xterm**: Desactivación de composiciones/shaders pesados en el viewport de `xterm` para eliminar caídas de frames al hacer scroll masivo o recibir salidas de agentes.
- **Contraste visual**: Refuerzo de bordes y textos en paleta Osaka Jade neon (`#2DD5B7`, `#e6fff8`).

### 5.2. Vista `Home` en Sidebar e Historial Multi-Harness (Bloque 2)
- **Componente `HomePage.tsx`**: Nueva vista `Home` accesible directamente desde el Sidebar principal.
- **Historial unificado de sesiones**: Soporte multi-harness para inspeccionar y reanudar sesiones de **`Pi`**, **`OpenCode`**, **`Hermes`**, **`Claude`**, **`Codex`** y **`Antigravity`**.

### 5.3. Búsqueda Web en `Cmd+J` y Filtrado por Proyecto (Bloque 3)
- **Paleta `Cmd+J` (`worktree-jump-palette-surface.tsx`)**: Botón explícito **`"Buscar en el navegador"`** acompañado del atajo rápido **`Shift+Enter`** para lanzar búsquedas web directas desde la paleta de salto.
- **Filtrado estricto por proyecto en `Agent Session History`**: Las sesiones se filtran estrictamente según el repositorio/proyecto activo y exhiben el badge **`[Proyecto: <Nombre>]`** para evitar mezclar contextos entre distintos worktrees.

### 5.4. Automations, Tasks Kanban y Multi-Agent Hub (Bloque 4)
- **Plantillas Cron en `Automations`**: Presets listos para ejecutar tareas programadas con **`pi`**, **`hermes`** y **`opencode`**.
- **Vista Kanban en `Tasks`**: Conmutador de visualización **`List | Kanban`** para gestionar tareas por columnas de estado.
- **`Lunar Orca Multi-Agent Hub` en `WorkspaceBoard`**: Panel central de coordinación multi-agente con sincronización automática de estado de tareas (`syncTaskStatusFromWorkspaceBoard: true`).

---

## 4. SSH Remote Worktrees (`sahacloud`)

### Configuración del Host
- **Host Config / Alias**: `sahacloud`
- **IP Tailscale**: `100.106.162.119`
- **Puerto**: `22`
- **Usuario**: `sahacloud`
- **Fuente**: `ssh-config` (sincronizado desde `~/.ssh/config`)
- **Generación**: `1`

### Procedimiento de Uso en Lunar Orca
1. Abrir el Command Palette o panel de SSH Remote Worktrees en Lunar Orca.
2. Seleccionar el target `sahacloud`.
3. Lunar Orca iniciará la sesión remota sin requerir contraseñas adicionales gracias a la autenticación por llave SSH pública previamente configurada en `~/.ssh/config`.
4. El daemon de worktrees creará ramas y espacios de trabajo aislados en el servidor SahaCloud manteniendo la latencia minimizada sobre Tailscale.

### Procedimiento de Rollback
Si se requiere volver a una configuración limpia o restaurar el perfil anterior:
1. **Detener Lunar Orca**:
   ```bash
   killall -9 orca-ide Orca-linux.AppImage 2>/dev/null || true
   ```
2. **Restaurar base de datos de perfil**:
   Los respaldos automáticos se guardan en `~/.config/orca/profiles/local-default/profile-state.db.backup.*`.
   Copiar el backup más reciente sobre `profile-state.db`:
   ```bash
   cp ~/.config/orca/profiles/local-default/profile-state.db.backup.<timestamp>.db ~/.config/orca/profiles/local-default/profile-state.db
   ```
3. **Restaurar AppImage previa (Stably 1.4.224)**:
   ```bash
   cp /home/krailynd/Applications/Orca-linux.AppImage.bak-stably-1.4.224 /home/krailynd/Applications/Orca-linux.AppImage
   ```
4. **Restaurar configuración de Hyprland**:
   ```bash
   cp ~/.config/hypr/looknfeel.lua.bak-lunar-orca ~/.config/hypr/looknfeel.lua
   hyprctl reload
   ```
