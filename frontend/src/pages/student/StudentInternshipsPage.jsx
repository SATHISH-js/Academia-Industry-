import React, { useState, useEffect, useMemo } from 'react';
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
  Filter,
  Search,
  Check,
  DollarSign,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const StudentInternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState('');

  // Filter States: 'ALL' | 'INTERNSHIP' | 'JOB'
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL'); // 'ALL' | 'REMOTE' | 'HYBRID' | 'ON_SITE'

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const [internRes, jobRes] = await Promise.all([
        api.get('/internships').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/jobs').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (internRes.data.success) {
        setInternships(internRes.data.data.map(i => ({ ...i, itemType: 'INTERNSHIP' })));
      }
      if (jobRes.data.success) {
        setJobs(jobRes.data.data.map(j => ({ ...j, itemType: 'JOB' })));
      }
    } catch (err) {
      console.error('Failed to load opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (item) => {
    setApplyingId(item.id);
    setMessage('');
    try {
      const res = await api.post('/applications', {
        opportunity_type: item.itemType,
        opportunity_id: item.id,
        cover_note: `Submitted application for ${item.title} via Academia-Industry Collaboration Portal`
      });
      if (res.data.success) {
        setMessage(`Application for "${item.title}" submitted successfully! Calculated profile match: ${res.data.data.matchScore || item.matchScore || 85}%`);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplyingId(null);
    }
  };

  // Combined and filtered opportunities list
  const combinedOpportunities = useMemo(() => {
    let list = [];
    if (activeTab === 'ALL') {
      list = [...internships, ...jobs];
    } else if (activeTab === 'INTERNSHIP') {
      list = internships;
    } else if (activeTab === 'JOB') {
      list = jobs;
    }

    return list.filter(item => {
      // Work Mode Filter
      if (selectedWorkMode !== 'ALL') {
        const mode = (item.work_mode || '').toUpperCase();
        if (selectedWorkMode === 'REMOTE' && !mode.includes('REMOTE')) return false;
        if (selectedWorkMode === 'HYBRID' && !mode.includes('HYBRID')) return false;
        if (selectedWorkMode === 'ON_SITE' && !mode.includes('SITE') && !mode.includes('OFFICE')) return false;
      }

      // Keyword Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const compMatch = (item.company_name || '').toLowerCase().includes(q);
        const locMatch = (item.location || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        if (!titleMatch && !compMatch && !locMatch && !descMatch) return false;
      }

      return true;
    });
  }, [internships, jobs, activeTab, selectedWorkMode, searchQuery]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)', fontWeight: 600 }}>Loading vetted opportunities...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', fontWeight: 700, padding: '0.35rem 0.75rem', marginBottom: '0.75rem' }}>
              💼 Unified Career Placement Engine
            </span>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Internships / Jobs Portal
            </h1>
            <p style={{ color: '#c7d2fe', fontSize: '0.96rem', lineHeight: 1.6, maxWidth: '720px' }}>
              Explore industry internships and full-time engineering career openings. Opportunities are pre-ranked by our 
              matching engine against your verified skills, coursework milestones, and credentials.
            </p>
          </div>

          {/* Quick Filter Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: '0.35rem', borderRadius: 'var(--radius-md)', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                background: activeTab === 'ALL' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All ({internships.length + jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('INTERNSHIP')}
              style={{
                background: activeTab === 'INTERNSHIP' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Briefcase size={14} /> Internships ({internships.length})
            </button>
            <button
              onClick={() => setActiveTab('JOB')}
              style={{
                background: activeTab === 'JOB' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Building2 size={14} /> Full-Time Jobs ({jobs.length})
            </button>
          </div>
        </div>

        {/* Search & Work Mode Filters Row */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by role, tech stack, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: '#1e1b4b',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL" style={{ background: '#1e293b' }}>All Work Modes</option>
              <option value="REMOTE" style={{ background: '#1e293b' }}>Remote Only</option>
              <option value="HYBRID" style={{ background: '#1e293b' }}>Hybrid</option>
              <option value="ON_SITE" style={{ background: '#1e293b' }}>On-Site</option>
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: message.includes('successfully') ? 'var(--success-50)' : 'var(--danger-50)',
          color: message.includes('successfully') ? 'var(--success-700)' : 'var(--danger-700)',
          border: `1px solid ${message.includes('successfully') ? '#a7f3d0' : '#fca5a5'}`,
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.includes('successfully') ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{message}</span>
        </div>
      )}

      {/* Opportunities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--primary-600)" />
            Matching Positions ({combinedOpportunities.length})
          </h2>
          {(searchQuery || selectedWorkMode !== 'ALL' || activeTab !== 'ALL') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedWorkMode('ALL'); setActiveTab('ALL'); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {combinedOpportunities.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Filter size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
            <p style={{ fontWeight: 600 }}>No opportunities found matching your search criteria.</p>
          </div>
        ) : (
          combinedOpportunities.map((item) => {
            const isIntern = item.itemType === 'INTERNSHIP';
            const isApplying = applyingId === item.id;

            return (
              <div
                key={`${item.itemType}-${item.id}`}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: `4px solid ${isIntern ? 'var(--primary-600)' : 'var(--success-600)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{
                        backgroundColor: isIntern ? 'var(--primary-100)' : 'var(--success-100)',
                        color: isIntern ? 'var(--primary-800)' : 'var(--success-800)',
                        fontWeight: 800,
                        fontSize: '0.72rem'
                      }}>
                        {isIntern ? 'INTERNSHIP' : 'FULL-TIME JOB'}
                      </span>
                      <span className="badge badge-neutral">{item.work_mode || 'Flexible'}</span>
                      {isIntern && item.duration_months && (
                        <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                          <Clock size={11} style={{ marginRight: '0.2rem' }} /> {item.duration_months} Months
                        </span>
                      )}
                      {!isIntern && item.job_type && (
                        <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                          {item.job_type}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.25rem 0' }}>
                      {item.title}
                    </h3>

                    <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--slate-600)', fontSize: '0.88rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={16} color="var(--slate-500)" /> {item.company_name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={16} color="var(--slate-500)" /> {item.location || 'India'}
                      </span>
                      {isIntern && item.stipend_amount && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                          Stipend: {item.stipend_amount}
                        </span>
                      )}
                      {!isIntern && (item.salary_min || item.salary_max) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success-700)', fontWeight: 700 }}>
                          CTC: ₹{item.salary_min ? `${item.salary_min}L` : ''} - ₹{item.salary_max ? `${item.salary_max}L PA` : 'Negotiable'}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.matchScore !== undefined && (
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      backgroundColor: item.matchScore >= 80 ? 'var(--success-50)' : 'var(--warning-50)',
                      color: item.matchScore >= 80 ? 'var(--success-700)' : 'var(--warning-600)',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      border: `1px solid ${item.matchScore >= 80 ? '#6ee7b7' : '#fde68a'}`
                    }}>
                      <Sparkles size={16} />
                      {item.matchScore}% Compatibility
                    </div>
                  )}
                </div>

                <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
                  {item.description}
                </p>

                {/* Skill Match Breakdown */}
                {item.matchedSkills && item.matchedSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--slate-600)' }}>Verified Matches:</span>
                    {item.matchedSkills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="badge badge-success" style={{ textTransform: 'none' }}>
                        <CheckCircle2 size={12} /> {s.skill_name}
                      </span>
                    ))}
                    {item.skillGaps?.slice(0, 2).map((g, idx) => (
                      <span key={idx} className="badge badge-warning" style={{ textTransform: 'none' }}>
                        <AlertTriangle size={12} /> Gap: {g.skill_name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    {item.deadline ? `Application Closes: ${new Date(item.deadline).toLocaleDateString()}` : 'Rolling Admission'} 
                    {item.openings ? ` • ${item.openings} Openings` : ''}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.45rem 1.25rem', fontWeight: 700 }}
                      onClick={() => handleApply(item)}
                      disabled={isApplying}
                    >
                      {isApplying ? 'Submitting Application…' : (
                        <>
                          <Send size={14} /> 1-Click Apply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
