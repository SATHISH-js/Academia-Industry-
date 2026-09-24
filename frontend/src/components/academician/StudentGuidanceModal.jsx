import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  User,
  GraduationCap
} from 'lucide-react';

export const StudentGuidanceModal = ({
  student,
  onClose,
  onMessageSent
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('GUIDANCE');
  const [errorMsg, setErrorMsg] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (student?.id) {
      fetchMessages();
    }
  }, [student?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get(`/academician/students/${student.id}/messages`);
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load guidance messages', err);
      setErrorMsg('Could not load prior message history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      setErrorMsg(null);
      const res = await api.post(`/academician/students/${student.id}/messages`, {
        subject: subject.trim() || 'Academic Mentorship Guidance',
        message: message.trim(),
        message_type: messageType
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setMessage('');
        setSubject('');
        if (onMessageSent) onMessageSent(student);
      }
    } catch (err) {
      console.error('Failed to send guidance message', err);
      setErrorMsg('Failed to dispatch message.');
    } finally {
      setSending(false);
    }
  };

  if (!student) return null;

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
          height: '85vh',
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
            alignItems: 'center'
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
                justifyContent: 'center'
              }}
            >
              <MessageSquare size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Direct Student Guidance & Mentorship
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--primary-200)', marginTop: '0.15rem' }}>
                To: <strong>{student.name}</strong> • {student.department} (Reg: {student.register_number || student.enrollment_number || '2026'})
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
              color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread History */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem 1.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: 'var(--slate-50)'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
              <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
              Loading mentorship history...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
              <GraduationCap size={36} style={{ margin: '0 auto 0.5rem', color: 'var(--slate-300)' }} />
              <div style={{ fontWeight: 600, color: 'var(--slate-600)' }}>No prior messages exchanged</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Provide guidance, advise on roadmaps, or issue remedial alerts below.
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isFaculty = m.sender_role === 'ACADEMICIAN';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isFaculty ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isFaculty ? 'flex-end' : 'flex-start'
                  }}
                >
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
                    <span style={{ fontWeight: 700, color: isFaculty ? 'var(--primary-700)' : 'var(--slate-700)' }}>
                      {isFaculty ? 'You (Faculty)' : student.name}
                    </span>
                    <span>•</span>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 600 }}>
                      {m.message_type || 'GUIDANCE'}
                    </span>
                    <span>•</span>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: isFaculty ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isFaculty ? 'var(--primary-600)' : '#ffffff',
                      color: isFaculty ? '#ffffff' : 'var(--slate-900)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      border: isFaculty ? 'none' : '1px solid var(--slate-200)'
                    }}
                  >
                    {m.subject && (
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          marginBottom: '0.3rem',
                          color: isFaculty ? 'var(--primary-100)' : 'var(--slate-700)'
                        }}
                      >
                        {m.subject}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dispatch Form */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid var(--slate-200)',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Subject (e.g., Capstone Milestone Review, Attendance Notice)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ flex: 2, minWidth: '220px', fontSize: '0.85rem' }}
            />

            <select
              className="form-control"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              style={{ flex: 1, minWidth: '160px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="GUIDANCE">Academic Guidance</option>
              <option value="ROADMAP_ADVICE">Roadmap & Skill Advice</option>
              <option value="ACADEMIC_WARNING">Attendance / Backlog Warning</option>
              <option value="FEEDBACK">Project Feedback</option>
              <option value="GENERAL">General Message</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <textarea
              className="form-control"
              placeholder={`Write direct mentorship advice or instruction to ${student.name}...`}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              style={{ flex: 1, fontSize: '0.88rem', resize: 'vertical' }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!message.trim() || sending}
              style={{
                padding: '0 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                fontWeight: 700,
                alignSelf: 'stretch',
                flexShrink: 0
              }}
            >
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send size={16} /> Send
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--danger-600)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
