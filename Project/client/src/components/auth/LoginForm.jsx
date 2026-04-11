import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validators';

const DEMO_USER = { email: 'user@sharecircle.com', password: 'demo123' };

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await login(form);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrors({});
    setServerError('');
    try {
      await login(DEMO_USER);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Demo login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="sc-card auth-card fade-in">
      <div className="text-center mb-4">
        <i className="bi bi-recycle fs-1" style={{ color: 'var(--primary-500)' }}></i>
        <h3 className="mt-2">Welcome Back</h3>
        <p style={{ color: 'var(--text-tertiary)' }}>Sign in to your ShareCircle account</p>
      </div>

      {serverError && (
        <div className="alert alert-danger d-flex align-items-center gap-2" style={{ borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <i className="bi bi-exclamation-circle"></i> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email</label>
          <input
            type="email" name="email" value={form.email} onChange={handleChange}
            className={`sc-input ${errors.email ? 'border-danger' : ''}`}
            placeholder="you@example.com" id="login-email"
          />
          {errors.email && <small className="text-danger">{errors.email}</small>}
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
            <a href="#" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
          </div>
          <input
            type="password" name="password" value={form.password} onChange={handleChange}
            className={`sc-input ${errors.password ? 'border-danger' : ''}`}
            placeholder="••••••••" id="login-password"
          />
          {errors.password && <small className="text-danger">{errors.password}</small>}
        </div>

        <button type="submit" className="sc-btn sc-btn-primary w-100 sc-btn-lg mt-2" disabled={loading || demoLoading} id="login-submit">
          {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</> : 'Sign In'}
        </button>
      </form>

      {/* ── Demo Quick Access ── */}
      <div className="mt-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, rgba(0,0,0,0.1))' }}></div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Quick Access
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, rgba(0,0,0,0.1))' }}></div>
        </div>

        <button
          type="button"
          id="demo-user-login"
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
          className="w-100"
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--primary-400, #34d399)',
            background: 'transparent',
            color: 'var(--primary-500, #10b981)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: loading || demoLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background 0.2s, color 0.2s',
            opacity: loading || demoLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (!loading && !demoLoading) {
              e.currentTarget.style.background = 'var(--primary-500, #10b981)';
              e.currentTarget.style.color = '#fff';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--primary-500, #10b981)';
          }}
        >
          {demoLoading
            ? <><span className="spinner-border spinner-border-sm"></span>&nbsp;Logging in...</>
            : <><i className="bi bi-person-check-fill"></i> Try Demo User</>
          }
        </button>

        <p className="text-center mt-1 mb-0" style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
          <i className="bi bi-info-circle me-1"></i>
          user@sharecircle.com — one click, no typing needed
        </p>
      </div>

      <p className="text-center mt-4 mb-0" style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
        Don&apos;t have an account? <Link to="/register" className="fw-semibold">Sign up</Link>
      </p>
    </div>
  );
}
