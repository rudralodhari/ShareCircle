import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

// ── Password & Email validation helpers ──
const PWD_RULES = [
  { key: 'minLen',   label: 'At least 8 characters',    test: (p) => p.length >= 8 },
  { key: 'maxLen',   label: 'Maximum 20 characters',     test: (p) => p.length <= 20 && p.length > 0 },
  { key: 'upper',    label: '1 uppercase letter (A-Z)',   test: (p) => /[A-Z]/.test(p) },
  { key: 'lower',    label: '1 lowercase letter (a-z)',   test: (p) => /[a-z]/.test(p) },
  { key: 'number',   label: '1 number (0-9)',             test: (p) => /[0-9]/.test(p) },
  { key: 'symbol',   label: '1 special symbol (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const VALID_TLDS = ['com','in','org','net','edu','co','io','dev','info','biz','us','uk','co.in','ac.in','gov','gov.in'];
const POPULAR_DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','protonmail.com','icloud.com','aol.com','mail.com','zoho.com','yandex.com','rediffmail.com'];

function validateEmail(email) {
  const checks = [];
  const hasAt = email.includes('@');
  const parts = email.split('@');
  const username = parts[0] || '';
  const domain = parts[1] || '';
  const domainParts = domain.split('.');
  const tld = domainParts.length >= 2 ? domainParts.slice(1).join('.') : '';

  checks.push({ label: 'Contains @ symbol', pass: hasAt });
  checks.push({ label: 'Has unique username', pass: username.length >= 2 && /^[a-zA-Z0-9._+-]+$/.test(username) });
  checks.push({ label: 'Has domain name', pass: domainParts[0]?.length >= 2 });
  checks.push({ label: 'Contains . separator', pass: domain.includes('.') });
  checks.push({ label: 'Has valid TLD (.com, .in, etc.)', pass: VALID_TLDS.includes(tld.toLowerCase()) });
  checks.push({ label: 'Known email provider', pass: POPULAR_DOMAINS.includes(domain.toLowerCase()), optional: true });

  return checks;
}

function getStrengthPercent(password) {
  if (!password) return 0;
  const passed = PWD_RULES.filter((r) => r.test(password)).length;
  return Math.round((passed / PWD_RULES.length) * 100);
}

function getStrengthLabel(pct) {
  if (pct <= 16) return { label: 'Very Weak', color: '#ef4444' };
  if (pct <= 33) return { label: 'Weak', color: '#f97316' };
  if (pct <= 66) return { label: 'Fair', color: '#f59e0b' };
  if (pct <= 83) return { label: 'Good', color: '#22c55e' };
  return { label: 'Strong 💪', color: '#10b981' };
}

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', referralCode: '' });
  const [showPwdInfo, setShowPwdInfo] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'password') setShowPwdInfo(true);
    if (e.target.name === 'email') setShowEmailInfo(true);
  };

  // Password strength
  const pwdStrength = useMemo(() => getStrengthPercent(form.password), [form.password]);
  const pwdLabel = useMemo(() => getStrengthLabel(pwdStrength), [pwdStrength]);
  const pwdRulesStatus = useMemo(() => PWD_RULES.map((r) => ({ ...r, pass: r.test(form.password) })), [form.password]);

  // Email validation
  const emailChecks = useMemo(() => validateEmail(form.email), [form.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRequired = emailChecks.filter((c) => !c.optional);
    const emailFail = emailRequired.find((c) => !c.pass);
    if (emailFail) {
      toast.error(`Email invalid: ${emailFail.label}`);
      return;
    }

    // Password validation
    const pwdFail = PWD_RULES.find((r) => !r.test(form.password));
    if (pwdFail) {
      toast.error(`Password must have: ${pwdFail.label}`);
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await register(form);
      toast.success('Account created successfully! 🎉 Complete your profile next.');
      navigate('/complete-profile');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="sc-container sc-section fade-in" style={{ minHeight: '80vh', paddingTop: 'var(--space-8)' }}>
      <div className="row align-items-center g-5" style={{ minHeight: '70vh' }}>
        {/* Left: image panel */}
        <div className="col-lg-5 d-none d-lg-block">
          <div className="auth-image-panel">
            <div className="auth-image-grid">
              <img src="/images/products/standing-desk.jpg" alt="" className="auth-img auth-img-1" onError={(e) => { e.target.style.background='var(--primary-100)'; e.target.src=''; }} />
              <img src="/images/products/harry-potter-books.jpg" alt="" className="auth-img auth-img-2" onError={(e) => { e.target.style.background='var(--primary-100)'; e.target.src=''; }} />
              <img src="/images/products/kids-toys.jpg" alt="" className="auth-img auth-img-3" onError={(e) => { e.target.style.background='var(--primary-100)'; e.target.src=''; }} />
            </div>
            <div className="text-center mt-4">
              <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Join the movement</h5>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', maxWidth: 320, margin: '0 auto' }}>
                Buy, sell, rent, borrow, share, exchange, and donate — all in one platform.
              </p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="col-lg-7 d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: 520 }}>
            <div className="sc-card">
              <div className="text-center mb-4">
                <i className="bi bi-recycle fs-1" style={{ color: 'var(--primary-500)' }}></i>
                <h2 className="fw-bold mt-2 mb-1">Join ShareCircle</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Start sharing with your community today</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full Name <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    className="sc-input" placeholder="Your full name" id="register-name" autoComplete="name" required />
                </div>

                {/* Email with validation */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email address <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className="sc-input" placeholder="you@gmail.com" id="register-email" autoComplete="email" required
                    onFocus={() => setShowEmailInfo(true)} />
                  
                  {showEmailInfo && form.email.length > 0 && (
                    <div className="mt-2 p-2 rounded-3" style={{ background: 'var(--bg-surface-2)', fontSize: '0.8rem' }}>
                      {emailChecks.map((c, i) => (
                        <div key={i} className="d-flex align-items-center gap-2 py-1" style={{ color: c.pass ? '#10b981' : (c.optional ? 'var(--text-tertiary)' : '#ef4444') }}>
                          <i className={`bi ${c.pass ? 'bi-check-circle-fill' : (c.optional ? 'bi-dash-circle' : 'bi-x-circle-fill')}`} style={{ fontSize: '0.75rem' }}></i>
                          <span>{c.label}{c.optional ? ' (optional)' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Password with strength meter */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    className="sc-input" placeholder="Min. 8 characters" id="register-password" autoComplete="new-password" required
                    onFocus={() => setShowPwdInfo(true)} />
                  
                  {/* Strength bar */}
                  {form.password.length > 0 && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Password Strength</small>
                        <small style={{ color: pwdLabel.color, fontWeight: 700, fontSize: '0.75rem' }}>{pwdLabel.label}</small>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pwdStrength}%`, background: pwdLabel.color, borderRadius: 3, transition: 'all 0.3s ease' }}></div>
                      </div>
                    </div>
                  )}

                  {showPwdInfo && form.password.length > 0 && (
                    <div className="mt-2 p-2 rounded-3" style={{ background: 'var(--bg-surface-2)', fontSize: '0.8rem' }}>
                      {pwdRulesStatus.map((r) => (
                        <div key={r.key} className="d-flex align-items-center gap-2 py-1" style={{ color: r.pass ? '#10b981' : '#ef4444' }}>
                          <i className={`bi ${r.pass ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} style={{ fontSize: '0.75rem' }}></i>
                          <span>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Confirm Password <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    className="sc-input" placeholder="Repeat password" id="register-confirm-password" autoComplete="new-password" required />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <small className="d-flex align-items-center gap-1 mt-1" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                      <i className="bi bi-x-circle-fill"></i> Passwords do not match
                    </small>
                  )}
                  {form.confirmPassword && form.password === form.confirmPassword && form.password.length > 0 && (
                    <small className="d-flex align-items-center gap-1 mt-1" style={{ color: '#10b981', fontSize: '0.8rem' }}>
                      <i className="bi bi-check-circle-fill"></i> Passwords match
                    </small>
                  )}
                </div>

                {/* Referral Code */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Referral Code (Optional)</label>
                  <input type="text" name="referralCode" value={form.referralCode} onChange={handleChange}
                    className="sc-input" placeholder="e.g. JOHN123" id="register-referral-code" autoComplete="off" />
                  <small style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Enter a friend's code to get an extra discount!</small>
                </div>

                <button type="submit" className="sc-btn sc-btn-primary w-100 sc-btn-lg" id="register-submit" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</>
                  ) : (
                    <><i className="bi bi-person-plus me-2"></i>Create Account</>
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: 0 }}>
                  Already have an account?{' '}
                  <Link to="/login" className="fw-semibold" style={{ color: 'var(--primary-500)', textDecoration: 'none' }}>Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
