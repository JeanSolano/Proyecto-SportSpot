import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Pencil, Rocket, ArrowUpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getEstablishments, getSubscription } from '../data/store';
import { PLANS, planById } from '../data/plans';
import { amenity, courtType } from '../data/constants';

export default function Establishments() {
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
  const used = establishments.length;
  const atLimit = plan && used >= plan.maxEstablishments;
  const canCreate = plan && !atLimit;
  const nextPlan = PLANS.find((p) => p.maxEstablishments > (plan?.maxEstablishments || 0));

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Establecimientos</h2>
          <span className="muted tiny">Gestiona tus sedes, canchas y horarios</span>
        </div>
        {canCreate ? (
          <button className="btn btn-primary" onClick={() => navigate('/establecimientos/nuevo')}>
            <Plus className="lucide" /> Nuevo establecimiento
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/planes')}>
            <ArrowUpCircle className="lucide" /> {plan ? 'Mejorar plan' : 'Elegir plan'}
          </button>
        )}
      </div>

      <div className="content">
        {/* Estado del plan */}
        {!loading && !plan && (
          <div className="plan-callout no-plan">
            <span className="icon-badge orange"><Rocket className="lucide" /></span>
            <div className="plan-callout-text">
              <h3>Activa un plan para publicar</h3>
              <p className="muted">Necesitas una suscripción activa para registrar y publicar tus establecimientos.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/planes')}>Ver planes</button>
          </div>
        )}

        {!loading && atLimit && (
          <div className="plan-callout at-limit">
            <span className="icon-badge navy"><Sparkles className="lucide" /></span>
            <div className="plan-callout-text">
              <h3>Alcanzaste el límite de tu plan {plan.name}</h3>
              <p className="muted">
                Estás usando <strong>{used} de {plan.maxEstablishments}</strong> establecimientos.
                {nextPlan
                  ? <> Mejora a <strong>{nextPlan.name}</strong> para publicar hasta <strong>{nextPlan.maxEstablishments}</strong> y bajar la comisión a <strong>{nextPlan.commission}%</strong>.</>
                  : ' Ya tienes el plan más alto.'}
              </p>
            </div>
            {nextPlan && (
              <button className="btn btn-primary" onClick={() => navigate(`/checkout/${nextPlan.id}`)}>
                <ArrowUpCircle className="lucide" /> Mejorar a {nextPlan.name}
              </button>
            )}
          </div>
        )}

        {!loading && canCreate && (
          <div className="plan-usage">
            <CheckCircle2 className="lucide" style={{ color: 'var(--primary)' }} />
            <span>
              Plan <strong>{plan.name}</strong> · usando <strong className="tnum">{used} de {plan.maxEstablishments}</strong> establecimientos
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/suscripcion')}>Gestionar plan</button>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="center-screen" style={{ minHeight: 200 }}><div className="spinner dark" /></div>
        ) : establishments.length === 0 ? (
          <div className="card card-pad empty-state">
            <span className="icon-badge navy"><Building2 className="lucide" /></span>
            <h3>Aún no tienes establecimientos</h3>
            <p className="muted" style={{ margin: '8px 0 20px' }}>
              {plan ? 'Registra tu primer establecimiento para empezar a recibir reservas.' : 'Elige un plan para empezar a publicar.'}
            </p>
            <button className="btn btn-primary" onClick={() => navigate(plan ? '/establecimientos/nuevo' : '/planes')}>
              {plan ? <><Plus className="lucide" /> Registrar establecimiento</> : <>Ver planes</>}
            </button>
          </div>
        ) : (
          <div className="estab-grid">
            {establishments.map((e) => (
              <div key={e.id} className="card estab-card" onClick={() => navigate(`/establecimientos/${e.id}`)}>
                <div className="estab-card-head">
                  <h3>{e.name}</h3>
                  <button
                    className="btn btn-outline btn-sm estab-edit"
                    onClick={(ev) => { ev.stopPropagation(); navigate(`/establecimientos/${e.id}/editar`); }}
                    title="Editar establecimiento">
                    <Pencil className="lucide" /> Editar
                  </button>
                </div>
                <span className="muted tiny">{e.direccion || e.ownerName}</span>
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
