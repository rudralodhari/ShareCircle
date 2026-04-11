import { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { formatPrice } from '../../utils/helpers';

const STATUS_COLORS = { placed: '#3b82f6', confirmed: '#8b5cf6', shipped: '#f59e0b', delivered: '#10b981', cancelled: '#ef4444', returned: '#6b7280', return_requested: '#f97316', disputed: '#dc2626' };

export default function AdminDeliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = {};
        if (filter) params.status = filter;
        const res = await orderService.getAllOrders(params);
        setOrders(res.data.orders || []);
      } catch {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [filter]);

  return (
    <div className="sc-card fade-in">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h5 className="fw-bold mb-0"><i className="bi bi-truck me-2" style={{ color: '#8B5CF6' }}></i>Deliveries & Orders</h5>
        <select className="sc-input" style={{ width: 'auto', fontSize: '0.85rem' }} value={filter} onChange={(e) => { setFilter(e.target.value); setLoading(true); }}>
          <option value="">All Statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
          <option value="return_requested">Return Requested</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-500)' }}></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-4">
          <i className="bi bi-inbox d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-tertiary)' }}></i>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 0 }}>No orders found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item</th>
                <th>From (Seller)</th>
                <th>To (Buyer)</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o._id}>
                    <td><small style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>#{o._id?.slice(-6)}</small></td>
                    <td className="fw-semibold">{o.item?.title || 'N/A'}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{o.seller?.name || 'N/A'}</div>
                      <small style={{ color: 'var(--text-tertiary)' }}>{o.seller?.email}</small>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{o.buyer?.name || 'N/A'}</div>
                      <small style={{ color: 'var(--text-tertiary)' }}>{o.buyer?.email}</small>
                    </td>
                    <td className="fw-bold" style={{ color: 'var(--primary-500)' }}>{formatPrice(o.total)}</td>
                    <td>
                      <span className="sc-badge" style={{ background: `${STATUS_COLORS[o.status] || '#ccc'}20`, color: STATUS_COLORS[o.status] || '#ccc', textTransform: 'capitalize' }}>
                        {o.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td><small>{new Date(o.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <button className="sc-btn sc-btn-ghost sc-btn-sm" onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}>
                        <i className={`bi bi-chevron-${expandedId === o._id ? 'up' : 'down'}`}></i>
                      </button>
                    </td>
                  </tr>
                  {expandedId === o._id && (
                    <tr key={`${o._id}-detail`}>
                      <td colSpan="8" style={{ background: 'var(--bg-surface-2)', padding: '16px 24px' }}>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Delivery Address</h6>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {o.address?.name && <div>{o.address.name}</div>}
                              {o.address?.phone && <div>{o.address.phone}</div>}
                              {o.address?.line1 && <div>{o.address.line1}</div>}
                              {o.address?.line2 && <div>{o.address.line2}</div>}
                              <div>{[o.address?.city, o.address?.state, o.address?.zipcode].filter(Boolean).join(', ')}</div>
                              {o.address?.country && <div>{o.address.country}</div>}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Payment</h6>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <div>Method: <strong>{o.paymentMethod?.replace('_', ' ') || 'COD'}</strong></div>
                              <div>Status: <strong style={{ textTransform: 'capitalize' }}>{o.paymentStatus}</strong></div>
                              {o.deposit > 0 && <div>Deposit: {formatPrice(o.deposit)}</div>}
                              {o.discount > 0 && <div>Discount: -{formatPrice(o.discount)}</div>}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Item Details</h6>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <div>Category: <strong>{o.item?.category || 'N/A'}</strong></div>
                              <div>Type: <strong style={{ textTransform: 'capitalize' }}>{o.item?.transactionType || 'N/A'}</strong></div>
                              {o.days > 0 && <div>Duration: <strong>{o.days} days</strong></div>}
                              {o.deliveredAt && <div>Delivered: {new Date(o.deliveredAt).toLocaleDateString()}</div>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
