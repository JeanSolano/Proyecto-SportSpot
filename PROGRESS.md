# SportSpot App — Progreso de Desarrollo

## Visión General

**SportSpot** es una red social deportiva para Panamá que actúa como intermediario entre usuarios y canchas deportivas privadas. Permite descubrir, reservar y pagar canchas desde la app, además de interactuar con otros deportistas.

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Expo | ~56.0.11 | Framework principal |
| React Native | 0.85.3 | Base móvil |
| React | 19.2.3 | UI |
| Expo Router | ~56.2.10 | Navegación file-based |
| TypeScript | ~6.0.3 | Tipado estático |
| expo-linear-gradient | SDK 56 | Gradientes de marca |
| expo-image | ~56.0.11 | Carga de imágenes optimizada |
| expo-symbols | ~56.0.6 | Íconos nativos |
| react-native-reanimated | 4.3.1 | Animaciones |

---

## Design System (`src/constants/theme.ts`)

> Colores actualizados para coincidir con el logo oficial. Los tres colores del pin (verde → naranja-rojo → azul marino) definen toda la identidad visual.

### Colores de Marca

| Token | Light | Dark | Origen / Uso |
|---|---|---|---|
| `primary` | `#56B330` | `#6DD43E` | Verde del pin (arriba) — CTAs |
| `secondary` | `#1E7FE0` | `#4196F0` | Azul del pin (derecha) — íconos de acción |
| `accent` | `#F4511E` | `#FF6B3D` | Naranja-rojo del pin (base) — energía |
| `navy` | `#1B2880` | `#4A6AE0` | Azul marino del texto "Spot" — headers |
| `surface` | `#FFFFFF` | `#1A1A2E` | Fondo de cards |
| `border` | `#E2E6F0` | `#2A2A44` | Bordes de inputs |
| `inputBackground` | `#F4F6FB` | `#1E1E34` | Fondo de campos |
| `text` | `#1A1A2E` | `#FFFFFF` | Texto principal (tinte navy) |

### Gradientes (`Gradients`)

```ts
header:        ['#56B330', '#F4511E', '#1B2880']  // Espeja el pin del logo: verde→naranja→navy
buttonPrimary: ['#56B330', '#1E7FE0']              // Verde→azul
splash:        ['#56B330', '#F4511E', '#1B2880']   // Igual que header
```

### Border Radius (`BorderRadius`)

```ts
sm: 8     // Botones, inputs
md: 12    // Cards de venue
lg: 16    // Modals
xl: 24    // Bottom sheets, card login
full: 9999 // Pills, badges, avatares
```

### Sombras (`Shadows`)

```ts
card:  elevation 3  // Cards del feed
modal: elevation 8  // Bottom sheets
```

### Escala Tipográfica (`Typography`)

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `displayLg` | 32px | 700 | Nombre de la app |
| `displayMd` | 24px | 700 | Títulos de sección |
| `heading` | 20px | 700 | Nombre de venue |
| `subheading` | 17px | 600 | Subtítulos |
| `body` | 15px | 400 | Texto descriptivo |
| `bodyBold` | 15px | 600 | Precio, nombre |
| `caption` | 13px | 400 | Ubicación, fecha |
| `badge` | 11px | 700 | Etiquetas de deporte |

---

## Arquitectura de Pantallas

```
src/app/
├── _layout.tsx       ← Root layout con AuthProvider + BookingsProvider + condicional auth/tabs
├── index.tsx         ← Home / Discover feed
├── map.tsx           ← Mapa mock (sin Google Maps API)
├── profile.tsx       ← Perfil de usuario + Mis Reservas
├── login.tsx         ← Inicio de sesión
└── register.tsx      ← Registro de cuenta
```

---

## Flujo de Autenticación

```
App abre → Splash animation
                ↓
           [Login]
            • Campos: Email + Contraseña
            • Botón deshabilitado hasta tener datos válidos
            • Spinner 1.4s simulando auth → entra al app
            • "Regístrate gratis" → navega a Register
                ↓
           [Register]
            • Campos: Nombre, Email, Contraseña, Confirmar, Deporte favorito
            • Validación en tiempo real con hints ✓/○
            • Spinner 1.6s → entra al app
            • "Inicia sesión" → vuelve a Login
                ↓
           [Home Tabs]  ←→  [Profile → "Cerrar Sesión" → vuelve a Login]
```

