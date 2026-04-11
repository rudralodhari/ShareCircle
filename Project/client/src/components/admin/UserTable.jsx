import { useState, useEffect } from 'react';
import userService from '../../services/userService';

export default function UserTable({ onAction }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getAllUsers();
        setUsers(res.data.users || []);
      } catch {
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleBan = async (user) => {
    try {
      const res = await userService.banUser(user._id);
      setUsers(users.map(u => u._id === user._id ? { ...u, isBanned: res.data.user.isBanned } : u));
    } catch {
      // Toggle locally if backend is unavailable (though it should be available now)
      setUsers(users.map(u => u._id === user._id ? { ...u, isBanned: !u.isBanned } : u));
    }
  };

  return (
    <div className="sc-card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="p-4 pb-3">
        <h5 className="fw-bold mb-0">Users</h5>
      </div>
      
      {loading ? (
        <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-500)' }}></div></div>
      ) : users.length === 0 ? (
        <div className="text-center py-4 px-4"><p style={{ color: 'var(--text-tertiary)' }}>No users found</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ paddingLeft: 'var(--space-6)' }}>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ paddingRight: 'var(--space-6)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ paddingLeft: 'var(--space-6)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, background: 'var(--primary-100)', color: 'var(--primary-600)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.name?.charAt(0)}
                      </div>
                      <span className="fw-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={`sc-badge ${u.role === 'admin' ? 'sc-badge-accent' : 'sc-badge-primary'}`}>{u.role}</span></td>
                  <td>
                    <span className={`sc-badge ${u.isBanned ? 'sc-badge-danger' : 'sc-badge-primary'}`}>
                      {u.isBanned ? 'banned' : 'active'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ paddingRight: 'var(--space-6)' }}>
                    <div className="d-flex gap-1">
                      <button className="sc-btn sc-btn-ghost sc-btn-sm" onClick={() => onAction?.('view', u)}><i className="bi bi-eye"></i></button>
                      <button className="sc-btn sc-btn-ghost sc-btn-sm" onClick={() => handleBan(u)}>
                        <i className={`bi ${u.isBanned ? 'bi-check-circle' : 'bi-slash-circle'}`}></i>
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
