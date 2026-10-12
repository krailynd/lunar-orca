# Lunar Orca — Rebrand Audit & Asset Inventory (`docs-dev/REBRAND-LOG.md`)

**Date:** 2026-04-20
**Branch:** `mis-mods`
**Objective:** Rebrand visible desktop product surfaces to **"Lunar Orca"** + **Osaka Jade Neon Glass** UI while preserving 100% of technical, protocol, daemon, pairing, storage, and mobile/cloud compatibility with upstream `stablyai/orca`.

---

## 1. Classification of `"Orca"` / `"orca"` / `"Stably"` Occurrences

### (a) Visible UI / Brand Name → Renamed to `"Lunar Orca"`

| File | Location / Key | Original Value | New Value | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `config/electron-builder.config.cjs` | `productName` (line 192) | `'Orca'` | `'Lunar Orca'` | Desktop display name for packaged app / shortcuts |
| `src/renderer/index.html` | `<title>` (line 5) | `Orca` | `Lunar Orca` | Main renderer document title |
| `src/renderer/popout.html` | `<title>` (line 5) | `Orca Agent Dashboard` | `Lunar Orca Agent Dashboard` | Pop-out agent dashboard HTML title |
| `src/renderer/web-index.html` | `<title>` (line 6) | `Orca Web` | `Lunar Orca Web` | Paired web client HTML title |
| `src/main/window/createMainWindow.ts` | `BrowserWindow({ title })` (line 107) | `opts?.title ?? 'Orca'` | `opts?.title ?? 'Lunar Orca'` | Default native window title |
| `src/main/window/dashboard-popout-window.ts` | `BrowserWindow({ title })` (line 160) | `'Orca Agent Dashboard'` | `'Lunar Orca Agent Dashboard'` | Native pop-out dashboard window title |
| `src/main/window/dashboard-popout-window.test.ts` | Unit test assertion (line 202) | `'Orca Agent Dashboard'` | `'Lunar Orca Agent Dashboard'` | Keeps window unit test suite green |
| `src/renderer/src/app-shell/TitlebarLeftControls.tsx` | `.titlebar-app-name` fallback & `aria-label` (lines 74–78) | `translate('auto.App.5096cbbc86', 'Orca')` | `translate('auto.App.5096cbbc86', 'Lunar Orca')` | Top-left titlebar brand label when `showTitlebarAppName` is enabled |
| `src/renderer/src/i18n/locales/{en,es,fr,ja,ko,zh}.json` | `auto.App.5096cbbc86` | `"Orca"` | `"Lunar Orca"` | Localized string catalog backing `TitlebarLeftControls.tsx` |
| `README.md` | Top heading, badge, and fork notice | `Orca` | `# Lunar Orca` + fork badge + Stably AI / Lovecast Inc. attribution | MIT license compliance & fork documentation |
| `NOTICE` | Root attribution file | *(new file)* | `Lunar Orca` / `Modified by Krailynd / Lunar Orca (2026)` | Explicit MIT attribution notice |

---

### (b) Technical / Protocol / Pairing / Storage Identity → PRESERVED AS-IS (DO NOT TOUCH)

Changing any of the following breaks CLI wrappers, deep links, Linux WM matching, local settings persistence, daemon sockets, or Android/iOS mobile companion pairing. **All remain 100% untouched:**

