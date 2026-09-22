import React, { useState } from 'react';
import api from '../../services/api';
import { Mail, Send, X, CheckCircle2, AlertCircle, Sparkles, User, GraduationCap } from 'lucide-react';

export const InstitutionContactModal = ({ recipient, type = 'STUDENT', onClose, onMessageSent }) => {
  const isStudent = type === 'STUDENT';
  const defaultContactType = isStudent ? 'ACADEMIC_NOTICE' : 'FACULTY_MEETING';

  const [contactType, setContactType] = useState(defaultContactType);
  const [subject, setSubject] = useState(
    isStudent
      ? `Academic Guidance & Skill Development Notice`
      : `Institutional Academic & Research Council Notice`
  );
  const [message, setMessage] = useState(
    isStudent
      ? `Dear ${recipient?.name || 'Student'}, this is an official communication from your institution regarding your academic benchmarks and campus opportunities.`
      : `Dear ${recipient?.name || 'Professor'}, this is an institutional communication regarding department curriculum alignment and academic activities.`
  );
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  if (!recipient) return null;

  const handleTypeChange = (newType) => {
    setContactType(newType);
    if (isStudent) {
      if (newType === 'ACADEMIC_NOTICE') {
        setSubject('Semester Academic Review & Performance Guidance');
      } else if (newType === 'PLACEMENT_INVITATION') {
        setSubject('On-Campus Placement Drive Shortlist & Eligibility Notice');
      } else if (newType === 'SKILL_INTERVENTION') {
        setSubject('Skill Deficit Remediation & Workshop Enrollment');
      } else if (newType === 'MENTORSHIP') {
        setSubject('Faculty Mentorship Allocation & Progress Check');
      }
    } else {
      if (newType === 'FACULTY_MEETING') {
        setSubject('Department Academic Council & Faculty Meeting');
      } else if (newType === 'RESEARCH_COLLABORATION') {
        setSubject('Sponsored Research Grant & Industry MoU Initiative');
      } else if (newType === 'CURRICULUM_REVIEW') {
        setSubject('Curriculum Revision & Industry Skill Alignment Task');
      } else if (newType === 'FDP_NOMINATION') {
        setSubject('Faculty Development Program (FDP) Nomination');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please provide both subject and message body.' });
      return;
    }

    try {
      setSending(true);
      setStatus(null);

      const endpoint = isStudent
        ? '/institution/contact/student'
        : '/institution/contact/academician';

      const payload = isStudent
        ? {
            student_id: recipient.id,
            contact_type: contactType,
            subject: subject.trim(),
            message: message.trim()
          }
        : {
            academician_id: recipient.id,
            contact_type: contactType,
            subject: subject.trim(),
            message: message.trim()
          };

      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        setStatus({
          type: 'success',
          text: `Official message successfully dispatched to ${recipient.name}!`
        });
        setTimeout(() => {
          if (onMessageSent) onMessageSent();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to send outreach message', err);
      setStatus({
        type: 'error',
        text: err.response?.data?.error || 'Failed to dispatch institutional communication.'
      });
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
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          zIndex: 1050,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--slate-900)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {isStudent ? (
              <User size={20} color="var(--primary-400)" />
            ) : (
              <GraduationCap size={20} color="#2dd4bf" />
            )}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {isStudent ? 'Contact Enrolled Student' : 'Contact Faculty Member'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-300)' }}>
                Official College Communication & In-App Notice
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

        {/* Recipient Preview */}
        <div
          style={{
            padding: '0.9rem 1.5rem',
            backgroundColor: 'var(--slate-50)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            flexShrink: 0
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
              {recipient.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>
              {recipient.department} {recipient.designation ? `• ${recipient.designation}` : ''}
            </div>
          </div>

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: isStudent ? 'var(--primary-50)' : '#f0fdfa',
              color: isStudent ? 'var(--primary-700)' : '#0f766e',
              border: `1px solid ${isStudent ? 'var(--primary-200)' : '#99f6e4'}`
            }}
          >
            {isStudent
              ? `Reg No: ${recipient.enrollment_number || 'N/A'}`
              : `Staff ID: ${recipient.employee_id || 'N/A'}`}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto'
          }}
        >
          {status && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: status.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
                color: status.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{status.text}</span>
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              Purpose of Communication
            </label>
            <select
              className="form-control"
              value={contactType}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {isStudent ? (
                <>
                  <option value="ACADEMIC_NOTICE">Academic Guidance & Performance Notice</option>
                  <option value="PLACEMENT_INVITATION">Campus Placement Eligibility & Shortlist</option>
                  <option value="SKILL_INTERVENTION">Skill Gap Remediation Workshop</option>
                  <option value="MENTORSHIP">Faculty Mentorship Session</option>
                  <option value="GENERAL">General Institutional Communication</option>
                </>
              ) : (
                <>
                  <option value="FACULTY_MEETING">Department Academic Council Meeting</option>
                  <option value="RESEARCH_COLLABORATION">Sponsored Research & MoU Taskforce</option>
                  <option value="CURRICULUM_REVIEW">Industry Skill Curriculum Alignment</option>
                  <option value="FDP_NOMINATION">Faculty Development Program Nomination</option>
                  <option value="GENERAL">General Faculty Communication</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Subject Line</label>
            <input
              type="text"
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Message Body</label>
            <textarea
              className="form-control"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter details, instructions, venue/links, or schedules..."
              required
              style={{ lineHeight: 1.5, fontSize: '0.88rem' }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={sending}
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              {sending ? (
                <>
                  <Sparkles size={15} className="animate-spin" /> Dispatching...
                </>
              ) : (
                <>
                  <Send size={15} /> Send In-App Notice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
