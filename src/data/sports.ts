// Color de marca por deporte (los nombres vienen de la BD). Compartido por el
// Inicio y el Perfil para no duplicar el mapeo.
export function sportColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('futbol') || n.includes('fútbol')) return '#00CA4E';
  if (n.includes('basket')) return '#0066FF';
  if (n.includes('tenis')) return '#FF7F00';
  if (n.includes('voley') || n.includes('voleibol')) return '#9C27B0';
  if (n.includes('nataci')) return '#00B8D4';
  return '#1E7FE0';
}

// Etiqueta bonita para mostrar (los nombres de la BD vienen sin acento).
export function sportLabel(name: string): string {
  return name.replace(/f[uú]tbol/i, 'Fútbol');
}
