// Configuracion publica del frontend.
// El Client ID de Google es un dato PUBLICO (va en el navegador); el secret NO.
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '136692436903-bucoeq541jchfqun7qtvpiv9jtf777qj.apps.googleusercontent.com';

// Client ID de PayPal (dato PUBLICO; el Secret vive solo en el backend).
// 'sb' es el sandbox generico de PayPal: renderiza los botones para probar la UI
// aunque aun no tengas tu propia app. Para cobrar de verdad en Sandbox usa tu Client ID.
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
