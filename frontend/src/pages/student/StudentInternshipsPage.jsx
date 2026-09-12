import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Clock, 
  Filter 
} from 'lucide-react';

export const StudentInternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await api.get('/internships');
      if (res.data.success) {
        setInternships(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load internships', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId) => {
    setApplyingId(internshipId);
    setMessage('');
    try {
      const res = await api.post('/applications', {
        opportunity_type: 'INTERNSHIP',
        opportunity_id: internshipId,
        cover_note: 'Submitted application via Academia-Industry Collaboration Portal'
      });
      if (res.data.success) {
        setMessage(`Application submitted successfully! Computed compatibility score: ${res.data.data.matchScore}%`);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading opportunities...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Industry Internships
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          Explore opportunities pre-ranked by our matching algorithm against your verified skill profile.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: message.includes('success') ? 'var(--success-50)' : 'var(--danger-50)',
          color: message.includes('success') ? 'var(--success-700)' : 'var(--danger-600)',
          border: `1px solid ${message.includes('success') ? '#a7f3d0' : '#fca5a5'}`,
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {internships.map((item) => (
          <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-primary">{item.work_mode}</span>
                  <span className="badge badge-neutral">{item.duration_months} Months</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {item.title}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  <span><Building2 size={15} style={{ verticalAlign: 'middle' }} /> {item.company_name}</span>
                  <span><MapPin size={15} style={{ verticalAlign: 'middle' }} /> {item.location}</span>
                  <span>{item.stipend_amount}</span>
                </div>
              </div>

              {item.matchScore !== undefined && (
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  backgroundColor: item.matchScore >= 80 ? 'var(--success-50)' : 'var(--warning-50)',
                  color: item.matchScore >= 80 ? 'var(--success-700)' : 'var(--warning-600)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: `1px solid ${item.matchScore >= 80 ? '#6ee7b7' : '#fde68a'}`
                }}>
                  <Sparkles size={16} />
                  {item.matchScore}% Match
                </div>
              )}
            </div>

            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {item.description}
            </p>

            {/* Matching & Missing Skills preview */}
            {item.matchedSkills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--slate-600)' }}>Skills Assessment:</span>
                {item.matchedSkills?.map((s, idx) => (
                  <span key={idx} className="badge badge-success" style={{ textTransform: 'none' }}>
                    <CheckCircle2 size={12} /> {s.skill_name} ({s.current_score}%)
                  </span>
                ))}
                {item.skillGaps?.map((g, idx) => (
                  <span key={idx} className="badge badge-warning" style={{ textTransform: 'none' }}>
                    <AlertTriangle size={12} /> {g.skill_name} (Gap: {g.gap}%)
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Deadline: {new Date(item.deadline).toLocaleDateString()} • {item.openings} Openings
              </div>
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
                onClick={() => handleApply(item.id)}
                disabled={applyingId === item.id}
              >
                {applyingId === item.id ? 'Submitting...' : (
                  <>
                    <Send size={15} /> Apply Now
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
