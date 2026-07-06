// Sesion en memoria: guarda el JWT para que api.ts lo adjunte en cada request.
// Nota: no persiste entre reinicios de la app (suficiente para la demo). Si mas
// adelante se quiere mantener la sesion, se persiste aqui con expo-secure-store.
let authToken: string | null = null;

export const getToken = () => authToken;
export const setToken = (t: string | null) => { authToken = t; };
export const clearToken = () => { authToken = null; };
