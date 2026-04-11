import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints');
        setComplaints(res.data.complaints || []);
      } catch {
        setComplaints([]);
      }
      setLoading(false);
    };
    fetchComplaints();
  }, []);

  const statusColors = { open: 'var(--danger-500)', in_progress: '#f59e0b', resolved: 'var(--primary-500)' };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}`, { status: newStatus });
      setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
      toast.success(`Complaint marked as ${newStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update complaint');
    }
  };

  return (
    <div className="sc-card fade-in">
      <h5 className="fw-bold mb-4"><i className="bi bi-chat-left-text me-2" style={{ color: '#8B5CF6' }}></i>User Complaints</h5>
      {loading ? (
        <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-500)' }}></div></div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-4">
          <i className="bi bi-check-circle d-block mb-2" style={{ fontSize: '2rem', color: 'var(--primary-500)' }}></i>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 0 }}>No complaints filed yet</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {complaints.map((c) => (
            <div key={c._id} className="p-3 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-bold mb-1">{c.subject}</h6>
                  <p className="mb-1" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    By: <strong>{c.user?.name || c.name || 'Anonymous'}</strong>
                    {c.user?.email && <span style={{ color: 'var(--text-tertiary)' }}> ({c.user.email})</span>}
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{c.description}</p>
                  {c.category && (
                    <span className="sc-chip mt-1 d-inline-block" style={{ fontSize: '0.72rem' }}>{c.category}</span>
                  )}
                </div>
                <span className="sc-badge" style={{ background: `${statusColors[c.status] || statusColors.open}20`, color: statusColors[c.status] || statusColors.open, textTransform: 'capitalize' }}>
                  {c.status?.replace('_', ' ') || 'open'}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <small style={{ color: 'var(--text-tertiary)' }}>{new Date(c.createdAt).toLocaleDateString()}</small>
                <div className="d-flex gap-2">
                  {c.status !== 'in_progress' && c.status !== 'resolved' && (
                    <button className="sc-btn sc-btn-outline sc-btn-sm" style={{ fontSize: '0.78rem' }} onClick={() => handleUpdateStatus(c._id, 'in_progress')}>In Progress</button>
                  )}
                  {c.status !== 'resolved' && (
                    <button className="sc-btn sc-btn-primary sc-btn-sm" style={{ fontSize: '0.78rem' }} onClick={() => handleUpdateStatus(c._id, 'resolved')}>Resolve</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
