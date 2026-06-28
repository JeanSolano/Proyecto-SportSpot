import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicNav() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="pnav">
      <Link to="/" className="pnav-brand">
        <img src="/logo-official.png" alt="SportSpot" />
        <span>SportSpot</span>
      </Link>

      <nav className="pnav-links">
        <a href="/#como-funciona">Cómo funciona</a>
        <Link to="/planes">Planes</Link>
        <a href="/#nosotros">Nosotros</a>
        <a href="/#contacto">Contacto</a>
      </nav>

      <div className="pnav-actions">
        {isAuthenticated ? (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/panel')}>
            Ir a mi panel
          </button>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
              <LogIn className="lucide" /> Iniciar sesión
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/planes')}>
              <Store className="lucide" /> Registra tu establecimiento
            </button>
          </>
        )}
      </div>
    </header>
  );
}
