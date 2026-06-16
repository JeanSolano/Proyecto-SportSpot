// Catálogos compartidos por los formularios del panel admin.

// Tipos de cancha soportados. El `color` se usa para los badges.
export const COURT_TYPES = [
  { id: 'futbol', label: 'Fútbol', emoji: '⚽', color: '#00CA4E' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀', color: '#1E7FE0' },
  { id: 'baseball', label: 'Baseball', emoji: '⚾', color: '#F4511E' },
  { id: 'padel', label: 'Pádel', emoji: '🎾', color: '#9C27B0' },
  { id: 'tenis', label: 'Tenis', emoji: '🎾', color: '#FF7F00' },
  { id: 'voleibol', label: 'Voleibol', emoji: '🏐', color: '#E91E63' },
  { id: 'natacion', label: 'Natación', emoji: '🏊', color: '#00BCD4' },
  { id: 'otro', label: 'Otro', emoji: '🏟️', color: '#5A5A72' },
];

export const courtType = (id) =>
  COURT_TYPES.find((t) => t.id === id) ?? COURT_TYPES[COURT_TYPES.length - 1];

// Amenidades del establecimiento (checkboxes).
export const AMENITIES = [
  { id: 'techo', label: 'Techo / Cubierto', emoji: '⛱️' },
  { id: 'banos', label: 'Baños', emoji: '🚻' },
  { id: 'gym', label: 'Gimnasio', emoji: '🏋️' },
  { id: 'vestidores', label: 'Vestidores', emoji: '🚪' },
  { id: 'estacionamiento', label: 'Estacionamiento', emoji: '🅿️' },
  { id: 'iluminacion', label: 'Iluminación nocturna', emoji: '💡' },
  { id: 'cafeteria', label: 'Cafetería', emoji: '☕' },
  { id: 'wifi', label: 'WiFi', emoji: '📶' },
  { id: 'duchas', label: 'Duchas', emoji: '🚿' },
  { id: 'tienda', label: 'Tienda deportiva', emoji: '🛒' },
];

export const amenity = (id) => AMENITIES.find((a) => a.id === id);

// Días de la semana (clave corta + etiqueta).
export const WEEK_DAYS = [
  { id: 'lun', label: 'Lun' },
  { id: 'mar', label: 'Mar' },
  { id: 'mie', label: 'Mié' },
  { id: 'jue', label: 'Jue' },
  { id: 'vie', label: 'Vie' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
];

// Franjas horarias disponibles (06:00 – 22:00).
export const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = 6 + i;
  return `${String(h).padStart(2, '0')}:00`;
});
