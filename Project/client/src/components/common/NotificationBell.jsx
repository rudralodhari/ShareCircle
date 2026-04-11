import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const panelRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('sc-token');
    if (!token) return;
    
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(SOCKET_URL, { auth: { token } });
    
    socket.on('newNotification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.close();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e) {
      if (!bellRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    const id = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  return (
    <div className="dropdown">
      <button
        ref={bellRef}
        className="sc-btn sc-btn-ghost sc-btn-icon position-relative"
        onClick={() => setOpen(!open)}
        id="notification-bell"
        aria-label="Notifications"
      >
        <i className="bi bi-bell fs-5"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute badge rounded-pill"
            style={{
              top: '4px',
              right: '4px',
              background: 'var(--danger-500)',
              color: '#fff',
              fontSize: '0.65rem',
              padding: '2px 5px',
              minWidth: '18px',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={panelRef}
          className="dropdown-menu dropdown-menu-end show"
          style={{ width: '340px', padding: 'var(--space-2)' }}
        >
          <div className="d-flex justify-content-between align-items-center px-3 py-2">
            <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h6>
            <button className="sc-btn sc-btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 8px' }} onClick={handleMarkAllRead}>
              Mark all read
            </button>
          </div>
          <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />
          {notifications.length === 0 ? (
            <div className="text-center py-3">
              <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                className="dropdown-item d-flex align-items-start gap-2 py-2"
                style={{ whiteSpace: 'normal', background: n.read ? 'transparent' : 'var(--primary-50)' }}
              >
                <i className="bi bi-circle-fill mt-1" style={{ fontSize: '6px', color: n.read ? 'transparent' : 'var(--primary-500)' }}></i>
                <div>
                  <p className="mb-0" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.text}</p>
                  <small style={{ color: 'var(--text-tertiary)' }}>{n.time}</small>
                </div>
              </button>
            ))
          )}
          <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />
          <button className="dropdown-item text-center py-2" style={{ color: 'var(--primary-500)', fontWeight: 600, fontSize: '0.85rem' }}>
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

