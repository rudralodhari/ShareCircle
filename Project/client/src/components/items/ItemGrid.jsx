import ItemCard from './ItemCard';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ItemGrid({ items = [], loading = false, emptyMessage = 'No items found' }) {
  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <div className="sc-empty-state">
        <i className="bi bi-inbox d-block"></i>
        <h5>{emptyMessage}</h5>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="browse-grid">
      {items.map((item, index) => (
        <div key={item._id || index} className="fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <ItemCard item={item} />
        </div>
      ))}
    </div>
  );
}
