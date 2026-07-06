// CRUD de reservas. El POST es la transaccion estrella (disponibilidad + total en el servidor).
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRol } = require('../middleware/auth');

const router = express.Router();

const ESTADOS = ['pendiente_pago', 'confirmada', 'cancelada', 'completada', 'no_show'];

// Duracion en horas entre dos "HH:MM"
function horasEntre(inicio, fin) {
  const [h1, m1] = String(inicio).split(':').map(Number);
  const [h2, m2] = String(fin).split(':').map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

// GET /api/reservas  (token) - historial del usuario autenticado (RF-10)
router.get('/', verificarToken, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT r.id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.precio_total,
              r.estado, c.nombre AS cancha, t.nombre AS deporte, e.nombre AS establecimiento
         FROM reservas r
         JOIN canchas c ON c.id_cancha = r.id_cancha
         JOIN tipos_deporte t ON t.id_tipo = c.id_tipo_deporte
         JOIN establecimientos e ON e.id_establecimiento = c.id_establecimiento
        WHERE r.id_usuario = $1
        ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC`,
      [req.usuario.id_usuario],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus reservas' });
  }
});

// GET /api/reservas/establecimiento/:idEst  (Dueno propietario) - reservas del negocio (RF-11)
router.get('/establecimiento/:idEst', verificarToken, async (req, res) => {
  try {
    const own = await pool.query('SELECT id_dueno FROM establecimientos WHERE id_establecimiento = $1', [req.params.idEst]);
    if (own.rowCount === 0) return res.status(404).json({ error: 'Establecimiento no encontrado' });
    if (own.rows[0].id_dueno !== req.usuario.id_usuario) return res.status(403).json({ error: 'Ese establecimiento no es tuyo' });

    const r = await pool.query(
      `SELECT r.id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.precio_total,
              r.comision_monto, r.estado, c.nombre AS cancha, u.nombre AS cliente
         FROM reservas r
         JOIN canchas c ON c.id_cancha = r.id_cancha
         JOIN usuarios u ON u.id_usuario = r.id_usuario
        WHERE c.id_establecimiento = $1
        ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC`,
      [req.params.idEst],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las reservas del establecimiento' });
  }
});

// GET /api/reservas/agenda?fecha=YYYY-MM-DD  (Dueno) - reservas de un dia de TODOS
// sus establecimientos (agenda del panel). Sin fecha, usa hoy.
router.get('/agenda', verificarToken, soloRol('Dueno'), async (req, res) => {
  const fecha = req.query.fecha || null;
  try {
    const r = await pool.query(
      `SELECT r.id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.precio_total,
              r.comision_monto, r.estado, c.nombre AS cancha, e.nombre AS establecimiento,
              t.nombre AS deporte, u.nombre AS cliente
         FROM reservas r
         JOIN canchas c ON c.id_cancha = r.id_cancha
         JOIN tipos_deporte t ON t.id_tipo = c.id_tipo_deporte
         JOIN establecimientos e ON e.id_establecimiento = c.id_establecimiento
         JOIN usuarios u ON u.id_usuario = r.id_usuario
        WHERE e.id_dueno = $1
          AND r.fecha_reserva = COALESCE($2::date, CURRENT_DATE)
        ORDER BY r.hora_inicio`,
      [req.usuario.id_usuario, fecha],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la agenda del dia' });
  }
});

// GET /api/reservas/:id  (token) - detalle (dueno de la reserva o del establecimiento)
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT r.*, c.nombre AS cancha, e.id_dueno, e.nombre AS establecimiento
         FROM reservas r
         JOIN canchas c ON c.id_cancha = r.id_cancha
         JOIN establecimientos e ON e.id_establecimiento = c.id_establecimiento
        WHERE r.id_reserva = $1`,
      [req.params.id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    const reserva = r.rows[0];
    if (reserva.id_usuario !== req.usuario.id_usuario && reserva.id_dueno !== req.usuario.id_usuario) {
      return res.status(403).json({ error: 'No tienes acceso a esta reserva' });
    }
    res.json(reserva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
});

// POST /api/reservas  (token) - crear reserva (TRANSACCION)
router.post('/', verificarToken, async (req, res) => {
  const { id_cancha, fecha_reserva, hora_inicio, hora_fin } = req.body;
  if (!id_cancha || !fecha_reserva || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'id_cancha, fecha_reserva, hora_inicio y hora_fin son obligatorios' });
  }
  const horas = horasEntre(hora_inicio, hora_fin);
  if (!(horas > 0)) return res.status(400).json({ error: 'hora_fin debe ser mayor que hora_inicio' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Cancha activa + precio + dueno
    const cancha = await client.query(
      `SELECT c.precio_hora, c.estado, e.id_dueno
         FROM canchas c JOIN establecimientos e ON e.id_establecimiento = c.id_establecimiento
        WHERE c.id_cancha = $1`,
      [id_cancha],
    );
    if (cancha.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }
    if (cancha.rows[0].estado !== 'activa') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La cancha no esta disponible' });
    }

    // 2) El bloque debe estar cubierto por franjas horarias habilitadas.
    //    Los horarios se definen en franjas de 1 hora; una reserva de N horas
    //    debe cubrir N franjas contiguas no bloqueadas dentro del rango [inicio, fin).
    const disp = await client.query(
      `SELECT COUNT(*)::int AS cubiertas FROM cancha_horarios
        WHERE id_cancha = $1
          AND dia_semana = EXTRACT(DOW FROM $2::date)
          AND bloqueado = FALSE
          AND hora_inicio >= $3::time
          AND hora_fin <= $4::time`,
      [id_cancha, fecha_reserva, hora_inicio, hora_fin],
    );
    if (disp.rows[0].cubiertas < horas) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Horario no disponible para esa cancha' });
    }

    // 3) No debe solaparse con otra reserva activa
    const solape = await client.query(
      `SELECT 1 FROM reservas
        WHERE id_cancha = $1 AND fecha_reserva = $2::date
          AND estado IN ('pendiente_pago', 'confirmada')
          AND hora_inicio < $4::time AND hora_fin > $3::time
        LIMIT 1`,
      [id_cancha, fecha_reserva, hora_inicio, hora_fin],
    );
    if (solape.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Ya existe una reserva en ese horario' });
    }

    // 4) Total calculado en el servidor + comision segun el plan del dueno
    const precioHora = Number(cancha.rows[0].precio_hora);
    const total = +(precioHora * horas).toFixed(2);

    const planRes = await client.query(
      `SELECT p.comision_pct FROM suscripciones s JOIN planes p ON p.id_plan = s.id_plan
        WHERE s.id_dueno = $1 AND s.estado = 'activa' ORDER BY s.fecha_inicio DESC LIMIT 1`,
      [cancha.rows[0].id_dueno],
    );
    const comisionPct = planRes.rowCount ? Number(planRes.rows[0].comision_pct) : 0;
    const comisionMonto = +((total * comisionPct) / 100).toFixed(2);

    const insert = await client.query(
      `INSERT INTO reservas (id_usuario, id_cancha, fecha_reserva, hora_inicio, hora_fin,
                             precio_total, comision_pct, comision_monto, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente_pago')
       RETURNING *`,
      [req.usuario.id_usuario, id_cancha, fecha_reserva, hora_inicio, hora_fin, total, comisionPct, comisionMonto],
    );

    await client.query('COMMIT');
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al crear la reserva' });
  } finally {
    client.release();
  }
});

