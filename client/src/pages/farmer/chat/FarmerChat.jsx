import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChatUsers, getConversations, getMessages, sendMessage } from '../../../services/farmerService';
import { useAuth } from '../../../hooks/useAuth';

const ACCENT = '#1a6b1a';

const FarmerChat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeId, setActiveId] = useState(userId || null);
  const [messages, setMessages] = useState([]);
  const [participant, setParticipant] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const [conversationResponse, userResponse] = await Promise.all([
        getConversations(),
        getChatUsers(),
      ]);
      setConversations(conversationResponse.data.data.conversations || []);
      setUsers(userResponse.data.data.users || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chat contacts.');
    }
    finally { setLoadingConvs(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => { setActiveId(userId || null); }, [userId]);

  useEffect(() => {
    if (!activeId) return;
    setParticipant(null);
    setMessages([]);
    setError('');
    setLoadingMsgs(true);
    let active = true;
    let loading = false;
    const loadMessages = () => {
      if (!active || loading) return;
      loading = true;
      return getMessages(activeId)
      .then((res) => {
        if (!active) return;
        setMessages(res.data.data.messages || []);
        setParticipant(res.data.data.participant);
        setError('');
        setConversations((prev) => prev.map((c) => String(c.participant?._id) === activeId ? { ...c, unreadCount: 0 } : c));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load messages.');
      })
      .finally(() => {
        loading = false;
        if (active) setLoadingMsgs(false);
      });
    };
    loadMessages();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadMessages();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [activeId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadConversations();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await sendMessage(activeId, { text: text.trim() });
      setMessages((prev) => [...prev, res.data.data.message]);
      setText('');
      await loadConversations();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send message.');
      setTimeout(() => setError(''), 3000);
    } finally { setSending(false); }
  };

  const fmtTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '';

  return (
    <div style={{ height:'calc(100vh - 120px)', display:'flex', gap:0, background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
      {/* Conversations list */}
      <div style={{ width:260, borderRight:'1px solid var(--color-border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'1rem', borderBottom:'1px solid var(--color-border)', fontWeight:700, fontSize:'0.9rem', background:'var(--color-off-white)' }}>
          💬 Conversations
        </div>
        {error && !activeId && <p role="alert" style={{ padding:'0.75rem', margin:0, color:'var(--color-error)', fontSize:'0.75rem' }}>{error}</p>}
        <div style={{ flex:1, overflowY:'auto' }}>
          {loadingConvs ? (
            <p style={{ padding:'1rem', color:'var(--color-text-muted)', fontSize:'0.82rem' }}>Loading…</p>
          ) : users.length === 0 ? (
            <div style={{ padding:'1.5rem', textAlign:'center' }}>
              <p style={{ fontSize:'1.5rem', marginBottom:'0.375rem' }}>👥</p>
              <p style={{ color:'var(--color-text-muted)', fontSize:'0.82rem' }}>No active farmers or buyers are available to chat.</p>
            </div>
          ) : (
            users.map((person) => {
              const conv = conversations.find((item) => String(item.participant?._id) === String(person._id));
              return <button key={person._id} type="button" onClick={() => navigate(`/farmer/chat/${person._id}`)} style={{
                width: '100%', textAlign: 'left', border: 0,
                padding:'0.875rem 1rem', cursor:'pointer', borderBottom:'1px solid var(--color-border)',
                background: activeId === String(person._id) ? '#edf7ed' : 'transparent',
                borderLeft: activeId === String(person._id) ? `3px solid ${ACCENT}` : '3px solid transparent',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, fontSize:'0.82rem', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {person.name}
                    </p>
                    <p style={{ fontSize:'0.68rem', color:'var(--color-text-muted)', margin:'0.1rem 0 0', textTransform:'capitalize' }}>
                      {person.role}{person.loginId ? ` · ${person.loginId}` : ''}
                    </p>
                    <p style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', margin:'0.1rem 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {conv?.lastMessage?.text || 'Start a conversation'}
                    </p>
                  </div>
                  {conv?.unreadCount > 0 && (
                    <span style={{ background:ACCENT, color:'#fff', borderRadius:'9999px', padding:'0.1rem 0.4rem', fontSize:'0.65rem', fontWeight:700, flexShrink:0, marginLeft:'0.5rem' }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>;
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      {!activeId ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.75rem', color:'var(--color-text-muted)' }}>
          <p style={{ fontSize:'2rem' }}>💬</p>
          <p style={{ fontWeight:600 }}>Select a conversation</p>
          <p style={{ fontSize:'0.82rem' }}>Choose a farmer or buyer from the contacts list.</p>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--color-border)', background:'var(--color-off-white)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontWeight:700, fontSize:'0.9rem', margin:0 }}>👤 {participant?.name || '…'}</p>
              <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:0, textTransform:'capitalize' }}>{participant?.loginId || ''}{participant?.role ? ` · ${participant.role}` : ''}</p>
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.625rem' }}>
            {loadingMsgs ? (
              <p style={{ textAlign:'center', color:'var(--color-text-muted)', fontSize:'0.82rem' }}>Loading…</p>
            ) : messages.length === 0 ? (
              <div style={{ textAlign:'center', marginTop:'3rem' }}>
                <p style={{ fontSize:'1.5rem', marginBottom:'0.375rem' }}>👋</p>
                <p style={{ color:'var(--color-text-muted)', fontSize:'0.82rem' }}>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = String(msg.sender?._id || msg.sender) === String(user?._id || user?.id);
                return (
                  <div key={msg._id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth:'70%', padding:'0.625rem 0.875rem', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: isMe ? ACCENT : 'var(--color-off-white)',
                      color: isMe ? '#fff' : 'var(--color-text)',
                    }}>
                      {msg.text && <p style={{ fontSize:'0.875rem', margin:0, lineHeight:1.5 }}>{msg.text}</p>}
                      <p style={{ fontSize:'0.65rem', margin:'0.25rem 0 0', opacity:0.7, textAlign:'right' }}>{fmtTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p style={{ padding:'0 1rem', color:'var(--color-error)', fontSize:'0.78rem' }}>{error}</p>}
          <form onSubmit={handleSend} style={{ padding:'0.875rem 1rem', borderTop:'1px solid var(--color-border)', display:'flex', gap:'0.625rem' }}>
            <input className="form-input" style={{ flex:1 }} placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} disabled={sending} />
            <button type="submit" disabled={sending || !text.trim()} className="btn btn-sm" style={{ background:ACCENT, color:'#fff', borderColor:ACCENT, minWidth:70 }}>
              {sending ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FarmerChat;
