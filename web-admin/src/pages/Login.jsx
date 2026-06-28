import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/panel';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
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
        <h1>Panel de Establecimientos</h1>
        <p>Gestiona tus canchas, horarios y reservas desde un solo lugar. Bienvenido de vuelta.</p>
        <ul>
          <li>🏟️ Registra tus establecimientos y canchas</li>
          <li>🗓️ Define horarios individuales por cancha</li>
          <li>📊 Controla disponibilidad y servicios</li>
        </ul>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Iniciar sesión</h2>
          <p className="muted">Accede a tu panel de administración.</p>

          {error && <div className="banner-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Correo electrónico</label>
              <input
                className="input"
                type="email"
                placeholder="dueno@establecimiento.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading || !email || !password}>
              {loading ? <span className="spinner" /> : 'Entrar al panel'}
            </button>
          </form>

          <p className="auth-switch">
            ¿No tienes cuenta? <Link to="/register" state={{ from }}>Regístrate como dueño</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
