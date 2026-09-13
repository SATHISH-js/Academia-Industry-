import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { ContactStudentModal } from '../../components/industry/ContactStudentModal';
import {
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Filter,
  Sliders,
  Mail,
  GraduationCap,
  Building2,
  Briefcase,
  Check,
  RotateCcw
} from 'lucide-react';

export const CandidateMatchingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOppType = searchParams.get('type') || '';
  const initialOppId = searchParams.get('id') || '';

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState({
    type: initialOppType,
    id: initialOppId
  });

  // Filters
  const [minScore, setMinScore] = useState(50);
  const [keyword, setKeyword] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  const [candidates, setCandidates] = useState([]);
  const [benchmarkSkills, setBenchmarkSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Outreach Modal state
  const [selectedStudentForContact, setSelectedStudentForContact] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [selectedOpp, minScore, department, minCgpa]);

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/industry/my-opportunities');
      if (res.data.success) {
        const allOpps = [
          ...(res.data.data.internships || []).map(i => ({ ...i, opportunity_type: 'INTERNSHIP' })),
          ...(res.data.data.jobs || []).map(j => ({ ...j, opportunity_type: 'JOB' }))
        ];
        setOpportunities(allOpps);

        // If no URL param, default to first opportunity if available
        if (!initialOppId && allOpps.length > 0) {
          setSelectedOpp({
            type: allOpps[0].opportunity_type,
            id: String(allOpps[0].id)
          });
        }
      }
    } catch (err) {
      console.error('Failed to load posted opportunities', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedOpp.type && selectedOpp.id) {
        params.opportunityType = selectedOpp.type;
        params.opportunityId = selectedOpp.id;
      }
      if (minScore) params.minScore = minScore;
      if (department) params.department = department;
      if (minCgpa) params.minCgpa = minCgpa;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await api.get('/industry/candidates/search', { params });
      if (res.data.success) {
        setCandidates(res.data.data.candidates || []);
        setBenchmarkSkills(res.data.data.benchmarkSkills || []);
      }
    } catch (err) {
      console.error('Failed to fetch candidate rankings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleResetFilters = () => {
    setMinScore(50);
    setKeyword('');
    setDepartment('');
    setMinCgpa('');
    fetchCandidates();
  };

  const selectedOppTitle = opportunities.find(
    o => o.opportunity_type === selectedOpp.type && String(o.id) === String(selectedOpp.id)
  )?.title || 'General Industry Engineering Benchmark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', marginBottom: '0.75rem' }}>
              <Sparkles size={14} /> Algorithmic Talent Sourcing
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Candidate Matching & Role Compatibility
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Filter and source students evaluated against your posted job requirements. Review verified proficiency scores, skill gaps, and connect with candidates directly through in-app outreach.
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-200)', letterSpacing: '0.05em' }}>
              Active Target Role
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              {selectedOppTitle}
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--success-50)',
          color: 'var(--success-700)',
          border: '1px solid var(--success-500)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Advanced Filter Toolbar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
            <Filter size={18} color="var(--primary-600)" /> Search & Compatibility Filters
          </div>
          <button
            onClick={handleResetFilters}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Opportunity Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Target Opportunity / Role</label>
              <select
                className="form-control"
                value={selectedOpp.id ? `${selectedOpp.type}:${selectedOpp.id}` : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSelectedOpp({ type: '', id: '' });
                  } else {
                    const [t, id] = val.split(':');
                    setSelectedOpp({ type: t, id });
                  }
                }}
              >
                <option value="">All Engineering Roles (Default Benchmarks)</option>
                {opportunities.map(opp => (
                  <option key={`${opp.opportunity_type}:${opp.id}`} value={`${opp.opportunity_type}:${opp.id}`}>
                    [{opp.opportunity_type}] {opp.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Candidate Name or Skill</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Aditya, Python, NIT..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Academic Department</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science / AI</option>
                <option value="Electronics">Electronics & Communication</option>
              </select>
            </div>

            {/* Minimum CGPA */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Minimum CGPA</label>
              <select
                className="form-control"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
              >
                <option value="">Any CGPA</option>
                <option value="7.5">7.5+ CGPA</option>
                <option value="8.0">8.0+ CGPA</option>
                <option value="8.5">8.5+ CGPA</option>
                <option value="9.0">9.0+ CGPA</option>
              </select>
            </div>
          </div>

          {/* Minimum Match Score Slider */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                Minimum Role Match Score:
              </span>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                ≥ {minScore}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '220px', maxWidth: '450px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>0%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>100%</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Search size={15} /> Apply Search
            </button>
          </div>
        </form>
      </div>

      {/* Benchmark Skills Bar */}
      {benchmarkSkills.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
          <span style={{ fontWeight: 700 }}>Benchmark Skills Evaluated:</span>
          {benchmarkSkills.map((bm, i) => (
            <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              {bm.skill_name} (Req: ≥{bm.min_required_score || 70}%)
            </span>
          ))}
        </div>
      )}

      {/* Candidate Cards Leaderboard */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
          Computing compatibility algorithms across student database...
        </div>
      ) : candidates.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Users size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            No candidates found matching criteria
          </h3>
          <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Try lowering the minimum match score threshold or clearing search keywords.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            <span>Showing <strong>{candidates.length}</strong> qualified student candidate(s)</span>
          </div>

          {candidates.map((c, idx) => (
            <div
              key={c.student_id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: c.matchScore >= 80 ? '1.5px solid #a7f3d0' : '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-400)' }}>
                      #{idx + 1}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {c.name}
                    </h3>
                    <span className="badge badge-primary">{c.department}</span>
                    {c.institution_name && (
                      <span className="badge badge-neutral">{c.institution_name}</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                    {c.headline || 'Student Engineer'} • CGPA: <strong>{c.cgpa || '8.5'}</strong> • Batch of <strong>{c.graduation_year}</strong>
                  </p>
                </div>

                {/* Match Score Badge */}
                <div style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '9999px',
                  backgroundColor: c.matchScore >= 80 ? 'var(--success-50)' : c.matchScore >= 60 ? 'var(--primary-50)' : 'var(--warning-50)',
                  color: c.matchScore >= 80 ? 'var(--success-700)' : c.matchScore >= 60 ? 'var(--primary-700)' : 'var(--warning-700)',
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  border: `1.5px solid ${c.matchScore >= 80 ? '#6ee7b7' : c.matchScore >= 60 ? 'var(--primary-300)' : '#fde68a'}`,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {c.matchScore}% Match
                </div>
              </div>

              {/* Matched vs Skill Gaps Breakdown */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                backgroundColor: 'var(--slate-50)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>Matched Proficiencies:</span>
                  {c.matchedSkills?.length > 0 ? (
                    c.matchedSkills.map((ms, i) => (
                      <span key={i} className="badge badge-success" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                        <CheckCircle2 size={13} /> {ms.skill_name} ({ms.current_score}%)
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>No direct benchmark skills matched.</span>
                  )}
                </div>

                {c.skillGaps?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>Target Gaps:</span>
                    {c.skillGaps.map((sg, i) => (
                      <span key={i} className="badge badge-warning" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                        <AlertTriangle size={13} /> {sg.skill_name} (Gap: {sg.gap}%)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.75rem'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {c.github_url && (
                    <a href={c.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                      GitHub <ArrowUpRight size={13} />
                    </a>
                  )}
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                      LinkedIn <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>

                {/* Direct Contact Button */}
                <button
                  onClick={() => setSelectedStudentForContact(c)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
                >
                  <Mail size={15} /> Contact / Invite Student
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outreach Modal */}
      {selectedStudentForContact && (
        <ContactStudentModal
          student={selectedStudentForContact}
          opportunities={opportunities}
          onClose={() => setSelectedStudentForContact(null)}
          onMessageSent={() => {
            setToastMessage(`Outreach message sent to ${selectedStudentForContact.name}!`);
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />
      )}
    </div>
  );
};