**Implementación:** `AuthContext` (`src/context/auth.tsx`) con `isAuthenticated`, `login()` y `logout()`. Estado en memoria (sin persistencia, adecuado para prototipo).

---

## Pantallas Construidas

### 1. Login (`login.tsx`)

- Header con gradiente verde→naranja→navy (colores del logo) y logo oficial en círculo
- Card blanca con esquinas redondeadas superpuesta al gradiente
- Campos con ícono, borde activo al enfocar, label superior
- Validación: ambos campos requeridos (password mín. 4 chars)
- Botón "Iniciar Sesión" con gradiente, deshabilitado (opacity 0.55) si faltan datos
- `ActivityIndicator` durante la simulación de carga
- Links: "¿Olvidaste tu contraseña?", "Regístrate gratis"
- Botón social: **Google únicamente** (Facebook eliminado)
- Footer de Términos y Privacidad

### 2. Register (`register.tsx`)

- Mismo header de marca que login con logo oficial
- Botón "← Volver" en la parte superior del gradiente para regresar al login sin salir de la app
- 4 campos: Nombre, Email, Contraseña, Confirmar contraseña
- Selector de deporte favorito (chips: Fútbol, Basketball, Tenis, Voleibol, Natación, Otro)
- Hints de validación en tiempo real: "Mín. 6 caracteres" y "Contraseñas coinciden"
- Botón habilitado solo cuando todos los campos son válidos
- Validaciones con Alert nativo para guiar al usuario

### 3. Home / Discover (`index.tsx`)

- Header fijo con logo oficial (32px) + "SportSpot" en navy y pill "↗ Popular"
- Filtros horizontales por deporte (pills: Todos, Fútbol, Basketball, Tenis, Voleibol, Natación)
- Feed vertical de cards de venues:
  - **Imagen real** (Unsplash) con gradiente overlay para texto
  - Badge de deporte con color específico por categoría
  - Título y descripción sobre la imagen
  - Avatar con iniciales + nombre del establecimiento + rating ★ + ubicación 📍
  - Badge de disponibilidad y precio por hora
  - Contador de likes (interactivo, toggle ♡/♥) y comentarios
  - Botón "Reservar" → abre flujo de reserva (`BookingModal`)
  - Timestamp relativo ("Hace 2h")
- Estado vacío cuando no hay canchas en la categoría seleccionada
- Datos exportados (`export const VENUES`) para compartir con el mapa

**Imágenes por deporte:**
- Basketball: cancha profesional renovada (Unsplash)
- Fútbol: estadio/cancha de fútbol (Unsplash)
- Tenis: cancha de tenis (Unsplash)
- Voleibol: cancha de playa (Unsplash)

### 4. Mapa (`map.tsx`)

- **Mapa mock** (sin `react-native-maps`, sin Google Maps API Key) renderizado con Views puras de React Native
  - Fondo estilizado al estilo OSM: tierra `#EDE9E0`, Canal de Panamá, Océano Pacífico, Bahía, parques
  - Grid de calles y Cinta Costera como capas de Views
- Marcadores posicionados geográficamente: las coordenadas lat/lng de cada venue se convierten a posición porcentual sobre el mapa mock
  - 🏀 Basketball `#0066FF`
  - ⚽ Fútbol `#00CA4E`
  - 🎾 Tenis `#FF7F00`
  - 🏐 Voleibol `#9C27B0`
- Marcador seleccionado se expande mostrando nombre del venue
- Header flotante con logo oficial (30px) + "SportSpot" en navy + contador "4 canchas"
- **Bottom sheet modal** animado (spring animation):
  - Desliza desde abajo al tocar un marcador
  - Foto real del venue + badge de deporte
  - Nombre, rating, ubicación, disponibilidad, precio/hora
  - Like interactivo + botón "Reservar cancha" → abre `BookingModal`
  - Se cierra tocando fuera del sheet

> **Nota:** Google Maps reemplazado por mock frontend. Cuando se integre backend real, se puede restaurar `react-native-maps` añadiendo la API Key.

### 5. Perfil (`profile.tsx`)

- Header con logo oficial (34px) + "SportSpot" en navy
- Banner con gradiente verde→azul (full width)
- Avatar circular superpuesto al banner (emoji 🏃 + gradiente gris)
- Nombre: Carlos Méndez / @carlosdeportivo
- Badges: 🏅 Miembro Premium (dorado) + 🌐 Fútbol (azul)
- Bio de usuario
- Stats en cards: 📅 24 Reservas | ♥ 12 Favoritos | 🏆 3 Torneos
- **Sección "Mis Reservas"** (dinámica, desde `BookingsContext`):
  - Lista de reservas con emoji de deporte, nombre del venue, fecha, horario y precio
  - Chip de estado: `● Confirmada` (verde) / `✗ Cancelada` (gris)
  - Botón "Cancelar" en reservas confirmadas con `Alert` de confirmación
  - Estado vacío con mensaje guía si no hay reservas
