import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const { login, loading, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      const result = await login(form);
      const role = result?.data?.user?.role;
      if (role !== 'admin') {
        // Not an admin — log them out immediately so they don't stay logged in as a regular user
        logout();
        setError('Access denied. This login is for administrators only.');
        toast.error('❌ Access denied. Admin credentials required.');
        return;
      }
      toast.success('Welcome back, Admin! 🛡️');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      if (msg.toLowerCase().includes('banned')) {
        setError('🚫 This account has been banned.');
      } else if (msg.toLowerCase().includes('invalid')) {
        setError('❌ Invalid email or password.');
      } else {
        setError(msg);
      }
      toast.error(msg);
    }
  };

  return (
    <div className="sc-container sc-section fade-in" style={{ minHeight: '80vh', paddingTop: 'var(--space-8)' }}>
      <div className="row justify-content-center" style={{ minHeight: '70vh', alignItems: 'center' }}>
        <div className="col-lg-5">
          <div className="sc-card">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                style={{ width: 64, height: 64, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', fontSize: '1.6rem' }}
              >
                <i className="bi bi-shield-lock"></i>
              </div>
              <h2 className="fw-bold mt-2 mb-1">Admin Panel</h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Sign in with your administrator credentials</p>
            </div>

            {error && (
              <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.875rem' }}>
                <i className="bi bi-exclamation-circle me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Admin Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="sc-input" placeholder="admin@example.com" id="admin-login-email" autoComplete="email" />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
                <div className="position-relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                    className="sc-input" placeholder="Enter admin password" id="admin-login-password" autoComplete="current-password" 
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

              <button type="submit" className="sc-btn w-100 sc-btn-lg" id="admin-login-submit" disabled={loading}
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                ) : (
                  <><i className="bi bi-shield-lock me-2"></i>Sign In as Admin</>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <Link to="/login" className="d-inline-flex align-items-center gap-2" style={{ color: 'var(--primary-500)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                <i className="bi bi-arrow-left"></i> Back to User Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
