import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="sc-container sc-section fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="sc-card mx-auto" style={{ maxWidth: 800 }}>
        <h1 className="fw-bold mb-4 text-gradient">Privacy Policy</h1>
        <p className="text-secondary mb-4">Last updated: April 2026</p>
        
        <h5 className="fw-bold mt-4">1. Information We Collect</h5>
        <p className="text-secondary">We collect information you provide directly to us when you register, complete your profile, or interact with our community hub and listings. This includes your name, email, location data, and transaction history.</p>

        <h5 className="fw-bold mt-4">2. How We Use Your Information</h5>
        <p className="text-secondary">We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you related information, and to facilitate the sharing and borrowing of items among the community.</p>

        <h5 className="fw-bold mt-4">3. Information Sharing</h5>
        <p className="text-secondary">We do not share your personal information with third parties except as necessary to provide our services (e.g., sharing your approximate location or contact info with a verified buyer/seller to coordinate an exchange).</p>
      </div>
    </div>
  );
}
