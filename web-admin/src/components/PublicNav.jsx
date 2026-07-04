import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicNav() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // El portal de administrador vive en una pestaña aparte del sitio público.
  const openAdmin = (path) => window.open(path, '_blank', 'noopener');

  return (
    <header className="pnav">
      <Link to="/" className="pnav-brand">
        <img src="/logo-official.png" alt="SportSpot" />
        <span>SportSpot</span>
      </Link>

      <nav className="pnav-links">
        <a href="/#como-funciona">Cómo funciona</a>
        <a href="/#nosotros">Quiénes somos</a>
        <Link to="/planes">Planes</Link>
        <a href="/#contacto">Contáctanos</a>
      </nav>

      <div className="pnav-actions">
        {isAuthenticated ? (
          <button className="btn btn-primary btn-sm" onClick={() => openAdmin('/panel')}>
            Ir a mi panel
          </button>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => openAdmin('/login')}>
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
