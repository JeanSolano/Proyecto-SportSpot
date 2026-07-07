import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Coins, ShieldCheck } from 'lucide-react';
import PublicNav from '../components/PublicNav.jsx';
import PublicFooter from '../components/PublicFooter.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getSubscription } from '../data/store';
import { PLANS } from '../data/plans';

export default function Plans() {
  const { isAuthenticated, owner } = useAuth();
  const navigate = useNavigate();
  const [currentPlanId, setCurrentPlanId] = useState(null);

  // Si el admin ya inició sesión, resaltamos su plan actual.
  useEffect(() => {
    if (!isAuthenticated) return;
    getSubscription(owner?.id)
      .then((s) => setCurrentPlanId(s?.status === 'active' ? s.planId : null))
      .catch(() => {});
  }, [isAuthenticated, owner?.id]);

  const choose = (planId) => {
    const checkout = `/checkout/${planId}`;
    if (isAuthenticated) {
      navigate(checkout); // mismo tab: el admin cambia/mejora su plan
    } else {
      window.open(`/register?next=${encodeURIComponent(checkout)}`, '_blank', 'noopener');
    }
  };

  return (
    <div className="public">
      <PublicNav />

      <section className="section section-top">
        <h2 className="section-title">Elige el plan para tu negocio</h2>
        <p className="section-sub">
          Modelo híbrido: una cuota mensual fija + una pequeña comisión por cada reserva pagada.
          Cancela cuando quieras.
        </p>

        <div className="plans">
          {PLANS.map((p) => {
            const isCurrent = p.id === currentPlanId;
            return (
              <div key={p.id} className={`plan-card ${p.popular ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}>
                {isCurrent ? <span className="plan-tag current-tag">Tu plan actual</span> : p.popular && <span className="plan-tag">Más popular</span>}
                <h3 style={{ color: p.accent }}>{p.name}</h3>
                <div className="plan-price tnum">
                  ${p.price}<span>/mes</span>
                </div>
                <p className="plan-tagline">{p.tagline}</p>
                <ul className="plan-features">
                  {p.features.map((f) => (
                    <li key={f}><Check className="lucide" /> {f}</li>
                  ))}
                  <li className="plan-commission"><Coins className="lucide" /> {p.commission}% de comisión por reserva</li>
                </ul>
                <button
                  className={`btn btn-block ${isCurrent ? 'btn-outline' : p.popular ? 'btn-primary' : 'btn-outline'}`}
                  disabled={isCurrent}
                  onClick={() => choose(p.id)}>
                  {isCurrent ? 'Plan activo' : isAuthenticated ? `Cambiar a ${p.name}` : `Elegir ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="plans-note">
          <ShieldCheck className="lucide" /> El pago se procesa con <strong>&nbsp;PayPal&nbsp;</strong> (entorno <strong>&nbsp;Sandbox&nbsp;</strong> para esta demo, sin cobros reales).
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
