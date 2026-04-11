import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import orderService from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { formatPrice, placeholderImage } from '../utils/helpers';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try { const res = await orderService.getWishlist(); setItems(res.data.wishlist || []); }
      catch { setItems([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRemove = async (id) => {
    try { await orderService.removeFromWishlist(id); setItems(items.filter(i => i._id !== id)); toast.success('Removed from wishlist'); }
    catch { toast.error('Failed to remove'); }
  };

  const handleMoveToCart = async (id) => {
    try { await orderService.addToCart(id); await orderService.removeFromWishlist(id); setItems(items.filter(i => i._id !== id)); toast.success('Moved to cart! 🛒'); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <h2 className="fw-bold mb-1">My Wishlist</h2>
        <p style={{ color: 'var(--text-tertiary)' }}>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--primary-500)' }}></div></div>
        ) : items.length === 0 ? (
          <div className="sc-card text-center py-5">
            <i className="bi bi-heart d-block mb-3" style={{ fontSize: '4rem', color: 'var(--text-tertiary)' }}></i>
            <h4 className="fw-bold">Your wishlist is empty</h4>
            <p style={{ color: 'var(--text-tertiary)' }}>Save items you love for later</p>
            <Link to="/browse" className="sc-btn sc-btn-primary"><i className="bi bi-grid me-2"></i>Browse Items</Link>
          </div>
        ) : (
          <div className="row g-3">
            {items.map((item) => (
              <div key={item._id} className="col-md-6 col-xl-4">
                <div className="sc-card h-100">
                  <img src={item.images?.[0] || placeholderImage(400, 250)} alt={item.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}
                    onError={(e) => { e.target.src = placeholderImage(400, 250); }} />
                  <Link to={`/item/${item._id}`} className="fw-bold text-decoration-none d-block mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</Link>
                  <div className="fw-bold mb-3" style={{ color: 'var(--primary-500)' }}>{formatPrice(item.price)}</div>
                  <div className="d-flex gap-2">
                    <button className="sc-btn sc-btn-primary sc-btn-sm flex-grow-1" onClick={() => handleMoveToCart(item._id)}>
                      <i className="bi bi-cart-plus me-1"></i>Move to Cart
                    </button>
                    <button className="sc-btn sc-btn-ghost sc-btn-sm" style={{ color: '#ef4444' }} onClick={() => handleRemove(item._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
