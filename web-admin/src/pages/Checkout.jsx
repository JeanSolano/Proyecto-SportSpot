import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { planById } from '../data/plans';
import { subscribe } from '../data/store';

export default function Checkout() {
  const { planId } = useParams();
  const { owner } = useAuth();
  const navigate = useNavigate();
  const plan = planById(planId);

  const [status, setStatus] = useState('idle'); // idle | paying | done
  const [error, setError] = useState('');

  if (!plan) return <Navigate to="/planes" replace />;

  const pay = async () => {
    setError('');
    setStatus('paying');
    try {
      await subscribe(owner.id, plan.id);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="checkout-wrap">
      <div className="checkout-card card">
        <div className="checkout-head" style={{ background: `linear-gradient(120deg, ${plan.accent}, #1B2880)` }}>
          <img src="/logo-official.png" alt="SportSpot" />
          <span>Suscripción SportSpot</span>
        </div>

        {status === 'done' ? (
          <div className="card-pad checkout-success">
            <div className="success-check">✓</div>
            <h2>¡Pago confirmado!</h2>
            <p className="muted">
              Tu plan <strong>{plan.name}</strong> está activo. Ahora puedes registrar tu establecimiento.
            </p>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/establecimientos/nuevo', { replace: true })}>
              Registrar mi establecimiento →
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => navigate('/panel', { replace: true })}>
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
              <hr className="divider" />
              <div className="checkout-row checkout-total">
                <span>Total hoy</span>
                <strong>${plan.price.toFixed(2)}</strong>
              </div>
            </div>

            {error && <div className="banner-error">{error}</div>}

            <button className="paypal-btn" onClick={pay} disabled={status === 'paying'}>
              {status === 'paying' ? <span className="spinner" /> : <><span className="pp-blue">Pay</span><span className="pp-cyan">Pal</span></>}
            </button>
            <p className="hint" style={{ textAlign: 'center' }}>
              🔐 Entorno <strong>Sandbox</strong> — simulación, sin cobros reales.
            </p>

            <button className="btn btn-ghost btn-block" onClick={() => navigate('/planes')} disabled={status === 'paying'}>
              ← Cambiar de plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
