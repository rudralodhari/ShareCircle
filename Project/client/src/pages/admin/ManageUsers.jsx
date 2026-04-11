import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import UserTable from '../../components/admin/UserTable';
import Modal from '../../components/common/Modal';

const adminLinks = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Overview' },
  { to: '/admin/users', icon: 'bi-people', label: 'Users' },
  { to: '/admin/listings', icon: 'bi-grid', label: 'Listings' },
  { to: '/admin/disputes', icon: 'bi-exclamation-triangle', label: 'Disputes' },
];

export default function ManageUsers() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAction = (action, user) => {
    if (action === 'view') {
      setSelectedUser(user);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar items={adminLinks} />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Manage Users</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>View and manage platform users</p>
        </div>
        <UserTable onAction={handleAction} />

        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
          {selectedUser && (
            <div>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.isBanned ? 'Banned' : 'Active'}</p>
              <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
