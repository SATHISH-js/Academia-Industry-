import React, { useState } from 'react';
import api from '../../services/api';
import {
  X,
  Send,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Video,
  Building2,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const RequestGuestLectureModal = ({
  speaker,
  onClose,
  onRequestSent
}) => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('3rd & 4th Year Undergraduate Students');
  const [deliveryMode, setDeliveryMode] = useState(speaker?.guest_lecture_mode || 'VIRTUAL');
  const [proposedDate, setProposedDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [venue, setVenue] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const speakerTopics = speaker?.guest_lecture_topics
    ? speaker.guest_lecture_topics.split(',').map((t) => t.trim())
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg('Please select or specify a lecture topic.');
      return;
    }

    try {
      setSending(true);
      setErrorMsg(null);
      const res = await api.post('/academician/guest-lectures', {
        speaker_academician_id: speaker.id,
        request_type: 'INVITATION',
        topic: topic.trim(),
        description: description.trim(),
        target_audience: targetAudience,
        delivery_mode: deliveryMode,
        proposed_date: proposedDate ? new Date(proposedDate).toISOString() : null,
        meeting_link: meetingLink.trim() || null,
        venue: venue.trim() || null
      });

      if (res.data.success) {
        if (onRequestSent) onRequestSent(speaker, topic);
        onClose();
      }
    } catch (err) {
      console.error('Failed to send guest lecture request', err);
      setErrorMsg(err.response?.data?.error || 'Failed to submit lecture request.');
    } finally {
      setSending(false);
    }
  };

  if (!speaker) return null;

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
          maxHeight: '90vh',
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
            padding: '1.5rem 2rem',
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
              <BookOpen size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Request / Invite Guest Lecture
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--primary-200)', marginTop: '0.15rem' }}>
                Inviting <strong>{speaker.speaker_name}</strong> from {speaker.institution_name}
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Speaker Quick Card */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md, 10px)',
              border: '1px solid var(--slate-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                {speaker.speaker_name} • {speaker.designation}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                {speaker.institution_name} ({speaker.city || speaker.institution_city || 'India'})
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                {speaker.guest_lecture_mode || 'VIRTUAL'} MODE
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                {speaker.experience_years || 8}+ Yrs Exp
              </span>
            </div>
          </div>

          {/* Preset Topics Suggestions */}
          {speakerTopics.length > 0 && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem', display: 'block' }}>
                Speaker's Recommended Lecture Topics (Click to select):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {speakerTopics.map((top, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(top)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-md, 6px)',
                      fontSize: '0.78rem',
                      border: topic === top ? '1.5px solid var(--primary-600)' : '1px solid var(--slate-200)',
                      backgroundColor: topic === top ? 'var(--primary-50)' : '#ffffff',
                      color: topic === top ? 'var(--primary-800)' : 'var(--slate-700)',
                      cursor: 'pointer',
                      fontWeight: topic === top ? 700 : 500
                    }}
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Topic Title */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem', display: 'block' }}>
              Lecture Topic / Theme *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Deep Learning Transformers in Enterprise Systems"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem', display: 'block' }}>
              Lecture Syllabus / Session Abstract & Note
            </label>
            <textarea
              className="form-control"
              placeholder="Describe the expected coverage, key takeaways, and why your college is hosting this session..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          {/* Target Audience & Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem', display: 'block' }}>
                Target Audience
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 3rd & 4th Year B.Tech CSE"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem', display: 'block' }}>
                Delivery Mode
              </label>
              <select
                className="form-control"
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                <option value="VIRTUAL">Virtual (Online Webinar / Meet)</option>
                <option value="IN_PERSON">In-Person (Campus Lecture Hall)</option>
                <option value="HYBRID">Hybrid (Online + Campus)</option>
              </select>
            </div>
          </div>

          {/* Proposed Date & Link/Venue */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem', display: 'block' }}>
                Proposed Date & Time
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem', display: 'block' }}>
                {deliveryMode === 'VIRTUAL' ? 'Virtual Meeting Link (Optional)' : 'Campus Hall / Venue'}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={deliveryMode === 'VIRTUAL' ? 'https://meet.google.com/...' : 'Seminar Hall 3, Tech Block'}
                value={deliveryMode === 'VIRTUAL' ? meetingLink : venue}
                onChange={(e) =>
                  deliveryMode === 'VIRTUAL' ? setMeetingLink(e.target.value) : setVenue(e.target.value)
                }
                style={{ fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--danger-600)', fontSize: '0.82rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              borderTop: '1px solid var(--slate-200)',
              paddingTop: '1.25rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary"
              style={{
                fontSize: '0.85rem',
                padding: '0.55rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700
              }}
            >
              {sending ? 'Sending...' : (
                <>
                  <Send size={15} /> Send Guest Lecture Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
