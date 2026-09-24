import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Award,
  Layers,
  Send,
  X,
  AlertCircle
} from 'lucide-react';

export const TrainingProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedAudience, setSelectedAudience] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cohort Enrollment Modal state
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [batchSize, setBatchSize] = useState(35);
  const [startDate, setStartDate] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const domains = [
    'ALL',
    'Cloud & DevOps',
    'AI & Data Science',
    'Software Engineering',
    'Cyber Security',
    'Faculty Development'
  ];

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institution/training-programs', {
        params: {
          domain: selectedDomain !== 'ALL' ? selectedDomain : undefined,
          audience: selectedAudience !== 'ALL' ? selectedAudience : undefined,
          keyword: searchQuery || undefined
        }
      });
      if (res.data?.success) {
        setPrograms(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch training programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [selectedDomain, selectedAudience]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPrograms();
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      const res = await api.post('/institution/training-programs/enroll', {
        program_id: selectedProgram.id,
        requested_batch_size: parseInt(batchSize, 10),
        preferred_start_date: startDate || null,
        notes: customNotes || null
      });

      if (res.data?.success) {
        setSuccessMessage(`Successfully requested cohort training for '${selectedProgram.title}'! The corporate training team has been notified.`);
        setSelectedProgram(null);
        setCustomNotes('');
        fetchPrograms();
        setTimeout(() => setSuccessMessage(''), 7000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to submit cohort request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.35)', color: '#c7d2fe', marginBottom: '0.85rem' }}>
              <BookOpen size={14} /> Corporate Industry Training & Upskilling
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Industry-Led Training Programs
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '750px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Explore technical training tracks, hands-on cloud labs, corporate certification bootcamps, and Faculty Development Programs (FDP) provided directly by leading technology enterprises for your college cohorts.
            </p>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          {domains.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              style={{
                background: selectedDomain === d ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {d === 'ALL' ? 'All Domains' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="card" style={{ backgroundColor: 'var(--success-50)', borderColor: 'var(--success-500)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={22} color="var(--success-600)" />
          <span style={{ color: 'var(--success-700)', fontWeight: 600, fontSize: '0.95rem' }}>
            {successMessage}
          </span>
        </div>
      )}

      {/* Search and Audience Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search programs by technology, title, or providing company..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)' }}>Audience:</label>
            <select
              className="form-control"
              style={{ width: '160px' }}
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
            >
              <option value="ALL">All Cohorts</option>
              <option value="STUDENTS">Students Only</option>
              <option value="FACULTY">Faculty Only (FDP)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
          Loading industry training programs...
        </div>
      ) : programs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-500)' }}>
          <BookOpen size={44} style={{ margin: '0 auto 1rem', color: 'var(--slate-400)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
            No Training Programs Found
          </h3>
          <p style={{ maxWidth: '450px', margin: '0 auto', fontSize: '0.9rem' }}>
            No corporate training programs match the current domain or search filters. Try switching filters or resetting your query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
          {programs.map(p => (
            <div
              key={p.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                {/* Header: Company & Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                        {p.company_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {p.company_city || 'Corporate Partner'}
                      </div>
                    </div>
                  </div>

                  <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', fontSize: '0.72rem' }}>
                    {p.domain}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.35, marginBottom: '0.65rem' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {p.description}
                </p>

                {/* Meta details pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={15} color="var(--primary-600)" />
                    <span>{p.duration_weeks} Weeks Duration</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Layers size={15} color="var(--primary-600)" />
                    <span style={{ textTransform: 'capitalize' }}>{p.mode?.toLowerCase()} Mode</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={15} color="var(--primary-600)" />
                    <span>Audience: <strong>{p.target_audience}</strong></span>
                  </div>
                  {p.certification_offered && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success-700)', fontWeight: 600 }}>
                      <Award size={15} color="var(--success-600)" />
                      <span>Certified Program</span>
                    </div>
                  )}
                </div>

                {/* Skills Tags */}
                {p.skills_covered && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Syllabus Competencies:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {p.skills_covered.split(',').map((skill, i) => (
                        <span key={i} style={{ fontSize: '0.72rem', backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {p.enrollment_status ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning-700)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCircle size={16} color="var(--warning-600)" />
                    <span>Cohort Requested ({p.enrollment_status})</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedProgram(p);
                      setBatchSize(p.max_batch_size || 40);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <Send size={15} /> Request Training Cohort
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cohort Enrollment Request Modal */}
      {selectedProgram && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Institutional Cohort Request
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {selectedProgram.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                  Provided by <strong>{selectedProgram.company_name}</strong> • {selectedProgram.domain}
                </div>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {errorMessage && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {errorMessage}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Requested Batch Size</label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    className="form-control"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Number of students/faculty in batch</span>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Preferred Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Curriculum Customization / College Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Mention preferred laboratory timings, specialized topics to emphasize, or faculty coordinator contacts..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedProgram(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Send Cohort Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
