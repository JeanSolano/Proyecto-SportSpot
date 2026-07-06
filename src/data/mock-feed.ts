// Feed estilo social. Mezcla:
//  - Publicaciones de USUARIOS (mock, contenido casual de demostración).
//  - Publicaciones de ESTABLECIMIENTOS generadas desde la BD real (llevan el id
//    real para poder abrir su perfil desde el pop-up del post).
import { sportColor } from './sports';
import type { EstablecimientoResumen } from './establecimientos';

export type FeedItem = {
  id: string;
  tipoAutor: 'usuario' | 'establecimiento';
  autor: string;
  autorInicial: string;
  autorColor: string;
  tiempo: string;
  texto: string;
  imagen: string;
  deporte?: string;
  deporteColor?: string;
  esEvento?: boolean;
  fechaEvento?: string;
  establecimientoId?: string; // real, para "Ver perfil"
  likes: number;
  comentarios: number;
};

function initials(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

// Imagen de demostración según el deporte (aún no hay fotos reales en la BD).
const SPORT_IMG: Record<string, string> = {
  futbol: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  basket: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  tenis: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&q=80',
  voley: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
};
function imagenDeporte(deporte?: string): string {
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

// Frases de demostración para los posts de establecimientos.
const PLANTILLAS = [
  (n: string) => `¡Ya puedes reservar en ${n} directo desde SportSpot! 📲`,
  (n: string) => `Nuevas horas disponibles esta semana en ${n}. ¡Aparta la tuya!`,
  (n: string) => `Gracias por elegir ${n} 🙌 Te esperamos en la cancha.`,
];

// ─── Publicaciones de establecimientos (desde la BD real) ─────────────────────
export function buildEstablecimientoPosts(ests: EstablecimientoResumen[]): FeedItem[] {
  return ests.map((e, i) => {
    const deporte = e.deportes[0];
    return {
      id: `e-${e.id_establecimiento}`,
      tipoAutor: 'establecimiento',
      autor: e.nombre,
      autorInicial: initials(e.nombre),
      autorColor: deporte ? sportColor(deporte) : '#1B2880',
      tiempo: 'Reciente',
      texto: PLANTILLAS[i % PLANTILLAS.length](e.nombre),
      imagen: imagenDeporte(deporte),
      deporte,
      deporteColor: deporte ? sportColor(deporte) : undefined,
      establecimientoId: e.id_establecimiento,
      likes: 30 + ((i * 17) % 120),
      comentarios: 3 + ((i * 5) % 20),
    };
  });
}

// Intercala usuarios y establecimientos para que el feed se vea variado.
export function mezclarFeed(estPosts: FeedItem[]): FeedItem[] {
  const out: FeedItem[] = [];
  const max = Math.max(USER_POSTS.length, estPosts.length);
  for (let i = 0; i < max; i++) {
    if (estPosts[i]) out.push(estPosts[i]);
    if (USER_POSTS[i]) out.push(USER_POSTS[i]);
  }
  return out;
}
