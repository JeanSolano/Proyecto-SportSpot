# Prompt de continuidad — SportSpot

> Copia y pega esto al iniciar un nuevo chat para retomar el proyecto donde lo dejamos.

---

Estoy trabajando en **SportSpot**, una red social deportiva para **Panamá** que conecta deportistas con dueños de canchas/establecimientos para descubrir, reservar y pagar canchas. El repo está en `C:\Users\50769\Downloads\SportSpot-App` (git, rama `main`). **Todo es solo frontend / mock por ahora** (sin backend ni base de datos todavía).

Habla y escribe en **español**. Mensajes de commit **simples y en español** (estilo `feat: ...`). Para diagramas de arquitectura uso estilo **árbol jerárquico top-down** (cajas blancas, flechas negras, sin bandas de colores). Antes de tocar la app móvil, recuerda que usa **Expo SDK 56** (lee los docs versionados de Expo v56 si hace falta).

## Dos partes del proyecto

### 1) App móvil (ya existente) — `/src`
- **Expo ~56 + React Native 0.85 + React 19 + Expo Router + TypeScript** (Reanimated, expo-image, expo-linear-gradient).
- El root `src/app/_layout.tsx` NO usa file-based routing normal: hace un switch manual entre auth y tabs.
- Pantallas: `login`, `register` (solo Google como social), `index` (feed/discover con fotos Unsplash), `map` (mapa mock sin Google Maps), `profile` (+ "Mis Reservas" y un dashboard demo de establecimiento). Componentes: booking-modal, venue-detail-modal, establishment-dashboard, app-tabs.
- Identidad de marca en `src/constants/theme.ts`: verde `#56B330`, azul `#1E7FE0`, naranja `#F4511E`, navy `#1B2880`, logo en `assets/images/logo-official.png`.
- Estado en memoria (Context): `auth.tsx`, `bookings.tsx`. Sin persistencia.

### 2) Panel web de administrador (lo que más hemos trabajado) — `/web-admin`
- **React 18 + Vite (JavaScript, no TS) + react-router-dom + lucide-react**. Fuentes **Poppins + Open Sans**.
- Persistencia **mock en localStorage** detrás de `src/data/store.js` (funciones que devuelven Promesas, listas para cambiar por `fetch('/api/...')` cuando exista el backend).
- Reutiliza los **mismos colores de marca y fotos Unsplash** que la app móvil (parity). Diseño visual rico: hero "Aurora" (gradiente mesh animado), glassmorphism, galería de fotos, scroll-reveal (`useScrollReveal`), íconos SVG Lucide.
- Estructura:
  - `pages/`: `Landing`, `Plans`, `Checkout`, `Subscription`, `Dashboard`, `EstablishmentForm`, `EstablishmentDetail`, `Login`, `Register`.
  - `components/`: `PublicNav`, `PublicFooter`, `Layout` (sidebar del panel), `CourtScheduleEditor`.
  - `data/`: `constants.js` (deportes, amenidades, días, horarios), `plans.js` (planes), `store.js` (auth + suscripción + establecimientos), `media.js` (fotos).
  - `context/AuthContext.jsx`, `hooks/useScrollReveal.js`.
- Correr: `cd web-admin && npm install && npm run dev` → http://localhost:5173

## Modelo de negocio (decidido)
- **Cobro híbrido**: suscripción por **planes según cantidad de establecimientos** (Básico = 1, Pro = hasta 3, Premium = hasta 10) **+ comisión por reserva** (8% / 6% / 4%).
- **Pasarela: PayPal** (usaremos **PayPal Sandbox** para simular). En el web el checkout es mock.
- **Flujo del dueño**: landing pública → elegir plan → pago (PayPal sandbox mock) → registrar establecimiento (con canchas, tipos, días y **horarios individuales por cancha**) → publicar. Hay **paywall**: sin plan activo no se puede crear establecimiento; el plan define el límite.
- **División web ↔ móvil**: la **web es la fuente de la verdad** (alta/edición de establecimientos, canchas, horarios, facturación). La **app móvil del dueño = solo operar/editar** (publicaciones del feed, bloquear horarios, confirmar/cancelar reservas); NO crea establecimientos.
- **Separación de espacios**: el **sitio público** (landing + planes) y el **portal de administrador** (login/registro/checkout/panel) están separados — el portal **se abre en una pestaña aparte** (`window.open`). La landing tiene una sección promocional "Conviértete en administrador". Login/Register soportan `?next=` para continuar al checkout tras registrarse.

## Stack objetivo para el backend (planeado, aún no implementado)
React Native (móvil) · **Next.js** (web admin — ojo: hoy está en Vite) · **NestJS (Node.js)** · **PostgreSQL** · **Redis** (caché/tiempo real) · **JWT + Roles** · **PayPal** · **Firebase Cloud Messaging** · **Mapbox** · **Docker**. (Hay una pequeña discrepancia: el web-admin actual es Vite y antes habíamos hablado de Express; el diagrama de stack dice Next.js + NestJS. Decidir cuál mantener.)

## Documentación / diagramas en `/docs`
- `diagrama-arquitectura.svg` — arquitectura por capas (frontend / backend / datos + servicios de terceros).
- `flujo-administrador.svg` — flujo del recorrido del dueño (landing → plan → PayPal → publicar → operación web/móvil).
- `PROGRESS.md` (raíz) — progreso de la app móvil.

## Estado de git
Varios commits en español. **OJO:** los últimos cambios (separación sitio público / portal admin en pestaña aparte + sección promocional "Conviértete en administrador" + apertura en pestaña nueva) **podrían estar sin commitear** — verifica con `git status` y commitea si hace falta.

## Posibles próximos pasos (pendientes)
- Backend real (NestJS o Express) + PostgreSQL + Redis, y cambiar `store.js` por llamadas al API.
- Integrar PayPal Sandbox de verdad (hoy es mock).
- Persistencia de sesión/datos, sistema de **roles** real (dueño vs super-admin).
- Integrar **pago de reservas en la app móvil** (requisito para cobrar la comisión).
- Conectar el botón "Panel de Establecimiento" de la app móvil al portal web.
- Dar el mismo tratamiento visual profesional al dashboard interno del panel.

**Por favor, antes de empezar, lee `web-admin/README.md`, `PROGRESS.md` y los archivos de `docs/` para tener el contexto completo, y revisa `git log` y `git status`.**
