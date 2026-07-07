// Contenido del feed. Los posts de ESTABLECIMIENTOS ahora vienen de la BD real
// (ver src/data/publicaciones.ts). Aquí quedan solo las publicaciones de USUARIOS
// (mock, contenido casual) y utilidades compartidas.

export type FeedItem = {
  id: string;
  tipoAutor: 'usuario' | 'establecimiento';
  autor: string;
  autorInicial: string;
  autorColor: string;
  autorLogo?: string | null;
  tiempo: string;
  titulo?: string;
  texto: string;
  imagen: string;
  deporte?: string;
  deporteColor?: string;
  etiqueta?: string; // 'Evento' | 'Promoción'
  esEvento?: boolean;
  fechaEvento?: string;
  establecimientoId?: string;
  likes: number;
  comentarios: number;
};

export function initials(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

// Imagen de demostración según el deporte (fallback cuando una publicación no trae imagen).
const SPORT_IMG: Record<string, string> = {
  futbol: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  basket: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  tenis: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&q=80',
  voley: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
};
export function imagenDeporte(deporte?: string): string {
  const n = (deporte || '').toLowerCase();
  if (n.includes('futbol') || n.includes('fútbol')) return SPORT_IMG.futbol;
  if (n.includes('basket')) return SPORT_IMG.basket;
  if (n.includes('tenis')) return SPORT_IMG.tenis;
  if (n.includes('voley') || n.includes('voleibol')) return SPORT_IMG.voley;
  return SPORT_IMG.default;
}

// ─── Publicaciones de usuarios (mock) ─────────────────────────────────────────
export const USER_POSTS: FeedItem[] = [
  {
    id: 'u1',
    tipoAutor: 'usuario',
    autor: 'Andrés Vega',
    autorInicial: 'AV',
    autorColor: '#1E7FE0',
    tiempo: 'Hace 1h',
    texto: 'Pichanga del domingo con los panas ⚽🔥 ¿Quién se apunta la próxima?',
    imagen: 'https://images.unsplash.com/photo-1600679472233-6a0e6b8b1b6a?w=800&q=80',
    likes: 42,
    comentarios: 7,
  },
  {
    id: 'u2',
    tipoAutor: 'usuario',
    autor: 'Valeria Ríos',
    autorInicial: 'VR',
    autorColor: '#F4511E',
    tiempo: 'Hace 3h',
    texto: 'Cerré la semana con un buen partido de tenis 🎾 Cada vez más cerca del saque perfecto.',
    imagen: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
    likes: 68,
    comentarios: 11,
  },
  {
    id: 'u3',
    tipoAutor: 'usuario',
    autor: 'Los Tiburones FC',
    autorInicial: 'LT',
    autorColor: '#00CA4E',
    tiempo: 'Hace 6h',
    texto: 'Buscamos rival para este finde 🏐 Nivel intermedio, buena vibra. ¡Escríbannos!',
    imagen: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80',
    likes: 95,
    comentarios: 23,
  },
];

// Intercala publicaciones de establecimientos (reales) con las de usuarios (mock).
export function mezclarFeed(estPosts: FeedItem[]): FeedItem[] {
  const out: FeedItem[] = [];
  const max = Math.max(USER_POSTS.length, estPosts.length);
  for (let i = 0; i < max; i++) {
    if (estPosts[i]) out.push(estPosts[i]);
    if (USER_POSTS[i]) out.push(USER_POSTS[i]);
  }
  return out;
}
