// Configuracion de la capa de datos del movil: resuelve la URL del API.
//
// Prioridad:
//   1. EXPO_PUBLIC_API_URL (si la defines en .env, manda sobre todo).
//   2. IP del servidor de Expo (Metro): funciona en cualquier celular/red sin
//      editar nada, porque Expo Go ya se conecta a esa misma IP.
//   3. Fallback por plataforma (emulador Android: 10.0.2.2; resto: localhost).
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PORT = 4000;

// hostUri suele venir como "192.168.1.32:8081"; tomamos solo el host.
function hostDeExpo(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    '';
  const host = String(hostUri).split(':')[0];
  return host || null;
}

function urlPorDefecto(): string {
  const host = hostDeExpo();
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:${PORT}`;
  }
  const fallback = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallback}:${PORT}`;
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? urlPorDefecto();
