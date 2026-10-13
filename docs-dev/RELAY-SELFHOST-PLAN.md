# Plan de Auto-Hosting del Relay de Lunar Orca

Este documento describe la arquitectura, requisitos, protocolos de comunicación e instrucciones paso a paso para desplegar un servidor **Relay propio** en **SahaCloud VPS** (`100.106.162.119` o subdominio Cloudflare), manteniendo **100% de compatibilidad con el APK oficial de Orca** en Android sin requerir reingeniería ni recompilación de la aplicación móvil.

---

## 1. Arquitectura y Requisitos del Relay

El relay actúa como punto de encuentro y transporte seguro ("splice") entre la aplicación de escritorio Lunar Orca y el cliente móvil Android. Teléfono y escritorio nunca se conectan directamente entre sí por IP: ambos abren conexiones WebSocket salientes hacia el relay, el cual empareja ambas sesiones y retransmite los frames encriptados de extremo a extremo (E2EE).

### Componentes Principales (`cloud/`):
- **`apps/relay`**: Servidor Node.js escrito en TypeScript (`@orca-cloud/relay`). Puede operar como `combined` (director y celda en el mismo proceso), `director` (gestor de asignación y enrutamiento regional) o `cell` (nodo de transporte que sostiene las conexiones WebSocket directas).
- **`packages/relay-contract`**: Contrato tipado que define esquemas de tramas, códigos de cierre WebSocket, presupuestos de admisión y la máquina de estados de splicing.
- **Base de Datos**:
  - En despliegues locales / livianos: SQLite en memoria o persistente en disco.
  - En producción estándar: PostgreSQL (versiones 16 o 17).
- **Puertos y Red**:
  - Puerto HTTP/WebSocket interno: `8080` (configurable mediante variable `PORT`).
  - Exposición externa: HTTPS/WSS (puerto `443`) a través de un túnel Cloudflare (`cloudflared`) o reverse proxy inverso (Caddy/Nginx) con certificado TLS válido.

### Variables de Entorno Clave (`apps/relay/src/config.ts`):
- `PORT`: Puerto de escucha del proceso (ej. `8080`).
- `ORCA_RELAY_ROLE`: Rol del servicio. Para auto-hosting en un solo nodo VPS se utiliza `combined`.
- `ORCA_RELAY_PUBLIC_URL`: URL pública del Director accesible desde Internet (ej. `https://relay.sahacloud.dpdns.org`).
- `ORCA_RELAY_CELL_URL`: URL pública de la celda de transporte (en modo `combined`, idéntica a `ORCA_RELAY_PUBLIC_URL`).
- `ORCA_RELAY_ASSIGNMENT_SIGNING_KEY`: Clave simétrica de al menos 32 caracteres generada aleatoriamente para firmar tokens de asignación de celdas.
- `ORCA_RELAY_AUTH_ISSUER` y `ORCA_RELAY_AUTH_AUDIENCE`: Identificadores de emisión de tokens (por defecto `orca-relay`).
- `DATABASE_URL` / `POSTGRES_URL`: Cadena de conexión opcional para persistencia en PostgreSQL (si no se define, opera en SQLite).

---

## 2. Diagrama de Emparejamiento y Comunicación

El protocolo utiliza cifrado de extremo a extremo (E2EE) con curvas elípticas Curve25519 (ECDH) y autenticación basada en clave pública. El Relay es completamente ciego al contenido de las sesiones de terminal.

```text
┌─────────────────────────┐             ┌─────────────────────────┐
│       Lunar Orca        │             │    APK Móvil Oficial    │
│  (Escritorio Arch Linux)│             │     (Android Phone)     │
└────────────┬────────────┘             └────────────┬────────────┘
             │                                       │
             │ 1. POST /v1/assign                    │
             │    (Solicita asignación de Celda)     │
             ▼                                       │
┌───────────────────────────────────────┐            │
│       Relay Server (SahaCloud)        │            │
│      Rol: Combined (Director + Cell)  │            │
└────────────┬──────────────────────────┘            │
             │                                       │
             │ 2. Devuelve: cellUrl, inviteToken,    │
             │    relayHostId, assignmentEpoch       │
             ▼                                       │
┌─────────────────────────┐                          │
│   Genera Código QR      │                          │
│   (Contiene Invite Token│                          │
│    + Clave Pública Host)│                          │
└────────────┬────────────┘                          │
             │                                       │
             │ 3. Escaneo de QR físico con cámara   │
             │──────────────────────────────────────►│
             │                                       │
             │ 4. WSS /v1/connect (Host)             │ 5. WSS /v1/connect (Mobile)
             │    Conexión WebSocket saliente        │    Conexión WebSocket saliente
             ▼                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Relay Server (Cell Splice)                   │
│   Valida Invite Token ➔ Empareja Sockets ➔ Splicing de Tramas    │
└─────────────────────────────────────────────────────────────────┘
             ▲                                       ▲
             └────────────── Intercambio E2EE ───────┘
                     (Túnel cifrado con secretos
                      intercambiados vía QR/ECDH)
```

