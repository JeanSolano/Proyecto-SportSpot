# Prompt — Construir SportSpot desde cero

> Brief completo para arrancar el proyecto de cero con todo el contexto y las decisiones ya tomadas. Copia y pega en un chat nuevo.

---

Quiero construir desde cero **SportSpot**, una **red social deportiva para Panamá** que actúa como intermediario entre **deportistas** y **dueños de establecimientos** deportivos (canchas de fútbol, basketball, baseball, pádel, tenis, voleibol, etc.). Los deportistas descubren, reservan y pagan canchas y socializan; los dueños publican y administran sus establecimientos.

Trabaja y responde en **español**. Commits **simples y en español** (`feat: ...`, `fix: ...`). Empieza por **frontend con datos mock** y deja la arquitectura lista para enchufar el backend después (capa de datos aislada que luego pase de `localStorage` a `fetch('/api/...')`).

## 1. Usuarios y roles
- **Deportista** (app móvil): descubre canchas, reserva, paga, interactúa (likes, comentarios, reseñas).
- **Dueño de establecimiento** (web + acciones en móvil): publica y administra establecimientos, canchas y horarios; gestiona reservas; paga su suscripción.
- **Super-admin / SportSpot** (web): aprueba establecimientos, ve métricas globales, gestiona pagos. Roles vía **JWT + Roles**.

## 2. Stack tecnológico (objetivo)
| Capa | Tecnología |
|---|---|
| Frontend móvil | **React Native (Expo SDK 56)** — Android e iOS con un solo código |
| Frontend web (panel admin) | **Next.js** (React). *Alternativa válida: React + Vite si se prefiere SPA simple.* |
| Backend | **NestJS (Node.js)** con **API REST** |
| Base de datos | **PostgreSQL** |
| Caché / tiempo real | **Redis** (disponibilidad de canchas en tiempo real) |
| Autenticación | **JWT + Roles** |
| Pagos | **PayPal** (usar **PayPal Sandbox** para desarrollo/simulación) |
| Notificaciones | **Firebase Cloud Messaging** (push) |
| Mapas | **Mapbox** (geolocalización de canchas) |
| Contenedores | **Docker** (backend + PostgreSQL + Redis) |

> Importante: para la app móvil, lee los docs versionados de **Expo v56** antes de escribir código (la API de Expo cambia entre versiones).

## 3. Arquitectura (capas, top-down)
`Usuarios → Clientes (App móvil / Web admin) → API REST (gate JWT+Roles) → Backend NestJS → [PostgreSQL, Redis] + Servicios de terceros (PayPal, Firebase FCM, Mapbox)`.
Backend, PostgreSQL y Redis corren en **Docker**.

## 4. Modelo de negocio (cobro híbrido)
- **Suscripción por planes según cantidad de establecimientos**:
  - **Básico** — 1 establecimiento, comisión 8%/reserva.
  - **Pro** — hasta 3 establecimientos, comisión 6%/reserva (más popular).
  - **Premium** — hasta 10 establecimientos, comisión 4%/reserva.
- **+ Comisión por reserva**: un % de cada reserva pagada en la app (requiere pago de reservas integrado).
- Pasarela **PayPal** (Sandbox en dev). El plan define el **límite** de establecimientos publicables (**paywall**: sin plan activo no se puede publicar).

## 5. Flujo del dueño (web)
1. **Landing pública** (marketing): descubrimiento, cómo funciona, quiénes somos, planes, **atención al cliente/contacto**, y una sección promocional "**Conviértete en administrador**".
2. El **portal de administrador** (login/registro/checkout/panel) se abre **en una pestaña aparte** del sitio público.
3. Registro/login del dueño → **elegir plan** → **pago con PayPal (Sandbox)** → **registrar establecimiento** → **publicar**.
4. **Registrar establecimiento** captura: nombre del establecimiento, dueño asociado, descripción, **servicios** (techo, baños, gym, vestidores, estacionamiento, iluminación, etc.), y **canchas dinámicas**, cada una con **tipo**, **días disponibles** y **franjas horarias individuales**.
5. **Panel/Dashboard**: estado de suscripción, KPIs (establecimientos, canchas, comisión), lista de establecimientos, sección de **Suscripción/Facturación**.

