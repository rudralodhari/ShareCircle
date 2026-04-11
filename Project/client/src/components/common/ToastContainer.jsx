import { useToast } from '../../context/ToastContext';

const icons = {
  success: 'bi-check-circle-fill',
  error: 'bi-exclamation-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

const colors = {
  success: { bg: 'var(--bg-elevated, #1c1c21)', border: '#10b981', text: '#10b981', icon: '#10b981' },
  error:   { bg: 'var(--bg-elevated, #1c1c21)', border: '#ef4444', text: '#ef4444', icon: '#ef4444' },
  warning: { bg: 'var(--bg-elevated, #1c1c21)', border: '#f59e0b', text: '#f59e0b', icon: '#f59e0b' },
  info:    { bg: 'var(--bg-elevated, #1c1c21)', border: '#3b82f6', text: '#3b82f6', icon: '#3b82f6' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 10,
      maxWidth: 400, width: '90vw',
    }}>
      {toasts.map((t) => {
        const c = colors[t.type] || colors.info;
        return (
          <div
            key={t.id}
            className="toast-slide-in"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 'var(--radius-md, 12px)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              animation: 'toastSlideIn 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <i className={`bi ${icons[t.type] || icons.info}`} style={{ color: c.icon, fontSize: '1.2rem', marginTop: 1 }}></i>
            <span style={{ color: 'var(--text-primary, #fff)', fontSize: '0.9rem', fontWeight: 500, flex: 1, lineHeight: 1.5 }}>
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0, fontSize: '1.1rem', lineHeight: 1 }}
              aria-label="Close"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
