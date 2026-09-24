import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Filter,
  X,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  AlertCircle
} from 'lucide-react';

export const ApplicationMessagePane = ({
  application,
  onClose,
  currentUserRole = 'STUDENT'
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'RECEIVED', 'SENT'
  const [errorMsg, setErrorMsg] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (application?.id) {
      fetchMessages();
    }
  }, [application?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeFilter]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get(`/applications/${application.id}/messages`);
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load application messages', err);
      setErrorMsg('Could not load message history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || sending) return;

    try {
      setSending(true);
      const res = await api.post(`/applications/${application.id}/messages`, {
        message: replyText.trim(),
        message_type: 'MESSAGE'
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to send application message', err);
      setErrorMsg('Failed to send message. Please retry.');
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (activeFilter === 'SENT') return msg.is_sent_by_me;
    if (activeFilter === 'RECEIVED') return !msg.is_sent_by_me;
    return true;
  });

  const sentCount = messages.filter((m) => m.is_sent_by_me).length;
  const receivedCount = messages.filter((m) => !m.is_sent_by_me).length;

  const formatMsgTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  };

  if (!application) return null;

  const candidateName = application.candidate_name || application.applicant_name || 'Candidate';
  const roleTitle = application.opportunity_title || 'Opportunity';
  const companyName = application.company_name || 'Hiring Enterprise';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 16px)',
          width: '100%',
          maxWidth: '720px',
          height: '88vh',
          maxHeight: '750px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Application Communication Pane
                </h3>
                <span
                  className="badge"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.55rem'
                  }}
                >
                  {application.status}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--primary-200)', marginTop: '0.15rem' }}>
                {roleTitle} • <strong>{companyName}</strong> (Applicant: {candidateName})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.2s'
            }}
            title="Close communication pane"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div
          style={{
            padding: '0.75rem 1.75rem',
            borderBottom: '1px solid var(--slate-200)',
            backgroundColor: 'var(--slate-50)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveFilter('ALL')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.8rem',
                fontWeight: activeFilter === 'ALL' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeFilter === 'ALL' ? 'var(--primary-600)' : 'transparent',
                color: activeFilter === 'ALL' ? '#ffffff' : 'var(--slate-600)'
              }}
            >
              All Messages ({messages.length})
            </button>

            <button
              onClick={() => setActiveFilter('RECEIVED')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.8rem',
                fontWeight: activeFilter === 'RECEIVED' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: activeFilter === 'RECEIVED' ? 'var(--primary-600)' : 'transparent',
                color: activeFilter === 'RECEIVED' ? '#ffffff' : 'var(--slate-600)'
              }}
            >
              <ArrowDownLeft size={13} />
              Received ({receivedCount})
            </button>

            <button
              onClick={() => setActiveFilter('SENT')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.8rem',
                fontWeight: activeFilter === 'SENT' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: activeFilter === 'SENT' ? 'var(--primary-600)' : 'transparent',
                color: activeFilter === 'SENT' ? '#ffffff' : 'var(--slate-600)'
              }}
            >
              <ArrowUpRight size={13} />
              Sent ({sentCount})
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={13} />
            <span>Real-time communication log</span>
          </div>
        </div>

        {/* Message Thread Body */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem 1.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#ffffff'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
              <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
              Loading communication thread...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--slate-400)' }}>
              <MessageSquare size={36} style={{ margin: '0 auto 0.5rem', color: 'var(--slate-300)' }} />
              <div style={{ fontWeight: 600, color: 'var(--slate-600)' }}>No messages under this filter</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Use the reply box below to write to the {currentUserRole === 'INDUSTRY' ? 'candidate' : 'recruiting team'}.
              </div>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSent = msg.is_sent_by_me;
              const isCoverNote = msg.message_type === 'COVER_NOTE';
              const isStatusUpdate = msg.message_type === 'STATUS_UPDATE';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSent ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isSent ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender meta */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.25rem',
                      fontSize: '0.72rem',
                      color: 'var(--slate-500)'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: isSent ? 'var(--primary-700)' : 'var(--slate-700)' }}>
                      {isSent ? 'You' : msg.sender_name}
                    </span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {isCoverNote ? 'Initial Cover Note' : isStatusUpdate ? 'Recruitment Feedback' : msg.sender_role?.toLowerCase()}
                    </span>
                    <span>•</span>
                    <span>{formatMsgTime(msg.created_at)}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: isSent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isCoverNote
                        ? 'var(--primary-50, #eef2ff)'
                        : isStatusUpdate
                        ? '#fef3c7'
                        : isSent
                        ? 'var(--primary-600)'
                        : 'var(--slate-100)',
                      color: isCoverNote
                        ? 'var(--slate-900)'
                        : isStatusUpdate
                        ? '#92400e'
                        : isSent
                        ? '#ffffff'
                        : 'var(--slate-900)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      border: isCoverNote ? '1px solid var(--primary-200)' : isStatusUpdate ? '1px solid #fde68a' : 'none'
                    }}
                  >
                    {isCoverNote && (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--primary-700)',
                          marginBottom: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <FileText size={12} /> Cover Note / Candidate Statement
                      </div>
                    )}

                    {isStatusUpdate && (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#b45309',
                          marginBottom: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <CheckCircle2 size={12} /> Status Update Feedback
                      </div>
                    )}

                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Composer Form */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--slate-200)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder={
              currentUserRole === 'INDUSTRY'
                ? `Type message, interview detail or note to ${candidateName}...`
                : `Type reply or question to ${companyName}...`
            }
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
            style={{
              flex: 1,
              borderRadius: '9999px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.88rem'
            }}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!replyText.trim() || sending}
            style={{
              borderRadius: '9999px',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0
            }}
          >
            {sending ? (
              <>Sending...</>
            ) : (
              <>
                <Send size={15} /> Send
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'var(--danger-50)',
              color: 'var(--danger-700)',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
