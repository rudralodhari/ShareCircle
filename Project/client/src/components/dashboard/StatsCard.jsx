export default function StatsCard({ icon, label, value, color = 'var(--primary-500)', trend }) {
  return (
    <div className="sc-card d-flex align-items-center gap-3 fade-in" style={{ padding: 'var(--space-5)' }}>
      <div
        className="d-flex align-items-center justify-content-center rounded-3"
        style={{ width: 52, height: 52, background: `${color}15`, color, fontSize: '1.3rem' }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="flex-grow-1">
        <small className="fw-semibold" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </small>
        <h4 className="mb-0 fw-bold">{value}</h4>
      </div>
      {trend && (
        <span className={`sc-badge ${trend > 0 ? 'sc-badge-primary' : 'sc-badge-danger'}`} style={{ fontSize: '0.7rem' }}>
          <i className={`bi ${trend > 0 ? 'bi-arrow-up' : 'bi-arrow-down'} me-1`}></i>
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}
