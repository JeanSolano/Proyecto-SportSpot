import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="pfooter">
      <div className="pfooter-inner">
        <div className="pfooter-brand">
          <img src="/logo-official.png" alt="SportSpot" />
          <span>SportSpot</span>
          <p>La red social deportiva de Panamá. Descubre, reserva y juega.</p>
        </div>
        <div className="pfooter-col">
          <h4>Producto</h4>
          <a href="/#como-funciona">Cómo funciona</a>
          <Link to="/planes">Planes</Link>
          <a href="/#nosotros">Nosotros</a>
        </div>
        <div className="pfooter-col">
          <h4>Soporte</h4>
          <a href="/#contacto">Atención al cliente</a>
          <a href="/#contacto">Contacto</a>
          <a href="mailto:soporte@sportspot.com">soporte@sportspot.com</a>
        </div>
        <div className="pfooter-col">
          <h4>Cuenta</h4>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/register">Crear cuenta</Link>
        </div>
      </div>
      <div className="pfooter-bottom">© {new Date().getFullYear()} SportSpot · Prototipo (datos de demostración)</div>
    </footer>
  );
}
