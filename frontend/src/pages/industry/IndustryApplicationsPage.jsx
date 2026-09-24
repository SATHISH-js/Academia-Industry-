import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Eye,
  Download,
  Search,
  FileText,
  Sparkles,
  ArrowUpDown,
  Mail,
  MessageSquare
} from 'lucide-react';
import { CandidateProfileModal } from '../../components/industry/CandidateProfileModal';
import { ResumePreviewModal } from '../../components/common/ResumePreviewModal';
import { ContactStudentModal } from '../../components/industry/ContactStudentModal';
import { ApplicationMessagePane } from '../../components/common/ApplicationMessagePane';

export const IndustryApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState(null);
  const [selectedCandidateForResume, setSelectedCandidateForResume] = useState(null);
  const [selectedStudentForContact, setSelectedStudentForContact] = useState(null);
  const [selectedAppForMessages, setSelectedAppForMessages] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await api.put(`/applications/${appId}/status`, {
        status: newStatus,
        feedback: `Status updated to ${newStatus} by recruitment team`
      });
      if (res.data.success) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
        if (selectedCandidateForProfile?.id === appId) {
          setSelectedCandidateForProfile(prev => ({ ...prev, status: newStatus }));
        }
        setToastMessage(`Application status updated to ${newStatus}`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatAppliedTime = (dateStr) => {
    if (!dateStr) return { primary: 'Recently', relative: '' };
    const date = new Date(dateStr);
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    let relative = '';
    if (diffHours < 1) relative = 'Just now';
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else {
      const diffDays = Math.floor(diffHours / 24);
      relative = `${diffDays}d ago`;
    }

    return {
      primary: `${dateFormatted}, ${timeFormatted}`,
      relative
    };
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      (app.candidate_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.candidate_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.opportunity_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1250px', margin: '0 auto' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: '#ffffff',
          padding: '2.25rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', marginBottom: '0.75rem' }}>
              👥 Candidate Recruitment Pipeline
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Applications Received & Talent Review
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Inspect candidate profiles, review timestamps of received applications, evaluate verified skill scores, and download candidate resumes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-200)' }}>Total Applications</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{applications.length}</div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--success-50, #ecfdf5)',
            color: 'var(--success-700, #047857)',
            border: '1px solid var(--success-500, #10b981)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search candidate name, role, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--slate-500)" />
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem', width: 'auto' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Showing <strong>{filteredApplications.length}</strong> of <strong>{applications.length}</strong> application(s)
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
            Loading received candidate applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-500)' }}>
            <Users size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              No applications match criteria
            </h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Try adjusting your search terms or status filters.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied Opportunity</th>
                  <th>Time Applied</th>
                  <th>Compatibility</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => {
                  const timeInfo = formatAppliedTime(app.created_at);
                  return (
                    <tr key={app.id}>
                      {/* Candidate Column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-600)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              flexShrink: 0
                            }}
                          >
                            {(app.candidate_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                              {app.candidate_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                              {app.candidate_email} • {app.department || 'CSE'} (CGPA: {app.cgpa || '8.5'})
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Opportunity */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                          {app.opportunity_title}
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                          {app.opportunity_type || 'ROLE'}
                        </span>
                      </td>

                      {/* Applied Time (Requirement 2) */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                            <Clock size={13} color="var(--primary-600)" />
                            <span>{timeInfo.primary}</span>
                          </div>
                          {timeInfo.relative && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--primary-600)', fontWeight: 700, marginLeft: '1.2rem' }}>
                              {timeInfo.relative}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Compatibility Score */}
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          backgroundColor: app.match_score >= 80 ? 'var(--success-50)' : 'var(--primary-50)',
                          color: app.match_score >= 80 ? 'var(--success-700)' : 'var(--primary-700)',
                          fontWeight: 800,
                          fontSize: '0.82rem'
                        }}>
                          <Sparkles size={12} />
                          {app.match_score}% Match
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        <select
                          className="form-control"
                          style={{
                            padding: '0.35rem 0.55rem',
                            fontSize: '0.78rem',
                            width: 'auto',
                            fontWeight: 700,
                            color:
                              app.status === 'SELECTED' ? 'var(--success-700)' :
                              app.status === 'REJECTED' ? 'var(--danger-700)' :
                              app.status === 'SHORTLISTED' || app.status === 'INTERVIEW' ? 'var(--primary-700)' : 'var(--warning-700)'
                          }}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          disabled={updatingId === app.id}
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="UNDER_REVIEW">UNDER REVIEW</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="INTERVIEW">INTERVIEW</option>
                          <option value="SELECTED">SELECTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      {/* Actions: View Profile & Download Resume (Requirement 2) */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedAppForMessages(app)}
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.78rem',
                              padding: '0.35rem 0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              backgroundColor: 'var(--primary-50)',
                              color: 'var(--primary-700)',
                              borderColor: 'var(--primary-200)'
                            }}
                            title="View Sent & Received Application Messages"
                          >
                            <MessageSquare size={13} /> Messages
                          </button>

                          <button
                            onClick={() => setSelectedCandidateForProfile(app)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            title="View Full Profile of Candidate"
                          >
                            <Eye size={13} /> View Profile
                          </button>

                          <button
                            onClick={() => setSelectedCandidateForResume(app)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            title="Download Candidate Resume"
                          >
                            <Download size={13} /> Download Resume
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Message Pane (Requirement 3) */}
      {selectedAppForMessages && (
        <ApplicationMessagePane
          application={selectedAppForMessages}
          currentUserRole="INDUSTRY"
          onClose={() => setSelectedAppForMessages(null)}
        />
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidateForProfile && (
        <CandidateProfileModal
          candidate={selectedCandidateForProfile}
          onClose={() => setSelectedCandidateForProfile(null)}
          onStatusChange={handleStatusChange}
          onOpenMessages={(cand) => setSelectedAppForMessages(cand)}
          onContactCandidate={(cand) => {
            setSelectedStudentForContact({
              student_id: cand.student_id || cand.applicant_id,
              name: cand.candidate_name || cand.name
            });
          }}
        />
      )}

      {/* Resume Preview & Download Modal */}
      {selectedCandidateForResume && (
        <ResumePreviewModal
          studentId={selectedCandidateForResume.student_id || selectedCandidateForResume.applicant_id}
          studentData={selectedCandidateForResume}
          onClose={() => setSelectedCandidateForResume(null)}
        />
      )}

      {/* Contact Student Modal */}
      {selectedStudentForContact && (
        <ContactStudentModal
          student={selectedStudentForContact}
          opportunities={[]}
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
