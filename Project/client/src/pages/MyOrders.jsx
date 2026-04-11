import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import orderService from '../services/orderService';
import userService from '../services/userService';
import { useToast } from '../context/ToastContext';
import { formatPrice, placeholderImage } from '../utils/helpers';

const STATUS_COLORS = { placed: '#3b82f6', confirmed: '#8b5cf6', shipped: '#f59e0b', delivered: '#10b981', cancelled: '#ef4444', returned: '#6b7280', return_requested: '#f97316', disputed: '#dc2626' };

const DISPUTE_REASONS = [
  'Item not as described',
  'Item damaged during rental',
  'Late return by lender',
  'Wrong item received',
  'Item missing parts/accessories',
  'Quality below expectation',
  'Other',
];

const RETURN_REASONS = [
  'Item not as described',
  'Item defective/damaged',
  'Changed my mind',
  'Found a better alternative',
  'Item no longer needed',
  'Other',
];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [reviewModal, setReviewModal] = useState({ open: false, order: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewing, setReviewing] = useState(false);

  // Return modal
  const [returnModal, setReturnModal] = useState({ open: false, order: null });
  const [returnForm, setReturnForm] = useState({ reason: '', description: '' });
  const [returning, setReturning] = useState(false);

  // Dispute modal
  const [disputeModal, setDisputeModal] = useState({ open: false, order: null });
  const [disputeForm, setDisputeForm] = useState({ reason: '', description: '' });
  const [disputing, setDisputing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await orderService.getMyOrders(); setOrders(res.data.orders || []); }
      catch { setOrders([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleCancel = async (id) => {
    try { await orderService.updateOrderStatus(id, 'cancelled'); setOrders(orders.map(o => o._id === id ? {...o, status: 'cancelled'} : o)); toast.success('Order cancelled'); }
    catch { toast.error('Failed to cancel'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModal.order) return;
    setReviewing(true);
    try {
      await userService.addReview(reviewModal.order.seller._id, reviewForm);
      toast.success('Review submitted successfully!');
      setReviewModal({ open: false, order: null });
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
    setReviewing(false);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModal.order || !returnForm.reason) { toast.warning('Please select a reason'); return; }
    setReturning(true);
    try {
      await orderService.requestReturn(returnModal.order._id, returnForm);
      setOrders(orders.map(o => o._id === returnModal.order._id ? {...o, status: 'return_requested'} : o));
      toast.success('Return request submitted!');
      setReturnModal({ open: false, order: null });
      setReturnForm({ reason: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit return request');
    }
    setReturning(false);
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeModal.order || !disputeForm.reason) { toast.warning('Please select a reason'); return; }
    setDisputing(true);
    try {
      await orderService.fileDispute(disputeModal.order._id, disputeForm);
      setOrders(orders.map(o => o._id === disputeModal.order._id ? {...o, status: 'disputed'} : o));
      toast.success('Dispute filed successfully!');
      setDisputeModal({ open: false, order: null });
      setDisputeForm({ reason: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to file dispute');
    }
    setDisputing(false);
  };

  // Check if return is still within 7-day window
  const canReturn = (order) => {
    if (order.status !== 'delivered') return false;
    const deliveryDate = order.deliveredAt || order.updatedAt;
    const daysSince = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  };

  const daysLeftForReturn = (order) => {
    const deliveryDate = order.deliveredAt || order.updatedAt;
    const daysSince = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(7 - daysSince));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)', position: 'relative' }}>
        <h2 className="fw-bold mb-1">My Orders</h2>
        <p style={{ color: 'var(--text-tertiary)' }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--primary-500)' }}></div></div>
        ) : orders.length === 0 ? (
          <div className="sc-card text-center py-5">
            <i className="bi bi-bag d-block mb-3" style={{ fontSize: '4rem', color: 'var(--text-tertiary)' }}></i>
            <h4 className="fw-bold">No orders yet</h4>
            <p style={{ color: 'var(--text-tertiary)' }}>Your orders will appear here after purchase</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => (
              <div key={order._id} className="sc-card d-flex gap-3 align-items-center">
                <img src={order.item?.images?.[0] || placeholderImage(80, 80)} alt="" style={{ width: 70, height: 70, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} onError={(e) => { e.target.src = placeholderImage(80, 80); }} />
                <div className="flex-grow-1">
                  <div className="fw-bold">{order.item?.title || 'Item'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Seller: {order.seller?.name} · {new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="fw-bold" style={{ color: 'var(--primary-500)' }}>{formatPrice(order.total)}</div>
                </div>
                <div className="text-end">
                  <span className="sc-badge" style={{ background: `${STATUS_COLORS[order.status] || '#ccc'}20`, color: STATUS_COLORS[order.status] || '#ccc', textTransform: 'capitalize' }}>{order.status?.replace('_', ' ')}</span>
                  {order.status === 'placed' && (
                    <button className="sc-btn sc-btn-ghost sc-btn-sm d-block mt-2 w-100" style={{ color: '#ef4444', fontSize: '0.8rem' }} onClick={() => handleCancel(order._id)}>Cancel</button>
                  )}
                  {order.status === 'delivered' && (
                    <div className="d-flex flex-column gap-1 mt-2">
                      <button className="sc-btn sc-btn-primary sc-btn-sm w-100" style={{ fontSize: '0.8rem' }} onClick={() => setReviewModal({ open: true, order })}>Leave Review</button>
                      {canReturn(order) && (
                        <button className="sc-btn sc-btn-outline sc-btn-sm w-100" style={{ fontSize: '0.78rem', color: '#f97316', borderColor: '#f97316' }} onClick={() => setReturnModal({ open: true, order })}>
                          Return ({daysLeftForReturn(order)}d left)
                        </button>
                      )}
                      <button className="sc-btn sc-btn-ghost sc-btn-sm w-100" style={{ fontSize: '0.78rem', color: '#dc2626' }} onClick={() => setDisputeModal({ open: true, order })}>
                        <i className="bi bi-exclamation-triangle me-1"></i>Dispute
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewModal.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="sc-card" style={{ width: 400, maxWidth: '90%' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0">Write a Review</h5>
                <button className="btn-close" onClick={() => setReviewModal({ open: false, order: null })}></button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reviewing seller: <strong>{reviewModal.order?.seller?.name}</strong></p>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rating</label>
                  <select className="sc-input" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Comment</label>
                  <textarea className="sc-input" rows="3" placeholder="How was your experience?"
                    value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}></textarea>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="sc-btn sc-btn-ghost" onClick={() => setReviewModal({ open: false, order: null })}>Cancel</button>
                  <button type="submit" className="sc-btn sc-btn-primary" disabled={reviewing}>
                    {reviewing ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {returnModal.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="sc-card" style={{ width: 440, maxWidth: '90%' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0"><i className="bi bi-arrow-return-left me-2" style={{ color: '#f97316' }}></i>Request Return</h5>
                <button className="btn-close" onClick={() => setReturnModal({ open: false, order: null })}></button>
              </div>
              <div className="mb-3 p-2 rounded-3" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', fontSize: '0.82rem', color: '#f97316' }}>
                <i className="bi bi-info-circle me-1"></i> 7-day return policy: {daysLeftForReturn(returnModal.order)} day(s) remaining
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Item: <strong>{returnModal.order?.item?.title}</strong></p>
              <form onSubmit={handleReturnSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reason for return *</label>
                  <select className="sc-input" value={returnForm.reason} onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })} required>
                    <option value="">Select a reason...</option>
                    {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Describe the problem</label>
                  <textarea className="sc-input" rows="3" placeholder="Please describe the issue in detail..."
                    value={returnForm.description} onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}></textarea>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="sc-btn sc-btn-ghost" onClick={() => setReturnModal({ open: false, order: null })}>Cancel</button>
                  <button type="submit" className="sc-btn sc-btn-sm" style={{ background: '#f97316', color: '#fff' }} disabled={returning}>
                    {returning ? 'Submitting...' : 'Submit Return Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {disputeModal.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="sc-card" style={{ width: 440, maxWidth: '90%' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0"><i className="bi bi-exclamation-triangle me-2" style={{ color: '#dc2626' }}></i>File a Dispute</h5>
                <button className="btn-close" onClick={() => setDisputeModal({ open: false, order: null })}></button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Item: <strong>{disputeModal.order?.item?.title}</strong></p>
              <form onSubmit={handleDisputeSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Dispute Reason *</label>
                  <select className="sc-input" value={disputeForm.reason} onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })} required>
                    <option value="">Select a reason...</option>
                    {DISPUTE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
                  <textarea className="sc-input" rows="3" placeholder="Explain the issue in detail to help our admin team resolve it..."
                    value={disputeForm.description} onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}></textarea>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="sc-btn sc-btn-ghost" onClick={() => setDisputeModal({ open: false, order: null })}>Cancel</button>
                  <button type="submit" className="sc-btn sc-btn-sm" style={{ background: '#dc2626', color: '#fff' }} disabled={disputing}>
                    {disputing ? 'Submitting...' : 'Submit Dispute'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
