import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  Handshake,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Clock,
  ExternalLink,
  Sparkles,
  X,
  FileText,
  AlertCircle,
  Search
} from 'lucide-react';

export const IndustryPartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proposal Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Industry Search State (No Dropdown)
  const [industrySearch, setIndustrySearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const [proposalData, setProposalData] = useState({
    industry_id: '',
    partnership_type: 'MOU',
    valid_until: '',
    notes: 'Comprehensive Industry-Academia MoU for technical curriculum co-design, student internships, and faculty development.',
    proposal_note: 'Bilateral agreement proposal for joint labs, sponsored hackathons, and placement fast-track interviews.'
  });

  useEffect(() => {
    fetchPartnersAndCompanies();
  }, []);

  const fetchPartnersAndCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institution/partners');
      if (res.data.success) {
        setPartners(res.data.data.connections || []);
        setAvailableCompanies(res.data.data.availableCompanies || []);
        if (res.data.data.availableCompanies?.length > 0) {
          const first = res.data.data.availableCompanies[0];
          setSelectedIndustry(first);
          setProposalData(prev => ({ ...prev, industry_id: String(first.id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load partners and companies', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeSubmit = async (e) => {
    e.preventDefault();
    if (!proposalData.industry_id || !proposalData.notes.trim()) {
      setFeedback({ type: 'error', text: 'Please select an industry partner and specify agreement notes.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const res = await api.post('/institution/mou/propose', proposalData);
      if (res.data.success) {
        setFeedback({ type: 'success', text: 'MoU collaboration agreement proposed successfully to industry partner!' });
        setShowModal(false);
        fetchPartnersAndCompanies();
      }
    } catch (err) {
      console.error('Failed to propose MoU', err);
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Failed to submit proposal.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              🤝 Industry Linkages & MoUs
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Corporate Industry Partners & MoUs
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Communicate with corporate leaders to sign bilateral MoUs, establish research centers of excellence, sponsor student internship cohorts, and host joint campus hackathons.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ backgroundColor: '#ffffff', color: 'var(--primary-900)', fontWeight: 800 }}
          >
            <PlusCircle size={18} /> Propose New MoU Agreement
          </button>
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

      {/* Partners & MoUs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
          <span>Active & Proposed Agreements (<strong>{partners.length}</strong>)</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
            Loading partner connections...
          </div>
        ) : partners.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No industry MoUs established yet. Click <strong>"Propose New MoU Agreement"</strong> to connect with corporate leaders!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {partners.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge badge-primary">{p.partnership_type?.replace('_', ' ')}</span>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {p.company_name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                    {p.industry_domain} • {p.city || 'India'}
                  </div>

                  <p style={{ color: 'var(--slate-700)', fontSize: '0.88rem', margin: '0.85rem 0', lineHeight: 1.5 }}>
                    {p.notes || 'Formal memorandum of understanding for reciprocal training, curriculum co-design, and campus recruitment.'}
                  </p>

                  {p.proposal_note && (
                    <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      <strong>Proposal Note:</strong> {p.proposal_note}
                    </div>
                  )}
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--slate-500)'
                }}>
                  <span>Signed: {p.mou_signed_date ? new Date(p.mou_signed_date).toLocaleDateString() : 'In Progress'}</span>
                  <span>Valid Until: {p.valid_until ? new Date(p.valid_until).toLocaleDateString() : 'Perpetual'}</span>
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Website <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Propose MoU Modal */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '620px',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              zIndex: 1050
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
                  Propose Industry MoU Agreement
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-300)' }}>
                  Initiate institutional collaboration & signed MoU
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProposeSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Search & Select Industry Partner *</label>
                  {selectedIndustry ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--slate-50)',
                      border: '1.5px solid var(--primary-500)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800
                        }}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                            {selectedIndustry.company_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {selectedIndustry.industry_domain} • {selectedIndustry.city || 'Corporate Partner'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIndustry(null);
                          setProposalData(prev => ({ ...prev, industry_id: '' }));
                          setIndustrySearch('');
                        }}
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      >
                        Change Enterprise
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search industry by enterprise name, technology domain, or location..."
                          style={{ paddingLeft: '2.5rem' }}
                          value={industrySearch}
                          onChange={(e) => setIndustrySearch(e.target.value)}
                          autoFocus
                        />
                      </div>

                      {/* Autocomplete Search Results */}
                      <div style={{
                        maxHeight: '180px',
                        overflowY: 'auto',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff'
                      }}>
                        {availableCompanies.filter(c =>
                          !industrySearch.trim() ||
                          c.company_name.toLowerCase().includes(industrySearch.toLowerCase()) ||
                          (c.industry_domain && c.industry_domain.toLowerCase().includes(industrySearch.toLowerCase())) ||
                          (c.city && c.city.toLowerCase().includes(industrySearch.toLowerCase()))
                        ).length === 0 ? (
                          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                            No industry enterprises match your search query.
                          </div>
                        ) : (
                          availableCompanies
                            .filter(c =>
                              !industrySearch.trim() ||
                              c.company_name.toLowerCase().includes(industrySearch.toLowerCase()) ||
                              (c.industry_domain && c.industry_domain.toLowerCase().includes(industrySearch.toLowerCase())) ||
                              (c.city && c.city.toLowerCase().includes(industrySearch.toLowerCase()))
                            )
                            .map(c => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setSelectedIndustry(c);
                                  setProposalData(prev => ({ ...prev, industry_id: String(c.id) }));
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.65rem 1rem',
                                  borderBottom: '1px solid var(--border-light)',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slate-50)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <Building2 size={16} color="var(--primary-600)" />
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                                      {c.company_name}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                                      {c.industry_domain} {c.city ? `• ${c.city}` : ''}
                                    </div>
                                  </div>
                                </div>
                                <span className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
                                  Select
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Partnership Agreement Type *</label>
                  <select
                    className="form-control"
                    value={proposalData.partnership_type}
                    onChange={(e) => setProposalData({ ...proposalData, partnership_type: e.target.value })}
                  >
                    <option value="MOU">Comprehensive Bilateral MoU</option>
                    <option value="PLACEMENT_PARTNER">Campus Placement & Hiring Partner</option>
                    <option value="LAB_COLLABORATION">Joint Laboratory & Center of Excellence</option>
                    <option value="RESEARCH_SPONSOR">Sponsored Research & Grants</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Proposed Validity Until</label>
                <input
                  type="date"
                  className="form-control"
                  value={proposalData.valid_until}
                  onChange={(e) => setProposalData({ ...proposalData, valid_until: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Agreement Scope & Summary *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={proposalData.notes}
                  onChange={(e) => setProposalData({ ...proposalData, notes: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Message to Corporate Leadership</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={proposalData.proposal_note}
                  onChange={(e) => setProposalData({ ...proposalData, proposal_note: e.target.value })}
                  placeholder="Outline benefits for students, faculty sabbaticals, and expected milestones..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {submitting ? 'Submitting Proposal...' : 'Dispatch MoU Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
