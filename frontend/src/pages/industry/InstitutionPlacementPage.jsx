import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  GraduationCap,
  Users,
  Send,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ExternalLink,
  PlusCircle,
  X,
  FileText
} from 'lucide-react';

export const InstitutionPlacementPage = () => {
  const [institutions, setInstitutions] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('DIRECTORY'); // 'DIRECTORY' | 'MY_REQUESTS'
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedInst, setSelectedInst] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [proposalData, setProposalData] = useState({
    title: 'Campus Recruitment Drive 2026 - Software Engineers & Cloud Interns',
    target_batch: '2025 - 2026 Graduating Batch',
    target_departments: 'Computer Science & Engineering, Information Technology, AI & Data Science',
    expected_hires: 10,
    salary_package: '10 - 16 LPA',
    proposed_date: '',
    proposal_details: 'On-campus technical coding assessment followed by technical panel and HR interviews for final year engineering students.'
  });

  useEffect(() => {
    fetchInstitutionsAndRequests();
  }, []);

  const fetchInstitutionsAndRequests = async () => {
    try {
      setLoading(true);
      const [instRes, reqRes] = await Promise.all([
        api.get('/industry/institutions'),
        api.get('/industry/placements/my-requests')
      ]);

      if (instRes.data.success) {
        setInstitutions(instRes.data.data);
      }
      if (reqRes.data.success) {
        setMyRequests(reqRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load institution placement data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (inst) => {
    setSelectedInst(inst);
    setProposalData(prev => ({
      ...prev,
      title: `Campus Recruitment Drive 2026 at ${inst.institution_name}`
    }));
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!proposalData.title.trim() || !proposalData.proposal_details.trim()) {
      setFeedback({ type: 'error', text: 'Please fill all required proposal details.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const payload = {
        institution_id: selectedInst.id,
        ...proposalData
      };

      const res = await api.post('/industry/placements/request', payload);
      if (res.data.success) {
        setFeedback({ type: 'success', text: `Campus placement request sent to ${selectedInst.institution_name}!` });
        setSelectedInst(null);
        fetchInstitutionsAndRequests();
      }
    } catch (err) {
      console.error('Failed to submit placement request', err);
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', marginBottom: '0.75rem' }}>
              🏛️ University & College Placement Partnerships
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Institution Placement & Campus Drives
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Partner directly with academic institutions and universities. Propose dedicated on-campus or virtual placement drives to hire skill-assessed student cohorts.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem', borderRadius: 'var(--radius-md)', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('DIRECTORY')}
              style={{
                background: activeTab === 'DIRECTORY' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Institutions Directory ({institutions.length})
            </button>
            <button
              onClick={() => setActiveTab('MY_REQUESTS')}
              style={{
                background: activeTab === 'MY_REQUESTS' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FileText size={15} /> Placement Drive Proposals ({myRequests.length})
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: feedback.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
          color: feedback.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--success-500)' : 'var(--danger-500)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {activeTab === 'DIRECTORY' ? (
        /* Institutions Directory Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {institutions.map((inst) => (
            <div key={inst.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                      {inst.institution_type || 'Institute'}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {inst.institution_name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                      <MapPin size={13} /> {inst.city ? `${inst.city}, ${inst.state}` : 'India'}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--primary-50)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                      {inst.student_count || 3}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
                      Enrolled Students
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginTop: '0.85rem', lineHeight: 1.5 }}>
                  {inst.description || 'Premier engineering and technical university with accredited curriculum and active student placement cell.'}
                </p>

                {inst.accreditation && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    Accreditation: <strong>{inst.accreditation}</strong>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.85rem'
              }}>
                {inst.website ? (
                  <a
                    href={inst.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.8rem', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    Visit Campus Website <ExternalLink size={12} />
                  </a>
                ) : <span />}

                <button
                  onClick={() => handleOpenModal(inst)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                >
                  <Send size={14} /> Connect for Placement Drive
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* My Placement Requests History */
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
            Submitted Campus Placement Drive Proposals
          </h3>

          {myRequests.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No placement drive proposals submitted yet. Connect with an institution from the directory!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th>Drive Title</th>
                    <th>Target Batch</th>
                    <th>Expected Hires</th>
                    <th>Package</th>
                    <th>Proposed Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        {req.institution_name}
                      </td>
                      <td>{req.title}</td>
                      <td>{req.target_batch}</td>
                      <td><strong>{req.expected_hires}</strong></td>
                      <td>{req.salary_package}</td>
                      <td>{req.proposed_date ? new Date(req.proposed_date).toLocaleDateString() : 'TBD'}</td>
                      <td>
                        <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Placement Drive Proposal Modal */}
      {selectedInst && (
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
          onClick={() => setSelectedInst(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '640px',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              zIndex: 1050,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--slate-900)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Propose Campus Placement Drive
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-300)' }}>
                  To: <strong>{selectedInst.institution_name}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedInst(null)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitProposal} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', overflowY: 'auto' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Placement Drive Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={proposalData.title}
                  onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Target Batch *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={proposalData.target_batch}
                    onChange={(e) => setProposalData({ ...proposalData, target_batch: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Expected Hires</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={proposalData.expected_hires}
                    onChange={(e) => setProposalData({ ...proposalData, expected_hires: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Salary Package (CTC)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={proposalData.salary_package}
                    onChange={(e) => setProposalData({ ...proposalData, salary_package: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Proposed Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={proposalData.proposed_date}
                    onChange={(e) => setProposalData({ ...proposalData, proposed_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Eligible Departments</label>
                <input
                  type="text"
                  className="form-control"
                  value={proposalData.target_departments}
                  onChange={(e) => setProposalData({ ...proposalData, target_departments: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Drive Proposal & Evaluation Stages *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={proposalData.proposal_details}
                  onChange={(e) => setProposalData({ ...proposalData, proposal_details: e.target.value })}
                  placeholder="Outline test structure, interview panels, and eligibility cutoff..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedInst(null)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting Proposal...' : 'Submit Placement Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
