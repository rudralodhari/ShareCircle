import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const dropdownPanelRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutsideClick(e) {
      const clickedBtn   = menuBtnRef.current?.contains(e.target);
      const clickedPanel = dropdownPanelRef.current?.contains(e.target);
      if (!clickedBtn && !clickedPanel) setMenuOpen(false);
    }
    const id = setTimeout(() => document.addEventListener('click', handleOutsideClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  const dropdownStyle = {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 220,
    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 9999, overflow: 'hidden',
  };

  const itemStyle = (color = 'var(--text-primary)') => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color,
    width: '100%', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500,
    textDecoration: 'none', cursor: 'pointer', transition: 'background 0.15s',
  });

  return (
    <nav className="navbar navbar-expand-lg sc-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <i className="bi bi-recycle fs-4" style={{ color: 'var(--primary-500)' }}></i>
          <span className="text-gradient">ShareCircle</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" onClick={() => setNavOpen((o) => !o)} aria-label="Toggle navigation">
          <i className="bi bi-list fs-4" style={{ color: 'var(--text-primary)' }}></i>
        </button>

        <div className={`collapse navbar-collapse${navOpen ? ' show' : ''}`}>
          <ul className="navbar-nav mx-auto gap-1">
            {[
              { to: '/browse', label: 'Browse' },
              { to: '/community', label: 'Community' },
              { to: '/sustainability', label: 'Sustainability' },
              { to: '/about', label: 'About' },
              { to: '/support', label: 'Support' },
            ].map(({ to, label }) => (
              <li key={to} className="nav-item">
                <NavLink className="nav-link" to={to} onClick={() => setNavOpen(false)}>{label}</NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap mt-3 mt-lg-0 pb-3 pb-lg-0 ms-auto">
            <SearchBar compact />
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {!isAdmin && <NotificationBell />}

                {/* Cart icon */}
                {!isAdmin && (
                  <Link to="/cart" className="sc-btn sc-btn-ghost sc-btn-icon position-relative" aria-label="Cart" onClick={() => setNavOpen(false)}>
                    <i className="bi bi-cart3 fs-5"></i>
                  </Link>
                )}

                {!isAdmin && (
                  <Link to="/create" className="sc-btn sc-btn-primary sc-btn-sm" onClick={() => setNavOpen(false)}>
                    <i className="bi bi-plus-lg"></i> List Item
                  </Link>
                )}

                {/* User menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    ref={menuBtnRef}
                    id="userMenuBtn"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="sc-btn sc-btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-full)' }}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person-circle fs-5"></i>
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <i className={`bi bi-chevron-${menuOpen ? 'up' : 'down'}`} style={{ fontSize: '0.65rem' }}></i>
                  </button>

                  {menuOpen && (
                    <div ref={dropdownPanelRef} style={dropdownStyle}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-2)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{user?.email}</div>
                      </div>

                      {isAdmin ? (
                        <Link to="/admin" onClick={close} style={itemStyle('var(--text-primary)')}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                          <i className="bi bi-shield-lock" style={{ color: 'var(--primary-500)', fontSize: '1rem' }}></i>Admin Panel
                        </Link>
                      ) : (
                        <Link to="/dashboard" onClick={close} style={itemStyle('var(--text-primary)')}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                          <i className="bi bi-speedometer2" style={{ color: 'var(--primary-500)', fontSize: '1rem' }}></i>User Panel
                        </Link>
                      )}

                      <div style={{ borderTop: '1px solid var(--border-color)' }}>
                        <button onClick={handleLogout} style={itemStyle('#ef4444')}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                          <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem' }}></i>Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="sc-btn sc-btn-ghost sc-btn-sm" onClick={() => setNavOpen(false)}>Log In</Link>
                <Link to="/register" className="sc-btn sc-btn-primary sc-btn-sm" onClick={() => setNavOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
