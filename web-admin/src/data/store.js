/**
 * Capa de datos del panel admin.
 *
 * AUTENTICACION: ya conectada al API REST (PostgreSQL) vía api.js.
 * SUSCRIPCION y ESTABLECIMIENTOS: todavia mock en localStorage (se migran en el
 * siguiente paso). Como se indexan por el id del dueno, funcionan con el UUID
 * real que ahora devuelve el API.
 */
import { apiFetch, clearToken, setToken } from './api';

const OWNER_KEY = 'sportspot_owner';
const SUBSCRIPTIONS_KEY = 'sportspot_subscriptions';
const ESTABLISHMENTS_KEY = 'sportspot_establishments';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const uid = () => Math.random().toString(36).slice(2, 10);
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Autenticación de dueños  (API REST)
// ---------------------------------------------------------------------------

const mapOwner = (u) => ({
  id: u.id_usuario,
  name: u.nombre,
  email: u.correo,
  phone: u.telefono || '',
  rol: u.nombre_rol || u.rol,
});

export async function registerOwner({ name, email, password, phone }) {
  const data = await apiFetch('/api/auth/registro', {
    method: 'POST',
    auth: false,
    body: { nombre: name, correo: email, contrasena: password, telefono: phone, rol: 'dueno' },
  });
  setToken(data.token);
  const owner = mapOwner(data.usuario);
  write(OWNER_KEY, owner);
  return owner;
}

export async function loginOwner({ email, password }) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { correo: email, contrasena: password },
  });
  setToken(data.token);
  const owner = mapOwner(data.usuario);
  write(OWNER_KEY, owner);
  return owner;
}

export async function loginWithGoogle(credential) {
  const data = await apiFetch('/api/auth/google', {
    method: 'POST',
    auth: false,
    body: { credential, rol: 'dueno' },
  });
  setToken(data.token);
  const owner = mapOwner(data.usuario);
  write(OWNER_KEY, owner);
  return owner;
}

export function logout() {
  clearToken();
  localStorage.removeItem(OWNER_KEY);
}

export function getCurrentOwner() {
  return read(OWNER_KEY, null);
}

// ---------------------------------------------------------------------------
// Suscripción (mock — se migra a /api/suscripciones en el paso 5b)
// ---------------------------------------------------------------------------

export async function getSubscription(ownerId) {
  await delay(250);
  return read(SUBSCRIPTIONS_KEY, {})[ownerId] ?? null;
}

export async function subscribe(ownerId, planId) {
  await delay(900); // simula el redirect/confirmacion de PayPal
  const all = read(SUBSCRIPTIONS_KEY, {});
  all[ownerId] = {
    planId,
    status: 'active',
    startedAt: new Date().toISOString(),
    renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    provider: 'paypal-sandbox',
  };
  write(SUBSCRIPTIONS_KEY, all);
  return all[ownerId];
}

export async function cancelSubscription(ownerId) {
  await delay(300);
  const all = read(SUBSCRIPTIONS_KEY, {});
  if (all[ownerId]) {
    all[ownerId] = { ...all[ownerId], status: 'cancelled' };
    write(SUBSCRIPTIONS_KEY, all);
  }
}

// ---------------------------------------------------------------------------
// Establecimientos (mock — se migra a /api/establecimientos en el paso 5b)
// ---------------------------------------------------------------------------

export async function getEstablishments(ownerId) {
  await delay(300);
  return read(ESTABLISHMENTS_KEY, []).filter((e) => e.ownerId === ownerId);
}

export async function getEstablishment(id) {
  await delay(200);
  return read(ESTABLISHMENTS_KEY, []).find((e) => e.id === id) ?? null;
}

export async function addEstablishment(data) {
  await delay();
  const all = read(ESTABLISHMENTS_KEY, []);
  const record = { ...data, id: uid(), published: true, createdAt: new Date().toISOString() };
  all.push(record);
  write(ESTABLISHMENTS_KEY, all);
  return record;
}

export async function updateEstablishment(id, data) {
  await delay();
  const all = read(ESTABLISHMENTS_KEY, []);
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Establecimiento no encontrado.');
  all[idx] = { ...all[idx], ...data, id };
  write(ESTABLISHMENTS_KEY, all);
  return all[idx];
}

export async function deleteEstablishment(id) {
  await delay(300);
  write(
    ESTABLISHMENTS_KEY,
    read(ESTABLISHMENTS_KEY, []).filter((e) => e.id !== id),
  );
}
