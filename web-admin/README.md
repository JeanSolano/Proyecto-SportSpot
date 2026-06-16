# SportSpot · Panel Web de Administración

Aplicación web (React + Vite) para que los **dueños de establecimientos** se registren,
inicien sesión y administren sus canchas. **Solo frontend por ahora**: los datos se
guardan en `localStorage`. El API de Node.js + Express y la base de datos se integrarán
más adelante.

## Cómo correr

```bash
cd web-admin
npm install
npm run dev
```

Abre http://localhost:5173

## Qué incluye

- **Registro / Login de dueños** (`/register`, `/login`) — sesión persistida en `localStorage`.
- **Dashboard** (`/`) — resumen + lista de establecimientos del dueño.
- **Nuevo / Editar establecimiento** (`/establecimientos/nuevo`, `/establecimientos/:id/editar`):
  - Nombre del establecimiento y dueño asociado
  - Descripción
  - Servicios (techo, baños, gym, vestidores, estacionamiento, etc.)
  - Canchas dinámicas, cada una con: tipo (fútbol, basketball, baseball, pádel, tenis…),
    días disponibles y franjas horarias **individuales**
- **Detalle de establecimiento** (`/establecimientos/:id`) — vista + eliminar.

## Integración futura con el backend

Toda la persistencia vive en **`src/data/store.js`**. Cuando exista el API:

1. Reemplaza el cuerpo de cada función por `fetch('/api/...')` (las firmas ya devuelven Promesas).
2. Descomenta el `proxy` en `vite.config.js` apuntando al servidor Express.

Las pantallas no necesitan cambios.

## Estructura

```
web-admin/
├── index.html
├── vite.config.js
├── public/logo-official.png
└── src/
    ├── main.jsx              · entrypoint + Router + AuthProvider
    ├── App.jsx               · rutas (públicas vs protegidas)
    ├── index.css             · design system (colores de marca)
    ├── context/AuthContext.jsx
    ├── data/
    │   ├── constants.js      · tipos de cancha, amenidades, días, horarios
    │   └── store.js          · capa de datos (localStorage → API después)
    ├── components/
    │   ├── Layout.jsx        · shell con sidebar
    │   └── CourtScheduleEditor.jsx
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── EstablishmentForm.jsx
        └── EstablishmentDetail.jsx
```
