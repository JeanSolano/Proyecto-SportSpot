import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ClipboardList, Sparkles, LayoutGrid, CalendarDays, Clock } from 'lucide-react';
import { deleteEstablishment, getEstablishment } from '../data/store';
import { amenity, courtType, WEEK_DAYS } from '../data/constants';

const dayLabel = (id) => WEEK_DAYS.find((d) => d.id === id)?.label ?? id;

export default function EstablishmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estab, setEstab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEstablishment(id).then((e) => {
      if (!e) navigate('/panel', { replace: true });
      else setEstab(e);
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este establecimiento? Esta acción no se puede deshacer.')) return;
    await deleteEstablishment(id);
    navigate('/panel', { replace: true });
  };

  if (loading || !estab) {
    return (
      <div className="center-screen">
        <div className="spinner dark" />
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <h2>{estab.name}</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/establecimientos/${id}/editar`)}>
            <Pencil className="lucide" /> Editar
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 className="lucide" /> Eliminar
          </button>
        </div>
      </div>

      <div className="content">
        <span className="back-link" onClick={() => navigate('/panel')}>
          <ArrowLeft className="lucide" /> Volver al dashboard
        </span>

        <div className="card card-pad form-section">
          <div className="form-section-title"><ClipboardList className="lucide" /> Información general</div>
          <p style={{ marginTop: 8 }}>
            <strong>Dueño:</strong> {estab.ownerName}
          </p>
          {estab.description && <p className="muted" style={{ marginTop: 8 }}>{estab.description}</p>}

          {estab.amenities.length > 0 && (
            <>
              <hr className="divider" />
              <div className="form-section-title" style={{ fontSize: 14 }}><Sparkles className="lucide" /> Servicios</div>
              <div className="estab-meta" style={{ marginTop: 10 }}>
                {estab.amenities.map((a) => {
                  const am = amenity(a);
                  return am ? (
                    <span key={a} className="chip active" style={{ cursor: 'default' }}>
                      {am.emoji} {am.label}
                    </span>
                  ) : null;
                })}
              </div>
            </>
          )}
        </div>

        <div className="card card-pad">
          <div className="form-section-title"><LayoutGrid className="lucide" /> Canchas ({estab.courts.length})</div>
          <div className="form-section-sub">Horarios individuales por cancha.</div>

          {estab.courts.map((c, idx) => {
            const ct = courtType(c.type);
            return (
              <div key={c.id} className="court-card">
                <div className="court-head">
                  <span className="court-num">{c.name || `Cancha #${idx + 1}`}</span>
                  <span className="badge" style={{ background: ct.color }}>
                    {ct.emoji} {ct.label}
                  </span>
                </div>
                <p className="tiny muted" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <CalendarDays className="lucide" style={{ width: 14, height: 14 }} />
                  <strong>Días:</strong> {c.days.length ? c.days.map(dayLabel).join(', ') : '—'}
                </p>
                <p className="tiny muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock className="lucide" style={{ width: 14, height: 14 }} />
                  <strong>Horarios:</strong> {c.slots.length ? [...c.slots].sort().join(' · ') : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
