import { timeAgo, truncate } from '../../utils/helpers';

export default function ChatList({ conversations = [], activeId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="sc-empty-state py-5">
        <i className="bi bi-chat-dots d-block"></i>
        <h6>No conversations</h6>
        <p style={{ fontSize: '0.8rem' }}>Start chatting with someone about an item!</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column">
      <div className="p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h5 className="fw-bold mb-0">Messages</h5>
      </div>
      {conversations.map((conv) => (
        <button
          key={conv._id}
          className="d-flex align-items-center gap-3 px-3 py-3 text-start border-0 w-100"
          style={{
            background: activeId === conv._id ? 'var(--primary-50)' : 'transparent',
            borderBottom: '1px solid var(--border-light)',
            transition: 'background var(--transition-fast)',
            cursor: 'pointer',
          }}
          onClick={() => onSelect?.(conv)}
        >
          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 44, height: 44, background: 'var(--primary-100)', color: 'var(--primary-600)', fontWeight: 700 }}>
            {conv.participant?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <div className="d-flex justify-content-between">
              <span className="fw-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{conv.participant?.name}</span>
              <small style={{ color: 'var(--text-tertiary)' }}>{timeAgo(conv.lastMessageAt)}</small>
            </div>
            <p className="mb-0" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
              {truncate(conv.lastMessage, 40)}
            </p>
          </div>
          {conv.unread > 0 && (
            <span className="badge rounded-pill" style={{ background: 'var(--primary-500)', color: '#fff', fontSize: '0.7rem' }}>
              {conv.unread}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
