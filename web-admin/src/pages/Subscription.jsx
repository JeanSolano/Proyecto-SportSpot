import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Building2, Coins, CalendarClock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
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
            <span className="icon-badge orange"><CreditCard className="lucide" /></span>
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
                <span className="cat" style={{ color: plan.accent }}>PLAN ACTUAL</span>
                <h2 style={{ margin: '4px 0' }}>{plan.name}</h2>
                <p className="muted">${plan.price.toFixed(2)}/mes · {plan.commission}% de comisión por reserva</p>
              </div>
              <span className="badge" style={{ background: 'var(--primary)' }}>● Activo</span>
            </div>

            <div className="stat-grid" style={{ marginTop: 20 }}>
              <StatCard icon={Building2} color="blue" tnum value={`${count}/${plan.maxEstablishments}`} label="Establecimientos usados" />
              <StatCard icon={Coins} color="orange" value={`${plan.commission}%`} label="Comisión por reserva" />
              <StatCard icon={CalendarClock} color="navy" valueStyle={{ fontSize: 17 }} value={fmtDate(sub.renewsAt)} label="Próxima renovación" />
            </div>

            <div className="card card-pad" style={{ marginTop: 20 }}>
              <h3>Método de pago</h3>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '10px 0 16px' }}>
                <ShieldCheck className="lucide" style={{ width: 17, height: 17 }} />
                PayPal <strong>&nbsp;Sandbox&nbsp;</strong> (entorno de prueba, sin cobros reales).
              </p>
              <button className="btn btn-outline" onClick={() => navigate('/planes')}>Cambiar de plan</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
