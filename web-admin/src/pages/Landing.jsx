import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, CalendarClock, MessagesSquare, BarChart3,
  UserPlus, CreditCard, Building2, Smartphone,
  Mail, Phone, Clock, CheckCircle2, ArrowRight, Sparkles,
  ShieldCheck, ExternalLink, LayoutGrid, Store,
} from 'lucide-react';
import PublicNav from '../components/PublicNav.jsx';
import PublicFooter from '../components/PublicFooter.jsx';
import useScrollReveal from '../hooks/useScrollReveal';
import { PLANS } from '../data/plans';
import { VENUE_PHOTOS } from '../data/media';

const SPORTS = ['⚽ Fútbol', '🏀 Basketball', '⚾ Baseball', '🎾 Pádel', '🎾 Tenis', '🏐 Voleibol'];

const STEPS = [
  { n: 1, Icon: UserPlus, title: 'Crea tu cuenta', text: 'Regístrate como dueño en menos de un minuto.' },
  { n: 2, Icon: CreditCard, title: 'Elige tu plan', text: 'Suscripción según la cantidad de establecimientos.' },
  { n: 3, Icon: Building2, title: 'Publica tus canchas', text: 'Configura canchas, horarios y servicios.' },
  { n: 4, Icon: Smartphone, title: 'Recibe reservas', text: 'Los deportistas reservan desde la app móvil.' },
];

