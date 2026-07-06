// Reservas contra el API. El total y la disponibilidad se validan en el servidor.
import { apiFetch } from './api';

export interface Reserva {
  id_reserva: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  precio_total: number;
  estado: string;
}

// POST /api/reservas (token). fecha_reserva "YYYY-MM-DD", horas "HH:MM".
export async function crearReserva(input: {
  id_cancha: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
}): Promise<Reserva> {
  const r = await apiFetch<any>('/api/reservas', { method: 'POST', body: input });
  return { ...r, precio_total: Number(r.precio_total) };
}
