export default function Sustainability() {
  const globalStats = [
    { icon: 'bi-cloud', label: 'Total CO₂ Saved', value: '5.2 Tonnes', color: 'var(--primary-500)' },
    { icon: 'bi-recycle', label: 'Items Circulated', value: '25,847', color: 'var(--secondary-500)' },
    { icon: 'bi-trash3', label: 'Waste Diverted', value: '12.8 Tonnes', color: 'var(--accent-500)' },
    { icon: 'bi-tree', label: 'Trees Equivalent', value: '240', color: '#22c55e' },
  ];

  const tips = [
    'Share tools you rarely use — most power drills are used less than 15 minutes in their lifetime.',
    'Borrow before buying — your neighbor might already have what you need.',
    'Donate items instead of discarding — one person\'s clutter is another\'s treasure.',
    'Join group buying to reduce packaging waste and transportation emissions.',
  ];

  return (
    <div className="sc-container sc-section fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="text-center mb-5">
        <span className="sc-badge sc-badge-primary mb-3">🌍 Our Impact</span>
        <h2 className="fw-bold">Sustainability Dashboard</h2>
        <p style={{ maxWidth: 520, margin: '0 auto', color: 'var(--text-tertiary)' }}>
          Together, our community is making a real difference for the planet.
        </p>
      </div>

      {/* Global stats */}
      <div className="row g-4 mb-5">
        {globalStats.map((s) => (
          <div key={s.label} className="col-md-6 col-lg-3">
            <div className="sustainability-card sc-card slide-up">
              <div className="gauge-circle" style={{ borderTopColor: s.color, color: s.color }}>
                <i className={`bi ${s.icon}`}></i>
              </div>
              <h4 className="fw-bold" style={{ color: s.color }}>{s.value}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="sc-card">
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-lightbulb" style={{ color: 'var(--accent-500)', fontSize: '1.2rem' }}></i>
          <h5 className="fw-bold mb-0">Sustainability Tips</h5>
        </div>
        <div className="d-flex flex-column gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: 'var(--bg-surface-2)' }}>
              <span className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                style={{ width: 28, height: 28, background: 'var(--primary-100)', color: 'var(--primary-600)', fontSize: '0.75rem', fontWeight: 700 }}>
                {i + 1}
              </span>
              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
