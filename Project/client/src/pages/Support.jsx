import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Support() {
  const [activeTab, setActiveTab] = useState('help');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['help', 'safety', 'guidelines', 'contact'].includes(tab)) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
  
  const faqs = [
    { q: "How do I rent an item?", a: "To rent an item, browse the listings, click on an item you like, and select 'Request to Borrow/Rent'. The owner will receive your request and can approve it." },
    { q: "Is ShareCircle free?", a: "Joining and basic sharing/borrowing is free. Some premium rentals might incur a fee set by the owner. ShareCircle takes a small service fee on paid transactions." },
    { q: "What happens if an item is damaged?", a: "We have a dispute resolution process. Owners are encouraged to request a deposit, and we provide mediation if an item is returned damaged." },
    { q: "How do I verify my account?", a: "Go to your Profile settings and click 'Verify Identity'. You'll need to provide a valid ID and phone number." }
  ];

  const guidelines = [
    "Treat all community members with respect and kindness.",
    "Be punctual when meeting to exchange items.",
    "Return items in the same (or better) condition than you received them.",
    "Communicate clearly and promptly through our built-in messaging system.",
    "Do not list prohibited, illegal, or dangerous items."
  ];

  return (
    <div className="sc-container py-5 fade-in">
      
      {/* Header section */}
      <div className="text-center mb-5">
        <span className="sc-badge sc-badge-primary mb-3"><i className="bi bi-life-preserver me-1"></i> Support Center</span>
        <h1 className="fw-bold mb-3">How can we help you?</h1>
        <p style={{ maxWidth: 600, margin: '0 auto', color: 'var(--text-secondary)' }}>
          Whether you need help with a transaction, want to learn our safety guidelines, or need to contact our team, you're in the right place.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
        {[
          { id: 'help', icon: 'bi-question-circle', label: 'Help Center' },
          { id: 'safety', icon: 'bi-shield-check', label: 'Safety Tips' },
          { id: 'guidelines', icon: 'bi-book', label: 'Community Guidelines' },
          { id: 'contact', icon: 'bi-envelope', label: 'Contact Us' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`sc-btn ${activeTab === tab.id ? 'sc-btn-primary' : 'sc-btn-outline'}`}
            style={activeTab === tab.id ? {} : { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <i className={`${tab.icon} me-2`}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="sc-card p-4 p-md-5">
        
        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="fade-in">
            <h3 className="fw-bold mb-4">Frequently Asked Questions</h3>
            <div className="d-flex flex-column gap-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                  <h6 className="fw-bold mb-2 d-flex align-items-start gap-2">
                    <i className="bi bi-info-circle text-primary mt-1"></i> {faq.q}
                  </h6>
                  <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Tips Tab */}
        {activeTab === 'safety' && (
          <div className="fade-in">
            <h3 className="fw-bold mb-4">Safety First</h3>
            <div className="row g-4">
              {[
                { title: 'Meet in Public', desc: 'Always arrange item exchanges in public, well-lit places. Consider meeting near a local police station or busy cafe.', icon: 'bi-people' },
                { title: 'Inspect Items', desc: 'Thoroughly inspect the item before finalizing the exchange to ensure it matches the description.', icon: 'bi-search' },
                { title: 'Protect Information', desc: 'Never share your financial details or home address in public chats. Use our secure messaging.', icon: 'bi-lock' },
                { title: 'Report Suspicious Activity', desc: 'If a listing or user seems suspicious, use the Report button immediately.', icon: 'bi-flag' }
              ].map((tip, idx) => (
                <div key={idx} className="col-md-6">
                  <div className="d-flex gap-3 h-100 p-4 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle" style={{ width: 48, height: 48, background: 'rgba(59,130,246,0.1)', color: 'var(--primary-600)', fontSize: '1.5rem' }}>
                      <i className={tip.icon}></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-2">{tip.title}</h6>
                      <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{tip.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div className="fade-in">
            <h3 className="fw-bold mb-2">Our Community Guidelines</h3>
            <p style={{ color: 'var(--text-tertiary)' }} className="mb-4">To ensure a safe and pleasant experience for everyone, all members must adhere to these rules.</p>
            
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
              {guidelines.map((guide, idx) => (
                <li key={idx} className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                  <i className="bi bi-check2-circle text-success fs-5"></i>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', paddingTop: '2px' }}>{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Us Tab */}
        {activeTab === 'contact' && (
          <div className="fade-in row g-4">
            <div className="col-md-6">
              <h3 className="fw-bold mb-4">Get in Touch</h3>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                Need more specific help? Send our support team a message and we'll get back to you within 24 hours.
              </p>
              
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: 'var(--bg-surface-2)' }}>
                    <i className="bi bi-envelope text-primary"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Email</div>
                    <div style={{ fontWeight: 500 }}>support@sharecircle.com</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: 'var(--bg-surface-2)' }}>
                    <i className="bi bi-telephone text-primary"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Phone (Emergencies only)</div>
                    <div style={{ fontWeight: 500 }}>+1 (800) 555-0199</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <form className="p-4 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }} onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Name</label>
                  <input type="text" className="form-control sc-input" placeholder="Your name" required />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
                  <input type="email" className="form-control sc-input" placeholder="Your email address" required />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Message</label>
                  <textarea className="form-control sc-input" rows="4" placeholder="How can we help?" required></textarea>
                </div>
                <button type="submit" className="sc-btn sc-btn-primary w-100">Send Message</button>
              </form>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
