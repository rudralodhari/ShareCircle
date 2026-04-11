import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import userService from '../services/userService';

const STATES_INDIA = ['Gujarat','Maharashtra','Delhi','Karnataka','Tamil Nadu','Rajasthan','Kerala','Uttar Pradesh','West Bengal','Madhya Pradesh','Other'];

export default function CompleteProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    phone: '', altPhone: '', altEmail: '',
    age: '', gender: '', dob: '',
    address: '', address2: '', city: '', state: '', country: 'India', zipcode: '',
  });
  
  const [customCountry, setCustomCountry] = useState(false);
  const [customState, setCustomState] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.city || !form.state || !form.country || !form.zipcode || !form.address || !form.gender || !form.dob) {
      toast.warning('Please fill all required fields marked with *');
      return;
    }
    setLoading(true);
    try {
      // Upload avatar if provided
      if (avatar) {
        const fd = new FormData();
        fd.append('avatar', avatar);
        const avRes = await userService.uploadAvatar(fd);
        updateUser({ avatar: avRes.data.avatar });
      }
      // Complete profile
      const res = await userService.completeProfile(form);
      updateUser(res.data.user);
      toast.success('Profile completed successfully! 🎉 Welcome to ShareCircle!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile. Please try again.');
    }
    setLoading(false);
  };

  const handleSkip = () => {
    toast.info('You can complete your profile later from the Profile page.');
    navigate('/dashboard');
  };

  const fieldStyle = { color: 'var(--text-secondary)', fontSize: '0.85rem' };
  const req = <span style={{color:'#ef4444'}}>*</span>;

  return (
    <div className="sc-container sc-section fade-in" style={{ paddingTop: 'var(--space-8)', maxWidth: 720, margin: '0 auto' }}>
      <div className="sc-card">
        <div className="text-center mb-4">
          <i className="bi bi-person-badge fs-1" style={{ color: 'var(--primary-500)' }}></i>
          <h2 className="fw-bold mt-2 mb-1">Complete Your Profile</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            Help your community know you better — fill in your personal details
          </p>
        </div>

        {/* Registered Email (read-only) */}
        <div className="mb-4 p-3 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-envelope-check" style={{ color: 'var(--primary-500)' }}></i>
            <div>
              <small style={{ color: 'var(--text-tertiary)' }}>Registered Email</small>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Photo */}
          <div className="mb-4 text-center">
            <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
              <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 100, height: 100, background: 'var(--primary-50)', border: '3px dashed var(--primary-300)', overflow: 'hidden' }}>
                {preview ? (
                  <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="bi bi-camera fs-3" style={{ color: 'var(--primary-400)' }}></i>
                )}
              </div>
              <small style={{ color: 'var(--text-tertiary)' }}>Upload profile photo (optional)</small>
            </label>
            <input type="file" id="avatar-upload" accept="image/*" className="d-none" onChange={handleAvatarChange} />
          </div>

          {/* Phone */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={fieldStyle}>Mobile Number {req}</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="sc-input" placeholder="10-digit number" maxLength="10" pattern="\d{10}" title="Must be exactly 10 digits" required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={fieldStyle}>Other Number <small style={{color:'var(--text-tertiary)'}}>(optional)</small></label>
              <input type="tel" name="altPhone" value={form.altPhone} onChange={handleChange} className="sc-input" placeholder="Alternate phone" maxLength="10" pattern="\d{0,10}" title="Must be exactly 10 digits" />
            </div>
          </div>

          {/* Alt Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={fieldStyle}>Alternate Email <small style={{color:'var(--text-tertiary)'}}>(optional)</small></label>
            <input type="email" name="altEmail" value={form.altEmail} onChange={handleChange} className="sc-input" placeholder="other@email.com" />
          </div>

          {/* Age, Gender, DOB */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={fieldStyle}>Age {req}</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} className="sc-input" placeholder="25" min="13" max="120" required />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={fieldStyle}>Gender {req}</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="sc-input" required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={fieldStyle}>Date of Birth {req}</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="sc-input" required />
            </div>
          </div>

          {/* Address */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={fieldStyle}>Address Line 1 {req}</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="sc-input" placeholder="House No, Street, Area..." required />
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-semibold" style={fieldStyle}>Address Line 2 <small style={{color:'var(--text-tertiary)'}}>(optional)</small></label>
            <input type="text" name="address2" value={form.address2} onChange={handleChange} className="sc-input" placeholder="Landmark, Apartment, Suite, Unit..." />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={fieldStyle}>City {req}</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="sc-input" placeholder="Ahmedabad" required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={fieldStyle}>State {req}</label>
              <select name="state" value={customState ? 'Other' : form.state} onChange={(e) => {
                if (e.target.value === 'Other') {
                  setCustomState(true);
                  setForm({...form, state: ''});
                } else {
                  setCustomState(false);
                  setForm({...form, state: e.target.value});
                }
              }} className="sc-input" required>
                <option value="">Select State</option>
                {STATES_INDIA.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {customState && (
                <input type="text" name="state" value={form.state} onChange={handleChange} className="sc-input mt-2" placeholder="Enter state" required />
              )}
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={fieldStyle}>Country {req}</label>
              <select name="country" value={customCountry ? 'Other' : form.country} onChange={(e) => {
                if (e.target.value === 'Other') {
                  setCustomCountry(true);
                  setForm({...form, country: ''});
                } else {
                  setCustomCountry(false);
                  setForm({...form, country: e.target.value});
                }
              }} className="sc-input" required>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
              {customCountry && (
                <input type="text" name="country" value={form.country} onChange={handleChange} className="sc-input mt-2" placeholder="Enter country" required />
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={fieldStyle}>Zipcode / PIN {req}</label>
              <input type="text" name="zipcode" value={form.zipcode} onChange={handleChange} className="sc-input" placeholder="380015" required />
            </div>
          </div>

          <div className="d-flex gap-3">
            <button type="submit" className="sc-btn sc-btn-primary sc-btn-lg flex-grow-1" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check-lg me-2"></i>Complete Profile</>}
            </button>
            <button type="button" className="sc-btn sc-btn-ghost sc-btn-lg" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
