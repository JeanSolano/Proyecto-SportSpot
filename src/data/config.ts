// Configuracion de la capa de datos del movil.
// La URL del API se puede sobreescribir con EXPO_PUBLIC_API_URL (Expo expone EXPO_PUBLIC_*).
// Por defecto: el emulador de Android usa 10.0.2.2 para llegar al host; el resto usa localhost.
// En un dispositivo fisico (Expo Go) hay que poner la IP LAN del equipo, ej:
//   EXPO_PUBLIC_API_URL=http://192.168.1.50:4000
import { Platform } from 'react-native';

const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_HOST}:4000`;