- **Botón "Panel de Establecimiento"** (🏟️) → abre `EstablishmentDashboard` en modal de pantalla completa
- Sección "Cuenta":
  - Editar Perfil (con ícono + chevron)
  - Ubicación: "Ciudad de Panamá" (con subtítulo)
  - Notificaciones (Switch toggle)
- Botón "Cerrar Sesión" con borde rojo → vuelve a pantalla de login

### 7. Flujo de Reserva (`BookingModal` + `BookingsContext`)

**Disparadores:** botón "Reservar" en Home feed y "Reservar cancha" en el bottom sheet del mapa.

**Modal de reserva** (`src/components/booking-modal.tsx`) — 3 fases:

1. **Formulario de selección:**
   - Mini card del venue (imagen, deporte, rating, precio/hora)
   - Selector de fecha: scroll horizontal con los próximos 7 días
   - Grid de horarios (07:00–21:00, 15 slots en 3 columnas):
     - Slots bloqueados (mock por venue): deshabilitados con etiqueta "No disp."
     - Slot seleccionado: fondo verde primario
   - Selector de duración: chips 1h / 2h / 3h con precio calculado
   - Resumen de precio: cancha, fecha, horario, duración, total
   - Botón "Confirmar Reserva · $XX.00" sticky en la parte inferior (deshabilitado hasta seleccionar hora)

2. **Loading:** spinner 900ms simulando procesamiento

3. **Pantalla de éxito:**
   - Ícono ✓ con gradiente verde→azul
   - Número de reserva generado (`SP-XXXXXX`)
   - Card resumen con foto del venue, horario y total
   - Botón "Listo" cierra el modal

**Estado de reservas** (`src/context/bookings.tsx`):
- `bookings[]` en memoria (sin persistencia)
- `openBooking(venue)` — abre el modal
- `addBooking(data)` — agrega con `status: 'confirmed'`
- `cancelBooking(id)` — marca `status: 'cancelled'`

**Slots bloqueados mock por venue:**

| Venue | Horas no disponibles |
|---|---|
| Club Deportivo Albrook (Basketball) | 09:00, 10:00, 15:00, 16:00 |
| Complejo Miraflores (Fútbol) | 10:00, 11:00, 17:00, 18:00 |
| Club de Tenis Paitilla | 08:00, 09:00, 14:00, 15:00 |
| Club Costa Verde (Voleibol) | 11:00, 12:00, 19:00, 20:00 |

### 8. Detalle de Venue (`VenueDetailModal`)

Accessible tocando la imagen de cualquier card en el feed o el nombre del venue en el mapa.

- Modal de pantalla completa con animación `slide`
- Hero image 280px con botón de cierre flotante (círculo blanco, posición absoluta)
- Botón "like" en el hero (sincronizado con `likedIds` global del `BookingsContext`)
- Sección de amenidades por deporte (4 ítems cada uno: Basketball, Fútbol, Tenis, Voleibol)
- Sección de reseñas (2 reseñas mock por venue con avatar, rating ★, texto)
- Info row: disponibilidad + precio/hora
- Botón sticky "Reservar cancha" en la parte inferior → cierra el detalle y abre `BookingModal` después de 180ms (para evitar doble modal)

### 9. Panel de Establecimiento (`EstablishmentDashboard`)

Vista de demostración del dashboard para dueños de establecimientos. Sin roles ni cambios de autenticación. Se abre desde el botón 🏟️ en el perfil.

- Header con gradiente del logo + botón ✕ de cierre
- **Selector de venues** (scroll horizontal): 4 tabs con emoji de deporte y color por categoría
- **Stats del día** (3 cards): Reservas hoy, Ingresos ($), Ocupación (%)
  - Los valores se calculan dinámicamente: datos mock + reservas reales de la sesión
- **Lista de reservas de hoy**: mezcla de bookings mock (nombres ficticios) y reservas reales hechas en la sesión actual
- **Grid de disponibilidad** (7:00–21:00, 15 slots):
  - 🟢 Disponible — toca para bloquear
  - 🔒 Bloqueado por propietario — toca para desbloquear
  - 🔴 Reservado — no modificable
  - Estado inicial: bloques de almuerzo preconfigurados por venue
