// Tipos compartidos de la capa de datos (forma que devuelve el API REST).

export interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string | null;
  id_rol: number;
  rol: string; // nombre_rol: Cliente | Dueno | ...
}

export interface AuthResponse {
  usuario: Usuario & { nombre_rol?: string };
  token: string;
}
