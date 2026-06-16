import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cuando exista el API de Node/Express, descomenta el proxy para que las
// llamadas a /api se redirijan al backend en desarrollo.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // proxy: {
    //   '/api': 'http://localhost:4000',
    // },
  },
});
