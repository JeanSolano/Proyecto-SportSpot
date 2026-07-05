// Tarjeta de estadística reutilizable (ícono + valor + etiqueta).
export default function StatCard({ icon: Icon, color = 'blue', value, label, tnum = false, valueStyle }) {
  return (
    <div className="card stat-card">
      <span className={`icon-badge ${color}`}>
        <Icon className="lucide" />
      </span>
      <div>
        <div className={`stat-value${tnum ? ' tnum' : ''}`} style={valueStyle}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
