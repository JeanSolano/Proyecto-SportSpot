import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, ShieldCheck, LogOut, Save, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getProfile } from '../data/store';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-PA', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ margin: '4px 0 0', fontSize: 13.5, fontWeight: 600, color: msg.type === 'ok' ? 'var(--primary-dark)' : 'var(--danger)' }}>
      {msg.text}
    </p>
  );
}

export default function Account() {
  const { owner, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [createdAt, setCreatedAt] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setForm({ name: p.name || '', email: p.email || '', phone: p.phone || '' });
        setCreatedAt(p.createdAt);
      })
      .catch(() => {
        if (owner) setForm({ name: owner.name || '', email: owner.email || '', phone: owner.phone || '' });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setF = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const setP = (k) => (e) => setPw((s) => ({ ...s, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!form.name.trim() || !form.email.trim()) {
      return setProfileMsg({ type: 'error', text: 'Nombre y correo son obligatorios.' });
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      setProfileMsg({ type: 'ok', text: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword.length < 6) return setPwMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    if (pw.newPassword !== pw.confirm) return setPwMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
    setSavingPw(true);
    try {
      await updateProfile({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPwMsg({ type: 'ok', text: 'Contraseña actualizada.' });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Mi cuenta</h2>
          <span className="muted tiny">Administra tu perfil y opciones</span>
        </div>
      </div>

      <div className="content" style={{ maxWidth: 720 }}>
        {/* Datos de la cuenta */}
        <form className="card card-pad" onSubmit={saveProfile} style={{ marginBottom: 20 }}>
          <div className="form-section-title"><UserCog className="lucide" /> Datos de la cuenta</div>
          <p className="form-section-sub">Estos datos identifican tu cuenta de administrador.</p>

          <div className="field">
            <label>Nombre completo <span className="req">*</span></label>
            <input className="input" value={form.name} onChange={setF('name')} placeholder="Tu nombre" />
          </div>
          <div className="field">
            <label>Correo electrónico <span className="req">*</span></label>
            <input className="input" type="email" value={form.email} onChange={setF('email')} placeholder="tu@email.com" />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input className="input" value={form.phone} onChange={setF('phone')} placeholder="Ej. 6000-0000" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <span className="spinner" /> : <><Save className="lucide" /> Guardar cambios</>}
            </button>
            <Msg msg={profileMsg} />
          </div>
        </form>

        {/* Seguridad */}
        <form className="card card-pad" onSubmit={savePassword} style={{ marginBottom: 20 }}>
          <div className="form-section-title"><ShieldCheck className="lucide" /> Seguridad</div>
          <p className="form-section-sub">Cambia tu contraseña. Deja los campos vacíos si no quieres cambiarla.</p>

          <div className="field">
            <label>Contraseña actual</label>
            <input className="input" type="password" value={pw.currentPassword} onChange={setP('currentPassword')} placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div className="field">
            <label>Nueva contraseña</label>
            <input className="input" type="password" value={pw.newPassword} onChange={setP('newPassword')} placeholder="Mín. 6 caracteres" autoComplete="new-password" />
          </div>
          <div className="field">
            <label>Confirmar nueva contraseña</label>
            <input className="input" type="password" value={pw.confirm} onChange={setP('confirm')} placeholder="Repite la contraseña" autoComplete="new-password" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-outline" disabled={savingPw || (!pw.newPassword && !pw.currentPassword)}>
              {savingPw ? <span className="spinner dark" /> : <><ShieldCheck className="lucide" /> Actualizar contraseña</>}
            </button>
            <Msg msg={pwMsg} />
          </div>
        </form>

        {/* Opciones generales */}
        <div className="card card-pad">
          <div className="form-section-title"><BadgeCheck className="lucide" /> Opciones generales</div>
          <div className="account-meta">
            <div><span className="muted tiny">Rol</span><strong>{owner?.rol || 'Dueño'}</strong></div>
            <div><span className="muted tiny">Miembro desde</span><strong>{fmtDate(createdAt)}</strong></div>
          </div>
          <button className="btn btn-danger" onClick={handleLogout} style={{ marginTop: 16 }}>
            <LogOut className="lucide" /> Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