### Seguridad e Intercambio de Secretos:
- El código QR transfiere: la clave pública efímera del host (`publicKeyB64`, 32 bytes en formato base64url), el ID de la oferta de emparejamiento y el `inviteToken`.
- El Relay nunca conoce la clave privada de ninguna de las partes; únicamente verifica que el `inviteToken` coincida antes de empalmar ("splice") ambos streams WebSocket.

---

## 3. Límites Infranqueables de Compatibilidad con el APK Oficial ("Prohibidos Conocidos")

Para que el APK binario oficial descargado desde la tienda o release de Orca funcione sin modificaciones contra nuestro servidor propio, **ninguno de los siguientes elementos del protocolo puede ser alterado**:

1. **Endpoints HTTP / WebSocket Invariables**:
   - `/v1/assign`: Endpoint POST utilizado por el escritorio para obtener celdas.
   - `/v1/resolve`: Endpoint GET/POST utilizado por la app móvil para reanudar sesiones guardadas.
   - `/v1/connect/:inviteToken`: Endpoint WSS para conexión de celdas y emparejamiento.
   - `/healthz` y `/readyz`: Endpoints de comprobación de salud del orquestador.
2. **Esquema de Payload JSON de Emparejamiento (`MobileRelayEndpointSchema`)**:
   - Debe mantener la versión `v: 1`.
   - `e2eeFraming: 2` (obligatorio: framing de versión 2 para multiplexación de canales).
   - `relayHostId`: exactamente 16 caracteres alfanuméricos base64url (`^[A-Za-z0-9_-]{16}$`).
   - `assignmentEpoch`: entero no negativo.
3. **Requisito Estricto de HTTPS / WSS**:
   - El cliente móvil rechaza conexiones en texto plano (`http://` o `ws://`). El dominio del Relay **debe** contar con terminación TLS válida.
4. **Nombres de Eventos y Encabezados RPC**:
   - Prohibido cambiar nombres de mensajes RPC internos (`pairing:provisionRelay`, `pairing:getEndpoints`, etc.).
   - La cabecera `User-Agent` y los headers de WebSocket deben respetar los tipos estándar de Node/Chromium.

---

## 4. Guía de Despliegue Futuro en SahaCloud (VPS del Usuario)

Cuando se decida realizar el despliegue del relay propio en SahaCloud (`100.106.162.119`), seguir este procedimiento paso a paso.

### Paso 1: Configurar Variables en el VPS
Crear directorio de trabajo en el VPS:
```bash
ssh sahacloud "mkdir -p ~/servicios/lunar-orca-relay"
```

Generar una clave secreta segura de 32+ bytes para `ORCA_RELAY_ASSIGNMENT_SIGNING_KEY`:
```bash
openssl rand -hex 32
```

### Paso 2: Crear `docker-compose.yml` en SahaCloud
Archivo de orquestación para levantar el Relay en modo `combined` con SQLite o PostgreSQL:

```yaml
version: '3.8'

services:
  lunar-orca-relay:
    image: node:20-alpine
    container_name: lunar-orca-relay
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=8080
      - ORCA_RELAY_ROLE=combined
      - ORCA_RELAY_CELL_ID=sahacloud-c1
      - ORCA_RELAY_PUBLIC_URL=https://relay.sahacloud.dpdns.org
      - ORCA_RELAY_CELL_URL=https://relay.sahacloud.dpdns.org
      - ORCA_RELAY_ASSIGNMENT_SIGNING_KEY=COLOCAR_AQUI_LA_CLAVE_DE_32_BYTES_HEX
      - ORCA_RELAY_AUTH_ISSUER=https://relay.sahacloud.dpdns.org
      - ORCA_RELAY_AUTH_AUDIENCE=orca-relay
      - ORCA_RELAY_ADMIN_AUDIENCE=https://relay.sahacloud.dpdns.org/v1/admin
      - ORCA_RELAY_DEPLOY_SERVICE_ACCOUNT=admin@sahacloud.dpdns.org
    ports:
      - "127.0.0.1:8080:8080"
```

### Paso 3: Configurar Exposición Pública (Cloudflare Tunnel o Caddy)
Exponer el puerto local `8080` bajo el dominio `relay.sahacloud.dpdns.org` con soporte completo de WebSockets (HTTP Upgrade headers activados).

### Paso 4: Apuntar Lunar Orca al Relay Propio
En la máquina de escritorio del usuario (`/home/krailynd`), configurar la variable de entorno antes de lanzar Lunar Orca o dentro de su archivo `.env` de perfil:

```bash
export ORCA_RELAY_URL="https://relay.sahacloud.dpdns.org"
```

Al iniciar Lunar Orca con `ORCA_RELAY_URL` configurado:
1. `src/main/orca-profiles/profile-cloud-auth-config.ts` sustituye automáticamente `PRODUCTION_RELAY_DIRECTOR_URL` (`https://relay.onorca.dev`) por el Relay de SahaCloud.
2. El código QR emitirá la URL del Director propio.
3. El APK oficial leerá dicha URL dentro de la oferta de emparejamiento y se conectará directamente a SahaCloud sin necesidad de parchear la app móvil.
