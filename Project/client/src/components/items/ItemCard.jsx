import { Link } from 'react-router-dom';
import { formatPrice, timeAgo, truncate, getTypeColor } from '../../utils/helpers';
import { placeholderImage } from '../../utils/helpers';

export default function ItemCard({ item }) {
  const {
    _id = '1',
    title = 'Item Title',
    description = 'Item description goes here',
    price = 0,
    mrp = 0,
    rentPerDay = 0,
    borrowPerDay = 0,
    images = [],
    transactionType = 'share',
    category = 'Other',
    condition = 'good',
    location: rawLocation,
    owner: rawOwner,
    createdAt = new Date(),
  } = item || {};

  // Defend against null (destructuring defaults only cover undefined, not null)
  const owner = rawOwner ?? { name: 'User' };
  const location = rawLocation ?? { city: 'Nearby' };

  const imgSrc = images[0] || placeholderImage();

  const isExchange = transactionType === 'exchange';
  const isDonate = transactionType === 'donate';
  const isRent = transactionType === 'rent';
  const isBorrow = transactionType === 'borrow';
  const perDayRate = isRent ? rentPerDay : isBorrow ? borrowPerDay : 0;

  const renderPrice = () => {
    if (isExchange) return 'Free (Exchange)';
    if (isDonate) return 'Free (Donate)';
    if (perDayRate > 0) return `${formatPrice(perDayRate)}/day`;
    return formatPrice(price);
  };

  return (
    <div className="sc-card h-100 d-flex flex-column" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Image */}
      <Link to={`/item/${_id}`} className="text-decoration-none">
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
          <img
            src={imgSrc} alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-base)' }}
            onError={(e) => { e.target.src = placeholderImage(); }}
          />
          {/* Type badge */}
          <span
            className="sc-badge position-absolute"
            style={{ top: 12, left: 12, background: getTypeColor(transactionType), color: '#fff', textTransform: 'capitalize' }}
          >
            {transactionType}
          </span>
          {/* Price */}
          <span
            className="position-absolute fw-bold"
            style={{
              bottom: 12, right: 12,
              background: 'var(--bg-glass)', backdropFilter: 'blur(8px)',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem', color: 'var(--text-primary)',
            }}
          >
            {renderPrice()}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="d-flex flex-column flex-grow-1 p-3">
        <Link to={`/item/${_id}`} className="text-decoration-none">
          <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h6>
        </Link>

        {/* MRP + Price */}
        {!isExchange && !isDonate && mrp > 0 && mrp !== price && (
          <div className="mb-1" style={{ fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>MRP {formatPrice(mrp)}</span>
            {mrp > price && price > 0 && (
              <span className="ms-1 fw-semibold" style={{ color: '#10b981' }}>
                {Math.round(((mrp - price) / mrp) * 100)}% off
              </span>
            )}
          </div>
        )}

        <p className="mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          {truncate(description, 80)}
        </p>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 28, height: 28, background: 'var(--primary-100)', color: 'var(--primary-600)', fontSize: '0.7rem', fontWeight: 700 }}
            >
              {owner.name?.charAt(0)?.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{owner.name}</span>
          </div>
          <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            <i className="bi bi-geo-alt"></i>
            <span>{location.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
