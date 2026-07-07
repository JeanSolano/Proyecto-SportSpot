# SportSpot 🏟️

Red social deportiva para **Panamá**: los deportistas descubren, reservan y pagan canchas desde la **app móvil**, y los dueños administran sus establecimientos desde el **panel web**. Sistema full-stack: **app móvil + panel web + API REST + PostgreSQL**, con pasarela de pago en **PayPal Sandbox**.

> Proyecto universitario (demo). Se ejecuta todo en local.

## Las 3 piezas del proyecto

| Pieza | Carpeta | Stack |
|---|---|---|
| **App móvil** (deportista) | `src/` | React Native + Expo |
| **Panel web** (dueño) | `web-admin/` | React + Vite |
| **API REST** | `sportspot-api/` | Node + Express + PostgreSQL |

---

# Guía de instalación (tras el `git clone`)

## 1. Requisitos previos

| Herramienta | Versión | Notas |
|---|---|---|
| **Node.js** | 20 o superior | https://nodejs.org (incluye `npm`) |
| **PostgreSQL** | 16, 17 o 18 | https://www.postgresql.org/download/ — anota la **contraseña** del usuario `postgres` |
| **Git** | reciente | https://git-scm.com |
| **Expo Go** (celular) | app del store | Solo para la app móvil. Android: Play Store · iOS: App Store |

- Para la **app móvil** necesitas un **celular físico con Expo Go** (o un emulador Android / simulador iOS).
- El **celular y la PC deben estar en la misma red WiFi**.

## 2. Clonar el repositorio

```bash
git clone https://github.com/JeanSolano/Proyecto-SportSpot.git
cd Proyecto-SportSpot
git checkout feature/backend-api
```

> ⚠️ Trabaja en la rama **`feature/backend-api`** (backend + web + móvil conectados). `main` es la versión mock inicial.

## 3. Base de datos (PostgreSQL)

Crea la base de datos vacía. Si `createdb` **no está en el PATH** (común en Windows), usa la ruta completa:

**Windows (PowerShell):**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres sportspot
```
**macOS / Linux:**
```bash
createdb -U postgres sportspot
```

Te pedirá la contraseña de `postgres`. Si el comando no existe, créala desde **pgAdmin** (*Databases → Create → Database → `sportspot`*).

## 4. API REST (`sportspot-api/`)

### 4.1 Variables de entorno
```bash
cd sportspot-api
cp .env.example .env      # Windows PowerShell:  Copy-Item .env.example .env
```
Edita `.env` con **tu** contraseña de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sportspot
DB_USER=postgres
DB_PASSWORD=TU_CONTRASENA_DE_POSTGRES   # <-- pon la tuya
PORT=4000
JWT_SECRET=cualquier_texto_largo_y_secreto
```
> Google y PayPal son **opcionales** para la demo básica (déjalos vacíos). Ver §7.

### 4.2 Instalar + crear tablas y datos de prueba
```bash
npm install
npm run migrate
```
`npm run migrate` crea **todas las tablas** e inserta **datos semilla**. Ya incluye logo/fotos y publicaciones; **no** necesitas correr `migrate:imagenes` ni `migrate:publicaciones` en una instalación nueva (esos son solo para actualizar una BD vieja sin borrarla).

### 4.3 Levantar el API
```bash
npm run dev
```
Debe decir `SportSpot API escuchando en http://localhost:4000`. **Déjalo corriendo.**
Verifica: http://localhost:4000/api/health → `{"ok":true}`.

### 4.4 Usuarios de prueba (contraseña: `demo1234`)
| Correo | Rol | Para qué |
|---|---|---|
| `dueno@sportspot.com` | **Dueño** | Panel web + publicar desde el móvil (ya tiene plan Pro + 1 establecimiento) |
| `ana@sportspot.com` | **Cliente** | Deportista en la app móvil (reservar) |

