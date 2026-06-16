import { COURT_TYPES, TIME_SLOTS, WEEK_DAYS } from '../data/constants';

/**
 * Editor de UNA cancha: nombre, tipo, días activos y franjas horarias.
 * Cada cancha tiene su propio horario individual.
 */
export default function CourtScheduleEditor({ index, court, onChange, onRemove }) {
  const update = (patch) => onChange({ ...court, ...patch });

  const toggleDay = (dayId) => {
    const days = court.days.includes(dayId)
      ? court.days.filter((d) => d !== dayId)
      : [...court.days, dayId];
    update({ days });
  };

  const toggleSlot = (slot) => {
    const slots = court.slots.includes(slot)
      ? court.slots.filter((s) => s !== slot)
      : [...court.slots, slot];
    update({ slots });
  };

  return (
    <div className="court-card">
      <div className="court-head">
        <span className="court-num">Cancha #{index + 1}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove} style={{ color: 'var(--danger)' }}>
          ✕ Quitar
        </button>
      </div>

      <div className="row">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Nombre / identificador</label>
          <input
            className="input"
            placeholder={`Ej. Cancha ${index + 1}`}
            value={court.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>
            Tipo de cancha <span className="req">*</span>
          </label>
          <select className="input" value={court.type} onChange={(e) => update({ type: e.target.value })}>
            {COURT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="tiny" style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          Días disponibles
        </label>
        <div className="days-row">
          {WEEK_DAYS.map((d) => (
            <span
              key={d.id}
              className={`chip ${court.days.includes(d.id) ? 'active' : ''}`}
              onClick={() => toggleDay(d.id)}>
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="tiny" style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
          Franjas horarias disponibles
        </label>
        <div className="hint" style={{ marginTop: 0, marginBottom: 4 }}>
          Toca las horas que la cancha estará disponible para reservar.
        </div>
        <div className="slots-grid">
          {TIME_SLOTS.map((slot) => (
            <span
              key={slot}
              className={`slot ${court.slots.includes(slot) ? 'on' : ''}`}
              onClick={() => toggleSlot(slot)}>
              {slot}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
