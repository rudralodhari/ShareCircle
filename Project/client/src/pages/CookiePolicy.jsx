import { useEffect } from 'react';

export default function CookiePolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="sc-container sc-section fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="sc-card mx-auto" style={{ maxWidth: 800 }}>
        <h1 className="fw-bold mb-4 text-gradient">Cookie Policy</h1>
        <p className="text-secondary mb-4">Last updated: April 2026</p>
        
        <h5 className="fw-bold mt-4">1. What are cookies?</h5>
        <p className="text-secondary">Cookies are small text files stored on your device that help us provide and improve our services, remember your preferences, and keep your session secure.</p>

        <h5 className="fw-bold mt-4">2. How we use cookies</h5>
        <p className="text-secondary">We use essential cookies to keep you logged in to ShareCircle. We also use preference cookies to remember your display settings, such as Dark Mode or Light Mode preferences.</p>

        <h5 className="fw-bold mt-4">3. Your choices</h5>
        <p className="text-secondary">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept essential cookies, you may not be able to use some portions of our Service.</p>
      </div>
    </div>
  );
}
