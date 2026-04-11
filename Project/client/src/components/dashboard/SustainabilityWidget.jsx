export default function SustainabilityWidget({ impact }) {
  const isZero = !impact || (impact.co2Saved === 0 && impact.itemsReused === 0 && impact.wasteDiverted === 0);

  const metrics = [
    { label: 'CO₂ Saved', value: impact ? `${impact.co2Saved.toFixed(1)} kg` : '0 kg', icon: 'bi-cloud', color: 'var(--primary-500)' },
    { label: 'Items Reused', value: impact ? String(impact.itemsReused) : '0', icon: 'bi-recycle', color: 'var(--secondary-500)' },
    { label: 'Waste Diverted', value: impact ? `${impact.wasteDiverted.toFixed(1)} kg` : '0 kg', icon: 'bi-trash3', color: 'var(--accent-500)' },
  ];

  return (
    <div className="sc-card fade-in h-100">
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-leaf" style={{ color: 'var(--primary-500)', fontSize: '1.2rem' }}></i>
        <h5 className="fw-bold mb-0">Your Impact</h5>
      </div>
      <div className="row g-3">
        {metrics.map((m) => (
          <div key={m.label} className="col-md-4">
            <div className="text-center p-3 rounded-3" style={{ background: 'var(--bg-surface-2)' }}>
              <i className={`bi ${m.icon} d-block mb-2`} style={{ fontSize: '1.5rem', color: m.color }}></i>
              <h4 className="fw-bold mb-1" style={{ color: m.color }}>{m.value}</h4>
              <small style={{ color: 'var(--text-tertiary)' }}>{m.label}</small>
            </div>
          </div>
        ))}
      </div>
      
      {!isZero ? (
        <div className="mt-4 p-3 rounded-3" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-trophy" style={{ color: 'var(--primary-500)' }}></i>
            <p className="mb-0" style={{ color: 'var(--primary-700)', fontSize: '0.85rem', fontWeight: 500 }}>
              You&apos;re in the top 15% of eco-contributors in your area! 🎉
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px dashed var(--border-color)' }}>
           <p className="mb-0 text-center" style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Your sustainability impact will grow as you share and borrow items! 🌱
           </p>
        </div>
      )}
    </div>
  );
}
