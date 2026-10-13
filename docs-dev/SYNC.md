# Estrategia de Sincronización con Upstream (`stablyai/orca`)

Este documento establece el procedimiento operativo estándar para mantener **Lunar Orca** sincronizado con los lanzamientos oficiales de `stablyai/orca`, preservando al 100% las modificaciones de marca, estética, telemetría y configuración personalizada de la rama `mis-mods`.

---

## 1. Principios y Regla de Oro

1. **NUNCA mergear directamente desde `upstream/main`**:
   `upstream/main` es una rama de desarrollo altamente volátil con tags diarios, commits experimentales y breaking changes frecuentes. Mergear `main` directamente genera conflictos destructivos innecesarios.
2. **Mergear ÚNICAMENTE tags de release estables**:
   Solo se integran tags oficiales con formato `v1.x.y` (por ejemplo `v1.0.9`, `v1.0.10`).
   - **Descartar tags de móvil**: tags como `mobile-android-*` o `mobile-ios-*` corresponden al ciclo móvil y no a la aplicación de escritorio.
   - **Descartar tags inestables**: evitar sufijos `-alpha`, `-beta` o `-rc`.
3. **Alternativa quirúrgica (Cherry-Pick)**:
   Si un bug puntual en upstream fue corregido en `upstream/main` pero aún no tiene release tag, utilizar:
   ```bash
   git cherry-pick <hash-del-commit>
   ```
   para backportear exclusivamente la corrección deseada sin absorber el resto del churn.

---

## 2. Flujo de Inspección y Fetch

Antes de iniciar cualquier actualización, inspeccionar las diferencias entre la versión base actual y los nuevos tags disponibles:

```bash
# 1. Asegurar estado local limpio en mis-mods
git checkout mis-mods
git status

# 2. Obtener tags y ramas actualizadas de upstream
git fetch upstream --tags

# 3. Listar últimos tags estables
git tag -l "v1.*" | sort -V | tail -10

# 4. Inspeccionar historial de cambios entre el tag actual y el nuevo release
git log <tag_actual>..<nuevo_tag> --oneline | head -50
```

---

## 3. Flujo de Integración en Rama Desechable (`sync-trial`)

**Regla de aislamiento**: Toda fusión se realiza en una rama efímera (`sync-trial-<tag>`). Si los conflictos son complejos o las pruebas fallan, la rama se descarta sin contaminar `mis-mods`.

```bash
# Paso 1: Crear rama de prueba a partir de mis-mods
git checkout -b sync-trial-<nuevo-tag> mis-mods

# Paso 2: Ejecutar el merge del tag estable
git merge <nuevo-tag>

# Paso 3: Resolver conflictos según la Matriz Protegida (ver sección 4)

# Paso 4: Instalar y compilar dependencias actualizadas
pnpm install

# Paso 5: Ejecutar suite de calidad y tipado estricto
pnpm run check:code-quality:changed
pnpm run typecheck

# Paso 6: Ejecutar pruebas críticas de temas y ventana
pnpm exec vitest run src/main/window/createMainWindow.test.ts src/shared/terminal-theme-selection.test.ts

# Paso 7: Si todas las verificaciones pasan limpias, integrar a mis-mods (Fast-Forward)
git checkout mis-mods
git merge --ff-only sync-trial-<nuevo-tag>

# Paso 8: Eliminar la rama desechable
git branch -d sync-trial-<nuevo-tag>
```

---

## 4. Matriz de Resolución de Conflictos Protegidos

Durante la resolución de conflictos (`git merge` o `git cherry-pick`), los siguientes archivos contienen personalizaciones irremplazables de Lunar Orca. Deben resolverse **siempre** a favor de nuestras modificaciones:

| Archivo | Elemento a Preservar | Justificación |
|---|---|---|
| `src/main/window/createMainWindow.ts` | `transparent: true` y `backgroundColor: '#00000000'` en plataforma Linux (`process.platform === 'linux'`). | Permite la transparencia y blur nativo bajo Hyprland/Wayland. |
| `src/renderer/src/assets/main.css` | Variables de color en bloque `.dark` (Osaka Jade Neon: teal `#00ffd5`, emerald `#00e5a3`, fondo `#070e13` translúcido) y reglas de glassmorphism con curvas spring iOS. | Identidad visual exclusiva de Lunar Orca. Upstream usa paleta base estándar. |
| `src/shared/terminal-themes/defaults.ts` | Definición completa del tema de terminal `Osaka Jade Neon` en la lista por defecto. | Tema de consola corporativo integrado con la UI. |
| `src/main/telemetry/client.ts` | `const TELEMETRY_ENABLED = false` forzado en código fuente. | Política de privacidad y telemetría cero hacia servidores de terceros. |
| `config/electron-builder.config.cjs` | `productName: 'Lunar Orca'`, `appId`, ejecutable y metadatos de empaquetado. | Nomenclatura del binario compilado y app desktop. |
| `package.json` | `"name": "orca"` intacto (requerido por dependencias internas y build scripts de Electron). | Evita romper imports de workspace y resolución de módulos nativos. |
| `src/shared/open-in-applications.ts` | Integración de `Zed` (`zed`, `dev.zed.Zed`) en el listado de editores externos. | Soporte del editor principal en Arch Linux. |

---

## 5. Protocolo de Verificación de Pairing con APK Oficial (Smoke Test)

Tras cada actualización, verificar que los contratos de conexión con la aplicación móvil oficial de Orca permanezcan intactos.

### Pasos de Verificación:
1. **Lanzar Lunar Orca en modo desarrollo**:
   ```bash
   pnpm run dev
   ```
2. **Abrir diálogo de Mobile Pairing**:
   - Navegar al menú o atajo de emparejamiento móvil (icono de celular / Settings > Mobile Pairing).
   - Constatar que se genere el **Código QR** y la carga útil del invite token sin errores en consola.
3. **Inspección de Carga Útil**:
   - El payload emitido debe cumplir con `MobileRelayEndpointSchema`:
     - `v: 1`
     - `directorUrl`: URI HTTPS válida.
     - `cellUrl`: URI HTTPS válida.
     - `assignmentEpoch`: entero no negativo.
     - `relayHostId`: string regex `^[A-Za-z0-9_-]{16}$`.
     - `e2eeFraming: 2`
4. **Verificación de Enlace con Celular**:
   - Escanear el código QR desde el APK oficial en el dispositivo Android.
   - Confirmar que la sesión WebSocket se establece y que los terminales del escritorio se sincronizan con la pantalla del celular.

---

## 6. Cadencia Recomendada

- **Revisión quincenal**: Inspección programada de los nuevos releases estables en `https://github.com/stablyai/orca/releases`.
- **Bajo demanda**: En caso de reportes de bugs críticos en upstream (seguridad, compatibilidad con Node/Electron o fallos de PTY) que afecten el flujo de trabajo diario, realizar cherry-pick del fix o sincronizar con el tag más reciente que lo contenga.
