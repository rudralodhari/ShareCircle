import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    department: 'Platform Administration',
    role: 'Super Admin'
  });

  // Fetch platform-level stats for admin overview
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await userService.getAdminStats();
        setPlatformStats(res.data);
      } catch { /* ignore */ }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      });
      if (updateUser) {
        updateUser({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
        });
      }
      setEditing(false);
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Early 2026';

  return (
    <div className="sc-card fade-in">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#8B5CF6' }}>Admin Profile Settings</h4>
          <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.9rem' }}>
            Manage your administrator account details
          </p>
        </div>
        {!editing ? (
          <button 
            className="sc-btn sc-btn-outline" 
            style={{ color: '#8B5CF6', borderColor: '#8B5CF6' }}
            onClick={() => setEditing(true)}
          >
            <i className="bi bi-pencil me-2"></i> Edit Profile
          </button>
        ) : (
          <button 
            className="sc-btn sc-btn-ghost text-danger" 
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        )}
      </div>

      {saved && (
        <div className="alert alert-success d-flex align-items-center mb-4 fade-in" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: 'none', borderRadius: 'var(--radius-md)' }}>
          <i className="bi bi-check-circle-fill me-2"></i> Admin profile updated successfully.
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <form onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control sc-input" 
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={!editing}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Admin Email</label>
                <input 
                  type="email" 
                  className="form-control sc-input" 
                  value={formData.email}
                  readOnly
                  disabled
                  title="Email cannot be changed"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  className="form-control sc-input" 
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!editing}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Department</label>
                <input 
                  type="text" 
                  className="form-control sc-input" 
                  value={formData.department}
                  readOnly
                  disabled
                />
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Bio / Notes</label>
                <textarea
                  name="bio" 
                  className="form-control sc-input" 
                  rows="2"
                  value={formData.bio}
                  onChange={handleChange}
                  readOnly={!editing}
                  placeholder="Add any notes about administrator responsibilities..."
                />
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Access Level</label>
                <div className="p-3 rounded-3 mt-1" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="sc-badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{formData.role}</span>
                  </div>
                  <small style={{ color: 'var(--text-tertiary)' }}>You have full access to manage users, moderate listings, resolve disputes, and view complaints.</small>
                </div>
              </div>
            </div>

            {editing && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="submit" className="sc-btn sc-btn-primary w-100" style={{ background: '#8B5CF6' }}>
                  Save Admin Changes
                </button>
              </div>
            )}
          </form>


        </div>
        
        <div className="col-lg-4">
          <div className="p-4 rounded-4 text-center h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'var(--bg-surface-2)' }}>
            <div className="position-relative mb-3">
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                   style={{ width: 100, height: 100, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontSize: '2.5rem', overflow: 'hidden' }}>
                   {user?.avatar ? <img src={user.avatar} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : formData.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <h5 className="fw-bold mb-1">{formData.name}</h5>
            <span className="sc-badge mb-2" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{formData.role}</span>
            <p className="small mb-2" style={{ color: 'var(--text-tertiary)' }}>Joined: {joinDate}</p>
            <p className="small mb-0" style={{ color: 'var(--text-tertiary)' }}>{formData.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
