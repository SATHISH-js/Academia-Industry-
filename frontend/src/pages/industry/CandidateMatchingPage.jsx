import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sparkles, Users, Award, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const CandidateMatchingPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      // Opportunity ID 1 = Full Stack Software Engineer Intern
      const res = await api.get('/recommendations/candidates/INTERNSHIP/1');
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch candidate rankings', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Running matching algorithm across talent pool...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.85rem' }}>
          <Sparkles size={16} /> Algorithmic Talent Sourcing
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Candidate Compatibility Leaderboard
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          Ranked for position: <strong>Full Stack Software Engineer Intern</strong>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {candidates.map((c, idx) => (
          <div key={c.student_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-400)' }}>#{idx + 1}</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {c.name}
                  </h3>
                  <span className="badge badge-primary">{c.department}</span>
                </div>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  {c.headline || 'Student Scholar'} • CGPA: <strong>{c.cgpa || '8.5'}</strong> • Graduating {c.graduation_year}
                </p>
              </div>

              <div style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                backgroundColor: c.matchScore >= 80 ? 'var(--success-50)' : 'var(--primary-50)',
                color: c.matchScore >= 80 ? 'var(--success-700)' : 'var(--primary-700)',
                fontWeight: 800,
                fontSize: '1.1rem',
                border: `1.5px solid ${c.matchScore >= 80 ? '#6ee7b7' : 'var(--primary-300)'}`
              }}>
                {c.matchScore}% Match
              </div>
            </div>

            {/* Matched vs Gaps */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--slate-600)' }}>Skill Breakdown:</span>
              {c.matchedSkills?.map((ms, i) => (
                <span key={i} className="badge badge-success" style={{ textTransform: 'none' }}>
                  <CheckCircle2 size={12} /> {ms.skill_name} ({ms.current_score}%)
                </span>
              ))}
              {c.skillGaps?.map((sg, i) => (
                <span key={i} className="badge badge-warning" style={{ textTransform: 'none' }}>
                  <AlertTriangle size={12} /> {sg.skill_name} (Needs +{sg.gap}%)
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              {c.github_url && (
                <a href={c.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  GitHub Profile <ArrowUpRight size={14} />
                </a>
              )}
              {c.linkedin_url && (
                <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  LinkedIn <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
