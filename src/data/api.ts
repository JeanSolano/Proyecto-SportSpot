// Cliente HTTP del API REST de SportSpot para el movil.
// Adjunta el JWT de la sesion (salvo auth:false) y lanza Error con el mensaje del backend.
import { API_URL } from './config';
import { getToken } from './session';

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T = any>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`No se pudo conectar con el servidor (${API_URL}). Verifica que el API este corriendo.`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || 'Error del servidor');
  return data as T;
}
