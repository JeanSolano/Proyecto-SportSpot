import { useNavigate } from 'react-router-dom';
import { Check, Coins, ShieldCheck } from 'lucide-react';
import PublicNav from '../components/PublicNav.jsx';
import PublicFooter from '../components/PublicFooter.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PLANS } from '../data/plans';

export default function Plans() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const choose = (planId) => {
    const target = `/checkout/${planId}`;
    if (isAuthenticated) navigate(target);
    else navigate('/register', { state: { from: target } });
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
          {PLANS.map((p) => (
            <div key={p.id} className={`plan-card ${p.popular ? 'popular' : ''}`}>
              {p.popular && <span className="plan-tag">Más popular</span>}
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
                className={`btn btn-block ${p.popular ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => choose(p.id)}>
                Elegir {p.name}
              </button>
            </div>
          ))}
        </div>

        <p className="plans-note">
          <ShieldCheck className="lucide" /> El pago se procesa con <strong>&nbsp;PayPal&nbsp;</strong> (entorno <strong>&nbsp;Sandbox&nbsp;</strong> para esta demo, sin cobros reales).
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