const FEATURES = [
  { Icon: MapPin, color: 'green', title: 'Visibilidad real', text: 'Tu establecimiento aparece en el mapa y el feed de la app.' },
  { Icon: CalendarClock, color: 'blue', title: 'Horarios por cancha', text: 'Define disponibilidad individual para cada cancha.' },
  { Icon: MessagesSquare, color: 'orange', title: 'Comunidad deportiva', text: 'Publicaciones, promociones y reseñas de tus clientes.' },
  { Icon: BarChart3, color: 'navy', title: 'Control total', text: 'Gestiona reservas y disponibilidad desde web y móvil.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  useScrollReveal();

  // El portal de administrador se abre en una pestaña aparte del sitio público.
  const openAdmin = (path) => window.open(path, '_blank', 'noopener');

  return (
    <div className="public">
      <PublicNav />

      {/* HERO — Aurora + collage de fotos */}
      <section className="hero aurora">
        <div className="aurora-bg" aria-hidden="true" />
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-badge glass"><Sparkles className="lucide" /> Hecho para Panamá 🇵🇦</span>
            <h1>Llena tus canchas. Haz crecer tu negocio deportivo.</h1>
            <p>
              SportSpot conecta tus canchas con miles de deportistas. Publica tus establecimientos,
              gestiona reservas y cobra en línea — todo desde un solo lugar.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/planes')}>
                Registra tu establecimiento <ArrowRight className="lucide" />
              </button>
              <button className="btn btn-light btn-lg" onClick={() => openAdmin('/login')}>
                Ya tengo cuenta
              </button>
            </div>
            <div className="hero-sports">
              {SPORTS.map((s) => (
                <span key={s} className="hero-sport">{s}</span>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hv-card hv-1">
              <img src={VENUE_PHOTOS[1].url} alt="Cancha de fútbol" />
            </div>
            <div className="hv-card hv-2">
              <img src={VENUE_PHOTOS[0].url} alt="Cancha de basketball" loading="lazy" />
            </div>
            <div className="hv-badge glass">
              <strong>+500</strong>
              <span>canchas listas para reservar</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / social proof */}
      <div className="trust">
        <div><strong>+500</strong><span>canchas potenciales</span></div>
        <div><strong>+5</strong><span>deportes</span></div>
        <div><strong>24/7</strong><span>reservas en línea</span></div>
        <div><strong>4.8★</strong><span>satisfacción</span></div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="section">
        <h2 className="section-title reveal">¿Cómo funciona?</h2>
        <p className="section-sub reveal">De tu cancha a la app en cuatro pasos.</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="step-card reveal" style={{ '--d': `${i * 0.08}s` }}>
              <span className="step-no">{s.n}</span>
              <div className="icon-badge blue"><s.Icon className="lucide" /></div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALERÍA de canchas (fotos reales) */}
      <section className="section section-tint">
        <h2 className="section-title reveal">Canchas que brillan en SportSpot</h2>
        <p className="section-sub reveal">Así lucen los establecimientos publicados en la app.</p>
        <div className="gallery">
          {VENUE_PHOTOS.map((p, i) => (
            <div key={p.label} className="gallery-item reveal" style={{ '--d': `${i * 0.08}s` }}>
              <img src={p.url} alt={`Cancha de ${p.label}`} loading="lazy" />
              <div className="g-overlay">
                <span className="g-label">{p.emoji} {p.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <h2 className="section-title reveal">¿Por qué SportSpot?</h2>
        <p className="section-sub reveal">Todo lo que necesitas para administrar tu establecimiento.</p>
        <div className="features">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card reveal" style={{ '--d': `${i * 0.08}s` }}>
              <div className={`icon-badge ${f.color}`}><f.Icon className="lucide" /></div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROMO: Portal de administrador (abre pestaña aparte) */}
      <section className="admin-promo">
        <div className="aurora-bg" aria-hidden="true" />
        <div className="admin-promo-inner">
          <div className="admin-promo-text reveal">
            <span className="hero-badge glass"><ShieldCheck className="lucide" /> Portal de administradores</span>
            <h2>¿Tienes un establecimiento? Conviértete en administrador</h2>
            <p>
              Accede al portal de administración —en una ventana aparte— para publicar tus canchas,
              definir horarios, gestionar reservas y cobrar en línea.
            </p>
            <div className="admin-promo-cta">
              <button className="btn btn-primary btn-lg" onClick={() => openAdmin('/register')}>
                <Store className="lucide" /> Registrarme como administrador
              </button>
              <button className="btn btn-light btn-lg" onClick={() => openAdmin('/login')}>
                Iniciar sesión
              </button>
            </div>
            <p className="admin-promo-note">
              <ExternalLink className="lucide" /> Se abre en una pestaña separada del sitio.
            </p>
          </div>

          <div className="admin-promo-visual reveal" style={{ '--d': '0.1s' }}>
            <div className="ap-card glass" role="img" aria-label="Vista previa del panel de administrador">
              <div className="ap-card-head">
                <img src="/logo-official.png" alt="" /> Panel · SportSpot
              </div>
              <div className="ap-kpis">
                <div><Building2 className="lucide" /><strong>3</strong><span>Establecimientos</span></div>
                <div><LayoutGrid className="lucide" /><strong>12</strong><span>Canchas</span></div>
                <div><CalendarClock className="lucide" /><strong>48</strong><span>Reservas hoy</span></div>
              </div>
              <div className="ap-bars" aria-hidden="true">
                {[38, 56, 44, 72, 50, 84, 66].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES (preview) */}
      <section id="planes" className="section section-tint">
        <h2 className="section-title reveal">Planes para cada negocio</h2>
        <p className="section-sub reveal">Suscripción mensual + una pequeña comisión por reserva.</p>
        <div className="plans plans-compact">
          {PLANS.map((p, i) => (
            <div key={p.id} className={`plan-card reveal ${p.popular ? 'popular' : ''}`} style={{ '--d': `${i * 0.08}s` }}>
              {p.popular && <span className="plan-tag">Más popular</span>}
              <h3 style={{ color: p.accent }}>{p.name}</h3>
              <div className="plan-price tnum">
                ${p.price}<span>/mes</span>
              </div>
              <p className="plan-tagline">{p.tagline}</p>
              <p className="plan-limit">
                Hasta {p.maxEstablishments} establecimiento{p.maxEstablishments > 1 ? 's' : ''} · {p.commission}% por reserva
              </p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/planes')}>
            Ver planes y empezar <ArrowRight className="lucide" />
          </button>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="section">
        <div className="about">
          <div className="reveal">
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
          <div className="about-stats reveal" style={{ '--d': '0.1s' }}>
            <div><strong>+5</strong><span>deportes</span></div>
            <div><strong>24/7</strong><span>reservas</span></div>
            <div><strong>100%</strong><span>en línea</span></div>
          </div>
        </div>
      </section>

      {/* CONTACTO / ATENCIÓN AL CLIENTE */}
      <section id="contacto" className="section section-tint">
        <h2 className="section-title reveal">Atención al cliente</h2>
        <p className="section-sub reveal">¿Dudas para publicar tu establecimiento? Escríbenos.</p>
        <div className="contact">
          <div className="contact-info reveal">
            <div><span className="icon-badge blue"><Mail className="lucide" /></span> soporte@sportspot.com</div>
            <div><span className="icon-badge green"><Phone className="lucide" /></span> +507 6000-0000</div>
            <div><span className="icon-badge orange"><MapPin className="lucide" /></span> Ciudad de Panamá, Panamá</div>
            <div><span className="icon-badge navy"><Clock className="lucide" /></span> Lun a Sáb · 8:00 – 18:00</div>
          </div>
          <form className="contact-form card card-pad reveal" style={{ '--d': '0.1s' }} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            {sent ? (
              <div className="contact-ok">
                <CheckCircle2 className="lucide" style={{ color: 'var(--primary)' }} />
                ¡Gracias! Te contactaremos pronto.
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

      {/* CTA final */}
      <section className="cta-band">
        <div className="aurora-bg" aria-hidden="true" />
        <div className="cta-inner">
          <h2>¿Listo para llenar tus canchas?</h2>
          <p>Publica tu establecimiento hoy y empieza a recibir reservas desde la app.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/planes')}>
            Empezar ahora <ArrowRight className="lucide" />
          </button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
