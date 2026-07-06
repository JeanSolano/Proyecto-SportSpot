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

// ─── Detalle (perfil del establecimiento) ─────────────────────────────────────
export interface CanchaHorario {
  dia_semana: number; // 0=Dom .. 6=Sab
  hora_inicio: string; // "HH:MM:SS"
  hora_fin: string;
  bloqueado: boolean;
}
export interface Cancha {
  id_cancha: string;
  nombre: string;
  precio_hora: number;
  deporte: string;
  estado: string;
  horarios: CanchaHorario[];
}
export interface Amenidad { id_amenidad: number; nombre: string; icono: string | null; }
export interface HorarioOperacion { dia_semana: number; hora_apertura: string; hora_cierre: string; }

export interface EstablecimientoDetalle {
  id_establecimiento: string;
  nombre: string;
  descripcion: string | null;
  direccion: string;
  ubicacion_lat: number | null;
  ubicacion_lng: number | null;
  telefono: string | null;
  correo: string | null;
  estado: string;
  dueno: string;
  canchas: Cancha[];
  amenidades: Amenidad[];
  horario_operacion: HorarioOperacion[];
}

// GET /api/establecimientos/:id (publico) - detalle con canchas, amenidades y horario.
export async function getEstablecimiento(id: string): Promise<EstablecimientoDetalle> {
  const e = await apiFetch<any>(`/api/establecimientos/${id}`, { auth: false });
  return {
    id_establecimiento: e.id_establecimiento,
    nombre: e.nombre,
    descripcion: e.descripcion,
    direccion: e.direccion,
    ubicacion_lat: e.ubicacion_lat != null ? Number(e.ubicacion_lat) : null,
    ubicacion_lng: e.ubicacion_lng != null ? Number(e.ubicacion_lng) : null,
    telefono: e.telefono ?? null,
    correo: e.correo ?? null,
    estado: e.estado,
    dueno: e.dueno,
    canchas: (e.canchas || []).map((c: any) => ({
      id_cancha: c.id_cancha,
      nombre: c.nombre,
      precio_hora: Number(c.precio_hora),
      deporte: c.deporte,
      estado: c.estado,
      horarios: (c.horarios || []).map((h: any) => ({
        dia_semana: Number(h.dia_semana),
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        bloqueado: !!h.bloqueado,
      })),
    })),
    amenidades: e.amenidades || [],
    horario_operacion: (e.horario_operacion || []).map((h: any) => ({
      dia_semana: Number(h.dia_semana),
      hora_apertura: h.hora_apertura,
      hora_cierre: h.hora_cierre,
    })),
  };
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
