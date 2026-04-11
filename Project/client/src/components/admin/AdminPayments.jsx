import { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { formatPrice } from '../../utils/helpers';

const STATUS_COLORS = { pending: '#f59e0b', paid: '#10b981', failed: '#ef4444', refunded: '#6b7280' };

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = {};
        // Note: we fetch all orders, and handle payment status locally or through existing status if API supports it.
        const res = await orderService.getAllOrders(params);
        let fetchedOrders = res.data.orders || [];
        
        if (filter) {
          fetchedOrders = fetchedOrders.filter(o => o.paymentStatus === filter);
        }
        
        setOrders(fetchedOrders);
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
        <h5 className="fw-bold mb-0">
          <i className="bi bi-credit-card me-2" style={{ color: '#8B5CF6' }}></i>
          Payments & Transactions
        </h5>
        <select 
          className="sc-input" 
          style={{ width: 'auto', fontSize: '0.85rem' }} 
          value={filter} 
          onChange={(e) => { setFilter(e.target.value); setLoading(true); }}
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-500)' }}></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-4">
          <i className="bi bi-wallet2 d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-tertiary)' }}></i>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 0 }}>No payments found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
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
                    <td className="fw-bold" style={{ color: 'var(--primary-500)' }}>{formatPrice(o.total)}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{o.paymentMethod?.replace('_', ' ') || 'COD'}</span></td>
                    <td>
                      <span className="sc-badge" style={{ background: `${STATUS_COLORS[o.paymentStatus] || '#ccc'}20`, color: STATUS_COLORS[o.paymentStatus] || '#ccc', textTransform: 'capitalize' }}>
                        {o.paymentStatus?.replace('_', ' ') || 'N/A'}
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
                      <td colSpan="7" style={{ background: 'var(--bg-surface-2)', padding: '16px 24px' }}>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Price Breakdown</h6>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <div className="d-flex justify-content-between"><span>Base MRP:</span> <span>{formatPrice(o.mrp || 0)}</span></div>
                              <div className="d-flex justify-content-between"><span>Platform Fee:</span> <span>{formatPrice(o.platformFee || 0)}</span></div>
                              <div className="d-flex justify-content-between"><span>Delivery Fee:</span> <span>{formatPrice(o.deliveryFee || 0)}</span></div>
                              <div className="d-flex justify-content-between"><span>Tax:</span> <span>{formatPrice(o.tax || 0)}</span></div>
                              {o.deposit > 0 && <div className="d-flex justify-content-between"><span>Deposit:</span> <span>{formatPrice(o.deposit)}</span></div>}
                              {o.discount > 0 && <div className="d-flex justify-content-between text-success"><span>Discount:</span> <span>-{formatPrice(o.discount)}</span></div>}
                              <hr className="my-1"/>
                              <div className="d-flex justify-content-between fw-bold text-dark"><span>Grand Total:</span> <span>{formatPrice(o.total || 0)}</span></div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Parties Involved</h6>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <div><strong>Buyer:</strong> {o.buyer?.name || 'N/A'} ({o.buyer?.email})</div>
                              <div className="mt-2"><strong>Seller:</strong> {o.seller?.name || 'N/A'} ({o.seller?.email})</div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Transaction Status</h6>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <div><strong>Order Status:</strong> <span style={{ textTransform: 'capitalize' }}>{o.status?.replace('_', ' ') || 'N/A'}</span></div>
                              <div><strong>Payment Method:</strong> <span style={{ textTransform: 'uppercase' }}>{o.paymentMethod || 'COD'}</span></div>
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
