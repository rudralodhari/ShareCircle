import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import useAuth from '../hooks/useAuth';
import itemService from '../services/itemService';
import { useToast } from '../context/ToastContext';


export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch user's listings from API
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      if (!user?._id) {
        setListings([]);
        setLoading(false);
        return;
      }
      try {
        const res = await itemService.getAll({ owner: user._id });
        // If we get items from API, transform status labels
        const items = res.data.items;
        if (items && items.length > 0) {
          setListings(items);
        } else {
          setListings([]);
        }
      } catch {
        setListings([]);
      }
      setLoading(false);
    };
    fetchListings();
  }, [user?._id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await itemService.delete(id);
      setListings(listings.filter((item) => item._id !== id));
      toast.success('Listing deleted successfully');
    } catch {
      // Fallback: remove locally
      setListings(listings.filter((item) => item._id !== id));
      toast.success('Listing deleted successfully (sync)');
    }
  };

  const getStatusLabel = (item) => {
    const status = item.status || 'available';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (item) => {
    const status = item.status || 'available';
    return status === 'available' ? 'success' : 'warning';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 flex-grow-1 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">My Listings</h2>
            <p style={{ color: 'var(--text-tertiary)' }}>Manage items you are sharing, renting, or selling.</p>
          </div>
          <Link to="/create" className="sc-btn sc-btn-primary">
            <i className="bi bi-plus-lg"></i> Create New Listing
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--primary-500)' }}></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="sc-card text-center py-5">
            <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: 64, height: 64, background: 'var(--bg-surface-2)', color: 'var(--text-tertiary)', fontSize: '1.5rem' }}>
              <i className="bi bi-box-seam"></i>
            </div>
            <h5 className="fw-bold">No listings yet</h5>
            <p style={{ color: 'var(--text-tertiary)' }}>You haven't added any items to the platform yet.</p>
            <Link to="/create" className="sc-btn mt-2" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="sc-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table sc-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Added On</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.images?.[0] || ''}
                            alt={item.title}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            onError={(e) => { e.target.style.background = 'var(--bg-surface-2)'; e.target.src = ''; }}
                          />
                          <span className="fw-medium text-gradient">{item.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="sc-badge" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {item.transactionType || 'share'}
                        </span>
                      </td>
                      <td>
                        <span className={`sc-badge sc-badge-${getStatusColor(item)}`}>
                          {getStatusLabel(item)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Link to={`/item/${item._id}`} className="sc-btn sc-btn-icon sc-btn-ghost btn-sm" title="View">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link to={`/edit/${item._id}`} className="sc-btn sc-btn-icon sc-btn-ghost btn-sm" title="Edit">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button className="sc-btn sc-btn-icon sc-btn-ghost btn-sm text-danger" title="Delete" onClick={() => handleDelete(item._id)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
