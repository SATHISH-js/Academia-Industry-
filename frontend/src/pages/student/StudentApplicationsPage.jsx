import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileText,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ApplicationMessagePane } from '../../components/common/ApplicationMessagePane';

export const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppForMessages, setSelectedAppForMessages] = useState(null);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SELECTED':
        return <span className="badge badge-success">Selected</span>;
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return <span className="badge badge-primary">{status}</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">Not Selected</span>;
      default:
        return <span className="badge badge-warning">{status}</span>;
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

  const totalSelected = applications.filter(a => a.status === 'SELECTED').length;
  const totalInReview = applications.filter(a => ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW'].includes(a.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          color: '#ffffff',
          padding: '2.25rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', marginBottom: '0.75rem' }}>
              📄 Candidate Applications Hub
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              My Applications & Recruiter Messages
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Track recruitment progression, compatibility scores, received interview invitations, and communicate directly with hiring teams.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-200)' }}>Submitted</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{applications.length}</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-200)' }}>In Review</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{totalInReview}</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-200)' }}>Selected</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80' }}>{totalSelected}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
            Loading your submitted applications...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--slate-500)' }}>
            <FileText size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              No applications submitted yet
            </h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Explore the Internships or Jobs tab to find matching opportunities and apply!
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Enterprise</th>
                  <th>Type</th>
                  <th>Compatibility</th>
                  <th>Applied Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Communication</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const timeInfo = formatAppliedTime(app.created_at);
                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        {app.opportunity_title}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Building2 size={14} color="var(--slate-400)" />
                          <span>{app.company_name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-neutral">{app.opportunity_type}</span></td>
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
                      <td>{getStatusBadge(app.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedAppForMessages(app)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.35rem 0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-700)',
                            borderColor: 'var(--primary-200)'
                          }}
                          title="View Sent and Received Recruiter Messages"
                        >
                          <MessageSquare size={13} /> Messages & Notes
                        </button>
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
          currentUserRole="STUDENT"
          onClose={() => setSelectedAppForMessages(null)}
        />
      )}
    </div>
  );
};
