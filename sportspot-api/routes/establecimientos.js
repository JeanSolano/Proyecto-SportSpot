// CRUD de establecimientos. Lectura publica; escritura solo rol Dueno con paywall.
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRol } = require('../middleware/auth');

const router = express.Router();

// GET /api/establecimientos  (publico) - lista para el Inicio de la app movil
// Soporta buscador con ?q=texto
router.get('/', async (req, res) => {
  const { q } = req.query;
  try {
    const params = [];
    let filtro = "WHERE e.estado = 'activo'";
    if (q) {
      params.push(`%${q}%`);
      filtro += ` AND (e.nombre ILIKE $${params.length} OR e.direccion ILIKE $${params.length})`;
    }
    const result = await pool.query(
      `SELECT e.id_establecimiento, e.nombre, e.descripcion, e.direccion,
              e.ubicacion_lat, e.ubicacion_lng, e.estado, u.nombre AS dueno,
              COUNT(DISTINCT c.id_cancha)          AS canchas,
              MIN(c.precio_hora)                   AS precio_desde,
              COALESCE(
                ARRAY_AGG(DISTINCT t.nombre) FILTER (WHERE t.nombre IS NOT NULL),
                '{}'
              )                                     AS deportes
         FROM establecimientos e
         JOIN usuarios u ON u.id_usuario = e.id_dueno
         LEFT JOIN canchas c ON c.id_establecimiento = e.id_establecimiento
         LEFT JOIN tipos_deporte t ON t.id_tipo = c.id_tipo_deporte
         ${filtro}
        GROUP BY e.id_establecimiento, u.nombre
        ORDER BY e.created_at DESC`,
      params,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los establecimientos' });
  }
});

// GET /api/establecimientos/mios  (Dueno) - los del dueno, con canchas y amenidades
router.get('/mios', verificarToken, soloRol('Dueno'), async (req, res) => {
  try {
    const ests = (
      await pool.query('SELECT * FROM establecimientos WHERE id_dueno = $1 ORDER BY created_at DESC', [req.usuario.id_usuario])
    ).rows;
    for (const e of ests) {
      e.canchas = (
        await pool.query(
          `SELECT c.id_cancha, c.nombre, c.precio_hora, t.nombre AS deporte
             FROM canchas c JOIN tipos_deporte t ON t.id_tipo = c.id_tipo_deporte
            WHERE c.id_establecimiento = $1 ORDER BY c.created_at`,
          [e.id_establecimiento],
        )
      ).rows;
      e.amenidades = (
        await pool.query(
          `SELECT a.nombre FROM establecimiento_amenidades ea
             JOIN amenidades a ON a.id_amenidad = ea.id_amenidad WHERE ea.id_establecimiento = $1`,
          [e.id_establecimiento],
        )
      ).rows.map((r) => r.nombre);
    }
    res.json(ests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus establecimientos' });
  }
});

// GET /api/establecimientos/:id  (publico) - detalle con canchas, amenidades y horario
router.get('/:id', async (req, res) => {
  try {
    const est = await pool.query(
      `SELECT e.*, u.nombre AS dueno
         FROM establecimientos e JOIN usuarios u ON u.id_usuario = e.id_dueno
        WHERE e.id_establecimiento = $1`,
      [req.params.id],
    );
    if (est.rowCount === 0) return res.status(404).json({ error: 'Establecimiento no encontrado' });

    const canchas = await pool.query(
      `SELECT c.*, t.nombre AS deporte
         FROM canchas c JOIN tipos_deporte t ON t.id_tipo = c.id_tipo_deporte
        WHERE c.id_establecimiento = $1 ORDER BY c.created_at`,
      [req.params.id],
    );
    for (const c of canchas.rows) {
      c.horarios = (
        await pool.query(
          `SELECT dia_semana, hora_inicio, hora_fin, bloqueado FROM cancha_horarios
            WHERE id_cancha = $1 ORDER BY dia_semana, hora_inicio`,
          [c.id_cancha],
        )
      ).rows;
    }
    const amenidades = await pool.query(
      `SELECT a.id_amenidad, a.nombre, a.icono
         FROM establecimiento_amenidades ea JOIN amenidades a ON a.id_amenidad = ea.id_amenidad
        WHERE ea.id_establecimiento = $1`,
      [req.params.id],
    );
    const horario = await pool.query(
      `SELECT dia_semana, hora_apertura, hora_cierre FROM horarios_operacion
        WHERE id_establecimiento = $1 ORDER BY dia_semana`,
      [req.params.id],
    );
    res.json({ ...est.rows[0], canchas: canchas.rows, amenidades: amenidades.rows, horario_operacion: horario.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el establecimiento' });
  }
});

// POST /api/establecimientos  (Dueno) - crea con validacion de PAYWALL
router.post('/', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { nombre, descripcion, direccion, ubicacion_lat, ubicacion_lng, telefono, correo, amenidades } = req.body;
  if (!nombre || !direccion || ubicacion_lat == null || ubicacion_lng == null) {
    return res.status(400).json({ error: 'nombre, direccion y ubicacion (lat/lng) son obligatorios' });
  }
  if (Math.abs(Number(ubicacion_lat)) > 90 || Math.abs(Number(ubicacion_lng)) > 180) {
    return res.status(400).json({ error: 'La latitud debe estar entre -90 y 90 y la longitud entre -180 y 180' });
  }
  const client = await pool.connect();
  try {
    // Paywall: requiere plan activo y no exceder su limite de establecimientos
    const plan = await client.query(
      `SELECT p.nombre, p.limite_establecimientos
         FROM suscripciones s JOIN planes p ON p.id_plan = s.id_plan
        WHERE s.id_dueno = $1 AND s.estado = 'activa'
        ORDER BY s.fecha_inicio DESC LIMIT 1`,
      [req.usuario.id_usuario],
    );
    if (plan.rowCount === 0) {
      return res.status(403).json({ error: 'Necesitas un plan activo para publicar establecimientos' });
    }
    const { nombre: planNombre, limite_establecimientos } = plan.rows[0];
    const actuales = await client.query('SELECT COUNT(*) FROM establecimientos WHERE id_dueno = $1', [req.usuario.id_usuario]);
    if (parseInt(actuales.rows[0].count, 10) >= limite_establecimientos) {
      return res.status(403).json({ error: `Alcanzaste el limite de tu plan ${planNombre} (${limite_establecimientos} establecimientos). Mejora tu plan.` });
    }

    await client.query('BEGIN');
    const insert = await client.query(
      `INSERT INTO establecimientos (id_dueno, nombre, descripcion, direccion, ubicacion_lat, ubicacion_lng, telefono, correo, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo') RETURNING *`,
      [req.usuario.id_usuario, nombre, descripcion || null, direccion, ubicacion_lat, ubicacion_lng, telefono || null, correo || null],
    );
    const est = insert.rows[0];
    if (Array.isArray(amenidades)) {
      for (const a of amenidades) {
        let idA = a;
        if (typeof a === 'string') {
          const found = await client.query('SELECT id_amenidad FROM amenidades WHERE LOWER(nombre) = LOWER($1)', [a]);
          if (found.rowCount === 0) continue;
          idA = found.rows[0].id_amenidad;
        }
        await client.query(
          'INSERT INTO establecimiento_amenidades (id_establecimiento, id_amenidad) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [est.id_establecimiento, idA],
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(est);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al crear el establecimiento' });
  } finally {
    client.release();
  }
});

// PUT /api/establecimientos/:id  (Dueno dueno del recurso)
router.put('/:id', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { nombre, descripcion, direccion, ubicacion_lat, ubicacion_lng, telefono, correo, estado } = req.body;
  try {
    const dueno = await pool.query('SELECT id_dueno FROM establecimientos WHERE id_establecimiento = $1', [req.params.id]);
    if (dueno.rowCount === 0) return res.status(404).json({ error: 'Establecimiento no encontrado' });
    if (dueno.rows[0].id_dueno !== req.usuario.id_usuario) return res.status(403).json({ error: 'Este establecimiento no es tuyo' });

    const upd = await pool.query(
      `UPDATE establecimientos SET
         nombre = COALESCE($2, nombre), descripcion = COALESCE($3, descripcion),
         direccion = COALESCE($4, direccion), ubicacion_lat = COALESCE($5, ubicacion_lat),
         ubicacion_lng = COALESCE($6, ubicacion_lng), telefono = COALESCE($7, telefono),
         correo = COALESCE($8, correo), estado = COALESCE($9, estado), updated_at = NOW()
       WHERE id_establecimiento = $1 RETURNING *`,
      [req.params.id, nombre, descripcion, direccion, ubicacion_lat, ubicacion_lng, telefono, correo, estado],
    );
    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el establecimiento' });
  }
});

// DELETE /api/establecimientos/:id  (Dueno dueno del recurso)
router.delete('/:id', verificarToken, soloRol('Dueno'), async (req, res) => {
  try {
    const dueno = await pool.query('SELECT id_dueno FROM establecimientos WHERE id_establecimiento = $1', [req.params.id]);
    if (dueno.rowCount === 0) return res.status(404).json({ error: 'Establecimiento no encontrado' });
    if (dueno.rows[0].id_dueno !== req.usuario.id_usuario) return res.status(403).json({ error: 'Este establecimiento no es tuyo' });
    await pool.query('DELETE FROM establecimientos WHERE id_establecimiento = $1', [req.params.id]);
    res.json({ mensaje: 'Establecimiento eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el establecimiento' });
  }
});

module.exports = router;
