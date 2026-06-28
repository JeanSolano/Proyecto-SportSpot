import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getEstablishments, getSubscription } from '../data/store';
import { planById } from '../data/plans';
import { amenity, courtType } from '../data/constants';

export default function Dashboard() {
  const { owner } = useAuth();
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState([]);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEstablishments(owner.id), getSubscription(owner.id)]).then(([e, s]) => {
      setEstablishments(e);
      setSub(s);
      setLoading(false);
    });
  }, [owner.id]);

  const plan = sub?.status === 'active' ? planById(sub.planId) : null;
  const atLimit = plan && establishments.length >= plan.maxEstablishments;
  const totalCourts = establishments.reduce((sum, e) => sum + e.courts.length, 0);

  const handleNew = () => {
    if (!plan) {
      navigate('/planes');
      return;
    }
    if (atLimit) {
      window.alert(`Has alcanzado el límite de tu plan ${plan.name} (${plan.maxEstablishments}). Mejora tu plan para agregar más.`);
      navigate('/suscripcion');
      return;
    }
    navigate('/establecimientos/nuevo');
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Dashboard</h2>
          <span className="muted tiny">Hola, {owner.name} 👋</span>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>➕ Nuevo establecimiento</button>
      </div>

      <div className="content">
        {/* Estado de suscripción */}
        {!loading && !plan && (
          <div className="card card-pad sub-banner">
            <div>
              <h3>Elige un plan para publicar 🚀</h3>
              <p className="muted">Necesitas una suscripción activa para registrar y publicar tus establecimientos.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/planes')}>Ver planes</button>
          </div>
        )}
        {!loading && plan && (
          <div className="card card-pad sub-banner" style={{ borderLeft: `4px solid ${plan.accent}` }}>
            <div>
              <h3>Plan {plan.name} · <span style={{ color: 'var(--primary)' }}>activo</span></h3>
              <p className="muted">
                {establishments.length} de {plan.maxEstablishments} establecimientos · {plan.commission}% de comisión por reserva
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/suscripcion')}>Gestionar</button>
          </div>
        )}

        <div className="stat-grid">
          <div className="card stat-card">
            <div className="stat-value">{establishments.length}</div>
            <div className="stat-label">Establecimientos</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{totalCourts}</div>
            <div className="stat-label">Canchas registradas</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{plan ? `${plan.commission}%` : '—'}</div>
            <div className="stat-label">Comisión por reserva</div>
          </div>
        </div>

        <div className="page-head">
          <h3>Mis establecimientos</h3>
        </div>

        {loading ? (
          <div className="center-screen" style={{ minHeight: 200 }}>
            <div className="spinner dark" />
          </div>
        ) : establishments.length === 0 ? (
          <div className="card card-pad empty-state">
            <span className="emoji">🏟️</span>
            <h3>Aún no tienes establecimientos</h3>
            <p className="muted" style={{ margin: '8px 0 20px' }}>
              {plan ? 'Registra tu primer establecimiento para empezar a recibir reservas.' : 'Elige un plan para empezar a publicar.'}
            </p>
            <button className="btn btn-primary" onClick={handleNew}>
              {plan ? '➕ Registrar establecimiento' : '💳 Ver planes'}
            </button>
          </div>
        ) : (
          <div className="estab-grid">
            {establishments.map((e) => (
              <div key={e.id} className="card estab-card" onClick={() => navigate(`/establecimientos/${e.id}`)}>
                <h3>{e.name}</h3>
                <span className="muted tiny">👤 {e.ownerName}</span>
                <div className="estab-meta">
                  {[...new Set(e.courts.map((c) => c.type))].map((t) => {
                    const ct = courtType(t);
                    return (
                      <span key={t} className="badge" style={{ background: ct.color }}>
                        {ct.emoji} {ct.label}
                      </span>
                    );
                  })}
                </div>
                <div className="estab-amenities">
                  🏟️ {e.courts.length} {e.courts.length === 1 ? 'cancha' : 'canchas'}
                  {e.amenities.slice(0, 3).map((a) => {
                    const am = amenity(a);
                    return am ? <span key={a}>· {am.emoji} {am.label}</span> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