## 6. División de responsabilidades web ↔ móvil
- **Web = fuente de la verdad**: alta y edición de establecimientos, canchas, horarios, facturación, métricas, y **crear** publicaciones/promos.
- **App móvil del dueño = operación sobre la marcha**: **solo editar** publicaciones del feed, bloquear/desbloquear horarios, confirmar/cancelar reservas, ver reservas del día, mensajes. **No** crea establecimientos ni hace edición masiva.

## 7. App móvil (deportista) — funcionalidades
- Registro/login (incluye Google como social).
- **Home/Discover**: feed de canchas con foto, deporte, rating, precio/hora, disponibilidad, likes y comentarios; filtros por deporte.
- **Mapa** con marcadores por coordenadas (Mapbox) y detalle en bottom sheet.
- **Detalle de cancha**: amenidades, reseñas, disponibilidad, precio.
- **Reserva**: elegir fecha, hora (slots), duración → confirmación → **pago en la app** (PayPal) → la comisión se calcula aquí.
- **Perfil**: datos, "Mis Reservas" (cancelar), historial.

## 8. Modelo de datos (entidades principales)
- **User** (deportista): id, nombre, email, password/hash, deporte favorito.
- **Owner** (dueño): id, nombre, email, teléfono. (Puede unificarse con User + rol.)
- **Subscription**: ownerId, planId, status, fechas, proveedor (paypal).
- **Establishment**: id, ownerId, nombre, descripción, amenities[], coordenadas (Mapbox), published.
- **Court**: id, establishmentId, nombre, tipo, días[], slots[] (horarios individuales).
- **Reservation**: id, courtId, userId, fecha, hora, duración, precio, comisión, status.
- **Publication** (feed/promos): id, establishmentId, contenido, imagen, fecha.
- **Review / Like / Comment**: relaciones sociales.

## 9. Diseño / identidad visual
- **Marca (del logo)**: verde `#56B330`, azul `#1E7FE0`, naranja `#F4511E`, navy `#1B2880`. Logo oficial reutilizado en headers (`assets/images/logo-official.png`).
- **Tipografía**: Poppins (títulos) + Open Sans (cuerpo) en web; en móvil mantener consistencia.
- **Íconos**: SVG (Lucide en web / @expo/vector-icons en móvil) — **no emojis como íconos de UI** (los emojis de deportes sí se permiten como categoría/badge para coincidir entre web y móvil).
- **Estilo**: profesional y **visualmente rico**, no plano — hero con **gradiente "Aurora" animado**, **glassmorphism**, **fotos reales** de canchas, **scroll-reveal**, sombras en capas. **Paridad total web ↔ móvil**: mismos colores, logo, gradientes y fotos.
- **Accesibilidad**: contraste AA (4.5:1), foco visible, `prefers-reduced-motion`, labels en inputs, `aria-label` en botones de ícono, touch targets ≥44px.

## 10. Preferencias de trabajo
- Diagramas de arquitectura: **árbol jerárquico top-down**, cajas blancas, flechas negras, sin bandas decorativas que confundan el flujo.
- Capa de datos del frontend **aislada** (un módulo `store`/`api`) para migrar de mock a backend sin tocar pantallas.
- Documentar el progreso (`PROGRESS.md`) y los diagramas en `docs/`.

## 11. Fases sugeridas de construcción
1. **Frontend mock**: app móvil (deportista) + panel web (dueño) con datos en memoria/localStorage, diseño completo y flujos navegables (incluye paywall y checkout PayPal simulado).
2. **Backend NestJS + PostgreSQL + Redis** dockerizado; API REST con JWT+Roles; reemplazar la capa mock por `fetch`.
3. **Integraciones reales**: PayPal (suscripción y pago de reservas + comisión), Firebase FCM (push), Mapbox (mapa real).
4. **Roles y panel super-admin**, métricas, y pulido final.

Empieza confirmando el plan y, salvo que indique lo contrario, arranca por la **Fase 1 (frontend mock)** manteniendo la capa de datos lista para el backend.
