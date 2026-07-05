// Ejecuta sql/schema.sql contra la base de datos del .env (patron de la practica).
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function migrate() {
  try {
    const ruta = path.join(__dirname, 'sql', 'schema.sql');
    const sql = fs.readFileSync(ruta, 'utf8');
    console.log('Ejecutando schema.sql ...');
    await pool.query(sql);
    console.log('Migracion completada: tablas y datos semilla creados correctamente.');
  } catch (err) {
    console.error('Error en la migracion:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
