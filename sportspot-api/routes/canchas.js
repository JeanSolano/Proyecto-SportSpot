// CRUD de canchas y sus horarios de disponibilidad (RF-12).
// Lectura publica; escritura solo del Dueno propietario del establecimiento.
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRol } = require('../middleware/auth');

const router = express.Router();

// Verifica que la cancha pertenezca al dueno autenticado.
async function canchaEsDelDueno(idCancha, idUsuario) {
  const r = await pool.query(
    `SELECT e.id_dueno FROM canchas c
       JOIN establecimientos e ON e.id_establecimiento = c.id_establecimiento
      WHERE c.id_cancha = $1`,
    [idCancha],
  );
  if (r.rowCount === 0) return 'no_existe';
  return r.rows[0].id_dueno === idUsuario ? 'ok' : 'ajeno';
}

// GET /api/canchas/:id  (publico) - detalle de una cancha
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, t.nombre AS deporte, e.nombre AS establecimiento
         FROM canchas c
         JOIN tipos_deporte t ON t.id_tipo = c.id_tipo_deporte
         JOIN establecimientos e ON e.id_establecimiento = c.id_establecimiento
        WHERE c.id_cancha = $1`,
      [req.params.id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Cancha no encontrada' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la cancha' });
  }
});

// GET /api/canchas/:id/horarios  (publico) - disponibilidad de la cancha
router.get('/:id/horarios', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_cancha_horario, dia_semana, hora_inicio, hora_fin, bloqueado
         FROM cancha_horarios WHERE id_cancha = $1
        ORDER BY dia_semana, hora_inicio`,
      [req.params.id],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los horarios' });
  }
});

// POST /api/canchas  (Dueno) - crea una cancha en un establecimiento propio
router.post('/', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { id_establecimiento, id_tipo_deporte, deporte, nombre, descripcion, precio_hora, capacidad_jugadores, specs } = req.body;
  if (!id_establecimiento || !nombre || precio_hora == null || (!id_tipo_deporte && !deporte)) {
    return res.status(400).json({ error: 'id_establecimiento, nombre, precio_hora y el tipo de deporte son obligatorios' });
  }
  try {
    const own = await pool.query('SELECT id_dueno FROM establecimientos WHERE id_establecimiento = $1', [id_establecimiento]);
    if (own.rowCount === 0) return res.status(404).json({ error: 'Establecimiento no encontrado' });
    if (own.rows[0].id_dueno !== req.usuario.id_usuario) return res.status(403).json({ error: 'Ese establecimiento no es tuyo' });

    // El deporte puede venir como id o como nombre
    let tipoId = id_tipo_deporte;
    if (!tipoId && deporte) {
      const t = await pool.query('SELECT id_tipo FROM tipos_deporte WHERE LOWER(nombre) = LOWER($1)', [deporte]);
      if (t.rowCount === 0) return res.status(400).json({ error: `Deporte invalido: ${deporte}` });
      tipoId = t.rows[0].id_tipo;
    }

    const ins = await pool.query(
      `INSERT INTO canchas (id_establecimiento, id_tipo_deporte, nombre, descripcion, precio_hora, capacidad_jugadores, specs)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id_establecimiento, tipoId, nombre, descripcion || null, precio_hora, capacidad_jugadores || null, specs || null],
    );
    res.status(201).json(ins.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la cancha' });
  }
});

// POST /api/canchas/:id/horarios  (Dueno) - agrega un bloque de disponibilidad
router.post('/:id/horarios', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { dia_semana, hora_inicio, hora_fin } = req.body;
  if (dia_semana == null || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'dia_semana, hora_inicio y hora_fin son obligatorios' });
  }
  try {
    const chk = await canchaEsDelDueno(req.params.id, req.usuario.id_usuario);
    if (chk === 'no_existe') return res.status(404).json({ error: 'Cancha no encontrada' });
    if (chk === 'ajeno') return res.status(403).json({ error: 'Esa cancha no es tuya' });

    const ins = await pool.query(
      `INSERT INTO cancha_horarios (id_cancha, dia_semana, hora_inicio, hora_fin)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, dia_semana, hora_inicio, hora_fin],
    );
    res.status(201).json(ins.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese bloque de horario ya existe' });
    console.error(err);
    res.status(500).json({ error: 'Error al agregar el horario' });
  }
});

// PATCH /api/canchas/:idCancha/horarios/:idHorario  (Dueno) - bloquear/liberar (RF-12)
router.patch('/:idCancha/horarios/:idHorario', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { bloqueado } = req.body;
  if (typeof bloqueado !== 'boolean') return res.status(400).json({ error: 'bloqueado (true/false) es obligatorio' });
  try {
    const chk = await canchaEsDelDueno(req.params.idCancha, req.usuario.id_usuario);
    if (chk === 'no_existe') return res.status(404).json({ error: 'Cancha no encontrada' });
    if (chk === 'ajeno') return res.status(403).json({ error: 'Esa cancha no es tuya' });

    const upd = await pool.query(
      `UPDATE cancha_horarios SET bloqueado = $3
        WHERE id_cancha_horario = $1 AND id_cancha = $2 RETURNING *`,
      [req.params.idHorario, req.params.idCancha, bloqueado],
    );
    if (upd.rowCount === 0) return res.status(404).json({ error: 'Horario no encontrado' });
    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el horario' });
  }
});

// PUT /api/canchas/:id  (Dueno)
router.put('/:id', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { nombre, descripcion, precio_hora, capacidad_jugadores, estado, specs, id_tipo_deporte } = req.body;
  try {
    const chk = await canchaEsDelDueno(req.params.id, req.usuario.id_usuario);
    if (chk === 'no_existe') return res.status(404).json({ error: 'Cancha no encontrada' });
    if (chk === 'ajeno') return res.status(403).json({ error: 'Esa cancha no es tuya' });

    const upd = await pool.query(
      `UPDATE canchas SET
         nombre = COALESCE($2, nombre), descripcion = COALESCE($3, descripcion),
         precio_hora = COALESCE($4, precio_hora), capacidad_jugadores = COALESCE($5, capacidad_jugadores),
         estado = COALESCE($6, estado), specs = COALESCE($7, specs), id_tipo_deporte = COALESCE($8, id_tipo_deporte)
       WHERE id_cancha = $1 RETURNING *`,
      [req.params.id, nombre, descripcion, precio_hora, capacidad_jugadores, estado, specs, id_tipo_deporte],
    );
    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la cancha' });
  }
});

// DELETE /api/canchas/:id  (Dueno)
router.delete('/:id', verificarToken, soloRol('Dueno'), async (req, res) => {
  try {
    const chk = await canchaEsDelDueno(req.params.id, req.usuario.id_usuario);
    if (chk === 'no_existe') return res.status(404).json({ error: 'Cancha no encontrada' });
    if (chk === 'ajeno') return res.status(403).json({ error: 'Esa cancha no es tuya' });
    await pool.query('DELETE FROM canchas WHERE id_cancha = $1', [req.params.id]);
    res.json({ mensaje: 'Cancha eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la cancha' });
  }
});

module.exports = router;
