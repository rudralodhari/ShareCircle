import { Link } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';

export default function About() {
  useScrollReveal();

  const team = [
    { name: 'Sustainability', icon: 'bi-leaf', desc: 'We believe sharing is the most impactful form of sustainability.' },
    { name: 'Community', icon: 'bi-people', desc: 'Strong neighborhoods are built on trust, generosity, and connection.' },
    { name: 'Accessibility', icon: 'bi-universal-access', desc: 'Everyone deserves access to the resources they need.' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <section className="sc-section" style={{ background: 'var(--gradient-hero)', color: '#fff', padding: 'var(--space-16) 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <h1 data-scroll="fade-up" style={{ color: '#fff', fontWeight: 800 }}>About ShareCircle</h1>
              <p data-scroll="fade-up" data-delay="1" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: 520 }}>
                We&apos;re on a mission to transform how communities share resources — reducing waste, strengthening bonds, and building a circular economy from the ground up.
              </p>
              <div className="d-flex gap-4 mt-4 flex-wrap" data-scroll="fade-up" data-delay="2">
                {[{ num: '10K+', label: 'Users' }, { num: '25K+', label: 'Items Shared' }, { num: '500+', label: 'Communities' }].map((s) => (
                  <div key={s.label} className="text-center">
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.num}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="about-photo-stack">
                <div className="about-photo about-photo-1" data-scroll="zoom-in" data-delay="1">
                  <img src="/images/products/garden-tools.jpg" alt="" />
                  <span>Share</span>
                </div>
                <div className="about-photo about-photo-2" data-scroll="zoom-in" data-delay="2">
                  <img src="/images/products/camping-tent.jpg" alt="" />
                  <span>Rent</span>
                </div>
                <div className="about-photo about-photo-3" data-scroll="zoom-in" data-delay="3">
                  <img src="/images/products/kitchen-mixer.jpg" alt="" />
                  <span>Sell</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="sc-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="sc-badge sc-badge-primary mb-3" data-scroll="fade-right">Our Mission</span>
              <h2 className="fw-bold" data-scroll="fade-up" data-delay="1">Empowering Communities Through Sharing</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)' }} data-scroll="fade-up" data-delay="2">
                ShareCircle was born from a simple idea: most of the things we own sit idle most of the time. 
                What if we could share them with the people around us? Our platform supports 7 types of 
                transactions — Buy, Sell, Rent, Borrow, Share, Exchange, and Donate — making it easy to 
                participate in the circular economy.
              </p>
              <Link to="/register" className="sc-btn sc-btn-primary mt-3" data-scroll="fade-up" data-delay="3">
                Join the Movement <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                {team.map((v, i) => (
                  <div key={i} className="col-12">
                    <div className="sc-card d-flex align-items-center gap-4" data-scroll={['fade-left', 'fade-right', 'zoom-in'][i % 3]} data-delay={String(i + 1)}>
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                        style={{ width: 56, height: 56, background: 'var(--primary-50)', color: 'var(--primary-500)', fontSize: '1.4rem' }}>
                        <i className={`bi ${v.icon}`}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{v.name}</h5>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>{v.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
