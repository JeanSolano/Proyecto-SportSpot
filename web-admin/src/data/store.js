/**
 * Capa de datos del panel admin — SOLO FRONTEND.
 *
 * Hoy persiste en localStorage para que la demo sea "pegajosa" entre recargas.
 * Cuando exista el API de Node/Express + base de datos, reemplaza el cuerpo de
 * estas funciones por llamadas `fetch('/api/...')`. Las pantallas no cambian:
 * solo dependen de la firma de estas funciones (todas devuelven Promesas).
 */

const OWNERS_KEY = 'sportspot_owners';
const SESSION_KEY = 'sportspot_session';
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

// Simula latencia de red para que los spinners se sientan reales.
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Autenticación de dueños
// ---------------------------------------------------------------------------

export async function registerOwner({ name, email, password, phone }) {
  await delay();
  const owners = read(OWNERS_KEY, []);
  const normalized = email.trim().toLowerCase();
  if (owners.some((o) => o.email === normalized)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }
  const owner = { id: uid(), name: name.trim(), email: normalized, password, phone: phone?.trim() ?? '' };
  owners.push(owner);
  write(OWNERS_KEY, owners);
  write(SESSION_KEY, owner.id);
  return publicOwner(owner);
}

export async function loginOwner({ email, password }) {
  await delay();
  const owners = read(OWNERS_KEY, []);
  const normalized = email.trim().toLowerCase();
  const owner = owners.find((o) => o.email === normalized && o.password === password);
  if (!owner) throw new Error('Correo o contraseña incorrectos.');
  write(SESSION_KEY, owner.id);
  return publicOwner(owner);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentOwner() {
  const id = read(SESSION_KEY, null);
  if (!id) return null;
  const owner = read(OWNERS_KEY, []).find((o) => o.id === id);
  return owner ? publicOwner(owner) : null;
}

const publicOwner = ({ id, name, email, phone }) => ({ id, name, email, phone });

// ---------------------------------------------------------------------------
// Establecimientos
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
  const record = { ...data, id: uid(), createdAt: new Date().toISOString() };
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
