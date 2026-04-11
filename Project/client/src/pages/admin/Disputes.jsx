import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import DisputePanel from '../../components/admin/DisputePanel';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const adminLinks = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Overview' },
  { to: '/admin/users', icon: 'bi-people', label: 'Users' },
  { to: '/admin/listings', icon: 'bi-grid', label: 'Listings' },
  { to: '/admin/disputes', icon: 'bi-exclamation-triangle', label: 'Disputes' },
];

const mockDisputes = [
  { _id: '1', item: 'Mountain Bicycle', buyer: 'Arjun P.', seller: 'Priya S.', reason: 'Item not as described', status: 'open', createdAt: '2026-03-10' },
  { _id: '2', item: 'Power Drill', buyer: 'Rahul S.', seller: 'Sneha G.', reason: 'Item damaged during rental', status: 'in_progress', createdAt: '2026-03-08' },
  { _id: '3', item: 'Books Set', buyer: 'Meera K.', seller: 'Dev T.', reason: 'Late return', status: 'resolved', createdAt: '2026-03-05' },
];

export default function Disputes() {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const toast = useToast();

  const handleAction = (action, dispute) => {
    if (action === 'view') {
      setSelectedDispute(dispute);
    } else if (action === 'resolve') {
      setDisputes(disputes.map(d => d._id === dispute._id ? { ...d, status: 'resolved' } : d));
      toast.success('Dispute marked as resolved.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar items={adminLinks} />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Disputes</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>Resolve community disputes</p>
        </div>
        <DisputePanel disputes={disputes} onAction={handleAction} />

        <Modal isOpen={!!selectedDispute} onClose={() => setSelectedDispute(null)} title="Dispute Details">
          {selectedDispute && (
            <div>
              <p><strong>Item:</strong> {selectedDispute.item}</p>
              <p><strong>Buyer:</strong> {selectedDispute.buyer}</p>
              <p><strong>Seller:</strong> {selectedDispute.seller}</p>
              <p><strong>Reason:</strong> {selectedDispute.reason}</p>
              <p><strong>Status:</strong> {selectedDispute.status.replace('_', ' ')}</p>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
