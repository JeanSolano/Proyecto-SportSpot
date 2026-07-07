# SportSpot — Guía de instalación (para correr el proyecto tras el `git clone`)

Esta guía explica cómo levantar **las 3 piezas** del proyecto en tu equipo:

1. **API REST** (Node + Express + PostgreSQL) — carpeta `sportspot-api/`
2. **Panel web del dueño** (React + Vite) — carpeta `web-admin/`
3. **App móvil del deportista** (React Native + Expo) — carpeta `src/` (raíz del repo)

> El sistema está pensado como **demo universitaria**. Se ejecuta todo en local.

---

## 1. Requisitos previos

Instala esto **antes** de empezar:

| Herramienta | Versión | Notas |
|---|---|---|
| **Node.js** | 20 o superior | https://nodejs.org (incluye `npm`) |
| **PostgreSQL** | 16, 17 o 18 | https://www.postgresql.org/download/ — anota la **contraseña** del usuario `postgres` |
| **Git** | cualquiera reciente | https://git-scm.com |
| **Expo Go** (celular) | app del store | Solo para la app móvil. Android: Play Store · iOS: App Store |

- Para la **app móvil** necesitas un **celular físico con Expo Go** (o un emulador Android / simulador iOS).
- El **celular y la PC deben estar en la misma red WiFi**.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/JeanSolano/Proyecto-SportSpot.git
cd Proyecto-SportSpot
git checkout feature/backend-api
```

> ⚠️ Trabaja siempre en la rama **`feature/backend-api`** (tiene el backend + web + móvil conectados). `main` es solo la versión mock inicial.

Estructura que verás:

```
SportSpot-App/
├── src/            ← App móvil (Expo)
├── web-admin/      ← Panel web del dueño (Vite)
├── sportspot-api/  ← Backend (Express + PostgreSQL)
└── docs/           ← Documentación y diagramas
```

---

## 3. Base de datos (PostgreSQL)

### 3.1 Crear la base de datos vacía

Abre una terminal. Si `psql`/`createdb` **no están en el PATH** (común en Windows), usa la ruta completa:

**Windows (PowerShell):**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres sportspot
```

**macOS / Linux:**
```bash
createdb -U postgres sportspot
```

Te pedirá la contraseña de `postgres`. Si el comando no existe, créala desde **pgAdmin** (clic derecho en *Databases → Create → Database → `sportspot`*).

---

## 4. API REST (`sportspot-api/`)

### 4.1 Configurar variables de entorno

```bash
cd sportspot-api
```

Copia el archivo de ejemplo y edítalo con **tu** contraseña de PostgreSQL:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```
**macOS / Linux:**
```bash
cp .env.example .env
```

Abre `.env` y ajusta al menos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sportspot
DB_USER=postgres
DB_PASSWORD=TU_CONTRASENA_DE_POSTGRES   # <-- pon la tuya
PORT=4000
JWT_SECRET=cualquier_texto_largo_y_secreto
```

> Google y PayPal son **opcionales** para correr la demo básica (déjalos vacíos). Ver §7.

### 4.2 Instalar dependencias y crear las tablas + datos de prueba

```bash
npm install
npm run migrate
```

`npm run migrate` crea **todas las tablas** e inserta **datos semilla** (usuarios, planes, un establecimiento de ejemplo, etc.).

> Ya incluye logo/fotos y publicaciones. **No** necesitas correr `migrate:imagenes` ni `migrate:publicaciones` en una instalación nueva — esos son solo para actualizar una BD vieja sin borrarla.

### 4.3 Levantar el API

```bash
npm run dev
```

Debe decir: `SportSpot API escuchando en http://localhost:4000` y `Conectado exitosamente a PostgreSQL`.

**Déjalo corriendo en esta terminal.** Verifica en el navegador: http://localhost:4000/api/health → `{"ok":true}`.

### 4.4 Usuarios de prueba (contraseña: `demo1234`)

| Correo | Rol | Para qué |
|---|---|---|
| `dueno@sportspot.com` | **Dueño** | Panel web + publicar desde el móvil (ya tiene plan Pro + 1 establecimiento) |
| `ana@sportspot.com` | **Cliente** | Deportista en la app móvil (reservar) |

---

## 5. Panel web del dueño (`web-admin/`)

En **otra terminal** (deja el API corriendo):

