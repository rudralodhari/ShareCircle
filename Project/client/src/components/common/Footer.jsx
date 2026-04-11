import { Link } from 'react-router-dom';

const SERVICES = [
  { label: 'Buy', key: 'buy' },
  { label: 'Sell', key: 'sell' },
  { label: 'Rent', key: 'rent' },
  { label: 'Borrow', key: 'borrow' },
  { label: 'Share', key: 'share' },
  { label: 'Exchange', key: 'exchange' },
  { label: 'Donate', key: 'donate' },
];

const SUPPORT = [
  { label: 'Help Center', to: '/support?tab=help' },
  { label: 'Safety Tips', to: '/support?tab=safety' },
  { label: 'Community Guidelines', to: '/support?tab=guidelines' },
  { label: 'Contact Us', to: '/support?tab=contact' },
];

const EXPLORE = [
  { to: '/browse', label: 'Browse Items' },
  { to: '/community', label: 'Community' },
  { to: '/sustainability', label: 'Sustainability' },
  { to: '/about', label: 'About Us' },
];

const linkStyle = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '0.88rem',
  transition: 'color 0.15s',
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}>
      <div className="container py-5">
        <div className="row g-4">

          {/* Brand */}
          <div className="col-lg-3 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-recycle fs-4" style={{ color: 'var(--primary-500)' }}></i>
              <span className="fw-bold fs-5 text-gradient">ShareCircle</span>
            </div>
            <p className="mb-3" style={{ color: 'var(--text-secondary)', maxWidth: 280, fontSize: '0.88rem' }}>
              Building stronger communities through sharing. Reduce waste, save money, and connect with your neighbors.
            </p>
            <div className="d-flex gap-2">
              {[
                { icon: 'facebook', href: 'https://facebook.com' },
                { icon: 'twitter', href: 'https://twitter.com' },
                { icon: 'instagram', href: 'https://instagram.com' },
                { icon: 'linkedin', href: 'https://linkedin.com' },
              ].map((s) => (
                <a key={s.icon} href={s.href} target="_blank" rel="noreferrer"
                  className="sc-btn sc-btn-ghost sc-btn-icon" style={{ width: 36, height: 36 }}>
                  <i className={`bi bi-${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {EXPLORE.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} style={linkStyle}
                    onMouseEnter={(e) => e.target.style.color = 'var(--primary-500)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Services</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {SERVICES.map((t) => (
                <li key={t.key}>
                  <Link to={`/browse?type=${t.key}`} style={linkStyle}
                    onMouseEnter={(e) => e.target.style.color = 'var(--primary-500)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Support</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {SUPPORT.map((t) => (
                <li key={t.label}>
                  <Link to={t.to} style={linkStyle}
                    onMouseEnter={(e) => e.target.style.color = 'var(--primary-500)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Stay Updated</h6>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Get the latest on community sharing and new features.
            </p>
            <div className="d-flex gap-2">
              <input type="email" placeholder="your@email.com"
                className="sc-input" style={{ fontSize: '0.85rem', padding: '8px 12px' }} />
              <button className="sc-btn sc-btn-primary sc-btn-sm" style={{ whiteSpace: 'nowrap' }}>
                <i className="bi bi-send"></i>
              </button>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0 1rem' }} />

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2"
          style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          <span>© {year} ShareCircle. All rights reserved.</span>
          <div className="d-flex gap-3">
            <Link to="/privacy" style={{ color: 'var(--text-tertiary)' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'var(--text-tertiary)' }}>Terms of Service</Link>
            <Link to="/cookies" style={{ color: 'var(--text-tertiary)' }}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
