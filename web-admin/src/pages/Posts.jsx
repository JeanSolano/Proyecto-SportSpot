import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Plus, Pencil, Trash2, ImagePlus, X, CalendarClock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getEstablishments, getMyPosts, createPost, updatePost, deletePost } from '../data/store';
import { fileToDataUrl } from '../data/image';

const TIPO_LABEL = { publicacion: 'Publicación', evento: 'Evento', promocion: 'Promoción' };
const TIPO_COLOR = { publicacion: 'var(--secondary)', evento: 'var(--navy)', promocion: 'var(--accent)' };
const fmtEvent = (iso) => (iso ? new Date(iso).toLocaleString('es-PA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

const emptyForm = { id: null, establishmentId: '', type: 'publicacion', title: '', description: '', image: null, eventDate: '' };

export default function Posts() {
  const { owner } = useAuth();
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => Promise.all([getEstablishments(owner.id), getMyPosts()]).then(([e, p]) => {
    setEstablishments(e);
    setPosts(p);
    setLoading(false);
  });

  useEffect(() => { load(); }, [owner.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const estName = useMemo(() => Object.fromEntries(establishments.map((e) => [e.id, e.name])), [establishments]);
  const setF = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const openNew = () => { setForm({ ...emptyForm, establishmentId: establishments[0]?.id || '' }); setErr(''); setOpen(true); };
  const openEdit = (p) => {
    setForm({ id: p.id, establishmentId: p.establishmentId, type: p.type, title: p.title, description: p.description, image: p.image, eventDate: p.eventDate ? p.eventDate.slice(0, 16) : '' });
    setErr(''); setOpen(true);
  };

  const onImage = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    setBusy(true); setErr('');
    try { setForm((s) => ({ ...s, image: null })); const url = await fileToDataUrl(file, 1200, 0.8); setForm((s) => ({ ...s, image: url })); }
    catch { setErr('No se pudo procesar la imagen.'); }
    finally { setBusy(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.establishmentId) return setErr('Elige un establecimiento.');
    if (!form.title.trim()) return setErr('El título es obligatorio.');
    setBusy(true);
    try {
      const payload = {
        establishmentId: form.establishmentId,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image,
        eventDate: form.type === 'evento' && form.eventDate ? form.eventDate : null,
      };
      if (form.id) await updatePost(form.id, payload);
      else await createPost(payload);
      setOpen(false);
      await load();
    } catch (e2) {
      setErr(e2.message || 'No se pudo guardar.');
    } finally { setBusy(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`¿Eliminar la publicación "${p.title}"?`)) return;
    await deletePost(p.id);
    setPosts((s) => s.filter((x) => x.id !== p.id));
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Publicaciones</h2>
          <span className="muted tiny">Promociones y eventos que verán los deportistas en el feed</span>
        </div>
        {establishments.length > 0 && (
          <button className="btn btn-primary" onClick={openNew}><Plus className="lucide" /> Nueva publicación</button>
        )}
      </div>

      <div className="content">
        {loading ? (
          <div className="center-screen" style={{ minHeight: 200 }}><div className="spinner dark" /></div>
        ) : establishments.length === 0 ? (
          <div className="card card-pad empty-state">
            <span className="icon-badge navy"><Megaphone className="lucide" /></span>
            <h3>Primero registra un establecimiento</h3>
            <p className="muted" style={{ margin: '8px 0 20px' }}>Las publicaciones se asocian a un establecimiento.</p>
            <button className="btn btn-primary" onClick={() => navigate('/establecimientos')}>Ir a Establecimientos</button>
          </div>
        ) : (
          <>
            {/* Composer */}
            {open && (
              <form className="card card-pad post-composer" onSubmit={save}>
                <div className="form-section-title"><Megaphone className="lucide" /> {form.id ? 'Editar publicación' : 'Nueva publicación'}</div>

                <div className="post-form-grid">
                  <div className="field">
                    <label>Establecimiento</label>
                    <select className="input" value={form.establishmentId} onChange={setF('establishmentId')} disabled={!!form.id}>
                      {establishments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Tipo</label>
                    <select className="input" value={form.type} onChange={setF('type')}>
                      <option value="publicacion">Publicación</option>
                      <option value="evento">Evento</option>
                      <option value="promocion">Promoción</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Título <span className="req">*</span></label>
                  <input className="input" value={form.title} onChange={setF('title')} placeholder="Ej. Torneo relámpago de Fútbol 5" maxLength={150} />
                </div>
                <div className="field">
                  <label>Descripción</label>
                  <textarea className="input textarea" rows={3} value={form.description} onChange={setF('description')} placeholder="Cuenta los detalles…" />
                </div>

                {form.type === 'evento' && (
                  <div className="field">
                    <label>Fecha y hora del evento</label>
                    <input className="input" type="datetime-local" value={form.eventDate} onChange={setF('eventDate')} />
                  </div>
                )}

                <div className="field">
                  <label>Imagen (opcional)</label>
                  <div className="post-image-row">
                    <div className="post-image-preview">
                      {form.image ? <img src={form.image} alt="Imagen" /> : <span className="logo-placeholder">Sin imagen</span>}
                    </div>
                    <label className="btn btn-outline btn-sm">
                      <ImagePlus className="lucide" /> {form.image ? 'Cambiar' : 'Subir imagen'}
                      <input type="file" accept="image/*" hidden disabled={busy} onChange={onImage} />
                    </label>
                    {form.image && <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm((s) => ({ ...s, image: null }))}><X className="lucide" /> Quitar</button>}
                  </div>
                </div>

                {err && <p style={{ color: 'var(--danger)', fontSize: 13.5, fontWeight: 600, margin: '0 0 10px' }}>{err}</p>}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner" /> : (form.id ? 'Guardar cambios' : 'Publicar')}</button>
                  <button type="button" className="btn btn-outline" onClick={() => setOpen(false)} disabled={busy}>Cancelar</button>
                </div>
              </form>
            )}

            {/* Lista */}
            {posts.length === 0 ? (
              !open && (
                <div className="card card-pad empty-state">
                  <span className="icon-badge blue"><Megaphone className="lucide" /></span>
                  <h3>Aún no tienes publicaciones</h3>
                  <p className="muted" style={{ margin: '8px 0 20px' }}>Crea promociones y eventos para atraer deportistas.</p>
                  <button className="btn btn-primary" onClick={openNew}><Plus className="lucide" /> Nueva publicación</button>
                </div>
              )
            ) : (
              <div className="post-list">
                {posts.map((p) => (
                  <div key={p.id} className="card post-card">
                    {p.image && <img className="post-card-img" src={p.image} alt="" />}
                    <div className="post-card-body">
                      <div className="post-card-head">
                        <span className="badge" style={{ background: TIPO_COLOR[p.type] }}>{TIPO_LABEL[p.type]}</span>
                        <span className="muted tiny">{estName[p.establishmentId] || p.establishment}</span>
                      </div>
                      <h3 className="post-card-title">{p.title}</h3>
                      {p.description && <p className="muted tiny post-card-desc">{p.description}</p>}
                      {p.type === 'evento' && p.eventDate && (
                        <p className="tiny" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--secondary)', marginTop: 6 }}>
                          <CalendarClock className="lucide" style={{ width: 14, height: 14 }} /> {fmtEvent(p.eventDate)}
                        </p>
                      )}
                      <div className="post-card-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><Pencil className="lucide" /> Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(p)}><Trash2 className="lucide" /> Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
