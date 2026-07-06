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

  // Timeout para no dejar la UI colgada si el dispositivo no alcanza el API.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const abortada = err instanceof Error && err.name === 'AbortError';
    throw new Error(
      abortada
        ? `El servidor no respondio (${API_URL}). Si usas un dispositivo fisico, define EXPO_PUBLIC_API_URL con la IP de tu PC.`
        : `No se pudo conectar con el servidor (${API_URL}). Verifica que el API este corriendo.`,
    );
  } finally {
    clearTimeout(timeout);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || 'Error del servidor');
  return data as T;
}
