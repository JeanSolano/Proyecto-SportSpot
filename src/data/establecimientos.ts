// Establecimientos desde el API REST (BD real). Usado por el Inicio.
import { apiFetch } from './api';

export interface EstablecimientoResumen {
  id_establecimiento: string;
  nombre: string;
  descripcion: string | null;
  direccion: string;
  ubicacion_lat: number | null;
  ubicacion_lng: number | null;
  estado: string;
  dueno: string;
  canchas: number;
  precio_desde: number | null;
  deportes: string[];
}

// GET /api/establecimientos (publico). q = texto de busqueda opcional.
export async function getEstablecimientos(q?: string): Promise<EstablecimientoResumen[]> {
  const query = q && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  const rows = await apiFetch<any[]>(`/api/establecimientos${query}`, { auth: false });
  return rows.map((e) => ({
    id_establecimiento: e.id_establecimiento,
    nombre: e.nombre,
    descripcion: e.descripcion,
    direccion: e.direccion,
    ubicacion_lat: e.ubicacion_lat != null ? Number(e.ubicacion_lat) : null,
    ubicacion_lng: e.ubicacion_lng != null ? Number(e.ubicacion_lng) : null,
    estado: e.estado,
    dueno: e.dueno,
    canchas: Number(e.canchas) || 0,
    precio_desde: e.precio_desde != null ? Number(e.precio_desde) : null,
    deportes: Array.isArray(e.deportes) ? e.deportes : [],
  }));
}
