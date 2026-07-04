import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';

export default function Layout() {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navClass = ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo-official.png" alt="SportSpot" />
          <span>SportSpot</span>
        </div>

        <nav>
          <NavLink to="/panel" end className={navClass}>
            <LayoutDashboard className="lucide" /> Dashboard
          </NavLink>
          <NavLink to="/establecimientos/nuevo" className={navClass}>
            <PlusCircle className="lucide" /> Nuevo establecimiento
          </NavLink>
          <NavLink to="/suscripcion" className={navClass}>
            <CreditCard className="lucide" /> Suscripción
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-owner">
            <span className="avatar">{initials(owner?.name)}</span>
            <span>
              {owner?.name}
              <br />
              {owner?.email}
            </span>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut className="lucide" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
