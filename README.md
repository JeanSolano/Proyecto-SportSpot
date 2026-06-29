# SportSpot

Red social deportiva para Panamá: los deportistas descubren, reservan y pagan canchas desde la **app móvil**, y los dueños administran sus establecimientos desde el **panel web**. Por ahora es **solo frontend (datos mock)**.

## Requisitos
- **Node.js 18+** y **npm**
- App móvil: **Expo** (usa la app **Expo Go** en tu teléfono, o un emulador Android/iOS)

## App móvil (carpeta raíz)
```bash
npm install
npx expo start
```
Escanea el QR con **Expo Go**, o pulsa `a` (Android) / `i` (iOS) para abrir en un emulador.

## Panel web de administrador (`web-admin/`)
```bash
cd web-admin
npm install
npm run dev
```
Abre **http://localhost:5173**

## Documentación
- `web-admin/README.md` — detalle del panel web
- `PROGRESS.md` — progreso de la app móvil
- `docs/` — diagramas de arquitectura y flujo, y prompts del proyecto

---
🤖 Asistido con [Claude Code](https://claude.com/claude-code)
