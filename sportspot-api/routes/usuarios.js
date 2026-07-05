// Rutas de usuarios: listado y perfil (protegidas con JWT).
const express = require('express');
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/usuarios - lista de usuarios registrados (requiere token)
// Nota: en produccion se restringiria a rol Admin; aqui se deja a cualquier
// usuario autenticado para facilitar las pruebas en Postman.
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.telefono, r.nombre_rol AS rol,
              u.activo, u.created_at
         FROM usuarios u
         JOIN roles r ON r.id_rol = u.id_rol
        ORDER BY u.created_at`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// GET /api/usuarios/perfil - perfil del usuario autenticado (RF-04)
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.telefono, u.avatar_url,
              r.nombre_rol AS rol, u.created_at
         FROM usuarios u
         JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.id_usuario = $1`,
      [req.usuario.id_usuario],
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

module.exports = router;
