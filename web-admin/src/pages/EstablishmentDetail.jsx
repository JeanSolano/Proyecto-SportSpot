import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ClipboardList, Sparkles, LayoutGrid, CalendarDays, Clock, ImagePlus, X } from 'lucide-react';
import { deleteEstablishment, getEstablishment, uploadLogo, removeLogo, addPhoto, removePhoto } from '../data/store';
import { fileToDataUrl } from '../data/image';
import { amenity, courtType, WEEK_DAYS } from '../data/constants';

const dayLabel = (id) => WEEK_DAYS.find((d) => d.id === id)?.label ?? id;

export default function EstablishmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estab, setEstab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [imgErr, setImgErr] = useState('');

  useEffect(() => {
    getEstablishment(id).then((e) => {
      if (!e) navigate('/panel', { replace: true });
      else setEstab(e);
      setLoading(false);
    });
  }, [id, navigate]);

  const onLogo = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    setImgErr(''); setBusy(true);
    try {
      const logo = await uploadLogo(id, await fileToDataUrl(file, 256, 0.85));
      setEstab((s) => ({ ...s, logo }));
    } catch (e) {
      setImgErr(e.message || 'No se pudo subir el logo.');
    } finally { setBusy(false); }
  };

  const onRemoveLogo = async () => {
    setBusy(true);
    try { await removeLogo(id); setEstab((s) => ({ ...s, logo: null })); }
    catch (e) { setImgErr(e.message); }
    finally { setBusy(false); }
  };

  const onPhotos = async (ev) => {
    const files = Array.from(ev.target.files || []);
    ev.target.value = '';
    if (!files.length) return;
    setImgErr(''); setBusy(true);
    try {
      for (const f of files) {
        const p = await addPhoto(id, await fileToDataUrl(f, 1200, 0.8));
        setEstab((s) => ({ ...s, photos: [...(s.photos || []), p] }));
      }
    } catch (e) {
      setImgErr(e.message || 'No se pudo subir la imagen.');
    } finally { setBusy(false); }
  };

  const onRemovePhoto = async (idImg) => {
    setBusy(true);
    try { await removePhoto(id, idImg); setEstab((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== idImg) })); }
    catch (e) { setImgErr(e.message); }
    finally { setBusy(false); }
  };

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

        {/* Logo y fotos */}
        <div className="card card-pad">
          <div className="form-section-title"><ImagePlus className="lucide" /> Logo y fotos</div>
          <div className="form-section-sub">Así se verá tu establecimiento en la app móvil.</div>

          <div className="logo-row">
            <div className="logo-preview">
              {estab.logo ? <img src={estab.logo} alt="Logo" /> : <span className="logo-placeholder">Sin logo</span>}
            </div>
            <div className="logo-actions">
              <label className="btn btn-outline btn-sm">
                <ImagePlus className="lucide" /> {estab.logo ? 'Cambiar logo' : 'Subir logo'}
                <input type="file" accept="image/*" hidden disabled={busy} onChange={onLogo} />
              </label>
              {estab.logo && (
                <button className="btn btn-danger btn-sm" disabled={busy} onClick={onRemoveLogo}>
                  <Trash2 className="lucide" /> Quitar
                </button>
              )}
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <strong style={{ fontSize: 14 }}>Fotos del lugar ({estab.photos?.length || 0})</strong>
            <label className="btn btn-primary btn-sm">
              <ImagePlus className="lucide" /> Agregar fotos
              <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={onPhotos} />
            </label>
          </div>

          {imgErr && <p style={{ color: 'var(--danger)', fontSize: 13.5, fontWeight: 600, margin: '0 0 10px' }}>{imgErr}</p>}
          {busy && <p className="muted tiny" style={{ margin: '0 0 10px' }}>Procesando imagen…</p>}

          {estab.photos?.length ? (
            <div className="photo-grid">
              {estab.photos.map((p) => (
                <div key={p.id} className="photo-thumb">
                  <img src={p.url} alt="Foto del establecimiento" />
                  <button className="photo-del" disabled={busy} onClick={() => onRemovePhoto(p.id)} title="Eliminar foto">
                    <X className="lucide" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted tiny">Aún no hay fotos. Agrega algunas para que se vean en el perfil del establecimiento en la app.</p>
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
