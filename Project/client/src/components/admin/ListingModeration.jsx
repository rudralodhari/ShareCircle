import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import itemService from '../../services/itemService';
import { useToast } from '../../context/ToastContext';

export default function ListingModeration() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await itemService.getAll({ limit: 20 });
        setListings(res.data.items || []);
      } catch {
        setListings([]);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const statusColors = {
    available: 'var(--primary-500)',
    pending: 'var(--accent-500)',
    sold: 'var(--gray-500)',
    removed: 'var(--danger-500)',
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await itemService.delete(item._id);
      setListings(listings.filter(l => l._id !== item._id));
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleView = (item) => {
    navigate(`/items/${item._id}`);
  };

  return (
    <div className="sc-card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="p-4 pb-3">
        <h5 className="fw-bold mb-0">Listing Moderation</h5>
      </div>
      {loading ? (
        <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-500)' }}></div></div>
      ) : listings.length === 0 ? (
        <div className="text-center py-4 px-4"><p style={{ color: 'var(--text-tertiary)' }}>No listings found</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ paddingLeft: 'var(--space-6)' }}>Listing</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Status</th>
                <th style={{ paddingRight: 'var(--space-6)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id}>
                  <td style={{ paddingLeft: 'var(--space-6)' }}>
                    <span className="fw-semibold">{l.title}</span>
                  </td>
                  <td><span className="sc-badge sc-badge-primary" style={{ textTransform: 'capitalize' }}>{l.transactionType || l.type}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{l.owner?.name || 'Unknown'}</td>
                  <td>
                    <span className="sc-badge" style={{ background: `${statusColors[l.status] || statusColors.available}20`, color: statusColors[l.status] || statusColors.available, textTransform: 'uppercase' }}>
                      {l.status || 'available'}
                    </span>
                  </td>
                  <td style={{ paddingRight: 'var(--space-6)' }}>
                    <div className="d-flex gap-1">
                      <button className="sc-btn sc-btn-ghost sc-btn-sm" title="View" onClick={() => handleView(l)}>
                        <i className="bi bi-eye"></i>
                      </button>
                      <button className="sc-btn sc-btn-ghost sc-btn-sm" style={{ color: 'var(--danger-500)' }} title="Delete" onClick={() => handleDelete(l)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
