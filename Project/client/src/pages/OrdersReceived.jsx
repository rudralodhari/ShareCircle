import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import orderService from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { formatPrice, placeholderImage } from '../utils/helpers';

const STATUS_COLORS = { placed: '#3b82f6', confirmed: '#8b5cf6', shipped: '#f59e0b', delivered: '#10b981', cancelled: '#ef4444', returned: '#6b7280' };
const STATUS_FLOW = ['placed', 'confirmed', 'shipped', 'delivered'];

export default function OrdersReceived() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try { const res = await orderService.getReceivedOrders(); setOrders(res.data.orders || []); }
      catch { setOrders([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try { await orderService.updateOrderStatus(id, status); setOrders(orders.map(o => o._id === id ? {...o, status} : o)); toast.success(`Order ${status}`); }
    catch { toast.error('Failed to update'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <h2 className="fw-bold mb-1">Orders Received</h2>
        <p style={{ color: 'var(--text-tertiary)' }}>Orders from other users for your items</p>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--primary-500)' }}></div></div>
        ) : orders.length === 0 ? (
          <div className="sc-card text-center py-5">
            <i className="bi bi-inbox d-block mb-3" style={{ fontSize: '4rem', color: 'var(--text-tertiary)' }}></i>
            <h4 className="fw-bold">No orders received yet</h4>
            <p style={{ color: 'var(--text-tertiary)' }}>When someone buys your item, it will appear here</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => {
              const currentIdx = STATUS_FLOW.indexOf(order.status);
              const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
              return (
                <div key={order._id} className="sc-card">
                  <div className="d-flex gap-3 align-items-center">
                    <img src={order.item?.images?.[0] || placeholderImage(70, 70)} alt="" style={{ width: 70, height: 70, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} onError={(e) => { e.target.src = placeholderImage(70, 70); }} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{order.item?.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Buyer: {order.buyer?.name} · {new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="fw-bold" style={{ color: 'var(--primary-500)' }}>{formatPrice(order.total)}</div>
                    </div>
                    <div className="text-end">
                      <span className="sc-badge mb-2" style={{ background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], textTransform: 'capitalize' }}>{order.status}</span>
                      {nextStatus && order.status !== 'cancelled' && (
                        <button className="sc-btn sc-btn-primary sc-btn-sm d-block" onClick={() => handleUpdateStatus(order._id, nextStatus)} style={{ textTransform: 'capitalize' }}>
                          Mark {nextStatus}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
