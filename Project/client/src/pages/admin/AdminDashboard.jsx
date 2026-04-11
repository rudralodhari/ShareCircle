import { useState, useEffect } from 'react';

import AdminStats from '../../components/admin/AdminStats';
import ListingModeration from '../../components/admin/ListingModeration';
import DisputePanel from '../../components/admin/DisputePanel';
import UserTable from '../../components/admin/UserTable';
import AdminProfile from '../../components/admin/AdminProfile';
import AdminComplaints from '../../components/admin/AdminComplaints';
import AdminDeliveries from '../../components/admin/AdminDeliveries';
import AdminPayments from '../../components/admin/AdminPayments';
import AdminActivityFeed from '../../components/admin/AdminActivityFeed';
import useAuth from '../../hooks/useAuth';

const SECTIONS = [
  { id: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { id: 'profile', icon: 'bi-person', label: 'Profile' },
  { id: 'users', icon: 'bi-people', label: 'Users' },
  { id: 'listings', icon: 'bi-grid', label: 'Listings' },
  { id: 'disputes', icon: 'bi-exclamation-triangle', label: 'Disputes' },
  { id: 'complaints', icon: 'bi-chat-left-text', label: 'Complaints' },
  { id: 'deliveries', icon: 'bi-truck', label: 'Deliveries' },
  { id: 'payments', icon: 'bi-credit-card', label: 'Payments' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [active, setActive] = useState('dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>

      {/* Admin Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        padding: 'var(--space-4)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Admin badge */}
        <div className="mb-4 p-3 rounded-3" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock" style={{ color: '#8B5CF6', fontSize: '1.1rem' }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#8B5CF6' }}>Admin Panel</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{user?.name}</div>
            </div>
          </div>
        </div>

        {/* Section links */}
        <nav className="d-flex flex-column gap-1 flex-grow-1">
          {SECTIONS.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActive(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', width: '100%',
                fontWeight: active === id ? 700 : 500,
                fontSize: '0.9rem', textAlign: 'left', transition: 'all 0.15s',
                background: active === id ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: active === id ? '#8B5CF6' : 'var(--text-secondary)',
              }}>
              <i className={`bi ${icon}`}></i>
              {label}
            </button>
          ))}
        </nav>

      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4 fade-in" style={{ overflowY: 'auto' }}>

        {/* Header */}
        <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Admin Dashboard</h2>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: 0 }}>Platform overview and management</p>
          </div>

        </div>

        {/* Stats — always visible */}
        <div className="mb-4">
          <AdminStats />
        </div>

        {/* Conditional sections */}
        {active === 'dashboard' && (
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <AdminActivityFeed />
            </div>
            <div className="col-lg-4">
              <div className="sc-card h-100 fade-in text-center d-flex flex-column justify-content-center py-5">
                <i className="bi bi-shield-check mb-3" style={{ fontSize: '3rem', color: '#10b981' }}></i>
                <h5 className="fw-bold">System Status: Optimal</h5>
                <p className="text-muted small mb-0 mt-2">All services are running normally with 99.9% uptime over the last 30 days.</p>
              </div>
            </div>
          </div>
        )}

        {active === 'listings' && (
          <div className="mb-4">
            <ListingModeration />
          </div>
        )}

        {active === 'disputes' && (
          <div className="mb-4">
            <DisputePanel />
          </div>
        )}

        {active === 'users' && (
          <div className="mb-4">
            <UserTable />
          </div>
        )}

        {active === 'profile' && (
          <div className="mb-4">
            <AdminProfile />
          </div>
        )}

        {active === 'complaints' && (
          <div className="mb-4">
            <AdminComplaints />
          </div>
        )}

        {active === 'deliveries' && (
          <div className="mb-4">
            <AdminDeliveries />
          </div>
        )}

        {active === 'payments' && (
          <div className="mb-4">
            <AdminPayments />
          </div>
        )}
      </main>
    </div>
  );
}
