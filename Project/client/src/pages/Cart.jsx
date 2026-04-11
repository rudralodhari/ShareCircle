import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import orderService from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { formatPrice, placeholderImage } from '../utils/helpers';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try { const res = await orderService.getCart(); setCart(res.data.cart || []); }
      catch { setCart([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRemove = async (itemId) => {
    try { await orderService.removeFromCart(itemId); setCart(cart.filter(c => c.item._id !== itemId)); toast.success('Removed from cart'); }
    catch { toast.error('Failed to remove'); }
  };

  const total = cart.reduce((s, c) => s + (c.item?.price || 0) * (c.quantity || 1), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <h2 className="fw-bold mb-1">Shopping Cart</h2>
        <p style={{ color: 'var(--text-tertiary)' }}>{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--primary-500)' }}></div></div>
        ) : cart.length === 0 ? (
          <div className="sc-card text-center py-5">
            <i className="bi bi-cart3 d-block mb-3" style={{ fontSize: '4rem', color: 'var(--text-tertiary)' }}></i>
            <h4 className="fw-bold">Your cart is empty</h4>
            <p style={{ color: 'var(--text-tertiary)' }}>Browse items and add them to your cart</p>
            <Link to="/browse" className="sc-btn sc-btn-primary"><i className="bi bi-grid me-2"></i>Browse Items</Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              {cart.map(({ item, quantity }) => (
                <div key={item._id} className="sc-card mb-3 d-flex gap-3 align-items-center">
                  <img src={item.images?.[0] || placeholderImage(100, 100)} alt={item.title}
                    style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = placeholderImage(100, 100); }} />
                  <div className="flex-grow-1">
                    <Link to={`/item/${item._id}`} className="fw-bold text-decoration-none" style={{ color: 'var(--text-primary)' }}>{item.title}</Link>
                    <div style={{ color: 'var(--primary-500)', fontWeight: 700 }}>{formatPrice(item.price)}</div>
                    <small style={{ color: 'var(--text-tertiary)' }}>Qty: {quantity || 1}</small>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button className="sc-btn sc-btn-primary sc-btn-sm" onClick={() => navigate(`/checkout?item=${item._id}`)}>
                      <i className="bi bi-bag me-1"></i>Buy
                    </button>
                    <button className="sc-btn sc-btn-ghost sc-btn-sm" style={{ color: '#ef4444' }} onClick={() => handleRemove(item._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-lg-4">
              <div className="sc-card">
                <h5 className="fw-bold mb-3">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2"><span>Items ({cart.length})</span><span className="fw-bold">{formatPrice(total)}</span></div>
                <div className="d-flex justify-content-between mb-2"><span>Platform Fee</span><span>{formatPrice(Math.round(total * 0.02))}</span></div>
                <div className="d-flex justify-content-between mb-3"><span>Delivery</span><span style={{ color: 'var(--primary-500)' }}>{total > 500 ? 'FREE' : '₹49'}</span></div>
                <hr style={{ borderColor: 'var(--border-color)' }} />
                <div className="d-flex justify-content-between mb-3"><span className="fw-bold fs-5">Total</span><span className="fw-bold fs-5" style={{ color: 'var(--primary-500)' }}>{formatPrice(total + Math.round(total * 0.02) + (total > 500 ? 0 : 49))}</span></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
