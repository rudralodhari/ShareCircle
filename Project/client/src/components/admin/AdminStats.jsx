import { useState, useEffect } from 'react';
import StatsCard from '../dashboard/StatsCard';
import userService from '../../services/userService';

export default function AdminStats() {
  const [apiStats, setApiStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await userService.getAdminStats();
        setApiStats(res.data);
      } catch {
        // Use default mock stats
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { icon: 'bi-people', label: 'Total Users', value: apiStats ? String(apiStats.totalUsers) : '—', color: 'var(--primary-500)', trend: apiStats?.newUsers || 0 },
    { icon: 'bi-grid', label: 'Active Listings', value: apiStats ? String(apiStats.activeListings) : '—', color: 'var(--secondary-500)', trend: 0 },
    { icon: 'bi-arrow-left-right', label: 'Transactions', value: apiStats ? String(apiStats.totalTransactions) : '—', color: 'var(--accent-500)', trend: 0 },
    { icon: 'bi-exclamation-triangle', label: 'Total Items', value: apiStats ? String(apiStats.totalItems) : '—', color: 'var(--danger-500)', trend: 0 },
  ];

  return (
    <div className="row g-4 fade-in">
      {stats.map((s) => (
        <div key={s.label} className="col-md-6 col-xl-3">
          <StatsCard {...s} />
        </div>
      ))}
    </div>
  );
}
