// Publicaciones del establecimiento (feed): publicacion | evento | promocion.
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRol } = require('../middleware/auth');

const router = express.Router();

const TIPOS = ['publicacion', 'evento', 'promocion'];

// Verifica que el establecimiento sea del dueno autenticado.
async function establecimientoDelDueno(idEst, idUsuario) {
  const r = await pool.query('SELECT id_dueno FROM establecimientos WHERE id_establecimiento = $1', [idEst]);
  if (r.rowCount === 0) return 'no-existe';
  return r.rows[0].id_dueno === idUsuario ? 'ok' : 'ajeno';
}

// GET /api/publicaciones  (publico) - feed: publicaciones activas de todos los establecimientos
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id_publicacion, p.tipo, p.titulo, p.descripcion, p.imagen, p.fecha_evento, p.created_at,
              e.id_establecimiento, e.nombre AS establecimiento, e.logo_url,
              (SELECT t.nombre FROM canchas c JOIN tipos_deporte t ON t.id_tipo = c.id_tipo_deporte
                WHERE c.id_establecimiento = e.id_establecimiento ORDER BY c.created_at LIMIT 1) AS deporte
         FROM publicaciones p
         JOIN establecimientos e ON e.id_establecimiento = p.id_establecimiento
        WHERE p.activo = TRUE
        ORDER BY p.created_at DESC`,
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las publicaciones' });
  }
});

// GET /api/publicaciones/mias  (Dueno) - publicaciones de sus establecimientos (para gestionar)
router.get('/mias', verificarToken, soloRol('Dueno'), async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id_publicacion, p.tipo, p.titulo, p.descripcion, p.imagen, p.fecha_evento, p.activo, p.created_at,
              e.id_establecimiento, e.nombre AS establecimiento
         FROM publicaciones p
         JOIN establecimientos e ON e.id_establecimiento = p.id_establecimiento
        WHERE e.id_dueno = $1
        ORDER BY p.created_at DESC`,
      [req.usuario.id_usuario],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus publicaciones' });
  }
});

// POST /api/publicaciones  (Dueno) - crea una publicacion en uno de sus establecimientos
router.post('/', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { id_establecimiento, tipo, titulo, descripcion, imagen, fecha_evento } = req.body;
  if (!id_establecimiento || !titulo) {
    return res.status(400).json({ error: 'id_establecimiento y titulo son obligatorios' });
  }
  const tipoFinal = TIPOS.includes(tipo) ? tipo : 'publicacion';
  try {
    const chk = await establecimientoDelDueno(id_establecimiento, req.usuario.id_usuario);
    if (chk === 'no-existe') return res.status(404).json({ error: 'Establecimiento no encontrado' });
    if (chk === 'ajeno') return res.status(403).json({ error: 'Este establecimiento no es tuyo' });

    const ins = await pool.query(
      `INSERT INTO publicaciones (id_establecimiento, tipo, titulo, descripcion, imagen, fecha_evento)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id_establecimiento, tipoFinal, titulo, descripcion || null, imagen || null, fecha_evento || null],
    );
    res.status(201).json(ins.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la publicacion' });
  }
});

// PUT /api/publicaciones/:id  (Dueno propietario)
router.put('/:id', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { tipo, titulo, descripcion, imagen, fecha_evento, activo } = req.body;
  try {
    const own = await pool.query(
      `SELECT e.id_dueno FROM publicaciones p JOIN establecimientos e ON e.id_establecimiento = p.id_establecimiento
        WHERE p.id_publicacion = $1`,
      [req.params.id],
    );
    if (own.rowCount === 0) return res.status(404).json({ error: 'Publicacion no encontrada' });
    if (own.rows[0].id_dueno !== req.usuario.id_usuario) return res.status(403).json({ error: 'Esta publicacion no es tuya' });

    const upd = await pool.query(
      `UPDATE publicaciones SET
         tipo = COALESCE($2, tipo), titulo = COALESCE($3, titulo),
         descripcion = COALESCE($4, descripcion), imagen = COALESCE($5, imagen),
         fecha_evento = COALESCE($6, fecha_evento), activo = COALESCE($7, activo)
       WHERE id_publicacion = $1 RETURNING *`,
      [req.params.id, tipo && TIPOS.includes(tipo) ? tipo : null, titulo ?? null, descripcion ?? null, imagen ?? null, fecha_evento ?? null, typeof activo === 'boolean' ? activo : null],
    );
    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la publicacion' });
  }
});

// DELETE /api/publicaciones/:id  (Dueno propietario)
router.delete('/:id', verificarToken, soloRol('Dueno'), async (req, res) => {
  try {
    const own = await pool.query(
      `SELECT e.id_dueno FROM publicaciones p JOIN establecimientos e ON e.id_establecimiento = p.id_establecimiento
        WHERE p.id_publicacion = $1`,
      [req.params.id],
    );
    if (own.rowCount === 0) return res.status(404).json({ error: 'Publicacion no encontrada' });
    if (own.rows[0].id_dueno !== req.usuario.id_usuario) return res.status(403).json({ error: 'Esta publicacion no es tuya' });

    await pool.query('DELETE FROM publicaciones WHERE id_publicacion = $1', [req.params.id]);
    res.json({ mensaje: 'Publicacion eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la publicacion' });
  }
});

module.exports = router;
