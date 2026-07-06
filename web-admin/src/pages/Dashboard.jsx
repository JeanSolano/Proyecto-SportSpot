import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, LayoutGrid, Coins, Rocket, CreditCard, CalendarClock, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import { getEstablishments, getSubscription, getAgendaHoy } from '../data/store';
import { planById } from '../data/plans';
import { amenity, courtType } from '../data/constants';

export default function Dashboard() {
  const { owner } = useAuth();
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState([]);
  const [sub, setSub] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEstablishments(owner.id),
      getSubscription(owner.id),
      getAgendaHoy().catch(() => []),
    ]).then(([e, s, a]) => {
      setEstablishments(e);
      setSub(s);
      setAgenda(a);
      setLoading(false);
    });
  }, [owner.id]);

  const plan = sub?.status === 'active' ? planById(sub.planId) : null;
  const atLimit = plan && establishments.length >= plan.maxEstablishments;
  const totalCourts = establishments.reduce((sum, e) => sum + e.courts.length, 0);
  const ingresosHoy = agenda
    .filter((r) => r.status !== 'cancelada')
    .reduce((sum, r) => sum + r.total, 0);
  const hoyLabel = new Date().toLocaleDateString('es-PA', { weekday: 'long', day: '2-digit', month: 'long' });

  const handleNew = () => {
    if (!plan) {
      window.alert('Necesitas un plan activo para publicar establecimientos. Elige uno para continuar.');
      return navigate('/planes');
    }
    if (atLimit) {
      window.alert(`Has alcanzado el límite de tu plan ${plan.name} (${plan.maxEstablishments}). Mejora tu plan para agregar más.`);
      return navigate('/suscripcion');
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
        <button className="btn btn-primary" onClick={handleNew}>
          <Plus className="lucide" /> Nuevo establecimiento
        </button>
      </div>

      <div className="content">
        {/* Estado de suscripción */}
        {!loading && !plan && (
          <div className="card sub-banner">
            <span className="icon-badge orange"><Rocket className="lucide" /></span>
            <div className="sub-banner-text">
              <h3>Elige un plan para publicar</h3>
              <p className="muted">Necesitas una suscripción activa para registrar y publicar tus establecimientos.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/planes')}>Ver planes</button>
          </div>
        )}
        {!loading && plan && (
          <div className="card sub-banner" style={{ boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${plan.accent}` }}>
            <span className="icon-badge green"><CreditCard className="lucide" /></span>
            <div className="sub-banner-text">
              <h3>Plan {plan.name} · <span style={{ color: 'var(--primary-dark)' }}>activo</span></h3>
              <p className="muted">{establishments.length} de {plan.maxEstablishments} establecimientos · {plan.commission}% de comisión por reserva</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/suscripcion')}>Gestionar</button>
          </div>
        )}

        <div className="stat-grid">
          <StatCard icon={CalendarClock} color="navy" value={agenda.length} label="Reservas hoy" />
          <StatCard icon={Coins} color="green" tnum value={`$${ingresosHoy.toFixed(2)}`} label="Ingresos de hoy" />
          <StatCard icon={Building2} color="blue" value={establishments.length} label="Establecimientos" />
          <StatCard icon={LayoutGrid} color="orange" value={totalCourts} label="Canchas registradas" />
        </div>

        {/* Agenda del día: reservas hechas desde la app móvil */}
        <div className="card card-pad" style={{ marginBottom: 26 }}>
          <div className="page-head" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Agenda de hoy</h3>
              <span className="muted tiny" style={{ textTransform: 'capitalize' }}>{hoyLabel}</span>
            </div>
            <span className="badge" style={{ background: 'var(--secondary)' }}>
              {agenda.length} {agenda.length === 1 ? 'reserva' : 'reservas'}
            </span>
          </div>

          {loading ? (
            <p className="muted">Cargando…</p>
          ) : agenda.length === 0 ? (
            <div className="agenda-empty">
              <CalendarClock className="lucide" />
              <div>
                <strong>Sin reservas para hoy</strong>
                <p className="muted tiny">Las reservas hechas desde la app móvil aparecerán aquí.</p>
              </div>
            </div>
          ) : (
            <div className="agenda-list">
              {agenda.map((r) => (
                <div key={r.id} className="agenda-row">
                  <div className="agenda-time">
                    <Clock className="lucide" />
                    <span>{r.start}<span className="muted tiny"> – {r.end}</span></span>
                  </div>
                  <div className="agenda-main">
                    <strong>{r.client}</strong>
                    <span className="muted tiny">{r.court} · {r.establishment}</span>
                  </div>
                  <span className="badge" style={{ background: 'var(--secondary)' }}>{r.sport}</span>
                  <div className="agenda-right">
                    <strong className="tnum">${r.total.toFixed(2)}</strong>
                    <span className={`status-chip ${r.status}`}>{r.statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <span className="icon-badge navy"><Building2 className="lucide" /></span>
            <h3>Aún no tienes establecimientos</h3>
            <p className="muted" style={{ margin: '8px 0 20px' }}>
              {plan ? 'Registra tu primer establecimiento para empezar a recibir reservas.' : 'Elige un plan para empezar a publicar.'}
            </p>
            <button className="btn btn-primary" onClick={handleNew}>
              {plan ? <><Plus className="lucide" /> Registrar establecimiento</> : <><CreditCard className="lucide" /> Ver planes</>}
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
                  <Building2 className="lucide" style={{ width: 15, height: 15 }} />
                  {e.courts.length} {e.courts.length === 1 ? 'cancha' : 'canchas'}
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
