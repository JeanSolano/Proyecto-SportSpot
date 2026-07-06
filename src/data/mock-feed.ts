// ⚠️ FEED MOCK — publicaciones y eventos deportivos de demostración para el Inicio.
// Es contenido de ejemplo (aún no hay tabla de publicaciones en la BD). El botón
// "Buscar" del feed lleva a los establecimientos REALES de la BD.

export type FeedItem = {
  id: string;
  tipo: 'publicacion' | 'evento';
  autor: string;
  autorInicial: string;
  autorColor: string;
  tiempo: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  deporte: string;
  deporteColor: string;
  fechaEvento?: string;
  likes: number;
  comentarios: number;
};

export const FEED: FeedItem[] = [
  {
    id: 'f1',
    tipo: 'publicacion',
    autor: 'Club Deportivo Albrook',
    autorInicial: 'CA',
    autorColor: '#00CA4E',
    tiempo: 'Hace 2h',
    titulo: '¡Canchas de básquet recién renovadas!',
    descripcion: 'Estrenamos piso profesional e iluminación LED. Ven a probarlas este fin de semana.',
    imagen: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    deporte: 'Basketball',
    deporteColor: '#0066FF',
    likes: 234,
    comentarios: 18,
  },
  {
    id: 'f2',
    tipo: 'evento',
    autor: 'Complejo Deportivo Miraflores',
    autorInicial: 'CM',
    autorColor: '#FF7F00',
    tiempo: 'Hace 5h',
    titulo: 'Torneo relámpago de Fútbol 5',
    descripcion: 'Inscribe tu equipo. Cupos limitados a 8 equipos. Premio para el campeón.',
    imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    deporte: 'Fútbol 5',
    deporteColor: '#00CA4E',
    fechaEvento: 'Sáb 12 Jul · 4:00 PM',
    likes: 189,
    comentarios: 32,
  },
  {
    id: 'f3',
    tipo: 'publicacion',
    autor: 'Club de Tenis Paitilla',
    autorInicial: 'CT',
    autorColor: '#1E7FE0',
    tiempo: 'Hace 8h',
    titulo: 'Clases de tenis para principiantes',
    descripcion: 'Nuevos horarios de mañana con instructor certificado. Reserva tu cupo desde la app.',
    imagen: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&q=80',
    deporte: 'Tenis',
    deporteColor: '#FF7F00',
    likes: 156,
    comentarios: 12,
  },
  {
    id: 'f4',
    tipo: 'evento',
    autor: 'Club Costa Verde',
    autorInicial: 'CV',
    autorColor: '#9C27B0',
    tiempo: 'Hace 1d',
    titulo: 'Torneo de Voleibol Playa',
    descripcion: 'Parejas mixtas. Música, food trucks y premios. ¡No te lo pierdas!',
    imagen: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    deporte: 'Voleibol',
    deporteColor: '#9C27B0',
    fechaEvento: 'Dom 13 Jul · 10:00 AM',
    likes: 312,
    comentarios: 45,
  },
];
