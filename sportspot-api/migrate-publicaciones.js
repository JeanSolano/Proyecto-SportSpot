// Aplica sql/migracion-publicaciones.sql (aditiva, no destructiva) a la BD del .env.
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'sql', 'migracion-publicaciones.sql'), 'utf8');
    console.log('Aplicando migracion de publicaciones ...');
    await pool.query(sql);
    console.log('Listo: tabla publicaciones disponible.');
  } catch (err) {
    console.error('Error en la migracion:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