```bash
cd web-admin
npm ci
npm run dev
```

> ⚠️ **No uses** `npm audit fix --force` aquí (rompe Vite). Usa `npm ci` o `npm install`.

Abre lo que indique Vite (normalmente **http://localhost:5173**).

- Inicia sesión con `dueno@sportspot.com` / `demo1234`.
- El panel apunta al API en `http://localhost:4000` por defecto (no requiere configuración extra).

---

## 6. App móvil del deportista (`src/`)

En **otra terminal**, desde la **raíz del repo** (no dentro de `src/`):

```bash
npm install
npx expo start
```

Escanea el **QR** con **Expo Go** en tu celular.

### 6.1 Conexión al API — importante
La app **detecta sola** la IP de tu PC (usa la del servidor de Expo), así que normalmente **no configuras nada**. Solo asegúrate de:

- **Celular y PC en la misma red WiFi.**
- El **API corriendo** (§4.3).
- El **Firewall** de la PC permite el puerto **4000** (ver §6.2).

Si por alguna razón no conecta, crea un archivo `.env` en la **raíz del repo** con la IP de tu PC:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000
```

Tu IP local la obtienes con `ipconfig` (Windows) o `ifconfig`/`ip a` (macOS/Linux) — la IPv4 de tu adaptador WiFi/Ethernet (ej. `192.168.1.32`). Luego reinicia con `npx expo start -c`.

### 6.2 Abrir el puerto 4000 en el Firewall (solo dispositivo físico)

**Windows** — PowerShell **como Administrador**, una sola vez:
```powershell
New-NetFirewallRule -DisplayName "SportSpot API 4000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4000 -Profile Any
```

**macOS:** normalmente el firewall pregunta al primer intento — permite el acceso a `node`.

### 6.3 Notas de uso en la app
- **Registrarse** crea una cuenta de **deportista (Cliente)**.
- Para **publicar promociones/eventos desde el móvil**, inicia sesión como **dueño** (`dueno@sportspot.com` / `demo1234`): aparecerá el botón **"＋ Publicar"** en la pantalla de Inicio.

---

## 7. Opcional: Google y PayPal Sandbox

No hacen falta para la demo básica. Si los quieres:

- **Google Sign-In:** pon `GOOGLE_CLIENT_ID` en `sportspot-api/.env` y el mismo Client ID (público) en `web-admin/src/data/config.js`. Agrega `http://localhost:5173` a los *Authorized JavaScript origins* en Google Cloud.
- **PayPal Sandbox (pago de suscripción):** crea una app en https://developer.paypal.com, y pon:
  - En `sportspot-api/.env`: `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`.
  - En `web-admin/` un archivo `.env` con `VITE_PAYPAL_CLIENT_ID=` (el **mismo** Client ID).

---

## 8. Resumen: qué debe estar corriendo

| Terminal | Carpeta | Comando | URL |
|---|---|---|---|
| 1 | `sportspot-api` | `npm run dev` | http://localhost:4000 |
| 2 | `web-admin` | `npm run dev` | http://localhost:5173 |
| 3 | raíz del repo | `npx expo start` | QR en Expo Go |

---

## 9. Problemas comunes

| Síntoma | Solución |
|---|---|
| `Error al conectar a PostgreSQL` | Revisa `DB_PASSWORD`/`DB_NAME` en `sportspot-api/.env` y que PostgreSQL esté corriendo. |
| `EADDRINUSE :::4000` | El puerto 4000 ya está ocupado. Ciérralo: `npx kill-port 4000` (o cierra la otra terminal del API). |
| La app móvil se queda **cargando** al registrarse | El celular no alcanza el API. Verifica misma WiFi + Firewall (§6.2) + API corriendo. |
| `psql`/`createdb` "no se reconoce" | No está en el PATH. Usa la ruta completa (§3.1) o pgAdmin. |
| Vite se rompe tras `audit fix` | No corras `npm audit fix --force` en `web-admin`. Reinstala con `npm ci`. |
| No veo el botón "Publicar" en el móvil | Solo aparece si inicias sesión como **dueño** (`dueno@sportspot.com`). |

---

¡Listo! Con las 3 terminales arriba puedes: registrarte/loguearte, ver establecimientos y el feed en la app, reservar canchas, y administrar todo desde el panel web.
