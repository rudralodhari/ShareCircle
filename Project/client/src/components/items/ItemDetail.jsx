import { useState } from 'react';
import { formatPrice, timeAgo, getTypeColor, placeholderImage } from '../../utils/helpers';

export default function ItemDetail({ item }) {
  const {
    title = 'Item Title',
    description = 'No description available.',
    price = 0,
    images = [],
    transactionType = 'share',
    category = 'Other',
    condition = 'good',
    location = { city: 'Unknown', address: '' },
    owner = { name: 'User', email: '' },
    createdAt = new Date(),
  } = item || {};

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  return (
    <div className="fade-in">
      <div className="row g-4">
        {/* Gallery */}
        <div className="col-lg-7">
          <div className="item-detail-gallery">
            <img src={images[selectedImageIdx] || images[0] || placeholderImage(800, 600)} alt={title} onError={(e) => { e.target.src = placeholderImage(800, 600); }} />
          </div>
          {images.length > 1 && (
            <div className="d-flex gap-2 mt-3">
              {images.slice(0, 5).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImageIdx(i)}
                  style={{
                    width: 80, height: 60,
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: `2px solid ${i === selectedImageIdx ? 'var(--primary-500)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    opacity: i === selectedImageIdx ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="col-lg-5">
          <div className="sc-card">
            <span className="sc-badge mb-3" style={{ background: getTypeColor(transactionType), color: '#fff', textTransform: 'capitalize' }}>
              {transactionType}
            </span>
            <h2 className="mb-2">{title}</h2>
            <h3 className="mb-4" style={{ color: 'var(--primary-500)' }}>{formatPrice(price)}</h3>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <span className="sc-chip"><i className="bi bi-tag"></i> {category}</span>
              <span className="sc-chip"><i className="bi bi-check-circle"></i> {condition}</span>
              <span className="sc-chip"><i className="bi bi-clock"></i> {timeAgo(createdAt)}</span>
            </div>

            <hr style={{ borderColor: 'var(--border-color)' }} />

            <h6 className="fw-bold mb-2">Description</h6>
            <p style={{ lineHeight: 1.7 }}>{description}</p>

            <hr style={{ borderColor: 'var(--border-color)' }} />

            {/* Owner */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'var(--primary-100)', color: 'var(--primary-600)', fontWeight: 700, fontSize: '1.1rem' }}>
                {owner.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{owner.name}</h6>
                <small style={{ color: 'var(--text-tertiary)' }}>
                  <i className="bi bi-geo-alt me-1"></i>{location.city}
                </small>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button className="sc-btn sc-btn-primary sc-btn-lg" id="contact-seller-btn">
                <i className="bi bi-chat-dots"></i> Contact {transactionType === 'donate' ? 'Donor' : 'Seller'}
              </button>
              <button className="sc-btn sc-btn-outline" id="save-item-btn">
                <i className="bi bi-heart"></i> Save Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
