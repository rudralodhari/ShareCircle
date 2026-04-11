import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileEdit from '../components/profile/ProfileEdit';
import ReviewList from '../components/profile/ReviewList';
import userService from '../services/userService';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Fetch real reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?._id) return;
      try {
        const res = await userService.getReviews(user._id);
        if (res.data.reviews.length > 0) {
          setReviews(res.data.reviews);
        }
      } catch {
        // Fallback or handle later
      }
    };
    fetchReviews();
  }, [user?._id]);

  const handleSave = async (data, avatarFile) => {
    try {
      let currentAvatar = user.avatar;
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const avRes = await userService.uploadAvatar(fd);
        currentAvatar = avRes.data.avatar;
      }

      const res = await userService.updateProfile({
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        altPhone: data.altPhone,
        altEmail: data.altEmail,
        age: data.age,
        gender: data.gender,
        dob: data.dob,
        address: data.address,
        address2: data.address2,
        city: data.city,
        state: data.state,
        country: data.country,
        zipcode: data.zipcode,
      });
      // also incorporate new avatar
      updateUser({ ...res.data.user, avatar: currentAvatar });
    } catch {
      // Fallback: update locally
      updateUser({
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        altPhone: data.altPhone,
        altEmail: data.altEmail,
        age: data.age ? Number(data.age) : null,
        gender: data.gender,
        dob: data.dob || null,
        location: {
          address: data.address || '',
          address2: data.address2 || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          zipcode: data.zipcode || '',
        },
        avatar: currentAvatar || user.avatar,
      });
    }
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">My Profile</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>Manage your personal information and see your reviews</p>
        </div>

        {saved && (
          <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2 fade-in"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--primary-600)' }}>
            <i className="bi bi-check-circle-fill"></i>
            <span>Profile updated successfully!</span>
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-4">
            <ProfileCard user={user} />
            <div className="mt-3">
              <button className="sc-btn sc-btn-outline w-100" onClick={() => setEditing(!editing)}>
                <i className={`bi ${editing ? 'bi-x' : 'bi-pencil'}`}></i>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
          <div className="col-lg-8">
            {editing ? (
              <ProfileEdit user={user} onSave={handleSave} />
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
