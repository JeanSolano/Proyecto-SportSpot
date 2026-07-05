// Pool de conexiones a PostgreSQL (patron de la practica de clase).
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Verificacion de conexion al iniciar.
pool
  .connect()
  .then((client) => {
    client.release();
    console.log('Conectado exitosamente a PostgreSQL');
  })
  .catch((err) => {
    console.error('Error al conectar a PostgreSQL:', err.message);
  });

module.exports = pool;
