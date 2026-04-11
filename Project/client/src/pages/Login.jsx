import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const QUICK_LOGINS = [
  { label: 'User', email: 'user@sharecircle.com', password: 'demo123', icon: 'bi-person', color: 'var(--primary-500)' },
];

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('sc-remember-email');
    const savedPassword = localStorage.getItem('sc-remember-password');
    if (savedEmail && savedPassword) {
      setForm((f) => ({ ...f, email: savedEmail, password: savedPassword }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const doLogin = async (credentials) => {
    if (!credentials.email || !credentials.password) {
      toast.warning('Please enter both email and password.');
      return;
    }
    try {
      const result = await login(credentials);
      const role = result?.data?.user?.role;
      const name = result?.data?.user?.name?.split(' ')[0];

      // Save/remove remembered credentials
      if (rememberMe) {
        localStorage.setItem('sc-remember-email', credentials.email);
        localStorage.setItem('sc-remember-password', credentials.password);
      } else {
        localStorage.removeItem('sc-remember-email');
        localStorage.removeItem('sc-remember-password');
      }

      toast.success(`Welcome back, ${name}! 🎉`);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      if (msg.toLowerCase().includes('banned')) {
        toast.error('🚫 Your account has been banned for suspicious activity. Contact support.');
      } else if (msg.toLowerCase().includes('invalid')) {
        toast.error('❌ Invalid email or password. Please check your credentials.');
      } else {
        toast.error(msg);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(form);
  };

  const handleQuickLogin = async (creds) => {
    setForm({ email: creds.email, password: creds.password });
    await doLogin(creds);
  };

  return (
    <div className="sc-container sc-section fade-in" style={{ minHeight: '80vh', paddingTop: 'var(--space-8)' }}>
      <div className="row align-items-center g-5" style={{ minHeight: '70vh' }}>
        {/* Left: image panel (hidden on mobile) */}
        <div className="col-lg-6 d-none d-lg-block">
          <div className="auth-image-panel">
            <div className="auth-image-grid">
              <img src="/images/products/mountain-bicycle.jpg" alt="" className="auth-img auth-img-1" onError={(e) => { e.target.style.background = 'var(--primary-100)'; e.target.src = ''; }} />
              <img src="/images/products/garden-tools.jpg" alt="" className="auth-img auth-img-2" onError={(e) => { e.target.style.background = 'var(--primary-100)'; e.target.src = ''; }} />
              <img src="/images/products/yoga-mat.jpg" alt="" className="auth-img auth-img-3" onError={(e) => { e.target.style.background = 'var(--primary-100)'; e.target.src = ''; }} />
            </div>
            <div className="text-center mt-4">
              <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Share with your community</h5>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', maxWidth: 320, margin: '0 auto' }}>
                Join thousands of neighbors sharing, renting, and exchanging resources locally.
              </p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="col-lg-6 d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: 440 }}>
            <div className="sc-card">
              <div className="text-center mb-4">
                <i className="bi bi-recycle fs-1" style={{ color: 'var(--primary-500)' }}></i>
                <h2 className="fw-bold mt-2 mb-1">Welcome back</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Sign in to your ShareCircle account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email address</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className="sc-input" placeholder="you@example.com" id="login-email" autoComplete="email" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
                  <div className="position-relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                      className="sc-input" placeholder="Enter your password" id="login-password" autoComplete="current-password"
                      style={{ paddingRight: '40px' }} />
                    <button
                      type="button"
                      className="btn position-absolute top-50 translate-middle-y end-0 border-0 shadow-none text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="mb-4 d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                  />
                  <label htmlFor="remember-me" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                    Remember me
                  </label>
                </div>

                <button type="submit" className="sc-btn sc-btn-primary w-100 sc-btn-lg" id="login-submit" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                  ) : (
                    <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
                  )}
                </button>
              </form>



              <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: 0 }}>
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="fw-semibold" style={{ color: 'var(--primary-500)', textDecoration: 'none' }}>Sign up free</Link>
                </p>
              </div>
            </div>

            <div className="mt-3 text-center">
              <Link to="/admin/login" className="d-inline-flex align-items-center gap-2" style={{ color: '#8B5CF6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                <i className="bi bi-shield-lock"></i> Admin Login
                <i className="bi bi-arrow-right" style={{ fontSize: '0.75rem' }}></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
