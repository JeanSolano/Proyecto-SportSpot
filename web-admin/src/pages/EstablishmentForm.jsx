import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addEstablishment, getEstablishment, updateEstablishment } from '../data/store';
import { AMENITIES } from '../data/constants';
import CourtScheduleEditor from '../components/CourtScheduleEditor.jsx';

const newCourt = () => ({
  id: Math.random().toString(36).slice(2, 8),
  name: '',
  type: 'futbol',
  days: ['lun', 'mar', 'mie', 'jue', 'vie'],
  slots: [],
});

export default function EstablishmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { owner } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState(owner.name);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [courts, setCourts] = useState([newCourt()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Carga datos al editar.
  useEffect(() => {
    if (!isEdit) return;
    getEstablishment(id).then((e) => {
      if (!e) {
        navigate('/', { replace: true });
        return;
      }
      setName(e.name);
      setOwnerName(e.ownerName);
      setDescription(e.description);
      setAmenities(e.amenities);
      setCourts(e.courts.length ? e.courts : [newCourt()]);
      setLoading(false);
    });
  }, [id, isEdit, navigate]);

  const toggleAmenity = (aId) =>
    setAmenities((prev) => (prev.includes(aId) ? prev.filter((x) => x !== aId) : [...prev, aId]));

  const updateCourt = (idx, court) => setCourts((prev) => prev.map((c, i) => (i === idx ? court : c)));
  const removeCourt = (idx) => setCourts((prev) => prev.filter((_, i) => i !== idx));
  const addCourt = () => setCourts((prev) => [...prev, newCourt()]);

  const validate = () => {
    if (!name.trim()) return 'El nombre del establecimiento es obligatorio.';
    if (!ownerName.trim()) return 'El dueño es obligatorio.';
    if (courts.length === 0) return 'Agrega al menos una cancha.';
    for (let i = 0; i < courts.length; i++) {
      if (courts[i].slots.length === 0) return `La cancha #${i + 1} no tiene franjas horarias seleccionadas.`;
      if (courts[i].days.length === 0) return `La cancha #${i + 1} no tiene días disponibles.`;
    }
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError('');
    setSaving(true);
    const payload = { ownerId: owner.id, ownerName: ownerName.trim(), name: name.trim(), description: description.trim(), amenities, courts };
    try {
      if (isEdit) await updateEstablishment(id, payload);
      else await addEstablishment(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner dark" />
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <h2>{isEdit ? 'Editar establecimiento' : 'Nuevo establecimiento'}</h2>
      </div>

      <div className="content">
        <span className="back-link" onClick={() => navigate(-1)}>
          ← Volver
        </span>

        {error && <div className="banner-error">{error}</div>}

        <form onSubmit={submit}>
          {/* ---------------------------------------------- Datos generales */}
          <div className="card card-pad form-section">
            <div className="form-section-title">📋 Datos del establecimiento</div>
            <div className="form-section-sub">Información general que verán los usuarios.</div>

            <div className="row">
              <div className="field">
                <label>
                  Nombre del establecimiento <span className="req">*</span>
                </label>
                <input className="input" placeholder="Ej. Club Deportivo Albrook" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>
                  Dueño <span className="req">*</span>
                </label>
                <input className="input" placeholder="Nombre del propietario" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                <div className="hint">Se asocia a tu cuenta ({owner.email}).</div>
              </div>
            </div>

            <div className="field">
              <label>Descripción</label>
              <textarea
                className="textarea"
                placeholder="Breve descripción del establecimiento, ubicación, características destacadas…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* ---------------------------------------------- Servicios */}
          <div className="card card-pad form-section">
            <div className="form-section-title">🛎️ Servicios e instalaciones</div>
            <div className="form-section-sub">Marca todo lo que ofrece tu establecimiento.</div>
            <div className="checks">
              {AMENITIES.map((a) => (
                <span key={a.id} className={`chip ${amenities.includes(a.id) ? 'active' : ''}`} onClick={() => toggleAmenity(a.id)}>
                  {a.emoji} {a.label}
                </span>
              ))}
            </div>
          </div>

          {/* ---------------------------------------------- Canchas */}
          <div className="card card-pad form-section">
            <div className="form-section-title">
              🏟️ Canchas para reservar
              <span className="badge" style={{ background: 'var(--navy)' }}>
                {courts.length} {courts.length === 1 ? 'cancha' : 'canchas'}
              </span>
            </div>
            <div className="form-section-sub">
              Cada cancha tiene su tipo, días y franjas horarias individuales disponibles para reserva.
            </div>

            {courts.map((court, idx) => (
              <CourtScheduleEditor
                key={court.id}
                index={idx}
                court={court}
                onChange={(c) => updateCourt(idx, c)}
                onRemove={() => removeCourt(idx)}
              />
            ))}

            <button type="button" className="btn btn-outline btn-block" onClick={addCourt}>
              ➕ Agregar otra cancha
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : isEdit ? 'Guardar cambios' : 'Registrar establecimiento'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
