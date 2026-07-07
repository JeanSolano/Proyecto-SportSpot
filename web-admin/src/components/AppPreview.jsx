import { courtType, amenity } from '../data/constants';

const DAY_CODES = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const todayCode = DAY_CODES[new Date().getDay()];

const initials = (name) =>
  (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'SS';

// Vista previa de cómo se verá el establecimiento en la app móvil (tarjeta + perfil).
export default function AppPreview({ name, direccion, description, courts = [], amenities = [] }) {
  const sports = [...new Map(courts.map((c) => [c.type, courtType(c.type)])).values()];
  const accent = sports[0]?.color || '#1E7FE0';
  const precios = courts.map((c) => Number(c.precio)).filter((n) => n > 0);
  const precioDesde = precios.length ? Math.min(...precios) : null;
  const abiertoHoy = courts.some((c) => (c.days || []).includes(todayCode));

  return (
    <div className="app-preview">
      <div className="app-preview-label">Vista previa · así se verá en la app</div>

      <div className="phone">
        <span className="phone-notch" />
        <div className="phone-screen">
          {/* Tarjeta del listado / feed */}
          <div className="pv-card">
            <div className="pv-hero" style={{ background: `linear-gradient(135deg, ${accent}, #1b2880)` }}>
              <span className="pv-watermark">{initials(name)}</span>
              <div className="pv-hero-top">
                {sports[0] ? <span className="pv-badge">{sports[0].label}</span> : <span />}
                {abiertoHoy && <span className="pv-avail">Disponible hoy</span>}
              </div>
              <div className="pv-hero-name">
                <strong>{name || 'Nombre del establecimiento'}</strong>
                <span>{direccion || 'Dirección del lugar'}</span>
              </div>
            </div>
            <div className="pv-body">
              {sports.length > 0 && (
                <div className="pv-chips">
                  {sports.map((s) => (
                    <span key={s.id} className="pv-chip" style={{ color: s.color, background: `${s.color}22` }}>{s.label}</span>
                  ))}
                </div>
              )}
              <div className="pv-footer">
                <span className="pv-muted">{courts.length} {courts.length === 1 ? 'cancha' : 'canchas'}</span>
                {precioDesde != null ? (
                  <span className="pv-price">Desde <strong>${precioDesde.toFixed(2)}</strong>/h</span>
                ) : (
                  <span className="pv-muted">Precio por definir</span>
                )}
              </div>
            </div>
          </div>

          {/* Mini perfil */}
          {(description || amenities.length > 0) && (
            <div className="pv-detail">
              {description && <p className="pv-desc">{description}</p>}
              {amenities.length > 0 && (
                <div className="pv-amenities">
                  {amenities.map((aId) => {
                    const a = amenity(aId);
                    return a ? <span key={aId} className="pv-amenity">{a.emoji} {a.label}</span> : null;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="app-preview-note">El logo y las fotos se agregan luego, en el detalle del establecimiento.</p>
    </div>
  );
}
