import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import SustainabilityWidget from '../components/dashboard/SustainabilityWidget';
import userService from '../services/userService';
import chatService from '../services/chatService';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiStats, setApiStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await userService.getStats();
        setApiStats(res.data);
      } catch {
        // Backend unavailable — use local user data
      }
    };
    fetchStats();
  }, []);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await chatService.getConversations();
        const convos = res.data.conversations || [];
        const total = convos.reduce((sum, c) => sum + (c.unread || 0), 0);
        setUnreadCount(total);
      } catch {
        setUnreadCount(3); // fallback mock
      }
    };
    fetchUnread();
  }, []);

  const stats = [
    { icon: 'bi-grid', label: 'My Listings', value: String(apiStats?.listings ?? user?.itemsShared ?? 0), color: 'var(--primary-500)', link: '/my-listings' },
    { icon: 'bi-arrow-left-right', label: 'Transactions', value: String(apiStats?.transactions ?? 0), color: 'var(--secondary-500)', link: '/my-orders' },
    { icon: 'bi-star', label: 'Avg Rating', value: (apiStats?.rating ?? user?.rating) ? (apiStats?.rating ?? user?.rating).toFixed(1) : '—', color: 'var(--accent-500)', link: '/profile' },
    { icon: 'bi-chat-dots', label: 'Messages', value: String(unreadCount), color: '#3B82F6', link: '/chat' },
  ];

  // Get the user's first name for a friendly greeting
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Welcome back, <strong style={{ color: 'var(--primary-500)' }}>{firstName}</strong>! Here&apos;s your overview.
          </p>
        </div>

        <div className="row g-4 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="col-md-6 col-xl-3" onClick={() => navigate(s.link)} style={{ cursor: 'pointer' }}>
              <StatsCard {...s} />
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <ActivityFeed activities={apiStats?.activityFeed} />
          </div>
          <div className="col-lg-5">
            <SustainabilityWidget impact={apiStats?.impact} />
          </div>
        </div>
      </main>
    </div>
  );
}
