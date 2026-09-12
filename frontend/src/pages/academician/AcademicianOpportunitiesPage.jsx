import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Compass, BookOpen, Building2, Calendar, Award, CheckCircle2 } from 'lucide-react';

export const AcademicianOpportunitiesPage = () => {
  const [data, setData] = useState({ research: [], workshops: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/academician/opportunities');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyResearch = async (rpId, title) => {
    setMessage('');
    try {
      const res = await api.post('/applications', {
        opportunity_type: 'RESEARCH',
        opportunity_id: rpId,
        cover_note: 'Academic research collaboration interest submitted.'
      });
      if (res.data.success) {
        setMessage(`Interest submitted for "${title}". Sponsoring industry will review your faculty proposal.`);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit proposal.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading academician opportunities...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Academician Opportunities & Research Grants
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          Industry-sponsored research programs, faculty development immersion, and consultancy initiatives.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--success-50)',
          color: 'var(--success-700)',
          border: '1px solid #a7f3d0',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {message}
        </div>
      )}

      {/* Research Projects */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
          Sponsored Research Collaborations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {data.research.map((rp) => (
            <div key={rp.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-primary">{rp.domain}</span>
                  <span className="badge badge-success">{rp.grant_amount}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
                  {rp.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: '0.35rem 0' }}>
                  Sponsor: <strong>{rp.company_name}</strong> • Duration: {rp.duration_months} Months
                </div>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', margin: '0.75rem 0', lineHeight: 1.5 }}>
                  {rp.description}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', backgroundColor: 'var(--primary-50)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  Expected: {rp.expected_outcomes}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.875rem' }}
                onClick={() => handleApplyResearch(rp.id, rp.title)}
              >
                Express Faculty Interest
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Workshops */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
          Upcoming Industry Workshops & Masterclasses
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {data.workshops.map((w) => (
            <div key={w.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-neutral">{w.mode}</span>
                <span className="badge badge-primary">{w.duration_hours} Hours</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
                {w.title}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: '0.35rem 0' }}>
                Host: <strong>{w.company_name}</strong> • Speaker: {w.speaker_name}
              </div>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', margin: '0.75rem 0', lineHeight: 1.5 }}>
                {w.description}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Scheduled: {new Date(w.workshop_date).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
