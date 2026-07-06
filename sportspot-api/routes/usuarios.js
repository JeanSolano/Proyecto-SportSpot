// Rutas de usuarios: listado y perfil (protegidas con JWT).
const express = require('express');
const bcrypt = require('bcryptjs');
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

// PUT /api/usuarios/perfil - actualiza el perfil del usuario autenticado.
// Permite cambiar nombre, telefono, correo y (opcional) la contrasena.
router.put('/perfil', verificarToken, async (req, res) => {
  const { nombre, telefono, correo, contrasena_actual, contrasena_nueva } = req.body;
  try {
    const cur = await pool.query('SELECT contrasena FROM usuarios WHERE id_usuario = $1', [req.usuario.id_usuario]);
    if (cur.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Cambio de contrasena (opcional): requiere la actual y valida longitud.
    let nuevoHash = null;
    if (contrasena_nueva) {
      if (String(contrasena_nueva).length < 6) {
        return res.status(400).json({ error: 'La nueva contrasena debe tener al menos 6 caracteres' });
      }
      if (!cur.rows[0].contrasena) {
        return res.status(400).json({ error: 'Esta cuenta inicia sesion con Google; no tiene contrasena' });
      }
      const ok = await bcrypt.compare(contrasena_actual || '', cur.rows[0].contrasena);
      if (!ok) return res.status(401).json({ error: 'La contrasena actual no es correcta' });
      nuevoHash = await bcrypt.hash(contrasena_nueva, 10);
    }

    const upd = await pool.query(
      `UPDATE usuarios SET
         nombre     = COALESCE($2, nombre),
         telefono   = COALESCE($3, telefono),
         correo     = COALESCE($4, correo),
         contrasena = COALESCE($5, contrasena),
         updated_at = NOW()
       WHERE id_usuario = $1
       RETURNING id_usuario, nombre, correo, telefono, avatar_url`,
      [
        req.usuario.id_usuario,
        nombre ?? null,
        telefono ?? null,
        correo ? correo.trim().toLowerCase() : null,
        nuevoHash,
      ],
    );

    const rolRes = await pool.query(
      'SELECT r.nombre_rol FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE u.id_usuario = $1',
      [req.usuario.id_usuario],
    );
    res.json({ ...upd.rows[0], rol: rolRes.rows[0]?.nombre_rol });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

module.exports = router;
