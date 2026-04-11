import { timeAgo } from '../../utils/helpers';

export default function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return (
      <div className="sc-card">
        <h5 className="fw-bold mb-3">Reviews</h5>
        <div className="sc-empty-state py-4">
          <i className="bi bi-star d-block"></i>
          <h6>No reviews yet</h6>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-card">
      <h5 className="fw-bold mb-4">Reviews ({reviews.length})</h5>
      <div className="d-flex flex-column gap-4">
        {reviews.map((review, i) => (
          <div key={i} className="d-flex gap-3" style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: 'var(--space-4)' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, background: 'var(--primary-100)', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.85rem' }}>
              {review.reviewer?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{review.reviewer?.name}</span>
                  <div className="mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={`bi bi-star${star <= review.rating ? '-fill' : ''}`}
                        style={{ color: star <= review.rating ? 'var(--accent-500)' : 'var(--gray-300)', fontSize: '0.8rem', marginRight: 2 }}></i>
                    ))}
                  </div>
                </div>
                <small style={{ color: 'var(--text-tertiary)' }}>{timeAgo(review.createdAt)}</small>
              </div>
              <p className="mt-2 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
