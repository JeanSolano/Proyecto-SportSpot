/**
 * Capa de datos del panel admin — conectada al API REST (PostgreSQL) vía api.js.
 * Las firmas se mantienen (Promesas) para no tocar las pantallas; internamente
 * traducen entre la forma del frontend y el esquema de la BD con adapters.js.
 */
import { apiFetch, clearToken, setToken } from './api';
import {
  DEPORTE_A_DB, deporteDesdeDb, AMENIDAD_A_DB, amenidadDesdeDb,
  DIA_A_DB, diaDesdeDb, slotDesdeHora, horaFinDeSlot,
} from './adapters';

const OWNER_KEY = 'sportspot_owner';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// ---------------------------------------------------------------------------
// Autenticación de dueños
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
// Suscripción  (/api/suscripciones)
// ---------------------------------------------------------------------------

const planIdDesdeNombre = (nombre) => String(nombre || '').toLowerCase(); // 'Pro' -> 'pro'
const nombrePlanDesdeId = (planId) => (planId ? planId.charAt(0).toUpperCase() + planId.slice(1) : ''); // 'pro' -> 'Pro'

export async function getSubscription() {
  const s = await apiFetch('/api/suscripciones/mia');
  if (!s) return null;
  return {
    planId: planIdDesdeNombre(s.plan),
    status: s.estado === 'activa' ? 'active' : s.estado,
    startedAt: s.fecha_inicio,
    renewsAt: s.fecha_fin,
    provider: s.proveedor,
  };
}

export async function subscribe(_ownerId, planId) {
  const s = await apiFetch('/api/suscripciones', { method: 'POST', body: { plan: nombrePlanDesdeId(planId) } });
  return { planId, status: 'active', startedAt: s.fecha_inicio, renewsAt: s.fecha_fin, provider: s.proveedor };
}

// ---------------------------------------------------------------------------
// Establecimientos  (/api/establecimientos)
// ---------------------------------------------------------------------------

const ownerNombre = () => read(OWNER_KEY, {})?.name || '';

const canchaDesdeDb = (c) => {
  const horarios = c.horarios || [];
  const days = [...new Set(horarios.map((h) => diaDesdeDb(h.dia_semana)).filter(Boolean))];
  const slots = [...new Set(horarios.map((h) => slotDesdeHora(h.hora_inicio)))].sort();
  return { id: c.id_cancha, name: c.nombre, type: deporteDesdeDb(c.deporte), precio: c.precio_hora, days, slots };
};

const estDesdeDb = (e) => ({
  id: e.id_establecimiento,
  ownerName: e.dueno || ownerNombre(),
  name: e.nombre,
  description: e.descripcion || '',
  direccion: e.direccion || '',
  lat: e.ubicacion_lat,
  lng: e.ubicacion_lng,
  amenities: (e.amenidades || []).map(amenidadDesdeDb).filter(Boolean),
  courts: (e.canchas || []).map(canchaDesdeDb),
  published: e.estado === 'activo',
});

export async function getEstablishments() {
  const rows = await apiFetch('/api/establecimientos/mios');
  return rows.map(estDesdeDb);
}

export async function getEstablishment(id) {
  const e = await apiFetch(`/api/establecimientos/${id}`);
  return e ? estDesdeDb(e) : null;
}

// Crea el establecimiento, sus canchas y los horarios de cada cancha.
export async function addEstablishment(data) {
  const est = await apiFetch('/api/establecimientos', {
    method: 'POST',
    body: {
      nombre: data.name,
      descripcion: data.description,
      direccion: data.direccion,
      ubicacion_lat: Number(data.lat),
      ubicacion_lng: Number(data.lng),
      amenidades: (data.amenities || []).map((id) => AMENIDAD_A_DB[id]).filter(Boolean),
    },
  });

  for (const court of data.courts || []) {
    const cancha = await apiFetch('/api/canchas', {
      method: 'POST',
      body: {
        id_establecimiento: est.id_establecimiento,
        deporte: DEPORTE_A_DB[court.type] || 'Futbol 5',
        nombre: court.name || 'Cancha',
        precio_hora: Number(court.precio),
      },
    });
    for (const dia of court.days || []) {
      for (const slot of court.slots || []) {
        await apiFetch(`/api/canchas/${cancha.id_cancha}/horarios`, {
          method: 'POST',
          body: { dia_semana: DIA_A_DB[dia], hora_inicio: slot, hora_fin: horaFinDeSlot(slot) },
        });
      }
    }
  }
  return { id: est.id_establecimiento };
}

// Actualiza los datos generales del establecimiento (la edicion de canchas se hace por separado).
export async function updateEstablishment(id, data) {
  await apiFetch(`/api/establecimientos/${id}`, {
    method: 'PUT',
    body: {
      nombre: data.name,
      descripcion: data.description,
      direccion: data.direccion,
      ubicacion_lat: data.lat != null && data.lat !== '' ? Number(data.lat) : undefined,
      ubicacion_lng: data.lng != null && data.lng !== '' ? Number(data.lng) : undefined,
    },
  });
  return { id };
}

export async function deleteEstablishment(id) {
  await apiFetch(`/api/establecimientos/${id}`, { method: 'DELETE' });
}
