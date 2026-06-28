import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';
import PublicFooter from '../components/PublicFooter.jsx';
import { PLANS } from '../data/plans';

const SPORTS = ['⚽ Fútbol', '🏀 Basketball', '⚾ Baseball', '🎾 Pádel', '🎾 Tenis', '🏐 Voleibol'];

const STEPS = [
  { n: 1, emoji: '📝', title: 'Crea tu cuenta', text: 'Regístrate como dueño en menos de un minuto.' },
  { n: 2, emoji: '💳', title: 'Elige tu plan', text: 'Suscripción según la cantidad de establecimientos.' },
  { n: 3, emoji: '🏟️', title: 'Publica tus canchas', text: 'Configura canchas, horarios y servicios.' },
  { n: 4, emoji: '📲', title: 'Recibe reservas', text: 'Los deportistas reservan desde la app móvil.' },
];

const FEATURES = [
  { emoji: '🗺️', title: 'Visibilidad real', text: 'Tu establecimiento aparece en el mapa y el feed de la app.' },
  { emoji: '🗓️', title: 'Horarios por cancha', text: 'Define disponibilidad individual para cada cancha.' },
  { emoji: '💬', title: 'Comunidad deportiva', text: 'Publicaciones, promociones y reseñas de tus clientes.' },
  { emoji: '📊', title: 'Control total', text: 'Gestiona reservas y disponibilidad desde web y móvil.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  const submitContact = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="public">
      <PublicNav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🇵🇦 Hecho para Panamá</span>
          <h1>Llena tus canchas. Haz crecer tu negocio deportivo.</h1>
          <p>
            SportSpot conecta tus canchas con miles de deportistas. Publica tus establecimientos,
            gestiona reservas y cobra en línea — todo desde un solo lugar.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => navigate('/planes')}>
              Registra tu establecimiento
            </button>
            <button className="btn btn-outline btn-light" onClick={() => navigate('/login')}>
              Ya tengo cuenta
            </button>
          </div>
          <div className="hero-sports">
            {SPORTS.map((s) => (
              <span key={s} className="hero-sport">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="section">
        <h2 className="section-title">¿Cómo funciona?</h2>
        <p className="section-sub">De tu cancha a la app en cuatro pasos.</p>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.emoji}</div>
              <h3>{s.n}. {s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-tint">
        <h2 className="section-title">¿Por qué SportSpot?</h2>
        <p className="section-sub">Todo lo que necesitas para administrar tu establecimiento.</p>
        <div className="features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-emoji">{f.emoji}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANES (preview) */}
      <section id="planes" className="section">
        <h2 className="section-title">Planes para cada negocio</h2>
        <p className="section-sub">Suscripción mensual + una pequeña comisión por reserva.</p>
        <div className="plans plans-compact">
          {PLANS.map((p) => (
            <div key={p.id} className={`plan-card ${p.popular ? 'popular' : ''}`}>
              {p.popular && <span className="plan-tag">Más popular</span>}
              <h3 style={{ color: p.accent }}>{p.name}</h3>
              <div className="plan-price">
                ${p.price}<span>/mes</span>
              </div>
              <p className="plan-tagline">{p.tagline}</p>
              <p className="plan-limit">Hasta {p.maxEstablishments} establecimiento{p.maxEstablishments > 1 ? 's' : ''} · {p.commission}% por reserva</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn btn-primary" onClick={() => navigate('/planes')}>
            Ver planes y empezar
          </button>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="section section-tint">
        <div className="about">
          <div>
            <h2 className="section-title" style={{ textAlign: 'left' }}>Quiénes somos</h2>
            <p>
              SportSpot nació para resolver un problema simple: encontrar y reservar una cancha en
              Panamá era complicado. Construimos una red social deportiva que une a quienes quieren
              jugar con los establecimientos que los reciben.
            </p>
            <p>
              Para los dueños, somos el canal más directo para llenar horarios vacíos, dar a conocer
              su lugar y profesionalizar la gestión de reservas y pagos.
            </p>
          </div>
          <div className="about-stats">
            <div><strong>+5</strong><span>deportes</span></div>
            <div><strong>24/7</strong><span>reservas</span></div>
            <div><strong>100%</strong><span>en línea</span></div>
          </div>
        </div>
      </section>

      {/* CONTACTO / ATENCIÓN AL CLIENTE */}
      <section id="contacto" className="section">
        <h2 className="section-title">Atención al cliente</h2>
        <p className="section-sub">¿Dudas para publicar tu establecimiento? Escríbenos.</p>
        <div className="contact">
          <div className="contact-info">
            <div><span className="contact-ic">📧</span> soporte@sportspot.com</div>
            <div><span className="contact-ic">📱</span> +507 6000-0000</div>
            <div><span className="contact-ic">📍</span> Ciudad de Panamá, Panamá</div>
            <div><span className="contact-ic">🕐</span> Lun a Sáb · 8:00 – 18:00</div>
          </div>
          <form className="contact-form card card-pad" onSubmit={submitContact}>
            {sent ? (
              <div className="contact-ok">
                ✅ ¡Gracias! Te contactaremos pronto.
              </div>
            ) : (
              <>
                <div className="field">
                  <label>Nombre</label>
                  <input className="input" placeholder="Tu nombre" required />
                </div>
                <div className="field">
                  <label>Correo</label>
                  <input className="input" type="email" placeholder="tu@correo.com" required />
                </div>
                <div className="field">
                  <label>Mensaje</label>
                  <textarea className="textarea" placeholder="¿En qué te ayudamos?" required />
                </div>
                <button className="btn btn-primary btn-block">Enviar mensaje</button>
              </>
            )}
          </form>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
