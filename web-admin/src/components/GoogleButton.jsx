import { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../data/config';

// Carga el SDK de Google Identity Services una sola vez.
let gisPromise;
function cargarGis() {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(s);
  });
  return gisPromise;
}

/**
 * Botón oficial "Iniciar con Google". Al autenticar, llama a onCredential(idToken).
 */
export default function GoogleButton({ onCredential, text = 'signin_with' }) {
  const ref = useRef(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;

  useEffect(() => {
    let cancelado = false;
    cargarGis()
      .then(() => {
        if (cancelado || !window.google || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => cb.current(resp.credential),
        });
        ref.current.innerHTML = '';
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          width: 320,
          logo_alignment: 'center',
        });
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [text]);

  return <div ref={ref} className="gbtn" />;
}