// PUT /api/reservas/:id  (token) - cambiar estado (RF-08: confirmar/cancelar/completar)
router.put('/:id', verificarToken, async (req, res) => {
  const { estado, motivo_cancelacion } = req.body;
  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: `estado invalido. Validos: ${ESTADOS.join(', ')}` });
  }
  try {
    const r = await pool.query(
      `SELECT r.id_usuario, e.id_dueno
         FROM reservas r
         JOIN canchas c ON c.id_cancha = r.id_cancha
         JOIN establecimientos e ON e.id_establecimiento = c.id_establecimiento
        WHERE r.id_reserva = $1`,
      [req.params.id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    const esCliente = r.rows[0].id_usuario === req.usuario.id_usuario;
    const esDueno = r.rows[0].id_dueno === req.usuario.id_usuario;
    if (!esCliente && !esDueno) return res.status(403).json({ error: 'No puedes modificar esta reserva' });

    const esCancelacion = estado === 'cancelada';
    const quien = esDueno ? 'establecimiento' : 'usuario';
    const upd = await pool.query(
      `UPDATE reservas SET
         estado = $2,
         cancelada_por = CASE WHEN $3 THEN $4 ELSE cancelada_por END,
         motivo_cancelacion = CASE WHEN $3 THEN $5 ELSE motivo_cancelacion END,
         cancelado_en = CASE WHEN $3 THEN NOW() ELSE cancelado_en END,
         updated_at = NOW()
       WHERE id_reserva = $1 RETURNING *`,
      [req.params.id, estado, esCancelacion, quien, motivo_cancelacion || null],
    );
    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
});

// DELETE /api/reservas/:id  (token, dueno de la reserva) - para pruebas
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const r = await pool.query('SELECT id_usuario FROM reservas WHERE id_reserva = $1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (r.rows[0].id_usuario !== req.usuario.id_usuario) return res.status(403).json({ error: 'No es tu reserva' });
    await pool.query('DELETE FROM reservas WHERE id_reserva = $1', [req.params.id]);
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

module.exports = router;
