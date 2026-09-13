import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Compass,
  Search,
  Building2,
  Calendar,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  Handshake,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Clock,
  Layers,
  MapPin,
  RotateCcw
} from 'lucide-react';

export const SearchCollaborationsPage = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryType, setCategoryType] = useState('ALL');
  const [feedback, setFeedback] = useState(null);

  // Connect / Propose MoU Modal
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proposalData, setProposalData] = useState({
    industry_id: '',
    partnership_type: 'MOU',
    valid_until: '',
    notes: '',
    proposal_note: ''
  });

  useEffect(() => {
    fetchCollaborations();
  }, [categoryType]);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryType !== 'ALL') params.type = categoryType;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await api.get('/institution/collaborations/search', { params });
      if (res.data.success) {
        setCollaborations(res.data.data.collaborations || []);
      }
    } catch (err) {
      console.error('Failed to load collaborations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCollaborations();
  };

  const handleReset = () => {
    setKeyword('');
    setCategoryType('ALL');
    fetchCollaborations();
  };

  const handleOpenConnectModal = (opp) => {
    setSelectedOpp(opp);
    let defaultType = 'MOU';
    if (opp.category === 'RESEARCH_PROJECT') defaultType = 'RESEARCH_SPONSOR';
    else if (opp.category === 'INNOVATION_CHALLENGE') defaultType = 'LAB_COLLABORATION';

    setProposalData({
      industry_id: opp.industry_id ? String(opp.industry_id) : '1',
      partnership_type: defaultType,
      valid_until: '2027-12-31',
      notes: `Institutional collaboration in response to: "${opp.title}" hosted by ${opp.company_name}. Joint execution and talent onboarding.`,
      proposal_note: `Our institution wishes to formally partner with ${opp.company_name} on this initiative, providing faculty researchers, lab infrastructure, and participating student scholars.`
    });
    setShowModal(true);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await api.post('/institution/mou/propose', proposalData);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: `Partnership & MoU proposal successfully sent to ${selectedOpp?.company_name}!`
        });
        setShowModal(false);
      }
    } catch (err) {
      console.error('Failed to submit collaboration proposal', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit proposal. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'INNOVATION_CHALLENGE':
        return { label: 'Innovation Challenge', bg: 'var(--success-50)', color: 'var(--success-700)', border: '1px solid var(--success-200)', icon: Sparkles };
      case 'RESEARCH_PROJECT':
        return { label: 'Sponsored Research Grant', bg: 'var(--primary-50)', color: 'var(--primary-700)', border: '1px solid var(--primary-200)', icon: BookOpen };
      case 'WORKSHOP':
        return { label: 'Technical Workshop', bg: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', icon: Layers };
      default:
        return { label: 'Industry Program', bg: 'var(--slate-100)', color: 'var(--slate-700)', border: '1px solid var(--slate-200)', icon: Handshake };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              🌐 Industry Collaboration Marketplace
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Search Industry Collaborations & MoUs
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '680px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Discover open innovation challenges, funded research grants, technical workshops, and campus partnership programs offered by top industry corporations. Connect and propose bilateral MoUs directly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {collaborations.length}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-200)', marginTop: '0.2rem' }}>
                Active Opportunities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: feedback.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
          color: feedback.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--success-500)' : 'var(--danger-500)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by initiative title, problem statement, company name, or domain..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
              <Search size={15} /> Search
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </form>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', marginRight: '0.5rem' }}>
            Filter Category:
          </span>
          {[
            { id: 'ALL', label: 'All Collaborations' },
            { id: 'INNOVATION', label: 'Innovation Challenges' },
            { id: 'RESEARCH', label: 'Sponsored Research Grants' },
            { id: 'WORKSHOP', label: 'Technical Workshops' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryType(tab.id)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: categoryType === tab.id ? '1px solid var(--primary-600)' : '1px solid var(--border-color)',
                backgroundColor: categoryType === tab.id ? 'var(--primary-600)' : '#ffffff',
                color: categoryType === tab.id ? '#ffffff' : 'var(--slate-700)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collaborations Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
          <p style={{ fontWeight: 600 }}>Searching active industry opportunities...</p>
        </div>
      ) : collaborations.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Compass size={40} style={{ margin: '0 auto 1rem', color: 'var(--slate-400)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
            No Collaborations Found
          </h3>
          <p style={{ maxWidth: '450px', margin: '0 auto', fontSize: '0.9rem' }}>
            No industry collaboration opportunities matched your criteria. Try adjusting keywords or category filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {collaborations.map(opp => {
            const badge = getCategoryBadge(opp.category);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={`${opp.category}-${opp.id}`}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  borderTop: `4px solid ${badge.color}`,
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  {/* Category & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '9999px',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: badge.border,
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <BadgeIcon size={12} /> {badge.label}
                    </span>

                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                      {opp.status || 'OPEN'}
                    </span>
                  </div>

                  {/* Title & Company */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.35, marginBottom: '0.4rem' }}>
                    {opp.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.88rem' }}>
                    <Building2 size={15} />
                    <span>{opp.company_name}</span>
                    {opp.city && (
                      <span style={{ color: 'var(--slate-500)', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        • <MapPin size={12} /> {opp.city}
                      </span>
                    )}
                  </div>

                  {/* Rewards / Grant Value */}
                  {opp.rewards && (
                    <div style={{
                      margin: '0.85rem 0',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Award size={16} color="var(--primary-600)" />
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                          Funding / Benefits
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                          {opp.rewards}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Problem Description */}
                  <p style={{
                    color: 'var(--slate-600)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {opp.description}
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} />
                      <span>Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}</span>
                    </div>

                    {opp.company_website && (
                      <a
                        href={opp.company_website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                      >
                        Company Site <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenConnectModal(opp)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem', justifyContent: 'center' }}
                  >
                    <Handshake size={16} /> Connect & Propose MoU
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect / Propose MoU Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
                  🤝 Bilateral Partnership Proposal
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Connect with {selectedOpp?.company_name}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Submit an institutional MoU or joint collaboration proposal.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">Collaboration Initiative Reference</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedOpp?.title || ''}
                  disabled
                  style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Partnership Type</label>
                <select
                  className="form-control"
                  value={proposalData.partnership_type}
                  onChange={(e) => setProposalData({ ...proposalData, partnership_type: e.target.value })}
                  required
                >
                  <option value="MOU">General Institutional MoU (Comprehensive)</option>
                  <option value="RESEARCH_SPONSOR">Sponsored Research & Joint R&D Grant</option>
                  <option value="LAB_COLLABORATION">Co-Innovation Lab & Technical Challenge</option>
                  <option value="PLACEMENT_PARTNER">Campus Placement & Internship Partner</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Proposed Agreement Validity (Date)</label>
                <input
                  type="date"
                  className="form-control"
                  value={proposalData.valid_until}
                  onChange={(e) => setProposalData({ ...proposalData, valid_until: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scope & Institutional Objectives</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={proposalData.notes}
                  onChange={(e) => setProposalData({ ...proposalData, notes: e.target.value })}
                  placeholder="Outline key terms, student participation scope, or infrastructure..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proposal Message to Industry Leadership</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={proposalData.proposal_note}
                  onChange={(e) => setProposalData({ ...proposalData, proposal_note: e.target.value })}
                  placeholder="Explain why your institution is an ideal partner for this initiative..."
                  required
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
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minWidth: '150px' }}
                >
                  {submitting ? (
                    <>
                      <Sparkles size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Proposal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
