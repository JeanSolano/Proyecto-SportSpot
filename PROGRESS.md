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
| react-native-maps | SDK 56 | Mapa interactivo |
| react-native-reanimated | 4.3.1 | Animaciones |

---

## Design System (`src/constants/theme.ts`)

### Colores de Marca

| Token | Light | Dark | Uso |
|---|---|---|---|
| `primary` | `#00CA4E` | `#00E85C` | Verde principal, CTAs |
| `secondary` | `#0066FF` | `#0088FF` | Azul, íconos de acción |
| `accent` | `#FF7F00` | `#FF9F3F` | Naranja de energía |
| `surface` | `#FFFFFF` | `#1C1C1C` | Fondo de cards |
| `border` | `#E8E8E8` | `#2C2C2C` | Bordes de inputs |
| `inputBackground` | `#F7F7F7` | `#232323` | Fondo de campos |

### Gradientes (`Gradients`)

```ts
header:        ['#00CA4E', '#00A86B', '#0066FF']  // Login, perfil, banners
buttonPrimary: ['#00CA4E', '#0066FF']              // Botones CTA
splash:        ['#00CA4E', '#00A86B', '#0044CC']   // Onboarding
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
├── _layout.tsx       ← Root layout con AuthProvider + condicional auth/tabs
├── index.tsx         ← Home / Discover feed
├── map.tsx           ← Mapa interactivo
├── profile.tsx       ← Perfil de usuario
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

- Header con gradiente verde→azul y logo de SportSpot en círculo semi-transparente
- Card blanca con esquinas redondeadas superpuesta al gradiente
- Campos con ícono, borde activo al enfocar, label superior
- Validación: ambos campos requeridos (password mín. 4 chars)
- Botón "Iniciar Sesión" con gradiente, deshabilitado (opacity 0.55) si faltan datos
- `ActivityIndicator` durante la simulación de carga
- Links: "¿Olvidaste tu contraseña?", "Regístrate gratis"
- Botones sociales: Google + Facebook (estructura lista para integrar SDK)
- Footer de Términos y Privacidad

### 2. Register (`register.tsx`)

- Mismo header de marca que login
- 4 campos: Nombre, Email, Contraseña, Confirmar contraseña
- Selector de deporte favorito (chips: Fútbol, Basketball, Tenis, Voleibol, Natación, Otro)
- Hints de validación en tiempo real: "Mín. 6 caracteres" y "Contraseñas coinciden"
- Botón habilitado solo cuando todos los campos son válidos
- Validaciones con Alert nativo para guiar al usuario

### 3. Home / Discover (`index.tsx`)

- Header fijo con "SportSpot" en verde y pill "↗ Popular"
- Filtros horizontales por deporte (pills: Todos, Fútbol, Basketball, Tenis, Voleibol, Natación)
- Feed vertical de cards de venues:
  - **Imagen real** (Unsplash) con gradiente overlay para texto
  - Badge de deporte con color específico por categoría
  - Título y descripción sobre la imagen
  - Avatar con iniciales + nombre del establecimiento + rating ★ + ubicación 📍
  - Badge de disponibilidad y precio por hora
  - Contador de likes (interactivo, toggle ♡/♥) y comentarios
  - Botón "Reservar" con fondo verde
  - Timestamp relativo ("Hace 2h")
- Estado vacío cuando no hay canchas en la categoría seleccionada
- Datos exportados (`export const VENUES`) para compartir con el mapa

**Imágenes por deporte:**
- Basketball: cancha profesional renovada (Unsplash)
- Fútbol: estadio/cancha de fútbol (Unsplash)
- Tenis: cancha de tenis (Unsplash)
- Voleibol: cancha de playa (Unsplash)

### 4. Mapa (`map.tsx`)

- `MapView` pantalla completa centrado en Ciudad de Panamá
- Header flotante con "SportSpot" + contador "4 canchas" sobre el mapa
- Marcadores personalizados por sport con emoji + color de marca:
  - 🏀 Basketball `#0066FF`
  - ⚽ Fútbol `#00CA4E`
  - 🎾 Tenis `#FF7F00`
  - 🏐 Voleibol `#9C27B0`
- Marcador seleccionado se expande mostrando nombre del venue
- **Bottom sheet modal** animado (spring animation):
  - Desliza desde abajo al tocar un marcador
  - Foto real del venue + badge de deporte
  - Nombre, rating, ubicación, disponibilidad, precio/hora
  - Like interactivo + botón "Reservar cancha" con gradiente
  - Se cierra tocando fuera del sheet

> **Nota Android:** Requiere Google Maps API Key en `app.json`. En iOS funciona con MapKit sin configuración adicional.

### 5. Perfil (`profile.tsx`)

- Header "SportSpot" en verde
- Banner con gradiente verde→azul (full width)
- Avatar circular superpuesto al banner (emoji 🏃 + gradiente gris)
- Nombre: Carlos Méndez / @carlosdeportivo
- Badges: 🏅 Miembro Premium (dorado) + 🌐 Fútbol (azul)
- Bio de usuario
- Stats en cards: 📅 24 Reservas | ♥ 12 Favoritos | 🏆 3 Torneos
- Sección "Cuenta":
  - Editar Perfil (con ícono + chevron)
  - Ubicación: "Ciudad de Panamá" (con subtítulo)
  - Notificaciones (Switch toggle)
- Botón "Cerrar Sesión" con borde rojo → vuelve a pantalla de login

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
| RF-05 | Búsqueda de canchas por mapa | ✅ MapView con marcadores |
| RF-06 | Consulta de disponibilidad | ✅ Badge en cards y mapa |
| RF-07 | Reserva de cancha | 🔗 Botón presente (sin flujo aún) |
| RF-14 | Publicación de eventos/promociones | ✅ Cards en el feed |
| RF-15 | Red social (likes, comentarios) | ✅ Like interactivo en feed |

---

## Pendiente

- [ ] Flujo de reserva (RF-07): selección de fecha/hora, confirmación
- [ ] Pago en línea (RF-09): integración con pasarela de pago
- [ ] Cancelación de reserva (RF-08)
- [ ] Historial de reservas (RF-10)
- [ ] Dashboard del establecimiento (RF-11)
- [ ] Gestión de disponibilidad (RF-12)
- [ ] Pantalla de detalle de venue (expandir card)
- [ ] Pantalla de recuperación de contraseña (RF-03)
- [ ] Persistencia de sesión (AsyncStorage o SecureStore)
- [ ] Integración con backend real
- [ ] Google Maps API Key para Android
- [ ] Íconos de tabs personalizados (actualmente placeholder)
- [ ] Pantalla de editar perfil

---

## Estructura de Archivos Relevantes

```
src/
├── app/
│   ├── _layout.tsx        ← AuthProvider + condicional auth/tabs
│   ├── index.tsx          ← Home/Discover (exporta VENUES)
│   ├── map.tsx            ← Mapa con bottom sheet
│   ├── profile.tsx        ← Perfil + logout
│   ├── login.tsx          ← Login con simulación
│   └── register.tsx       ← Registro con validación
├── components/
│   ├── app-tabs.tsx       ← 3 tabs (Inicio/Mapa/Perfil)
│   └── animated-icon.tsx  ← Splash overlay animado
├── constants/
│   └── theme.ts           ← Colors, Gradients, BorderRadius, Shadows, Typography, Spacing
├── context/
│   └── auth.tsx           ← AuthContext (isAuthenticated, login, logout)
└── hooks/
    └── use-theme.ts       ← Retorna Colors[colorScheme]
```
