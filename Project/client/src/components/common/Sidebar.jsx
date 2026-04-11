import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Sidebar({ items, className = '' }) {
  const { user } = useAuth();

  const defaultItems = [
    { to: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/profile', icon: 'bi-person', label: 'Profile' },
    { to: '/my-listings', icon: 'bi-card-checklist', label: 'My Listings' },
    { to: '/create', icon: 'bi-plus-circle', label: 'New Listing' },
    { to: '/chat', icon: 'bi-chat-dots', label: 'Messages' },
    { to: '/wishlist', icon: 'bi-heart', label: 'Wishlist' },
    { to: '/cart', icon: 'bi-cart3', label: 'Cart' },
    { to: '/my-orders', icon: 'bi-bag', label: 'My Orders' },
    { to: '/orders-received', icon: 'bi-inbox', label: 'Orders from Others' },
    { to: '/complaints', icon: 'bi-exclamation-octagon', label: 'File a Complaint' },
  ];

  const links = items || defaultItems;

  return (
    <aside
      className={className}
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        padding: 'var(--space-4)',
        minHeight: '100%',
      }}
    >
      {/* User Panel badge */}
      <div className="mb-4 p-3 rounded-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-person-circle" style={{ color: '#10B981', fontSize: '1.1rem' }}></i>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10B981' }}>User Panel</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{user?.name}</div>
          </div>
        </div>
      </div>

      <nav className="d-flex flex-column gap-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/admin'}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition ${
                isActive ? 'fw-semibold' : ''
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--primary-50)' : 'transparent',
              color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)',
              fontSize: '0.9rem',
            })}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