| Surface / Identifier | File(s) | Exact Preserved Value | Why Preserved |
| :--- | :--- | :--- | :--- |
| Package & CLI binary name | `package.json` | `"name": "orca"`, `"bin": { "orca": "./out/cli/index.js" }` | Internal workspace imports, CLI entrypoint, and scripts |
| Application ID | `config/electron-builder.config.cjs` | `appId: 'com.stablyai.orca'` | OS-level identity, keyring, and desktop integration |
| Custom URL scheme | `config/electron-builder.config.cjs`, `src/main/` | `protocols: [{ name: 'Orca', schemes: ['orca'] }]` | Deep-linking (`orca://`) and OAuth/pairing callbacks |
| Custom internal schemes | `src/main/window/main-window-webview-security.ts` | `orca-preview://`, `orca-media://`, `persist:orca-browser`, `orca-dashboard-popout` | Webview security policies, CSP, and session partitions |
| Linux desktop integration | `config/electron-builder.config.cjs` | `executableName: 'orca-ide'`, `StartupWMClass: 'orca'` | Hyprland/Wayland window rules, `.desktop` launcher, and `/opt` path expectations |
| User data & config paths | `src/main/persistence/`, `src/main/index.ts` | `~/.config/orca` (`orca-dev` in dev) | Preserves existing workspaces, SQLite state, worktrees, and settings |
| Daemon & Relay protocols | `src/orcad/`, `src/relay/`, `src/shared/` | `orcad`, `daemon-v43`, `ORCA_*` env vars | Local/remote daemon socket handshake and relay pairing with mobile app |
| Cloud & Mobile directories | `cloud/**`, `mobile/**` | **0 files modified** | Strict invariant: mobile APK (`0.0.52`) and cloud relay compatibility |

---

### (c) Ambiguous / Deferred Occurrences (Kept Conservative)

- **macOS Bundle Name & CLI path inspection (`src/main/cli/cli-command-inspection.ts`)**: Kept as-is because CLI installation inspection checks standard paths and bundle identifiers.
- **Bundled Launch Plugins (`resources/plugins/launch/stablyai.orca-*`)**: Plugin IDs (`stablyai.orca-arabic`, `stablyai.orca-navigation-shortcuts`, `stablyai.orca-portuguese`, etc.) are preserved to avoid breaking plugin manifest verification (`verify:skill-bundle-manifest`).
- **System Tray / Menu Bar Templates (`resources/tray/orca-menu-barTemplate*.png`)**: Monochrome template icons and filenames preserved for macOS/Linux tray compatibility.
- **Selectable App Icon Presets (`resources/app-icons/orca-blue.png`, `resources/app-icons/orca-watercolor.png`)**: Preserved as optional user-selectable presets in Settings while the default application icon (`resources/icon.png` and `resources/build/icon.png`) is updated to the Lunar Orca Osaka Jade emblem.

---

## 2. Complete Icon & Graphic Asset Inventory

| Asset Path | Format | Exact Dimensions / Type | Status in Phase 1 |
| :--- | :--- | :--- | :--- |
| `resources/build/icon.png` | PNG (RGBA, 8-bit) | `1024 x 1024` | **Updated** — Lunar Orca crescent + Osaka Jade (`#2DD5B7`) & lavender (`#c4b5fd`) neon ring on deep jade-black (`#090f0d` → `#111c18`) |
| `resources/icon.png` | PNG (RGBA, 8-bit) | `256 x 256` | **Updated** — Runtime window icon (`getAppIconPath`) in Lunar Orca palette |
| `resources/icon-dev.png` | PNG (RGBA, 8-bit) | `256 x 256` | **Updated** — Dev runtime window icon with lavender orb accent (`#c4b5fd`) |
| `resources/logo.svg` | SVG Vector | `viewBox="0 0 256 256"` (`256 x 256`) | **Updated** — Clean scalable vector with Lunar Orca crescent + jade/lavender glow |
| `resources/build/icon.icns` | Apple Icon Image (`ic12`) | `647,652 bytes` (multi-res macOS iconset) | **Preserved** (macOS packaging target; Linux uses `resources/build/icon.png`) |
| `resources/build/icon.ico` | MS Windows Icon | 6 embedded sizes (`256x256`, `128x128`, etc.) | **Preserved** (Windows packaging target) |
| `resources/app-icons/orca-blue.png` | PNG (RGBA, 8-bit) | `1024 x 1024` | **Preserved** (Optional alternate icon preset in Appearance settings) |
| `resources/app-icons/orca-watercolor.png` | PNG (RGBA, 8-bit) | `1024 x 1024` | **Preserved** (Optional alternate icon preset in Appearance settings) |
| `resources/tray/orca-menu-barTemplate.png` | PNG (RGBA, 8-bit) | `22 x 14` | **Preserved** (1x status bar / tray template icon) |
| `resources/tray/orca-menu-barTemplate@2x.png` | PNG (RGBA, 8-bit) | `44 x 28` | **Preserved** (2x status bar / tray template icon) |
