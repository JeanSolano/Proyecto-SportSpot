// Rutas de autenticacion: registro, login y recuperacion (JWT + bcrypt).
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

const firmarToken = (u, nombreRol) =>
  jwt.sign(
    { id_usuario: u.id_usuario, id_rol: u.id_rol, rol: nombreRol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  const { nombre, correo, contrasena, telefono, rol } = req.body;
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'nombre, correo y contrasena son obligatorios' });
  }
  try {
    // rol admitido desde el cliente: 'dueno' o 'cliente' (por defecto Cliente)
    const nombreRol = String(rol).toLowerCase() === 'dueno' ? 'Dueno' : 'Cliente';
    const rolRes = await pool.query('SELECT id_rol FROM roles WHERE nombre_rol = $1', [nombreRol]);
    if (rolRes.rowCount === 0) return res.status(400).json({ error: 'Rol invalido' });
    const id_rol = rolRes.rows[0].id_rol;

    const hash = await bcrypt.hash(contrasena, 10);
    const insert = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, telefono, id_rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, correo, telefono, id_rol`,
      [nombre, correo.trim().toLowerCase(), hash, telefono || null, id_rol],
    );
    const usuario = insert.rows[0];
    const token = firmarToken(usuario, nombreRol);
    res.status(201).json({ usuario: { ...usuario, rol: nombreRol }, token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'correo y contrasena son obligatorios' });
  }
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol
         FROM usuarios u
         JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.correo = $1 AND u.activo = TRUE`,
      [correo.trim().toLowerCase()],
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Correo o contrasena incorrectos' });
    }
    const usuario = result.rows[0];
    if (!usuario.contrasena) {
      return res.status(401).json({ error: 'Esta cuenta inicia sesion con Google' });
    }
    const ok = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!ok) return res.status(401).json({ error: 'Correo o contrasena incorrectos' });

    const token = firmarToken(usuario, usuario.nombre_rol);
    delete usuario.contrasena;
    res.json({ usuario, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
});

// POST /api/auth/recuperar (version simple)
router.post('/recuperar', async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: 'correo es obligatorio' });
  // Version simple: en produccion se enviaria un correo con un token temporal.
  res.json({ mensaje: `Si existe una cuenta con ${correo}, se enviaran instrucciones de recuperacion.` });
});

module.exports = router;
