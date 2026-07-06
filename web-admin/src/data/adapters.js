// Mapeos entre la forma del frontend (ids de constants.js) y el esquema de la BD.
// Los ids coinciden con COURT_TYPES / AMENITIES / WEEK_DAYS, por eso las pantallas
// (courtType(), amenity()) siguen funcionando sin cambios.

// Deporte: id frontend <-> nombre en tipos_deporte
export const DEPORTE_A_DB = {
  futbol: 'Futbol 5', basketball: 'Basketball', baseball: 'Baseball', padel: 'Padel',
  tenis: 'Tenis', voleibol: 'Voleibol', natacion: 'Natacion', otro: 'Futbol 5',
};
const DB_A_DEPORTE = {
  'Futbol 5': 'futbol', 'Futbol 7': 'futbol', Basketball: 'basketball', Baseball: 'baseball',
  Padel: 'padel', Tenis: 'tenis', Voleibol: 'voleibol', Natacion: 'natacion',
};
export const deporteDesdeDb = (nombre) => DB_A_DEPORTE[nombre] || 'otro';

// Amenidad: id frontend <-> nombre en amenidades
export const AMENIDAD_A_DB = {
  techo: 'Techo', banos: 'Banos', gym: 'Gimnasio', vestidores: 'Vestidores',
  estacionamiento: 'Estacionamiento', iluminacion: 'Iluminacion', cafeteria: 'Cafeteria',
  wifi: 'WiFi', duchas: 'Duchas', tienda: 'Tienda',
};
const DB_A_AMENIDAD = Object.fromEntries(Object.entries(AMENIDAD_A_DB).map(([k, v]) => [v, k]));
export const amenidadDesdeDb = (nombre) => DB_A_AMENIDAD[nombre];

// Dia: id frontend <-> dia_semana (0=Dom ... 6=Sab)
export const DIA_A_DB = { dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6 };
const DB_A_DIA = Object.fromEntries(Object.entries(DIA_A_DB).map(([k, v]) => [v, k]));
export const diaDesdeDb = (n) => DB_A_DIA[n];

// Horas: "18:00:00" -> slot "18:00" ; slot "18:00" -> hora_fin "19:00"
export const slotDesdeHora = (h) => String(h).slice(0, 5);
export const horaFinDeSlot = (slot) => {
  const [h, m] = String(slot).split(':').map(Number);
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
