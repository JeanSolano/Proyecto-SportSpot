import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, MapPin, Sparkles, LayoutGrid, Plus, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { addEstablishment, getEstablishment, getEstablishments, getSubscription, updateEstablishment } from '../data/store';
import { planById } from '../data/plans';
import { AMENITIES } from '../data/constants';
import CourtScheduleEditor from '../components/CourtScheduleEditor.jsx';

const newCourt = () => ({
  id: Math.random().toString(36).slice(2, 8),
  name: '',
  type: 'futbol',
  precio: '',
  days: ['lun', 'mar', 'mie', 'jue', 'vie'],
  slots: [],
});

const STEPS = ['Datos', 'Ubicación', 'Servicios', 'Canchas'];

export default function EstablishmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { owner } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState(owner.name);
  const [description, setDescription] = useState('');
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [courts, setCourts] = useState([newCourt()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Paywall: al crear, exige plan activo y dentro del límite.
  useEffect(() => {
    if (isEdit) return;
    Promise.all([getSubscription(owner.id), getEstablishments(owner.id)]).then(([sub, list]) => {
      const plan = sub?.status === 'active' ? planById(sub.planId) : null;
      if (!plan) {
        window.alert('Necesitas un plan activo para publicar establecimientos. Elige uno para continuar.');
        navigate('/planes', { replace: true });
        return;
      }
      if (list.length >= plan.maxEstablishments) {
        window.alert(`Has alcanzado el límite de tu plan ${plan.name} (${plan.maxEstablishments}). Mejora tu plan para agregar más.`);
        navigate('/suscripcion', { replace: true });
      }
    });
  }, [isEdit, owner.id, navigate]);

  // Carga datos al editar.
  useEffect(() => {
    if (!isEdit) return;
    getEstablishment(id).then((e) => {
      if (!e) {
        navigate('/panel', { replace: true });
        return;
      }
      setName(e.name);
      setOwnerName(e.ownerName);
      setDescription(e.description);
      setDireccion(e.direccion || '');
      setLat(e.lat ?? '');
      setLng(e.lng ?? '');
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
    if (!direccion.trim()) return 'La dirección es obligatoria.';
    const nlat = Number(lat);
    const nlng = Number(lng);
    if (lat === '' || Number.isNaN(nlat) || nlat < -90 || nlat > 90)
      return 'La latitud debe ser un número entre -90 y 90 (ej. 8.9936).';
    if (lng === '' || Number.isNaN(nlng) || nlng < -180 || nlng > 180)
      return 'La longitud debe ser un número entre -180 y 180 (ej. -79.5498).';
    if (courts.length === 0) return 'Agrega al menos una cancha.';
    for (let i = 0; i < courts.length; i++) {
      if (!(Number(courts[i].precio) > 0)) return `La cancha #${i + 1} necesita un precio por hora válido.`;
      if (courts[i].days.length === 0) return `La cancha #${i + 1} no tiene días disponibles.`;
      if (courts[i].slots.length === 0) return `La cancha #${i + 1} no tiene franjas horarias seleccionadas.`;
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
    const payload = {
      ownerId: owner.id,
      ownerName: ownerName.trim(),
      name: name.trim(),
      description: description.trim(),
      direccion: direccion.trim(),
      lat,
      lng,
      amenities,
      courts,
    };
    try {
      if (isEdit) await updateEstablishment(id, payload);
      else await addEstablishment(payload);
      navigate('/panel', { replace: true });
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
          <ArrowLeft className="lucide" /> Volver
        </span>

        {/* Encabezado del proceso */}
        <div className="form-hero card">
          <div className="form-hero-main">
            <div className="icon-badge blue"><Building2 className="lucide" /></div>
            <div>
              <h3>{isEdit ? 'Actualiza tu establecimiento' : 'Publica tu establecimiento en SportSpot'}</h3>
              <p>Completa cada sección para que los deportistas te encuentren y reserven.</p>
            </div>
          </div>
          <div className="form-steps">
            {STEPS.map((s, i) => (
              <div key={s} className="form-step">
                <span className="form-step-n">{i + 1}</span> {s}
              </div>
            ))}
          </div>
        </div>

        {error && <div className="banner-error"><AlertCircle className="lucide" /> {error}</div>}

        <form onSubmit={submit}>
          {/* ---------------------------------------------- Datos generales */}
          <div className="card card-pad form-section">
            <div className="form-section-title"><ClipboardList className="lucide" /> 1 · Datos del establecimiento</div>
            <div className="form-section-sub">Información general que verán los usuarios.</div>

            <div className="row">
              <div className="field">
                <label>Nombre del establecimiento <span className="req">*</span></label>
                <input className="input" placeholder="Ej. Club Deportivo Albrook" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Dueño <span className="req">*</span></label>
                <input className="input" placeholder="Nombre del propietario" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                <div className="hint">Se asocia a tu cuenta ({owner.email}).</div>
              </div>
            </div>

            <div className="field">
              <label>Descripción</label>
              <textarea
                className="textarea"
                placeholder="Breve descripción del establecimiento, características destacadas…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* ---------------------------------------------- Ubicación */}
          <div className="card card-pad form-section">
            <div className="form-section-title"><MapPin className="lucide" /> 2 · Ubicación</div>
            <div className="form-section-sub">Dónde queda tu establecimiento — aparecerá en el mapa de la app.</div>

            <div className="field">
              <label>Dirección <span className="req">*</span></label>
              <input className="input" placeholder="Ej. Albrook, Ciudad de Panamá" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
            <div className="row">
              <div className="field">
                <label>Latitud <span className="req">*</span></label>
                <input className="input" type="number" step="any" placeholder="8.9936" value={lat} onChange={(e) => setLat(e.target.value)} />
                <div className="hint">Coordenada para el mapa.</div>
              </div>
              <div className="field">
                <label>Longitud <span className="req">*</span></label>
                <input className="input" type="number" step="any" placeholder="-79.5498" value={lng} onChange={(e) => setLng(e.target.value)} />
                <div className="hint">Cópiala desde Google Maps (clic derecho → coordenadas).</div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------- Servicios */}
          <div className="card card-pad form-section">
            <div className="form-section-title"><Sparkles className="lucide" /> 3 · Servicios e instalaciones</div>
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
              <LayoutGrid className="lucide" /> 4 · Canchas para reservar
              <span className="badge" style={{ background: 'var(--navy)' }}>
                {courts.length} {courts.length === 1 ? 'cancha' : 'canchas'}
              </span>
            </div>
            <div className="form-section-sub">
              Cada cancha tiene su tipo, precio por hora, días y franjas horarias individuales.
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
              <Plus className="lucide" /> Agregar otra cancha
            </button>
          </div>

          <div className="form-footer">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <span className="spinner" /> : isEdit ? 'Guardar cambios' : '🚀 Publicar establecimiento'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
