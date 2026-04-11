import { useState } from 'react';

const STATES_INDIA = ['Gujarat','Maharashtra','Delhi','Karnataka','Tamil Nadu','Rajasthan','Kerala','Uttar Pradesh','West Bengal','Madhya Pradesh','Other'];

export default function ProfileEdit({ user, onSave, loading = false }) {
  const initialCountry = user?.location?.country || 'India';
  const initialState = user?.location?.state || '';
  
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    altPhone: user?.altPhone || '',
    altEmail: user?.altEmail || '',
    age: user?.age || '',
    gender: user?.gender || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    address: user?.location?.address || '',
    address2: user?.location?.address2 || '',
    city: user?.location?.city || '',
    state: initialState,
    country: initialCountry,
    zipcode: user?.location?.zipcode || '',
  });
  
  const isCustomCountry = initialCountry !== 'India' && initialCountry !== '';
  const isCustomState = initialState && !STATES_INDIA.includes(initialState);

  const [customCountry, setCustomCountry] = useState(isCustomCountry);
  const [customState, setCustomState] = useState(isCustomState);
  
  const [avatar, setAvatar] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form, avatar);
  };

  const fieldStyle = { color: 'var(--text-secondary)', fontSize: '0.85rem' };

  return (
    <div className="sc-card fade-in">
      <h5 className="fw-bold mb-4"><i className="bi bi-pencil-square me-2" style={{ color: 'var(--primary-500)' }}></i>Edit Profile</h5>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="mb-3">
          <label className="form-label fw-semibold" style={fieldStyle}>Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="sc-input" id="profile-name" required />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={fieldStyle}>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="sc-input" rows={3} id="profile-bio"
            placeholder="Tell your community about yourself..." />
        </div>

        {/* Contact */}
        <h6 className="fw-semibold mt-4 mb-3" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}><i className="bi bi-telephone me-1"></i>Contact Info</h6>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={fieldStyle}>Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="sc-input" id="profile-phone" maxLength="10" pattern="\d{10}" title="Must be exactly 10 digits" />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={fieldStyle}>Alt Phone <small style={{ color: 'var(--text-tertiary)' }}>(optional)</small></label>
            <input type="tel" name="altPhone" value={form.altPhone} onChange={handleChange} className="sc-input" maxLength="10" pattern="\d{0,10}" title="Must be exactly 10 digits" />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={fieldStyle}>Alt Email <small style={{ color: 'var(--text-tertiary)' }}>(optional)</small></label>
          <input type="email" name="altEmail" value={form.altEmail} onChange={handleChange} className="sc-input" />
        </div>

        {/* Personal */}
        <h6 className="fw-semibold mt-4 mb-3" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}><i className="bi bi-person me-1"></i>Personal Details</h6>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={fieldStyle}>Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} className="sc-input" min="13" max="120" />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={fieldStyle}>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="sc-input">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={fieldStyle}>Date of Birth</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} className="sc-input" />
          </div>
        </div>

        {/* Address */}
        <h6 className="fw-semibold mt-4 mb-3" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}><i className="bi bi-geo-alt me-1"></i>Address</h6>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={fieldStyle}>Address Line 1</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="sc-input" rows={2} placeholder="House No, Street, Area..." />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={fieldStyle}>Address Line 2 <small style={{ color: 'var(--text-tertiary)' }}>(optional)</small></label>
          <input type="text" name="address2" value={form.address2} onChange={handleChange} className="sc-input" placeholder="Landmark, Apartment, Suite..." />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={fieldStyle}>City</label>
            <input type="text" name="city" value={form.city} onChange={handleChange} className="sc-input" id="profile-city" />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={fieldStyle}>State</label>
            <select name="state" value={customState ? 'Other' : form.state} onChange={(e) => {
                if (e.target.value === 'Other') {
                  setCustomState(true);
                  setForm({...form, state: ''});
                } else {
                  setCustomState(false);
                  setForm({...form, state: e.target.value});
                }
              }} className="sc-input">
              <option value="">Select State</option>
              {STATES_INDIA.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {customState && (
              <input type="text" name="state" value={form.state} onChange={handleChange} className="sc-input mt-2" placeholder="Enter state" required />
            )}
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={fieldStyle}>Country</label>
            <select name="country" value={customCountry ? 'Other' : form.country} onChange={(e) => {
                if (e.target.value === 'Other') {
                  setCustomCountry(true);
                  setForm({...form, country: ''});
                } else {
                  setCustomCountry(false);
                  setForm({...form, country: e.target.value});
                }
              }} className="sc-input">
              <option value="India">India</option>
              <option value="Other">Other</option>
            </select>
            {customCountry && (
              <input type="text" name="country" value={form.country} onChange={handleChange} className="sc-input mt-2" placeholder="Enter country" required />
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={fieldStyle}>PIN Code</label>
            <input type="text" name="zipcode" value={form.zipcode} onChange={handleChange} className="sc-input" />
          </div>
        </div>

        {/* Profile Photo */}
        <div className="mb-3">
          <label className="form-label fw-semibold" style={fieldStyle}>Profile Photo</label>
          <input type="file" accept="image/*" className="form-control" id="profile-avatar" onChange={handleFileChange} />
        </div>

        <button type="submit" className="sc-btn sc-btn-primary" disabled={loading} id="profile-save">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
