import { getInitials } from '../../utils/helpers';

export default function ProfileCard({ user }) {
  const {
    name = 'User Name',
    email = 'user@example.com',
    bio = 'No bio yet.',
    avatar = null,
    phone = '',
    altPhone = '',
    altEmail = '',
    age = null,
    gender = '',
    dob = null,
    location = { city: 'Unknown', address: '', state: '', country: '', zipcode: '' },
    rating = 0,
    reviewCount = 0,
    itemsShared = 0,
    memberSince = new Date(),
    referralCode = '',
    giftCodes = [],
  } = user || {};

  const infoItems = [
    { icon: 'bi-envelope', label: 'Email', value: email },
    { icon: 'bi-telephone', label: 'Phone', value: phone },
    altPhone ? { icon: 'bi-telephone-plus', label: 'Alt Phone', value: altPhone } : null,
    altEmail ? { icon: 'bi-envelope-plus', label: 'Alt Email', value: altEmail } : null,
    age ? { icon: 'bi-person', label: 'Age', value: `${age} years` } : null,
    gender ? { icon: 'bi-gender-ambiguous', label: 'Gender', value: gender.charAt(0).toUpperCase() + gender.slice(1) } : null,
    dob ? { icon: 'bi-calendar-heart', label: 'Date of Birth', value: new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) } : null,
    location.address ? { icon: 'bi-house', label: 'Address', value: location.address } : null,
    location.city ? { icon: 'bi-geo-alt', label: 'City', value: location.city } : null,
    location.state ? { icon: 'bi-map', label: 'State', value: location.state } : null,
    location.country ? { icon: 'bi-globe', label: 'Country', value: location.country } : null,
    location.zipcode ? { icon: 'bi-mailbox', label: 'PIN Code', value: location.zipcode } : null,
  ].filter(Boolean);

  return (
    <div className="sc-card fade-in">
      {/* Avatar */}
      <div className="text-center mb-3">
        <div className="mx-auto mb-3" style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary-300)' }}>
          {avatar ? (
            <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)', fontSize: '2rem', fontWeight: 800 }}>
              {getInitials(name)}
            </div>
          )}
        </div>
        <h4 className="fw-bold mb-1">{name}</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{bio}</p>
      </div>

      {/* Stats */}
      <div className="d-flex justify-content-around mb-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="text-center">
          <div className="fw-bold fs-5" style={{ color: 'var(--primary-500)' }}>{itemsShared}</div>
          <small style={{ color: 'var(--text-tertiary)' }}>Items Shared</small>
        </div>
        <div className="text-center">
          <div className="fw-bold fs-5" style={{ color: 'var(--accent-500)' }}>
            {rating > 0 ? `${rating.toFixed(1)}★` : '—'}
          </div>
          <small style={{ color: 'var(--text-tertiary)' }}>{reviewCount} Reviews</small>
        </div>
        <div className="text-center">
          <div className="fw-bold fs-5" style={{ color: 'var(--secondary-500)' }}>
            {new Date(memberSince).getFullYear()}
          </div>
          <small style={{ color: 'var(--text-tertiary)' }}>Joined</small>
        </div>
      </div>

      {/* Personal Info */}
      <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <i className="bi bi-person-vcard me-1"></i>Personal Details
        </h6>
        <div className="d-flex flex-column gap-2">
          {infoItems.map((info, i) => (
            <div key={i} className="d-flex align-items-start gap-2" style={{ fontSize: '0.85rem' }}>
              <i className={`bi ${info.icon}`} style={{ color: 'var(--primary-500)', marginTop: '2px', minWidth: 18 }}></i>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{info.label}</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{info.value || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral & Gift Codes */}
      <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <i className="bi bi-gift me-1"></i>Rewards & Referrals
        </h6>
        
        {referralCode && (
          <div className="mb-3 p-2 rounded-3 text-center" style={{ background: 'var(--bg-surface-2)', border: '1px dashed var(--border-color)' }}>
            <small style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Your Referral Code</small>
            <div className="fw-bold fs-6" style={{ color: 'var(--primary-600)', letterSpacing: '1px' }}>{referralCode}</div>
          </div>
        )}

        <div className="d-flex flex-column gap-2">
          {giftCodes && giftCodes.length > 0 ? giftCodes.map((gc, i) => (
            <div key={i} className="d-flex justify-content-between align-items-center p-2 rounded-3" 
              style={{ background: gc.isUsed ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${gc.isUsed ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
              <div>
                <span className="fw-semibold" style={{ color: gc.isUsed ? '#ef4444' : '#10b981', fontSize: '0.85rem' }}>{gc.code}</span>
                <small className="d-block" style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>{gc.discountPercentage}% Discount</small>
              </div>
              <span className="sc-badge" style={{ background: gc.isUsed ? '#ef4444' : '#10b981', color: '#fff', fontSize: '0.65rem' }}>
                {gc.isUsed ? 'Used' : 'Available'}
              </span>
            </div>
          )) : (
            <small className="text-center w-100 d-block" style={{ color: 'var(--text-tertiary)' }}>No gift codes yet</small>
          )}
        </div>
      </div>
    </div>
  );
}
