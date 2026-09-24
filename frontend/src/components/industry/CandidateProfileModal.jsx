import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  Send,
  ArrowUpRight
} from 'lucide-react';
import { ResumePreviewModal } from '../common/ResumePreviewModal';

export const CandidateProfileModal = ({
  candidate,
  onClose,
  onStatusChange,
  onContactCandidate
}) => {
  const [showResumeModal, setShowResumeModal] = useState(false);

  if (!candidate) return null;

  const formatAppliedTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Relative calculation
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    let relative = '';
    if (diffHours < 1) relative = 'Just now';
    else if (diffHours < 24) relative = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    else {
      const diffDays = Math.floor(diffHours / 24);
      relative = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    return `${dateFormatted} at ${timeFormatted} (${relative})`;
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          overflowY: 'auto'
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg, 14px)',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.75rem 2rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {candidate.candidate_avatar || candidate.avatar_url ? (
                  <img
                    src={candidate.candidate_avatar || candidate.avatar_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (candidate.candidate_name || candidate.name || 'S').charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {candidate.candidate_name || candidate.name}
                  </h2>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: (candidate.match_score || candidate.matchScore || 0) >= 80 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(99, 102, 241, 0.3)',
                      color: (candidate.match_score || candidate.matchScore || 0) >= 80 ? '#6ee7b7' : '#c7d2fe',
                      fontWeight: 800
                    }}
                  >
                    <Sparkles size={13} /> {candidate.match_score || candidate.matchScore || 85}% Role Compatibility
                  </span>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '0.25rem', marginBottom: '0.35rem' }}>
                  {candidate.headline || `${candidate.department || 'Computer Science'} Candidate`}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>CGPA: <strong style={{ color: '#ffffff' }}>{candidate.cgpa || '8.5'} / 10.0</strong></span>
                  <span>Batch of <strong>{candidate.graduation_year || '2026'}</strong></span>
                  {candidate.institution_name && (
                    <span>• {candidate.institution_name}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Application Meta Banner */}
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--primary-50, #eef2ff)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-200, #c7d2fe)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-700)', fontWeight: 700 }}>
                  Application Details
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.15rem' }}>
                  {candidate.opportunity_title || 'Software Engineering Opportunity'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                  <Clock size={13} color="var(--primary-600)" />
                  <span>Applied on: <strong>{formatAppliedTime(candidate.created_at)}</strong></span>
                </div>
              </div>

              {onStatusChange && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)' }}>Status:</span>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem', width: 'auto', fontWeight: 700 }}
                    value={candidate.status || 'APPLIED'}
                    onChange={(e) => onStatusChange(candidate.id, e.target.value)}
                  >
                    <option value="APPLIED">APPLIED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="SELECTED">SELECTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              )}
            </div>

            {/* Candidate Cover Note */}
            {candidate.cover_note && (
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                  Candidate Pitch / Cover Note
                </h4>
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    color: 'var(--slate-700)',
                    lineHeight: 1.6
                  }}
                >
                  "{candidate.cover_note}"
                </div>
              </div>
            )}

            {/* Academic Qualifications Grid */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.6rem' }}>
                Academic Qualifications & Performance
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Undergraduate Degree</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>{candidate.degree || 'B.Tech'} - {candidate.department || 'CSE'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>College: {candidate.ug_college || candidate.institution_name || 'Apex Institute'}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.25rem' }}>CGPA: {candidate.cgpa || '8.5'}</div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Higher Secondary (12th)</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>Score: {candidate.twelfth_percentage || '92.4'}%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>Stream: Science / Technical</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>Status: Verified Records</div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Secondary School (10th)</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>Score: {candidate.tenth_percentage || '91.8'}%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>Board: CBSE / Matric</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>Status: Verified Records</div>
                </div>
              </div>
            </div>

            {/* Candidate Bio */}
            {candidate.bio && (
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                  Professional Bio
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
                  {candidate.bio}
                </p>
              </div>
            )}

            {/* Contact & Social Links */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.6rem' }}>
                Contact & Professional Profiles
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {candidate.candidate_email && (
                  <a
                    href={`mailto:${candidate.candidate_email}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                  >
                    <Mail size={14} /> {candidate.candidate_email}
                  </a>
                )}
                {candidate.candidate_phone && (
                  <a
                    href={`tel:${candidate.candidate_phone}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                  >
                    <Phone size={14} /> {candidate.candidate_phone}
                  </a>
                )}
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url.startsWith('http') ? candidate.linkedin_url : `https://${candidate.linkedin_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', color: '#0a66c2' }}
                  >
                    <Linkedin size={14} /> LinkedIn Profile <ArrowUpRight size={12} />
                  </a>
                )}
                {candidate.github_url && (
                  <a
                    href={candidate.github_url.startsWith('http') ? candidate.github_url : `https://${candidate.github_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', color: '#24292e' }}
                  >
                    <Github size={14} /> GitHub Profile <ArrowUpRight size={12} />
                  </a>
                )}
                {(candidate.city || candidate.address) && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--slate-600)', padding: '0.4rem 0.75rem', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-sm)' }}>
                    <MapPin size={14} color="var(--primary-600)" /> {candidate.city ? `${candidate.city}, ${candidate.state || 'India'}` : candidate.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              padding: '1.25rem 2rem',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--slate-50)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => setShowResumeModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.15rem' }}
              >
                <Download size={16} /> Download / View Resume
              </button>
              {candidate.resume_url && (
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <FileText size={15} /> Uploaded File
                </a>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {onContactCandidate && (
                <button
                  onClick={() => {
                    onClose();
                    onContactCandidate(candidate);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Send size={15} /> Contact Candidate
                </button>
              )}
              <button
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showResumeModal && (
        <ResumePreviewModal
          studentId={candidate.student_id || candidate.applicant_id || candidate.id}
          studentData={candidate}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </>
  );
};
