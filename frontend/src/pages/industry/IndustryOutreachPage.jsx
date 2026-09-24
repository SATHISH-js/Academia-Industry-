import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Mail,
  Send,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  Reply,
  Inbox,
  SendHorizontal,
  Eye,
  Download,
  CheckCheck,
  Building2,
  GraduationCap,
  ArrowUpRight,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import { CandidateProfileModal } from '../../components/industry/CandidateProfileModal';
import { ResumePreviewModal } from '../../components/common/ResumePreviewModal';
import { ContactStudentModal } from '../../components/industry/ContactStudentModal';

export const IndustryOutreachPage = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, sent: 0, received: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [directionFilter, setDirectionFilter] = useState('ALL'); // 'ALL' | 'SENT' | 'RECEIVED'
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected message in Single Pane
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // In-pane reply state
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  // Modals state
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState(null);
  const [selectedCandidateForResume, setSelectedCandidateForResume] = useState(null);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [candidatesList, setCandidatesList] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchOpportunitiesAndCandidates();
  }, [directionFilter, typeFilter, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (directionFilter !== 'ALL') params.direction = directionFilter;
      if (typeFilter !== 'ALL') params.message_type = typeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/industry/messages', { params });
      if (res.data.success) {
        const msgList = res.data.data.messages || res.data.data || [];
        setMessages(msgList);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        } else {
          setStats({
            total: msgList.length,
            sent: msgList.filter(m => m.direction === 'SENT' || m.sender_role === 'INDUSTRY').length,
            received: msgList.filter(m => m.direction === 'RECEIVED' || m.sender_role === 'STUDENT').length,
            unread: msgList.filter(m => m.sender_role === 'STUDENT' && !m.is_read).length
          });
        }

        // Auto-select first message if none selected
        if (msgList.length > 0 && !selectedMessageId) {
          setSelectedMessageId(msgList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load outreach messages', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunitiesAndCandidates = async () => {
    try {
      const [oppRes, candRes] = await Promise.all([
        api.get('/industry/my-opportunities'),
        api.get('/industry/candidates/search?minScore=0')
      ]);
      if (oppRes.data.success) {
        const allOpps = [
          ...(oppRes.data.data.internships || []).map(i => ({ ...i, opportunity_type: 'INTERNSHIP' })),
          ...(oppRes.data.data.jobs || []).map(j => ({ ...j, opportunity_type: 'JOB' }))
        ];
        setOpportunities(allOpps);
      }
      if (candRes.data.success) {
        setCandidatesList(candRes.data.data.candidates || []);
      }
    } catch (err) {
      // Graceful
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMessageId(msg.id);
    setReplyText('');
    setReplySuccess(false);

    // Mark as read if received & unread
    if (msg.direction === 'RECEIVED' && !msg.is_read) {
      try {
        await api.put(`/industry/messages/${msg.id}/read`);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: 1 } : m));
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      } catch (e) {
        // Continue
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessageId) return;

    try {
      setReplying(true);
      const res = await api.post(`/industry/messages/${selectedMessageId}/reply`, {
        message: replyText.trim()
      });

      if (res.data.success) {
        setReplyText('');
        setReplySuccess(true);
        setTimeout(() => setReplySuccess(false), 4000);
        // Refresh message list
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setReplying(false);
    }
  };

  const handleResetFilters = () => {
    setDirectionFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSearchTerm('');
  };

  // Filter messages by search term locally
  const filteredMessages = messages.filter(m => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.student_name || '').toLowerCase().includes(term) ||
      (m.student_email || '').toLowerCase().includes(term) ||
      (m.subject || '').toLowerCase().includes(term) ||
      (m.message || '').toLowerCase().includes(term) ||
      (m.student_dept || '').toLowerCase().includes(term)
    );
  });

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || filteredMessages[0] || null;

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    let relative = '';
    if (diffHours < 1) relative = 'Just now';
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else {
      const diffDays = Math.floor(diffHours / 24);
      relative = `${diffDays}d ago`;
    }

    return `${dateFormatted} at ${timeFormatted} (${relative})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: '#ffffff',
          padding: '2.25rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', marginBottom: '0.75rem' }}>
              ✉️ Unified Recruitment Communications
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Direct Candidate Outreach & In-App Messaging
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Review sent invitations and candidate replies in a unified single pane. Filter conversations by direction, message type, and status, and send instant replies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsComposeModalOpen(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <PlusCircle size={16} /> Compose New Outreach
            </button>
            <Link to="/industry/candidates" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={16} /> Source Candidates
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Options Control Deck */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Segmented Direction Filter Tabs (Sent vs Received vs All) */}
          <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--slate-100)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setDirectionFilter('ALL')}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: directionFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: directionFilter === 'ALL' ? 'var(--primary-700)' : 'var(--slate-600)',
                fontWeight: directionFilter === 'ALL' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: directionFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              All Messages ({stats.total})
            </button>

            <button
              onClick={() => setDirectionFilter('RECEIVED')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: directionFilter === 'RECEIVED' ? '#ffffff' : 'transparent',
                color: directionFilter === 'RECEIVED' ? 'var(--success-700)' : 'var(--slate-600)',
                fontWeight: directionFilter === 'RECEIVED' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: directionFilter === 'RECEIVED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Inbox size={15} />
              Received ({stats.received})
              {stats.unread > 0 && (
                <span style={{ backgroundColor: 'var(--danger-500)', color: '#ffffff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 800 }}>
                  {stats.unread} new
                </span>
              )}
            </button>

            <button
              onClick={() => setDirectionFilter('SENT')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: directionFilter === 'SENT' ? '#ffffff' : 'transparent',
                color: directionFilter === 'SENT' ? 'var(--primary-700)' : 'var(--slate-600)',
                fontWeight: directionFilter === 'SENT' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: directionFilter === 'SENT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <SendHorizontal size={15} />
              Sent ({stats.sent})
            </button>
          </div>

          {/* Secondary Filters: Message Type, Status & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search candidate, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
              />
            </div>

            {/* Message Type Filter */}
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="ALL">All Message Types</option>
              <option value="INTERVIEW_INVITE">Interview Invites</option>
              <option value="OFFER">Job / Internship Offers</option>
              <option value="ROLE_INQUIRY">Role Inquiries</option>
              <option value="REPLY">Candidate Replies</option>
              <option value="APPLICATION_INQUIRY">Application Questions</option>
            </select>

            {/* Status Filter */}
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="RECEIVED">Received</option>
              <option value="REPLIED">Replied</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SINGLE PANE CONTAINER (Split Feed & Reader) */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 420px) 1fr',
          minHeight: '620px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Left Column: Messages List Feed */}
        <div
          style={{
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--slate-50)'
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff'
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
              Outreach Log ({filteredMessages.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Showing {directionFilter.toLowerCase()} messages
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
                Loading messages...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                <Mail size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--slate-400)' }} />
                <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.95rem' }}>No messages found</div>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  No communications match the selected direction or search filters.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessageId === msg.id;
                const isReceived = msg.direction === 'RECEIVED' || msg.sender_role === 'STUDENT';
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    style={{
                      padding: '1rem 1.15rem',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: isSelected ? '#ffffff' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--primary-600)' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span
                          className={`badge ${isReceived ? 'badge-success' : 'badge-primary'}`}
                          style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', textTransform: 'uppercase' }}
                        >
                          {isReceived ? '📥 Received' : '📤 Sent'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                          {(msg.message_type || 'ROLE_INQUIRY').replace('_', ' ')}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>
                        {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ fontWeight: isSelected || !msg.is_read ? 800 : 600, fontSize: '0.9rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                      {msg.subject}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: '0.35rem' }}>
                      {isReceived ? 'From' : 'To'}: <strong>{msg.student_name}</strong> {msg.student_dept ? `(${msg.student_dept})` : ''}
                    </div>

                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--slate-500)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Reader & In-Pane Reply Composer */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          {!selectedMessage ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', padding: '2rem' }}>
              Select a message from the left to view the conversation details
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Message Header */}
              <div
                style={{
                  padding: '1.5rem 1.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'var(--slate-50)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <span
                        className={`badge ${selectedMessage.direction === 'RECEIVED' || selectedMessage.sender_role === 'STUDENT' ? 'badge-success' : 'badge-primary'}`}
                        style={{ fontSize: '0.75rem', fontWeight: 800 }}
                      >
                        {selectedMessage.direction === 'RECEIVED' || selectedMessage.sender_role === 'STUDENT' ? '📥 Candidate Reply / Inquiry' : '📤 Direct Outreach Sent'}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {(selectedMessage.message_type || 'ROLE_INQUIRY').replace('_', ' ')}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 0.35rem 0' }}>
                      {selectedMessage.subject}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      <Clock size={13} />
                      <span>{formatMessageTime(selectedMessage.created_at)}</span>
                    </div>
                  </div>

                  {/* Candidate Quick Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedCandidateForProfile(selectedMessage)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={14} /> View Candidate Profile
                    </button>
                    <button
                      onClick={() => setSelectedCandidateForResume(selectedMessage)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Download size={14} /> Download Resume
                    </button>
                  </div>
                </div>

                {/* Candidate Summary Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '1rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    flexWrap: 'wrap'
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-600)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}
                  >
                    {(selectedMessage.student_name || 'S').charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                      {selectedMessage.student_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      {selectedMessage.student_email} • {selectedMessage.student_dept || 'Engineering'} • CGPA: {selectedMessage.student_cgpa || '8.5'}
                    </div>
                  </div>

                  {selectedMessage.opportunity_title && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Target Role:</span>
                      <div style={{ fontWeight: 700 }}>{selectedMessage.opportunity_title}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Content Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: 1.7,
                    fontSize: '0.95rem',
                    color: 'var(--slate-800)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {selectedMessage.message}
                </div>

                {replySuccess && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.85rem 1.25rem',
                      backgroundColor: 'var(--success-50, #ecfdf5)',
                      color: 'var(--success-700, #047857)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--success-500, #10b981)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.88rem'
                    }}
                  >
                    <CheckCircle2 size={16} /> Reply successfully sent to candidate!
                  </div>
                )}
              </div>

              {/* In-Pane Reply Composer */}
              <div
                style={{
                  padding: '1.25rem 1.75rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'var(--slate-50)'
                }}
              >
                <form onSubmit={handleSendReply}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Reply size={15} color="var(--primary-600)" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                      Quick In-Pane Reply to {selectedMessage.student_name}:
                    </span>
                  </div>

                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder={`Type your response to ${selectedMessage.student_name} regarding "${selectedMessage.subject}"...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ fontSize: '0.88rem', resize: 'vertical' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Dispatches direct in-app candidate notification and email alert.
                    </span>

                    <button
                      type="submit"
                      disabled={replying || !replyText.trim()}
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.45rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Send size={14} /> {replying ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedCandidateForProfile && (
        <CandidateProfileModal
          candidate={selectedCandidateForProfile}
          onClose={() => setSelectedCandidateForProfile(null)}
          onContactCandidate={() => {
            setSelectedCandidateForProfile(null);
          }}
        />
      )}

      {/* Resume Preview Modal */}
      {selectedCandidateForResume && (
        <ResumePreviewModal
          studentId={selectedCandidateForResume.student_id}
          studentData={selectedCandidateForResume}
          onClose={() => setSelectedCandidateForResume(null)}
        />
      )}

      {/* Compose New Outreach Modal */}
      {isComposeModalOpen && (
        <ContactStudentModal
          student={candidatesList[0] || null}
          opportunities={opportunities}
          candidates={candidatesList}
          onClose={() => setIsComposeModalOpen(false)}
          onMessageSent={() => {
            setIsComposeModalOpen(false);
            fetchMessages();
          }}
        />
      )}
    </div>
  );
};
