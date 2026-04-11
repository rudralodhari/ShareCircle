import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import ListingModeration from '../../components/admin/ListingModeration';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const adminLinks = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Overview' },
  { to: '/admin/users', icon: 'bi-people', label: 'Users' },
  { to: '/admin/listings', icon: 'bi-grid', label: 'Listings' },
  { to: '/admin/disputes', icon: 'bi-exclamation-triangle', label: 'Disputes' },
];

export default function ManageListings() {
  const [selectedListing, setSelectedListing] = useState(null);
  const toast = useToast();

  const handleAction = (action, listing) => {
    if (action === 'view') {
      setSelectedListing(listing);
    } else if (action === 'approve') {
      toast.success('Listing approved and is now visible to the community.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar items={adminLinks} />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Manage Listings</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>Review and moderate community listings</p>
        </div>
        <ListingModeration onAction={handleAction} />

        <Modal isOpen={!!selectedListing} onClose={() => setSelectedListing(null)} title="Listing Details">
          {selectedListing && (
            <div>
              <p><strong>Title:</strong> {selectedListing.title}</p>
              <p><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedListing.transactionType || selectedListing.type}</span></p>
              <p><strong>Description:</strong> {selectedListing.description || 'No description provided.'}</p>
              <p><strong>Owner:</strong> {selectedListing.owner?.name || selectedListing.owner}</p>
              <p><strong>Status:</strong> {selectedListing.status || 'Available'}</p>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
