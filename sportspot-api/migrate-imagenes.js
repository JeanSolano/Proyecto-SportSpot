// Aplica sql/migracion-imagenes.sql (aditiva, no destructiva) a la BD del .env.
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'sql', 'migracion-imagenes.sql'), 'utf8');
    console.log('Aplicando migracion de imagenes (logo + galeria) ...');
    await pool.query(sql);
    console.log('Listo: columna logo_url y tabla establecimiento_imagenes disponibles.');
  } catch (err) {
    console.error('Error en la migracion:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
