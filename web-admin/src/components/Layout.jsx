import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo-official.png" alt="SportSpot" />
          <span>SportSpot</span>
        </div>

        <nav>
          <NavLink to="/panel" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/establecimientos/nuevo"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            ➕ Nuevo establecimiento
          </NavLink>
          <NavLink to="/suscripcion" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            💳 Suscripción
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-owner">
            👤 {owner?.name}
            <br />
            {owner?.email}
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
