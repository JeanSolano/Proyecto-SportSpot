// Autenticacion del deportista contra el API (rol Cliente).
import { apiFetch } from './api';
import { setToken, clearToken } from './session';
import type { AuthResponse, Usuario } from './types';

const normalizar = (r: AuthResponse): Usuario => ({
  id_usuario: r.usuario.id_usuario,
  nombre: r.usuario.nombre,
  correo: r.usuario.correo,
  telefono: r.usuario.telefono,
  id_rol: r.usuario.id_rol,
  rol: r.usuario.rol || r.usuario.nombre_rol || 'Cliente',
});

export async function registrar(input: {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
}): Promise<Usuario> {
  const data = await apiFetch<AuthResponse>('/api/auth/registro', {
    method: 'POST',
    auth: false,
    body: { ...input, rol: 'cliente' },
  });
  setToken(data.token);
  return normalizar(data);
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<Usuario> {
  const data = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { correo, contrasena },
  });
  setToken(data.token);
  return normalizar(data);
}

export function cerrarSesion() {
  clearToken();
}
