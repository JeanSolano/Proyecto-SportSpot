// Suscripciones del dueno (activa el paywall). Activacion mock hasta integrar PayPal.
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRol } = require('../middleware/auth');

const router = express.Router();

// GET /api/suscripciones/mia - suscripcion activa del dueno autenticado
router.get('/mia', verificarToken, soloRol('Dueno'), async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT s.id_suscripcion, s.estado, s.fecha_inicio, s.fecha_fin, s.proveedor,
              p.nombre AS plan, p.limite_establecimientos, p.precio_mensual, p.comision_pct
         FROM suscripciones s JOIN planes p ON p.id_plan = s.id_plan
        WHERE s.id_dueno = $1 AND s.estado = 'activa'
        ORDER BY s.fecha_inicio DESC LIMIT 1`,
      [req.usuario.id_usuario],
    );
    res.json(r.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la suscripcion' });
  }
});

// POST /api/suscripciones  body { plan }  (nombre: Basico | Pro | Premium)
// Activa el plan (mock; el cobro real con PayPal se integra despues).
router.post('/', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { plan } = req.body;
  if (!plan) return res.status(400).json({ error: 'plan es obligatorio' });
  const client = await pool.connect();
  try {
    const p = await client.query('SELECT id_plan FROM planes WHERE LOWER(nombre) = LOWER($1)', [plan]);
    if (p.rowCount === 0) return res.status(400).json({ error: 'Plan invalido' });

    await client.query('BEGIN');
    await client.query(
      `UPDATE suscripciones SET estado = 'cancelada' WHERE id_dueno = $1 AND estado = 'activa'`,
      [req.usuario.id_usuario],
    );
    const ins = await client.query(
      `INSERT INTO suscripciones (id_dueno, id_plan, estado, fecha_fin)
       VALUES ($1, $2, 'activa', NOW() + INTERVAL '30 days') RETURNING *`,
      [req.usuario.id_usuario, p.rows[0].id_plan],
    );
    await client.query('COMMIT');
    res.status(201).json(ins.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al activar la suscripcion' });
  } finally {
    client.release();
  }
});

module.exports = router;
