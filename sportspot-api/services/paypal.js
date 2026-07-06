// Cliente minimo de PayPal Sandbox (OAuth2 + Orders v2).
// Usa fetch global (Node 18+). El Secret vive solo en .env, nunca en el frontend.
require('dotenv').config();

const API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Lanza un error claro si faltan credenciales (evita respuestas confusas de PayPal).
function verificarCredenciales() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'Faltan credenciales de PayPal. Completa PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en el .env del backend.',
    );
  }
}

// Paso previo: token de acceso OAuth2 (client_credentials).
async function obtenerAccessToken() {
  verificarCredenciales();
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || 'No se pudo autenticar con PayPal');
  }
  return data.access_token;
}

// Paso 1: crear la orden (intent CAPTURE). El monto se calcula en el servidor.
async function crearOrden({ monto, moneda = 'USD', descripcion }) {
  const token = await obtenerAccessToken();
  const res = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: moneda, value: Number(monto).toFixed(2) },
          description: descripcion,
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'No se pudo crear la orden en PayPal');
  }
  return data; // { id, status, ... }
}

// Paso 2: capturar (cobrar) la orden aprobada por el comprador.
async function capturarOrden(orderId) {
  const token = await obtenerAccessToken();
  const res = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'No se pudo capturar el pago en PayPal');
  }
  return data; // { id, status: 'COMPLETED', purchase_units:[{ payments:{ captures:[...] }}] }
}

module.exports = { obtenerAccessToken, crearOrden, capturarOrden };
