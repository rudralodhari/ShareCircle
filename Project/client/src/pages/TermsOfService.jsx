import { useEffect } from 'react';

export default function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="sc-container sc-section fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="sc-card mx-auto" style={{ maxWidth: 800 }}>
        <h1 className="fw-bold mb-4 text-gradient">Terms of Service</h1>
        <p className="text-secondary mb-4">Last updated: April 2026</p>
        
        <h5 className="fw-bold mt-4">1. Acceptance of Terms</h5>
        <p className="text-secondary">By accessing or using the ShareCircle platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

        <h5 className="fw-bold mt-4">2. User Responsibilities</h5>
        <p className="text-secondary">You are responsible for ensuring the accuracy of your listings, treating other community members with respect, and honoring all agreements made for sharing, selling, or renting items.</p>

        <h5 className="fw-bold mt-4">3. Prohibited Items and Behaviors</h5>
        <p className="text-secondary">Users may not list illegal items, weapons, hazardous materials, or engage in fraudulent activities. We reserve the right to ban users who violate these guidelines.</p>
      </div>
    </div>
  );
}
