import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getEstablishments, getSubscription } from '../data/store';
import { planById } from '../data/plans';

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' }) : '—');

export default function Subscription() {
  const { owner } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSubscription(owner.id), getEstablishments(owner.id)]).then(([s, e]) => {
      setSub(s);
      setCount(e.length);
      setLoading(false);
    });
  }, [owner.id]);

  const plan = sub ? planById(sub.planId) : null;
  const active = sub?.status === 'active';

  return (
    <>
      <div className="topbar">
        <h2>Suscripción y facturación</h2>
      </div>

      <div className="content">
        {loading ? (
          <div className="center-screen" style={{ minHeight: 200 }}><div className="spinner dark" /></div>
        ) : !active ? (
          <div className="card card-pad empty-state">
            <span className="emoji">💳</span>
            <h3>No tienes un plan activo</h3>
            <p className="muted" style={{ margin: '8px 0 20px' }}>
              Elige un plan para poder publicar tus establecimientos.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/planes')}>Ver planes</button>
          </div>
        ) : (
          <>
            <div className="card card-pad sub-hero" style={{ borderTop: `4px solid ${plan.accent}` }}>
              <div>
                <span className="cat" style={{ color: plan.accent, fontSize: 13, fontWeight: 700 }}>PLAN ACTUAL</span>
                <h2 style={{ margin: '4px 0' }}>{plan.name}</h2>
                <p className="muted">${plan.price.toFixed(2)}/mes · {plan.commission}% de comisión por reserva</p>
              </div>
              <span className="badge" style={{ background: 'var(--primary)' }}>● Activo</span>
            </div>

            <div className="stat-grid" style={{ marginTop: 20 }}>
              <div className="card stat-card">
                <div className="stat-value">{count}/{plan.maxEstablishments}</div>
                <div className="stat-label">Establecimientos usados</div>
              </div>
              <div className="card stat-card">
                <div className="stat-value">{plan.commission}%</div>
                <div className="stat-label">Comisión por reserva</div>
              </div>
              <div className="card stat-card">
                <div className="stat-value" style={{ fontSize: 18 }}>{fmtDate(sub.renewsAt)}</div>
                <div className="stat-label">Próxima renovación</div>
              </div>
            </div>

            <div className="card card-pad" style={{ marginTop: 20 }}>
              <h3>Método de pago</h3>
              <p className="muted" style={{ margin: '8px 0 16px' }}>
                🔐 PayPal <strong>Sandbox</strong> (entorno de prueba, sin cobros reales).
              </p>
              <button className="btn btn-outline" onClick={() => navigate('/planes')}>Cambiar de plan</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
