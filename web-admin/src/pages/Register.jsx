import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/panel';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const passwordOk = form.password.length >= 6;
  const matchOk = form.password.length > 0 && form.password === form.confirm;
  const valid = form.name.trim() && form.email.trim() && passwordOk && matchOk;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setError('');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-hero">
        <img src="/logo-official.png" alt="SportSpot" />
        <h1>Registra tu establecimiento</h1>
        <p>Crea tu cuenta de dueño para empezar a publicar tus canchas en SportSpot y recibir reservas.</p>
        <ul>
          <li>⚽ Fútbol, basketball, pádel, tenis y más</li>
          <li>🕐 Horarios individuales por cancha</li>
          <li>🛎️ Servicios: techo, baños, gimnasio…</li>
        </ul>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Crear cuenta de dueño</h2>
          <p className="muted">Registra tus datos para administrar establecimientos.</p>

          {error && <div className="banner-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>
                Nombre completo <span className="req">*</span>
              </label>
              <input className="input" placeholder="Carlos Méndez" value={form.name} onChange={set('name')} required />
            </div>
            <div className="field">
              <label>
                Correo electrónico <span className="req">*</span>
              </label>
              <input
                className="input"
                type="email"
                placeholder="dueno@establecimiento.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input className="input" placeholder="+507 6000-0000" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="field">
              <label>
                Contraseña <span className="req">*</span>
              </label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
              <div className="hint" style={{ color: passwordOk ? 'var(--primary)' : undefined }}>
                {passwordOk ? '✓' : '○'} Mínimo 6 caracteres
              </div>
            </div>
            <div className="field">
              <label>
                Confirmar contraseña <span className="req">*</span>
              </label>
              <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
              <div className="hint" style={{ color: matchOk ? 'var(--primary)' : undefined }}>
                {matchOk ? '✓ Las contraseñas coinciden' : '○ Las contraseñas deben coincidir'}
              </div>
            </div>
            <button className="btn btn-primary btn-block" disabled={loading || !valid}>
              {loading ? <span className="spinner" /> : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login" state={{ from }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
