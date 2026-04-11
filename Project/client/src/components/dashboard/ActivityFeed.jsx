import { timeAgo } from '../../utils/helpers';

export default function ActivityFeed({ activities = [] }) {
  return (
    <div className="sc-card fade-in h-100">
      <h5 className="fw-bold mb-4">Recent Activity</h5>
      
      {activities.length === 0 ? (
        <div className="text-center py-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 64, height: 64, background: 'var(--bg-surface-2)', color: 'var(--text-tertiary)' }}>
            <i className="bi bi-clock-history fs-3"></i>
          </div>
          <h6 className="fw-bold mb-1">No recent activity</h6>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>When you interact with the platform, your activity will appear here.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {activities.map((activity) => (
            <div key={activity.id} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{ width: 40, height: 40, background: `${activity.color}15`, color: activity.color, fontSize: '1rem' }}>
                <i className={`bi ${activity.icon}`}></i>
              </div>
              <div className="flex-grow-1">
                <p className="mb-0 fw-medium" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{activity.text}</p>
                <small style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{timeAgo(activity.time)}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
