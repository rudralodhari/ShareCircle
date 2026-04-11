import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ conversation, messages = [], onSend }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText('');
  };

  if (!conversation) {
    return (
      <div className="chat-main d-flex flex-column h-100 align-items-center justify-content-center" style={{ background: 'var(--bg-body)' }}>
        <i className="bi bi-chat-dots" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}></i>
        <h5 style={{ color: 'var(--text-secondary)' }}>Select a conversation</h5>
        <p style={{ color: 'var(--text-tertiary)' }}>Choose a user from the sidebar to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="chat-main d-flex flex-column h-100">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: 'var(--primary-100)', color: 'var(--primary-600)', fontWeight: 700 }}>
          {conversation.participant?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <h6 className="mb-0 fw-bold">{conversation.participant?.name || 'Unknown User'}</h6>
          <small style={{ color: 'var(--text-tertiary)' }}>{conversation.item?.title || ''}</small>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-4" style={{ background: 'var(--bg-body)' }}>
        {messages.length === 0 ? (
          <div className="sc-empty-state">
            <i className="bi bi-chat-dots d-block"></i>
            <h5>No messages yet</h5>
            <p>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="d-flex gap-2 p-3" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <button type="button" className="sc-btn sc-btn-ghost sc-btn-icon">
          <i className="bi bi-paperclip"></i>
        </button>
        <input
          type="text" value={text} onChange={(e) => setText(e.target.value)}
          className="sc-input flex-grow-1" placeholder="Type a message..."
          style={{ borderRadius: 'var(--radius-full)' }} id="chat-input"
        />
        <button type="submit" className="sc-btn sc-btn-primary sc-btn-icon" id="chat-send">
          <i className="bi bi-send"></i>
        </button>
      </form>
    </div>
  );
}