- Disclaimer al pie explicando que es una demo sin backend

### 10. Identidad Visual (`assets/images/logo-official.png`)

- Logo oficial agregado al proyecto en `assets/images/logo-official.png`
- Visible en: Login (header, 95px), Register (header, 95px), Home (header, 32px), Mapa (header, 30px), Perfil (header, 34px)
- Colores de `theme.ts` actualizados para coincidir exactamente con el logo oficial

### 6. Navigation Shell (`app-tabs.tsx`)

- 3 tabs con `NativeTabs` (expo-router/unstable-native-tabs):
  - **Inicio** → `index.tsx`
  - **Mapa** → `map.tsx`
  - **Perfil** → `profile.tsx`
- Label activo en color `primary` (verde)
- Soporte light/dark mode

---

## Requisitos Funcionales Cubiertos

| RF | Descripción | Estado |
|---|---|---|
| RF-01 | Registro de usuario | ✅ Pantalla completa con validación |
| RF-02 | Inicio de sesión | ✅ Con simulación de auth |
| RF-03 | Recuperación de contraseña | 🔗 Link presente (sin flujo aún) |
| RF-04 | Gestión de perfil | ✅ Vista de perfil + editar (link) |
| RF-05 | Búsqueda de canchas por mapa | ✅ Mapa mock con marcadores por coordenadas |
| RF-06 | Consulta de disponibilidad | ✅ Badge en cards, mapa y slots de reserva |
| RF-07 | Reserva de cancha | ✅ Flujo completo: fecha, hora, duración, confirmación |
| RF-08 | Cancelación de reserva | ✅ Desde "Mis Reservas" en perfil |
| RF-10 | Historial de reservas | ✅ Sección "Mis Reservas" en perfil (sesión actual) |
| RF-11 | Dashboard del establecimiento | ✅ Demo visual (sin roles/backend) |
| RF-12 | Gestión de disponibilidad | ✅ Grid togglable en el dashboard demo |
| RF-14 | Publicación de eventos/promociones | ✅ Cards en el feed |
| RF-15 | Red social (likes, comentarios) | ✅ Like interactivo en feed, detalle y mapa |

---

## Pendiente

- [ ] Pago en línea (RF-09): integración con pasarela de pago
- [ ] Pantalla de recuperación de contraseña (RF-03)
- [ ] Persistencia de sesión (AsyncStorage o SecureStore)
- [ ] Persistencia de reservas entre sesiones
- [ ] Sistema de roles real (usuario vs. propietario) cuando haya backend
- [ ] Integración con backend real (auth, reservas, disponibilidad)
- [ ] Restaurar `react-native-maps` con Google Maps API Key cuando haya backend
- [ ] Íconos de tabs personalizados (actualmente placeholder)
- [ ] Pantalla de editar perfil

---

## Estructura de Archivos Relevantes

```
assets/
└── images/
    └── logo-official.png  ← Logo oficial (usado en todos los headers)

src/
├── app/
│   ├── _layout.tsx        ← AuthProvider + BookingsProvider + condicional auth/tabs
│   ├── index.tsx          ← Home/Discover (exporta VENUES)
│   ├── map.tsx            ← Mapa mock con marcadores y bottom sheet
│   ├── profile.tsx        ← Perfil + Mis Reservas + Panel de Establecimiento
│   ├── login.tsx          ← Login (Google como único social)
│   └── register.tsx       ← Registro con botón "← Volver"
├── components/
│   ├── app-tabs.tsx              ← 3 tabs (Inicio/Mapa/Perfil)
│   ├── animated-icon.tsx         ← Splash overlay animado
│   ├── booking-modal.tsx         ← Flujo completo de reserva (3 fases)
│   ├── venue-detail-modal.tsx    ← Detalle completo del venue (amenidades + reseñas)
│   └── establishment-dashboard.tsx ← Dashboard demo de propietario
├── constants/
│   └── theme.ts           ← Colors (con navy nuevo), Gradients, BorderRadius, Shadows, Typography, Spacing
├── context/
│   ├── auth.tsx           ← AuthContext (isAuthenticated, login, logout)
│   └── bookings.tsx       ← BookingsContext (bookings, modales, likedIds globales)
└── hooks/
    └── use-theme.ts       ← Retorna Colors[colorScheme]
```
