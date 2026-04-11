export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: '1.5rem', md: '3rem', lg: '4.5rem' };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 fade-in">
      <div
        style={{
          width: sizes[size],
          height: sizes[size],
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary-500)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && (
        <span className="mt-3" style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          {text}
        </span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
