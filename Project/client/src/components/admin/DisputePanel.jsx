import { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

export default function DisputePanel() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState({ open: false, dispute: null });
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await orderService.getOrderDisputes();
        setDisputes(res.data.disputes || []);
      } catch {
        setDisputes([]);
      }
      setLoading(false);
    };
    fetchDisputes();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveModal.dispute) return;
    setResolving(true);
    try {
      await orderService.resolveOrderDispute(resolveModal.dispute._id, { resolution, newStatus: 'delivered' });
      setDisputes(disputes.filter(d => d._id !== resolveModal.dispute._id));
      toast.success('Dispute resolved!');
      setResolveModal({ open: false, dispute: null });
      setResolution('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resolve dispute');
    }
    setResolving(false);
  };

  const statusColors = { disputed: 'var(--danger-500)', return_requested: '#f97316' };

  return (
    <div className="sc-card fade-in">
      <h5 className="fw-bold mb-4">Dispute Resolution</h5>
      {loading ? (
        <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-500)' }}></div></div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-4">
          <i className="bi bi-check-circle d-block mb-2" style={{ fontSize: '2rem', color: 'var(--primary-500)' }}></i>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 0 }}>No active disputes! 🎉</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {disputes.map((d) => (
            <div key={d._id} className="p-3 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-bold mb-1">{d.item?.title || 'Unknown Item'}</h6>
                  <p className="mb-1" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>{d.buyer?.name || 'Buyer'}</strong> vs <strong>{d.seller?.name || 'Seller'}</strong>
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    <i className="bi bi-exclamation-circle me-1"></i>{d.disputeReason || d.returnReason || 'No reason provided'}
                  </p>
                  {(d.disputeDescription || d.returnDescription) && (
                    <p className="mb-0 mt-1" style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      "{d.disputeDescription || d.returnDescription}"
                    </p>
                  )}
                </div>
                <span className="sc-badge" style={{ background: `${statusColors[d.status] || '#ccc'}20`, color: statusColors[d.status] || '#ccc', textTransform: 'capitalize' }}>
                  {d.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small style={{ color: 'var(--text-tertiary)' }}>{new Date(d.createdAt).toLocaleDateString()}</small>
                <button className="sc-btn sc-btn-primary sc-btn-sm" onClick={() => setResolveModal({ open: true, dispute: d })}>Resolve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sc-card" style={{ width: 440, maxWidth: '90%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Resolve Dispute</h5>
              <button className="btn-close" onClick={() => setResolveModal({ open: false, dispute: null })}></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>{resolveModal.dispute?.buyer?.name}</strong> filed a {resolveModal.dispute?.status?.replace('_', ' ')} for <strong>{resolveModal.dispute?.item?.title}</strong>
            </p>
            <div className="mb-3 p-2 rounded-3" style={{ background: 'var(--bg-surface-2)', fontSize: '0.85rem' }}>
              <strong>Reason:</strong> {resolveModal.dispute?.disputeReason || resolveModal.dispute?.returnReason}<br />
              {(resolveModal.dispute?.disputeDescription || resolveModal.dispute?.returnDescription) && (
                <><strong>Details:</strong> {resolveModal.dispute?.disputeDescription || resolveModal.dispute?.returnDescription}</>
              )}
            </div>
            <form onSubmit={handleResolve}>
              <div className="mb-4">
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Resolution Notes</label>
                <textarea className="sc-input" rows="3" placeholder="Describe the resolution..."
                  value={resolution} onChange={(e) => setResolution(e.target.value)} required></textarea>
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="sc-btn sc-btn-ghost" onClick={() => setResolveModal({ open: false, dispute: null })}>Cancel</button>
                <button type="submit" className="sc-btn sc-btn-primary" disabled={resolving}>
                  {resolving ? 'Resolving...' : 'Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
