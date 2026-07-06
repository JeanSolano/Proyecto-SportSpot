import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { planById } from '../data/plans';
import { createSubscriptionOrder, captureSubscriptionOrder } from '../data/store';
import { PAYPAL_CLIENT_ID } from '../data/config';

// Carga el SDK de PayPal una sola vez y resuelve con window.paypal.
function loadPayPalSdk() {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (!window.__paypalSdkPromise) {
    window.__paypalSdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
      s.onload = () => resolve(window.paypal);
      s.onerror = () => reject(new Error('No se pudo cargar el SDK de PayPal.'));
      document.body.appendChild(s);
    });
  }
  return window.__paypalSdkPromise;
}

export default function Checkout() {
  const { planId } = useParams();
  const { owner } = useAuth();
  const navigate = useNavigate();
  const plan = planById(planId);

  const [status, setStatus] = useState('loading'); // loading | ready | processing | done | error
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!plan) return;
    let cancelado = false;

    loadPayPalSdk()
      .then((paypal) => {
        if (cancelado || renderedRef.current || !containerRef.current) return;
        renderedRef.current = true;
        paypal
          .Buttons({
            style: { color: 'blue', shape: 'pill', label: 'pay', height: 45 },
            // Paso 1: el backend crea la orden en PayPal (monto recalculado en servidor).
            createOrder: () => createSubscriptionOrder(plan.id),
            // Paso 2: aprobada por el comprador, el backend la captura y activa la suscripcion.
            onApprove: async (data) => {
              setError('');
              setStatus('processing');
              try {
                await captureSubscriptionOrder(data.orderID);
                setStatus('done');
              } catch (err) {
                setError(err.message);
                setStatus('ready');
              }
            },
            onCancel: () => setStatus('ready'),
            onError: (err) => {
              setError(err?.message || 'Ocurrio un error con PayPal.');
              setStatus('ready');
            },
          })
          .render(containerRef.current)
          .then(() => !cancelado && setStatus('ready'))
          .catch(() => !cancelado && setError('No se pudieron cargar los botones de PayPal.'));
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err.message);
          setStatus('error');
        }
      });

    return () => {
      cancelado = true;
    };
  }, [plan]);

  if (!plan) return <Navigate to="/planes" replace />;

  return (
    <div className="checkout-wrap">
      <div className="checkout-card card">
        <div className="checkout-head" style={{ background: `linear-gradient(125deg, ${plan.accent}, #1B2880)` }}>
          <img src="/logo-official.png" alt="SportSpot" />
          <span>Suscripción SportSpot</span>
        </div>

        {status === 'done' ? (
          <div className="card-pad checkout-success">
            <div className="success-check"><Check className="lucide" /></div>
            <h2>¡Pago confirmado!</h2>
            <p className="muted" style={{ margin: '8px 0 22px' }}>
              Tu plan <strong>{plan.name}</strong> está activo. Ahora puedes registrar tu establecimiento.
            </p>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/establecimientos/nuevo', { replace: true })}>
              Registrar mi establecimiento <ArrowRight className="lucide" />
            </button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => navigate('/panel', { replace: true })}>
              Ir a mi panel
            </button>
          </div>
        ) : (
          <div className="card-pad">
            <h2>Confirmar plan {plan.name}</h2>
            <p className="muted" style={{ marginBottom: 18 }}>{plan.tagline}</p>

            <div className="checkout-summary">
              <div className="checkout-row">
                <span>Plan {plan.name} (mensual)</span>
                <strong>${plan.price.toFixed(2)}</strong>
              </div>
              <div className="checkout-row muted tiny">
                <span>Hasta {plan.maxEstablishments} establecimiento{plan.maxEstablishments > 1 ? 's' : ''}</span>
                <span>{plan.commission}% por reserva</span>
              </div>
              <hr className="divider" style={{ margin: '12px 0' }} />
              <div className="checkout-row checkout-total">
                <span>Total hoy</span>
                <strong>${plan.price.toFixed(2)}</strong>
              </div>
            </div>

            {error && <div className="banner-error"><AlertCircle className="lucide" /> {error}</div>}

            {/* Botones oficiales de PayPal (se renderizan aquí cuando carga el SDK). */}
            <div ref={containerRef} style={{ minHeight: 45, marginTop: 4 }} />
            {status === 'loading' && (
              <p className="hint" style={{ textAlign: 'center' }}><span className="spinner" /> Cargando PayPal…</p>
            )}
            {status === 'processing' && (
              <p className="hint" style={{ textAlign: 'center' }}><span className="spinner" /> Procesando tu pago…</p>
            )}

            <p className="hint" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <ShieldCheck className="lucide" style={{ width: 15, height: 15 }} /> Entorno <strong>&nbsp;Sandbox&nbsp;</strong> — simulación, sin cobros reales.
            </p>

            <button className="btn btn-ghost btn-block" onClick={() => navigate('/planes')} disabled={status === 'processing'}>
              ← Cambiar de plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
