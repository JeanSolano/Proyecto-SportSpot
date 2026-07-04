import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Building2, CalendarClock, BarChart3, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const from = location.state?.from || params.get('next') || '/panel';
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
          <li><Building2 className="lucide" /> Registra tus establecimientos y canchas</li>
          <li><CalendarClock className="lucide" /> Define horarios individuales por cancha</li>
          <li><BarChart3 className="lucide" /> Controla disponibilidad y servicios</li>
        </ul>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Iniciar sesión</h2>
          <p className="muted">Accede a tu panel de administración.</p>

          {error && <div className="banner-error"><AlertCircle className="lucide" /> {error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Correo electrónico</label>
              <div className="input-icon">
                <Mail className="lucide" />
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="dueno@establecimiento.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Contraseña</label>
              <div className="input-icon">
                <Lock className="lucide" />
                <input
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading || !email || !password}>
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
