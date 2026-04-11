import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { validateRegisterForm } from '../../utils/validators';

export default function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sc-card auth-card fade-in">
      <div className="text-center mb-4">
        <i className="bi bi-recycle fs-1" style={{ color: 'var(--primary-500)' }}></i>
        <h3 className="mt-2">Join ShareCircle</h3>
        <p style={{ color: 'var(--text-tertiary)' }}>Start sharing with your community today</p>
      </div>

      {serverError && (
        <div className="alert alert-danger d-flex align-items-center gap-2" style={{ borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <i className="bi bi-exclamation-circle"></i> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange}
            className={`sc-input ${errors.name ? 'border-danger' : ''}`}
            placeholder="John Doe" id="register-name" />
          {errors.name && <small className="text-danger">{errors.name}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            className={`sc-input ${errors.email ? 'border-danger' : ''}`}
            placeholder="you@example.com" id="register-email" />
          {errors.email && <small className="text-danger">{errors.email}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            className={`sc-input ${errors.password ? 'border-danger' : ''}`}
            placeholder="••••••••" id="register-password" />
          {errors.password && <small className="text-danger">{errors.password}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Confirm Password</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
            className={`sc-input ${errors.confirmPassword ? 'border-danger' : ''}`}
            placeholder="••••••••" id="register-confirm" />
          {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
        </div>

        <button type="submit" className="sc-btn sc-btn-primary w-100 sc-btn-lg mt-2" disabled={loading} id="register-submit">
          {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</> : 'Create Account'}
        </button>
      </form>

      <p className="text-center mt-4 mb-0" style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" className="fw-semibold">Sign in</Link>
      </p>
    </div>
  );
}
