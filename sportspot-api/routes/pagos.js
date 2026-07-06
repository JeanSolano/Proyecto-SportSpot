// Pagos con PayPal Sandbox. Patron de 3 pasos: crear orden -> aprobar (front) -> capturar.
// Al capturar una suscripcion se activa la fila en `suscripciones` y se registra en `log_pagos`.
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRol } = require('../middleware/auth');
const { crearOrden, capturarOrden } = require('../services/paypal');

const router = express.Router();

// Numero de pago legible y unico: 'PAG-' + timestamp (cabe en VARCHAR(20)).
const nuevoNumeroPago = () => `PAG-${Date.now()}`;

// -----------------------------------------------------------------------------
// POST /api/pagos/suscripciones/orden   body { plan }
// Crea la orden de PayPal por el precio del plan (recalculado en el servidor) y
// registra el pago como 'pendiente' en log_pagos.
// -----------------------------------------------------------------------------
router.post('/suscripciones/orden', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { plan } = req.body;
  if (!plan) return res.status(400).json({ error: 'plan es obligatorio' });
  try {
    const p = await pool.query(
      'SELECT id_plan, nombre, precio_mensual FROM planes WHERE LOWER(nombre) = LOWER($1)',
      [plan],
    );
    if (p.rowCount === 0) return res.status(400).json({ error: 'Plan invalido' });
    const { nombre, precio_mensual } = p.rows[0];

    const orden = await crearOrden({
      monto: precio_mensual,
      moneda: 'USD',
      descripcion: `Suscripcion SportSpot - Plan ${nombre}`,
    });

    await pool.query(
      `INSERT INTO log_pagos
         (numero_pago, tipo_origen, id_usuario, monto, moneda, tipo, metodo_pago,
          paypal_order_id, estado, metadata)
       VALUES ($1, 'suscripcion', $2, $3, 'USD', 'suscripcion', 'paypal', $4, 'pendiente', $5)`,
      [
        nuevoNumeroPago(),
        req.usuario.id_usuario,
        precio_mensual,
        orden.id,
        JSON.stringify({ plan: nombre }),
      ],
    );

    res.status(201).json({ orderId: orden.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al crear la orden de pago' });
  }
});

// -----------------------------------------------------------------------------
// POST /api/pagos/suscripciones/captura/:orderId
// Captura el pago aprobado; si se completa, activa la suscripcion y marca el pago.
// -----------------------------------------------------------------------------
router.post('/suscripciones/captura/:orderId', verificarToken, soloRol('Dueno'), async (req, res) => {
  const { orderId } = req.params;
  const client = await pool.connect();
  try {
    // Recuperar el pago pendiente (asegura que pertenece a este dueno y trae el plan).
    const pago = await client.query(
      `SELECT id_pago, metadata FROM log_pagos
        WHERE paypal_order_id = $1 AND id_usuario = $2 AND tipo_origen = 'suscripcion'`,
      [orderId, req.usuario.id_usuario],
    );
    if (pago.rowCount === 0) return res.status(404).json({ error: 'Orden de pago no encontrada' });
    const nombrePlan = pago.rows[0].metadata?.plan;

    const captura = await capturarOrden(orderId);
    if (captura.status !== 'COMPLETED') {
      await client.query(`UPDATE log_pagos SET estado = 'fallido' WHERE paypal_order_id = $1`, [orderId]);
      return res.status(402).json({ error: 'El pago no se completo', estado: captura.status });
    }
    const captureId = captura.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

    const p = await client.query('SELECT id_plan FROM planes WHERE LOWER(nombre) = LOWER($1)', [nombrePlan]);
    if (p.rowCount === 0) return res.status(400).json({ error: 'Plan invalido' });

    await client.query('BEGIN');
    // Cancela la suscripcion activa anterior (si la hay) y crea la nueva.
    await client.query(
      `UPDATE suscripciones SET estado = 'cancelada' WHERE id_dueno = $1 AND estado = 'activa'`,
      [req.usuario.id_usuario],
    );
    const sub = await client.query(
      `INSERT INTO suscripciones (id_dueno, id_plan, estado, fecha_fin)
       VALUES ($1, $2, 'activa', NOW() + INTERVAL '30 days') RETURNING *`,
      [req.usuario.id_usuario, p.rows[0].id_plan],
    );
    await client.query(
      `UPDATE log_pagos
          SET estado = 'aprobado', paypal_capture_id = $1, id_suscripcion = $2,
              metadata = metadata || $3::jsonb
        WHERE paypal_order_id = $4`,
      [captureId, sub.rows[0].id_suscripcion, JSON.stringify({ capture: captura }), orderId],
    );
    await client.query('COMMIT');

    res.json({ estado: 'aprobado', suscripcion: sub.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al capturar el pago' });
  } finally {
    client.release();
  }
});

module.exports = router;
