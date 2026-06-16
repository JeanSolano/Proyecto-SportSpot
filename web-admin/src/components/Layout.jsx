import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo-official.png" alt="SportSpot" />
          <span>SportSpot</span>
        </div>

        <nav>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/establecimientos/nuevo"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            ➕ Nuevo establecimiento
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
