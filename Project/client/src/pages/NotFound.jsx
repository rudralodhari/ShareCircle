import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-wrapper fade-in">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 text-center text-lg-start">
            <div style={{ fontSize: '7rem', fontWeight: 800, lineHeight: 1 }} className="text-gradient mb-3 hero-slide-left delay-1">404</div>
            <h3 className="fw-bold mb-2 hero-slide-left delay-2">Page Not Found</h3>
            <p style={{ color: 'var(--text-tertiary)', maxWidth: 400, marginBottom: 'var(--space-6)' }} className="hero-blur-in delay-3">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="d-flex gap-3 justify-content-center justify-content-lg-start hero-pop-in delay-4">
              <Link to="/" className="sc-btn sc-btn-primary sc-btn-lg">
                <i className="bi bi-house"></i> Go Home
              </Link>
              <Link to="/browse" className="sc-btn sc-btn-outline sc-btn-lg">
                <i className="bi bi-search"></i> Browse Items
              </Link>
            </div>
          </div>
          <div className="col-lg-6 d-none d-lg-block">
            <div className="notfound-images hero-slide-right delay-2">
              <div className="notfound-img-card notfound-img-1">
                <img src="/images/products/baby-stroller.jpg" alt="" />
              </div>
              <div className="notfound-img-card notfound-img-2">
                <img src="/images/products/power-drill.jpg" alt="" />
              </div>
              <div className="notfound-img-card notfound-img-3">
                <img src="/images/products/yoga-mat.jpg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
