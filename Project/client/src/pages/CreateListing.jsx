import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemForm from '../components/items/ItemForm';
import itemService from '../services/itemService';
import Sidebar from '../components/common/Sidebar';


export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data, imageFiles) => {
    setLoading(true);
    setError('');

    try {
      let imagePaths = [];

      // 1. Upload images first (if any)
      if (imageFiles && imageFiles.length > 0) {
        const uploadRes = await itemService.uploadImages(imageFiles);
        imagePaths = uploadRes.data.images; // e.g. ["/images/products/123.jpg"]
      }

      // 2. Create item with image paths
      await itemService.create({ ...data, images: imagePaths });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/browse'), 1500);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create listing. Please try again.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Create Listing</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>Share something with your community</p>
        </div>

        {success && (
          <div className="mb-4 p-4 rounded-3 text-center fade-in"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--primary-600)' }}>
            <i className="bi bi-check-circle-fill d-block mb-2" style={{ fontSize: '2rem' }}></i>
            <h5 className="fw-bold mb-1">Listing Published!</h5>
            <p className="mb-0">Your item has been shared with the community. Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-3 fade-in"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {!success && <ItemForm onSubmit={handleSubmit} loading={loading} />}
      </main>
    </div>
  );
}
