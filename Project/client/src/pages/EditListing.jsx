import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ItemForm from '../components/items/ItemForm';
import itemService from '../services/itemService';
import Sidebar from '../components/common/Sidebar';
import { useToast } from '../context/ToastContext';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await itemService.getById(id);
        const item = res.data.item;
        setInitialData({
          title: item.title, description: item.description,
          price: item.price, category: item.category,
          transactionType: item.transactionType, condition: item.condition,
          location: item.location?.city || item.location?.address || '',
        });
      } catch (err) {
        toast.error('Failed to load item for editing');
        navigate('/my-listings');
      }
      setFetching(false);
    };
    fetchItem();
  }, [id, navigate, toast]);

  const handleSubmit = async (data, imageFiles) => {
    setLoading(true);
    try {
      let imagePaths = [];
      // Upload new images if any
      if (imageFiles && imageFiles.length > 0) {
        const uploadRes = await itemService.uploadImages(imageFiles);
        imagePaths = uploadRes.data.images;
      }

      const updateData = { ...data };
      if (imagePaths.length > 0) updateData.images = imagePaths; // Only update if new images provided

      await itemService.update(id, updateData);

      toast.success('Listing updated successfully!');
      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update listing.');
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Edit Listing</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>Update your item details</p>
        </div>

        {fetching ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <ItemForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
        )}
      </main>
    </div>
  );
}
