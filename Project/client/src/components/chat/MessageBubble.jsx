export default function MessageBubble({ message }) {
  const { text, sender, createdAt, isMine } = message || {};

  const time = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
      <div
        style={{
          maxWidth: '70%',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: isMine ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
          background: isMine ? 'var(--gradient-primary)' : 'var(--bg-surface)',
          color: isMine ? '#fff' : 'var(--text-primary)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <p className="mb-1" style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'inherit' }}>{text}</p>
        <small style={{ opacity: 0.7, fontSize: '0.7rem' }}>{time}</small>
      </div>
    </div>
  );
}
