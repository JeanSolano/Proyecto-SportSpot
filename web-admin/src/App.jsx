import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EstablishmentForm from './pages/EstablishmentForm.jsx';
import EstablishmentDetail from './pages/EstablishmentDetail.jsx';

function Protected({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner dark" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/establecimientos/nuevo" element={<EstablishmentForm />} />
        <Route path="/establecimientos/:id" element={<EstablishmentDetail />} />
        <Route path="/establecimientos/:id/editar" element={<EstablishmentForm />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
