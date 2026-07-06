// Servidor principal de la API de SportSpot (Express).
const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/db'); // inicializa el pool y verifica la conexion

const app = express();
app.use(cors());
app.use(express.json());

// Ruta raiz de salud
app.get('/', (req, res) => {
  res.json({ mensaje: 'SportSpot API', version: '1.0', db: 'PostgreSQL' });
});
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/establecimientos', require('./routes/establecimientos'));
app.use('/api/canchas', require('./routes/canchas'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/suscripciones', require('./routes/suscripciones'));
app.use('/api/pagos', require('./routes/pagos'));

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Manejador de errores global
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SportSpot API escuchando en http://localhost:${PORT}`);
});
