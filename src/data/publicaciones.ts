// Publicaciones reales del feed (GET /api/publicaciones) mapeadas a FeedItem.
import { apiFetch } from './api';
import { imagenDeporte, initials, type FeedItem } from './mock-feed';
import { sportColor } from './sports';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function tiempoRelativo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Hace 1 día' : `Hace ${d} días`;
}

function fechaEventoLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} · ${h12}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

const ETIQUETA: Record<string, string | undefined> = { evento: 'Evento', promocion: 'Promoción', publicacion: undefined };

// pseudo-conteos deterministas (no hay likes reales todavía)
const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export async function getFeedPublicaciones(): Promise<FeedItem[]> {
  const rows = await apiFetch<any[]>('/api/publicaciones', { auth: false });
  return rows.map((p) => {
    const esEvento = p.tipo === 'evento';
    return {
      id: `pub-${p.id_publicacion}`,
      tipoAutor: 'establecimiento' as const,
      autor: p.establecimiento,
      autorInicial: initials(p.establecimiento || '?'),
      autorColor: p.deporte ? sportColor(p.deporte) : '#1B2880',
      autorLogo: p.logo_url ?? null,
      tiempo: tiempoRelativo(p.created_at),
      titulo: p.titulo,
      texto: p.descripcion || '',
      imagen: p.imagen || imagenDeporte(p.deporte),
      deporte: p.deporte || undefined,
      deporteColor: p.deporte ? sportColor(p.deporte) : undefined,
      etiqueta: ETIQUETA[p.tipo],
      esEvento,
      fechaEvento: esEvento && p.fecha_evento ? fechaEventoLabel(p.fecha_evento) : undefined,
      establecimientoId: p.id_establecimiento,
      likes: 20 + (hash(p.id_publicacion) % 120),
      comentarios: 2 + (hash(p.id_publicacion) % 18),
    };
  });
}
