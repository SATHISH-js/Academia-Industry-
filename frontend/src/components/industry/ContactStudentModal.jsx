import React, { useState } from 'react';
import api from '../../services/api';
import { Mail, Send, X, CheckCircle2, AlertCircle, Sparkles, Building2, User } from 'lucide-react';

export const ContactStudentModal = ({ student, opportunities = [], onClose, onMessageSent }) => {
  const [opportunityType, setOpportunityType] = useState('GENERAL');
  const [opportunityId, setOpportunityId] = useState('');
  const [messageType, setMessageType] = useState('INTERVIEW_INVITE');
  const [subject, setSubject] = useState(`Interview Invitation from TechCorp`);
  const [message, setMessage] = useState(
    `Hi ${student?.name || 'there'}, your verified technical skill profile caught our attention. We would love to discuss exciting engineering opportunities with our team.`
  );
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  if (!student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please provide both subject and message body.' });
      return;
    }

    try {
      setSending(true);
      setStatus(null);

      const payload = {
        student_id: student.student_id,
        opportunity_type: opportunityType,
        opportunity_id: opportunityId ? parseInt(opportunityId, 10) : null,
        message_type: messageType,
        subject: subject.trim(),
        message: message.trim()
      };

      const res = await api.post('/industry/messages/send', payload);
      if (res.data.success) {
        setStatus({ type: 'success', text: `Message successfully dispatched to ${student.name}!` });
        setTimeout(() => {
          if (onMessageSent) onMessageSent();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to send outreach message', err);
      setStatus({ type: 'error', text: err.response?.data?.error || 'Failed to send message.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '580px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          zIndex: 1050,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--slate-900)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Mail size={20} color="var(--primary-400)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Contact Student Candidate
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-300)' }}>
                Direct In-App Outreach & Interview Invitation
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-400)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Candidate Mini Preview */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--slate-50)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--slate-900)' }}>
              {student.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              {student.headline || student.department} • CGPA: <strong>{student.cgpa || '8.5'}</strong>
            </div>
          </div>
          {student.matchScore !== undefined && (
            <div style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: student.matchScore >= 80 ? 'var(--success-50)' : 'var(--primary-50)',
              color: student.matchScore >= 80 ? 'var(--success-700)' : 'var(--primary-700)',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: '1px solid currentColor'
            }}>
              {student.matchScore}% Match
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {status && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: status.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
              color: status.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{status.text}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Outreach Type</label>
              <select
                className="form-control"
                value={messageType}
                onChange={(e) => {
                  setMessageType(e.target.value);
                  if (e.target.value === 'INTERVIEW_INVITE') {
                    setSubject(`Interview Invitation from TechCorp`);
                  } else if (e.target.value === 'ROLE_INQUIRY') {
                    setSubject(`Opportunity Discussion: Role at TechCorp`);
                  } else if (e.target.value === 'OFFER') {
                    setSubject(`Offer Letter / Shortlist Notification from TechCorp`);
                  }
                }}
              >
                <option value="INTERVIEW_INVITE">Interview Invitation</option>
                <option value="ROLE_INQUIRY">Role Inquiry / Shortlist Note</option>
                <option value="OFFER">Job / Internship Offer</option>
                <option value="GENERAL">General In-App Message</option>
              </select>
            </div>

            {opportunities && opportunities.length > 0 && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Linked Opportunity (Optional)</label>
                <select
                  className="form-control"
                  value={opportunityId}
                  onChange={(e) => {
                    setOpportunityId(e.target.value);
                    const sel = opportunities.find(o => String(o.id) === e.target.value);
                    if (sel) {
                      setOpportunityType(sel.opportunity_type || 'INTERNSHIP');
                    }
                  }}
                >
                  <option value="">None / General Sourcing</option>
                  {opportunities.map(opp => (
                    <option key={opp.id} value={opp.id}>
                      [{opp.opportunity_type || 'ROLE'}] {opp.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Subject Line</label>
            <input
              type="text"
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Message Body</label>
            <textarea
              className="form-control"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your invitation, scheduled time suggestions, or role details..."
              required
              style={{ lineHeight: 1.5, fontSize: '0.9rem' }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={sending}
              style={{ fontSize: '0.88rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary"
              style={{ fontSize: '0.88rem' }}
            >
              {sending ? (
                <>
                  <Sparkles size={16} className="animate-spin" /> Dispatching Message...
                </>
              ) : (
                <>
                  <Send size={16} /> Send In-App Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