## 5. Panel web del dueño (`web-admin/`)

En **otra terminal** (deja el API corriendo):
```bash
cd web-admin
npm ci
npm run dev
```
> ⚠️ **No uses** `npm audit fix --force` aquí (rompe Vite).

Abre **http://localhost:5173** e inicia sesión con `dueno@sportspot.com` / `demo1234`. Apunta al API en `http://localhost:4000` por defecto.

## 6. App móvil del deportista (`src/`)

En **otra terminal**, desde la **raíz del repo** (no dentro de `src/`):
```bash
npm install
npx expo start
```
Escanea el **QR** con **Expo Go**.

### 6.1 Conexión al API
La app **detecta sola** la IP de tu PC (usa la del servidor de Expo), así que normalmente **no configuras nada**. Solo asegúrate de:
- **Celular y PC en la misma red WiFi.**
- El **API corriendo** (§4.3).
- El **Firewall** de la PC permite el puerto **4000** (ver §6.2).

Si no conecta, crea un `.env` en la **raíz del repo** con la IP de tu PC y reinicia con `npx expo start -c`:
```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000
```
Tu IP la obtienes con `ipconfig` (Windows) o `ifconfig`/`ip a` (macOS/Linux) — la IPv4 de tu WiFi (ej. `192.168.1.32`).

### 6.2 Abrir el puerto 4000 en el Firewall (solo dispositivo físico)
**Windows** — PowerShell **como Administrador**, una vez:
```powershell
New-NetFirewallRule -DisplayName "SportSpot API 4000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4000 -Profile Any
```
**macOS:** permite el acceso a `node` cuando el firewall pregunte.

### 6.3 Notas de uso
- **Registrarse** crea una cuenta de **deportista (Cliente)**.
- Para **publicar promociones/eventos desde el móvil**, inicia sesión como **dueño** (`dueno@sportspot.com`): aparece el botón **"＋ Publicar"** en la pantalla de Inicio.

## 7. Opcional: Google y PayPal Sandbox

No hacen falta para la demo básica.
- **Google Sign-In:** `GOOGLE_CLIENT_ID` en `sportspot-api/.env` y el mismo Client ID en `web-admin/src/data/config.js`; agrega `http://localhost:5173` a los *Authorized JavaScript origins* en Google Cloud.
- **PayPal Sandbox (pago de suscripción):** crea una app en https://developer.paypal.com y pon `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` en `sportspot-api/.env`, y `VITE_PAYPAL_CLIENT_ID=` (el mismo Client ID) en un `.env` dentro de `web-admin/`.

---

## Qué debe estar corriendo

| Terminal | Carpeta | Comando | URL |
|---|---|---|---|
| 1 | `sportspot-api` | `npm run dev` | http://localhost:4000 |
| 2 | `web-admin` | `npm run dev` | http://localhost:5173 |
| 3 | raíz del repo | `npx expo start` | QR en Expo Go |

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `Error al conectar a PostgreSQL` | Revisa `DB_PASSWORD`/`DB_NAME` en `sportspot-api/.env` y que PostgreSQL esté corriendo. |
| `EADDRINUSE :::4000` | Puerto ocupado: `npx kill-port 4000` (o cierra la otra terminal del API). |
| La app móvil se queda **cargando** al registrarse | El celular no alcanza el API: misma WiFi + Firewall (§6.2) + API corriendo. |
| `createdb` "no se reconoce" | No está en el PATH: usa la ruta completa (§3) o pgAdmin. |
| Vite se rompe tras `audit fix` | No corras `npm audit fix --force` en `web-admin`; reinstala con `npm ci`. |
| No veo el botón "Publicar" en el móvil | Solo aparece si inicias sesión como **dueño** (`dueno@sportspot.com`). |

## Documentación adicional

- `web-admin/README.md` — detalle del panel web
- `docs/` — diagramas de arquitectura y flujo, y prompts del proyecto
