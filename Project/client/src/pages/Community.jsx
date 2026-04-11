import { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import communityService from '../services/communityService';
import { timeAgo } from '../utils/helpers';

export default function Community() {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Discussion state
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscForm, setNewDiscForm] = useState({ title: '', content: '' });
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await communityService.getGroups();
        setGroups(res.data.groups);
      } catch (err) {
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [toast]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q));
  }, [groups, searchQuery]);

  const isJoined = (group) => {
    return group.members?.includes(user?._id);
  };

  const handleJoinLeave = async (groupId) => {
    if (!isAuthenticated) { toast.warning('Please login to join groups'); return; }
    try {
      const res = await communityService.joinGroup(groupId);
      setGroups(prev => prev.map(g => {
        if (g._id !== groupId) return g;
        return { ...g, members: res.data.members, memberCount: res.data.members.length };
      }));
      if (activeGroup?._id === groupId) {
        setActiveGroup(prev => ({ ...prev, members: res.data.members, memberCount: res.data.members.length }));
      }
      toast.success(res.data.members.includes(user._id) ? '🎉 Joined the group!' : 'Left the group');
    } catch (err) {
      toast.error('Failed to update group status');
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscForm.title.trim() || !newDiscForm.content.trim()) { toast.warning('Please fill title and content'); return; }
    try {
      const res = await communityService.postDiscussion(activeGroup._id, newDiscForm);
      const updatedGroup = { ...activeGroup, discussions: [res.data.discussion, ...(activeGroup.discussions || [])] };
      setActiveGroup(updatedGroup);
      setGroups(prev => prev.map(g => g._id === activeGroup._id ? updatedGroup : g));
      setShowNewDiscussion(false);
      setNewDiscForm({ title: '', content: '' });
      toast.success('📝 Discussion posted!');
    } catch (err) {
      toast.error('Failed to post discussion');
    }
  };

  const handleReply = async (discId) => {
    const text = replyInputs[discId];
    if (!text?.trim()) return;
    if (!isAuthenticated) { toast.warning('Please login to reply'); return; }
    try {
      const res = await communityService.replyDiscussion(discId, text);
      const updatedDiscussions = activeGroup.discussions.map(d =>
        d._id === discId ? { ...d, replies: res.data.replies } : d
      );
      const updatedGroup = { ...activeGroup, discussions: updatedDiscussions };
      setActiveGroup(updatedGroup);
      setGroups(prev => prev.map(g => g._id === activeGroup._id ? updatedGroup : g));
      setReplyInputs({ ...replyInputs, [discId]: '' });
      toast.success('💬 Reply posted!');
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  const handleLikeDiscussion = async (discId) => {
    if (!isAuthenticated) { toast.warning('Please login to like'); return; }
    try {
      const res = await communityService.likeDiscussion(discId);
      const updatedDiscussions = activeGroup.discussions.map(d =>
        d._id === discId ? { ...d, likes: Array(res.data.likes).fill('mock') } : d // backend returns length, map dynamically treats array length as likes
      );
      const updatedGroup = { ...activeGroup, discussions: updatedDiscussions };
      setActiveGroup(updatedGroup);
      setGroups(prev => prev.map(g => g._id === activeGroup._id ? updatedGroup : g));
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  // ── GROUP LIST VIEW ──
  if (!activeGroup) {
    return (
      <div className="fade-in mb-5">
        {/* Hero Section with 3 Hover Images */}
        <section className="sc-section" style={{ background: 'var(--gradient-hero)', color: '#fff', padding: 'var(--space-16) 0', position: 'relative', overflow: 'hidden' }}>
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h1 data-scroll="fade-up" style={{ color: '#fff', fontWeight: 800, fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                  Grow With <span style={{ color: '#fff' }}>Your Community</span>
                </h1>
                <p data-scroll="fade-up" data-delay="1" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: 520, lineHeight: 1.6, marginBottom: '2rem' }}>
                  Join groups based on your interests. Discuss, share ideas, and connect with your local community. Get instant advice, collaborate on projects, and build long-lasting friendships.
                </p>
                <div data-scroll="fade-up" data-delay="2">
                  <a href="#groups-dir" className="sc-btn sc-btn-lg" style={{ background: '#fff', color: 'var(--primary-600)', border: 'none', fontWeight: 600 }}>Explore Groups</a>
                </div>
              </div>
              <div className="col-lg-6 d-none d-lg-block">
                <div className="community-cards-wrapper">
                  <div className="community-hero-card community-hero-card-1" data-scroll="zoom-in" data-delay="1">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600" alt="Team collaborating" />
                    <div className="community-card-text">DISCUSS</div>
                  </div>
                  <div className="community-hero-card community-hero-card-2" data-scroll="zoom-in" data-delay="2">
                    <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=600" alt="Community support" />
                    <div className="community-card-text">CONNECT</div>
                  </div>
                  <div className="community-hero-card community-hero-card-3" data-scroll="zoom-in" data-delay="3">
                    <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=600" alt="Connecting ideas" />
                    <div className="community-card-text">COLLABORATE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div id="groups-dir" className="sc-container sc-section mt-5" style={{ paddingTop: 'var(--space-6)' }}>
          {/* Search */}
          <div className="mb-4">
            <div className="position-relative">
              <i className="bi bi-search position-absolute" style={{ left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}></i>
              <input className="sc-input" style={{ paddingLeft: 44 }} placeholder="Search groups by name or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {filteredGroups.map((group, i) => (
                  <div key={group._id} className="col-md-6 col-lg-4" data-scroll={['fade-up', 'fade-right', 'zoom-in'][i % 3]} data-delay={String((i % 3) + 1)}>
                    <div className="sc-card h-100 d-flex flex-column" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setActiveGroup(group)}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="d-flex align-items-center justify-content-center rounded-3"
                          style={{ width: 56, height: 56, background: 'var(--primary-50)', fontSize: '1.8rem', flexShrink: 0 }}>
                          {group.icon}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-0">{group.name}</h6>
                          <small style={{ color: 'var(--text-tertiary)' }}>{group.memberCount} members · {group.discussions?.length || 0} discussions</small>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, flexGrow: 1 }}>{group.description}</p>
                      <div className="d-flex align-items-center justify-content-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                        {group.category && <span className="sc-chip" style={{ fontSize: '0.75rem' }}>{group.category}</span>}
                        <button className={`sc-btn ${isJoined(group) ? 'sc-btn-outline' : 'sc-btn-primary'} sc-btn-sm`}
                          onClick={(e) => { e.stopPropagation(); handleJoinLeave(group._id); }}>
                          {isJoined(group) ? <><i className="bi bi-check-lg me-1"></i>Joined</> : <><i className="bi bi-plus me-1"></i>Join</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredGroups.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-search d-block mb-3" style={{ fontSize: '3rem', color: 'var(--text-tertiary)' }}></i>
                  <h5 className="fw-bold">No groups found</h5>
                  <p style={{ color: 'var(--text-tertiary)' }}>Try a different search!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── GROUP DETAIL VIEW ──
  return (
    <div className="fade-in">
      {/* Group Header */}
      <section className="py-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container">
          <button className="sc-btn sc-btn-ghost mb-3" style={{ color: 'rgba(255,255,255,0.85)' }}
            onClick={() => { setActiveGroup(null); setShowNewDiscussion(false); }}>
            <i className="bi bi-arrow-left me-2"></i>Back to Groups
          </button>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', fontSize: '2.2rem', flexShrink: 0 }}>
              {activeGroup.icon}
            </div>
            <div className="flex-grow-1">
              <h3 className="fw-bold mb-0" style={{ color: '#fff' }}>{activeGroup.name}</h3>
              <p className="mb-0" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                {activeGroup.memberCount} members
              </p>
            </div>
            <button className={`sc-btn ${isJoined(activeGroup) ? 'sc-btn-outline' : 'sc-btn-primary'}`}
              style={isJoined(activeGroup) ? { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' } : {}}
              onClick={() => handleJoinLeave(activeGroup._id)}>
              {isJoined(activeGroup) ? <><i className="bi bi-check-lg me-1"></i>Joined</> : <><i className="bi bi-plus me-1"></i>Join Group</>}
            </button>
          </div>
        </div>
      </section>

      <div className="sc-container sc-section" style={{ paddingTop: 'var(--space-4)' }}>
        <div className="sc-card mb-4">
          <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{activeGroup.description}</p>
        </div>

        {isAuthenticated && isJoined(activeGroup) && (
          <div className="mb-4">
            <button className="sc-btn sc-btn-primary" onClick={() => setShowNewDiscussion(!showNewDiscussion)}>
              <i className="bi bi-plus-lg me-2"></i>New Discussion
            </button>
          </div>
        )}

        {showNewDiscussion && (
          <div className="sc-card mb-4 fade-in">
            <h6 className="fw-bold mb-3"><i className="bi bi-chat-left-text me-2" style={{ color: 'var(--primary-500)' }}></i>Start a Discussion</h6>
            <form onSubmit={handlePostDiscussion}>
              <input className="sc-input mb-2" placeholder="Discussion title" value={newDiscForm.title} onChange={(e) => setNewDiscForm({ ...newDiscForm, title: e.target.value })} required />
              <textarea className="sc-input mb-3" rows={3} placeholder="Share your thoughts, ask a question, or start a conversation..." value={newDiscForm.content} onChange={(e) => setNewDiscForm({ ...newDiscForm, content: e.target.value })} required />
              <div className="d-flex gap-2">
                <button type="submit" className="sc-btn sc-btn-primary"><i className="bi bi-send me-1"></i>Post</button>
                <button type="button" className="sc-btn sc-btn-ghost" onClick={() => setShowNewDiscussion(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {!isJoined(activeGroup) && (
          <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
            <i className="bi bi-info-circle"></i>
            <span style={{ fontSize: '0.88rem' }}>Join this group to post discussions and reply to others.</span>
          </div>
        )}

        <div className="d-flex flex-column gap-3">
          {(!activeGroup.discussions || activeGroup.discussions.length === 0) ? (
            <div className="text-center py-5 sc-card">
              <i className="bi bi-chat-left-text d-block mb-3" style={{ fontSize: '3rem', color: 'var(--text-tertiary)' }}></i>
              <h5 className="fw-bold">No discussions yet</h5>
              <p style={{ color: 'var(--text-tertiary)' }}>Be the first to start a conversation!</p>
            </div>
          ) : (
            activeGroup.discussions.map((disc) => (
              <div key={disc._id} className="sc-card">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40, background: 'var(--primary-50)', color: 'var(--primary-500)', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {disc.author?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-0" style={{ fontSize: '1rem' }}>{disc.title}</h6>
                    <small style={{ color: 'var(--text-tertiary)' }}>{disc.author?.name} · {timeAgo(disc.createdAt)}</small>
                  </div>
                </div>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{disc.content}</p>

                <div className="d-flex gap-3 align-items-center pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button className="sc-btn sc-btn-ghost sc-btn-sm" onClick={() => handleLikeDiscussion(disc._id)}>
                    <i className="bi bi-hand-thumbs-up me-1"></i>{disc.likes?.length || 0}
                  </button>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
                    <i className="bi bi-chat me-1"></i>{disc.replies?.length || 0} replies
                  </span>
                </div>

                {disc.replies?.length > 0 && (
                  <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                    {disc.replies.map((reply) => (
                      <div key={reply._id} className="d-flex gap-2 mb-3 ms-4">
                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 32, height: 32, background: 'var(--bg-surface-2)', color: 'var(--primary-500)', fontWeight: 700, fontSize: '0.75rem' }}>
                          {reply.author?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-grow-1 p-2 rounded-3" style={{ background: 'var(--bg-surface-2)', fontSize: '0.88rem' }}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold" style={{ color: 'var(--primary-500)', fontSize: '0.82rem' }}>{reply.author?.name}</span>
                            <small style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{timeAgo(reply.createdAt)}</small>
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }}>{reply.content || reply.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isAuthenticated && isJoined(activeGroup) && (
                  <div className="d-flex gap-2 mt-2">
                    <input className="sc-input" style={{ fontSize: '0.85rem' }} placeholder="Write a reply..."
                      value={replyInputs[disc._id] || ''} onChange={(e) => setReplyInputs({ ...replyInputs, [disc._id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleReply(disc._id); }} />
                    <button className="sc-btn sc-btn-primary sc-btn-sm" onClick={() => handleReply(disc._id)}>
                      <i className="bi bi-send"></i>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
