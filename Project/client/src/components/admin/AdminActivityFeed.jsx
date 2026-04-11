export default function AdminActivityFeed() {
  const activities = [
    { id: 1, type: 'user', icon: 'bi-person-plus', text: 'New user "Sarah Jenkins" registered', time: '10 mins ago', color: '#3b82f6' },
    { id: 2, type: 'dispute', icon: 'bi-exclamation-triangle', text: 'Dispute #4812 opened by "David Greene"', time: '45 mins ago', color: '#f59e0b' },
    { id: 3, type: 'listing', icon: 'bi-flag', text: 'Listing "Vintage Camera" reported for irrelevant tags', time: '2 hours ago', color: '#ef4444' },
    { id: 4, type: 'ban', icon: 'bi-slash-circle', text: 'Auto-ban triggered for suspicious bot activity (IP: 192.168.1.4)', time: '5 hours ago', color: '#881337' },
    { id: 5, type: 'resolve', icon: 'bi-check-circle', text: 'Administrator "Rudra" resolved Dispute #4800', time: '1 day ago', color: '#10b981' },
    { id: 6, type: 'system', icon: 'bi-server', text: 'Nightly database backup completed successfully', time: '1 day ago', color: '#6366f1' },
  ];

  return (
    <div className="sc-card fade-in h-100">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">Platform Activity</h5>
        <button className="sc-btn sc-btn-ghost sc-btn-sm">View All</button>
      </div>

      <div className="d-flex flex-column gap-3">
        {activities.map((item) => (
          <div key={item.id} className="d-flex gap-3">
            <div 
              style={{ 
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: `${item.color}15`, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <i className={`bi ${item.icon} fs-5`}></i>
            </div>
            <div>
              <p className="mb-1" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {item.text}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
