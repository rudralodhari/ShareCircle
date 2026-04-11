import { Link } from 'react-router-dom';
import { TRANSACTION_TYPES } from '../utils/constants';

const shareTypes = [
  { key: 'buy',      label: 'Buy',      icon: 'bi-cart',             gradient: 'linear-gradient(135deg, #10B981 0%, #064e3b 100%)' },
  { key: 'sell',     label: 'Sell',     icon: 'bi-tag',              gradient: 'linear-gradient(135deg, #14B8A6 0%, #134e4a 100%)' },
  { key: 'rent',     label: 'Rent',     icon: 'bi-key',              gradient: 'linear-gradient(135deg, #8B5CF6 0%, #4c1d95 100%)' },
  { key: 'borrow',   label: 'Borrow',   icon: 'bi-arrow-left-right', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1e3a8a 100%)' },
  { key: 'share',    label: 'Share',    icon: 'bi-people',           gradient: 'linear-gradient(135deg, #F59E0B 0%, #78350f 100%)' },
  { key: 'exchange', label: 'Exchange', icon: 'bi-repeat',           gradient: 'linear-gradient(135deg, #EC4899 0%, #831843 100%)' },
  { key: 'donate',   label: 'Donate',   icon: 'bi-gift',             gradient: 'linear-gradient(135deg, #EF4444 0%, #7f1d1d 100%)' },
];

export default function Home() {
  const features = [
    { icon: 'bi-people', title: 'Community Driven', desc: 'Connect with neighbors and build trust through local sharing.' },
    { icon: 'bi-shield-check', title: 'Safe & Secure', desc: 'Verified profiles, reviews, and damage protection agreements.' },
    { icon: 'bi-geo-alt', title: 'Hyperlocal', desc: 'Find items near you with geolocation-based search.' },
    { icon: 'bi-wallet2', title: 'Cost Effective', desc: 'Save money by borrowing or renting instead of buying new.' },
    { icon: 'bi-tree', title: 'Eco-Friendly', desc: 'Reduce waste and help build a sustainable circular economy.' },
    { icon: 'bi-clock-history', title: 'Convenient', desc: 'Instantly find what you need within a short walking distance.' },
    { icon: 'bi-chat-text', title: 'Easy Communication', desc: 'Chat directly with owners to coordinate pickups safely.' },
    { icon: 'bi-star', title: 'Quality Assured', desc: 'Items are reviewed and rated by other local community members.' }
  ];

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 hero-content">
              <div className="sc-badge sc-badge-primary mb-3 hero-pop-in delay-1" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                🌱 Join the Circular Economy
              </div>
              <h1 className="hero-slide-left delay-2">Share Locally,<br />Live Sustainably</h1>
              <p className="mb-4 hero-blur-in delay-3">
                ShareCircle connects neighbors to share, rent, borrow, buy, sell, exchange, and donate 
                resources — reducing waste and building stronger communities.
              </p>
              <div className="d-flex gap-3 flex-wrap hero-pop-in delay-4">
                <Link to="/browse" className="sc-btn sc-btn-lg" style={{ background: '#fff', color: 'var(--primary-600)', fontWeight: 700 }}>
                  <i className="bi bi-search"></i> Browse Items
                </Link>
                <Link to="/register" className="sc-btn sc-btn-outline sc-btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                  Get Started <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Hero — Pinwheel Fan */}
            <div className="col-lg-6 d-none d-lg-block hero-slide-right delay-3">
              <div className="hero-wheel-outer">
                <div className="circular-wheel-wrapper hero-wheel-wrapper">
                  {/* Centre hub */}
                  <div className="circular-center-hub">
                    <i className="bi bi-recycle" />
                    <span>ShareCircle</span>
                  </div>
                  {/* Fan cards — tangentially rotated, progressively layered */}
                  {shareTypes.map((t, i) => {
                    const posAngleDeg = (i / shareTypes.length) * 360 - 90;
                    const R = 140;
                    const x = Math.round(Math.cos(posAngleDeg * Math.PI / 180) * R);
                    const y = Math.round(Math.sin(posAngleDeg * Math.PI / 180) * R);
                    const cardRotation = Math.round(posAngleDeg + 90);
                    return (
                      <Link
                        to={`/browse?type=${t.key}`}
                        key={t.key}
                        className="pinwheel-card-link"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          '--card-rot': `${cardRotation}deg`,
                          zIndex: ((i + 1) % shareTypes.length) + 1,
                        }}
                      >
                        <div className="pinwheel-card" style={{ background: t.gradient }}>
                          <div className="pinwheel-card-icon">
                            <i className={`bi ${t.icon}`} />
                          </div>
                          <span className="pinwheel-card-label">{t.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Types */}
      <section className="sc-section" style={{ background: 'var(--bg-body)' }}>
        <div className="container text-center">
          <h2 className="mb-2" data-scroll="fade-down">7 Ways to Share</h2>
          <p className="mb-5" data-scroll="blur-in" data-delay="1" style={{ maxWidth: 500, margin: '0 auto' }}>One platform for all types of resource sharing</p>
          <div className="transaction-types mb-4">
            {TRANSACTION_TYPES.map((t, i) => (
              <Link to={`/browse?type=${t.key}`} key={t.key} className="sc-chip" data-scroll="zoom-in" data-delay={String((i % 4) + 1)} style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '0.95rem', textDecoration: 'none' }}>
                <i className={`bi ${t.icon}`} style={{ color: t.color }}></i>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sc-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 data-scroll="fade-up">Why ShareCircle?</h2>
            <p data-scroll="blur-in" data-delay="1" style={{ maxWidth: 480, margin: '0 auto' }}>Everything you need for community-based resource sharing</p>
          </div>
          <div className="feature-grid">
            {features.map((f, i) => {
              const anims = ['fade-up', 'fade-left', 'zoom-in', 'fade-right', 'flip-up', 'rotate-in'];
              return (
              <div key={i} className="sc-card feature-card" data-scroll={anims[i % anims.length]} data-delay={String((i % 4) + 1)}>
                <div className="feature-icon">
                  <i className={`bi ${f.icon}`}></i>
                </div>
                <h5 className="fw-bold mb-2">{f.title}</h5>
                <p style={{ fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="sc-section" style={{ background: 'var(--bg-body)' }}>
        <div className="container">
          <div className="stats-row">
            {[
              { number: '10K+', label: 'Active Users' },
              { number: '25K+', label: 'Items Shared' },
              { number: '5T+', label: 'CO₂ Saved (kg)' },
              { number: '500+', label: 'Communities' },
            ].map((s, i) => {
              const anims = ['fade-left', 'fade-up', 'zoom-in', 'fade-right'];
              return (
              <div key={i} className="stat-item" data-scroll={anims[i % anims.length]} data-delay={String(i + 1)}>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sc-section text-center" style={{ background: 'var(--gradient-hero)', color: '#fff', padding: 'var(--space-16) 0' }}>
        <div className="container">
          <h2 data-scroll="fade-down" style={{ color: '#fff' }}>Ready to Start Sharing?</h2>
          <p data-scroll="blur-in" data-delay="1" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 480, margin: '0 auto var(--space-6)' }}>
            Join thousands of neighbors already making a difference in their communities.
          </p>
          <div data-scroll="zoom-in" data-delay="2">
            <Link to="/register" className="sc-btn sc-btn-lg" style={{ background: '#fff', color: 'var(--primary-600)', fontWeight: 700 }}>
              Join ShareCircle Today <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
