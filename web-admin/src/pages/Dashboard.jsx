import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getEstablishments } from '../data/store';
import { amenity, courtType } from '../data/constants';

export default function Dashboard() {
  const { owner } = useAuth();
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEstablishments(owner.id).then((data) => {
      setEstablishments(data);
      setLoading(false);
    });
  }, [owner.id]);

  const totalCourts = establishments.reduce((sum, e) => sum + e.courts.length, 0);
  const totalSlots = establishments.reduce(
    (sum, e) => sum + e.courts.reduce((s, c) => s + c.slots.length * c.days.length, 0),
    0,
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Dashboard</h2>
          <span className="muted tiny">Hola, {owner.name} 👋</span>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/establecimientos/nuevo')}>
          ➕ Nuevo establecimiento
        </button>
      </div>

      <div className="content">
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
            <div className="stat-value">{totalSlots}</div>
            <div className="stat-label">Cupos semanales disponibles</div>
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
              Registra tu primer establecimiento para empezar a recibir reservas.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/establecimientos/nuevo')}>
              ➕ Registrar establecimiento
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
