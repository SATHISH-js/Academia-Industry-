import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Building2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
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

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading application status...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          My Applications
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          Track recruitment progression, compatibility scores, and recruiter interview updates.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Company</th>
                <th>Type</th>
                <th>Compatibility</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                    No applications submitted yet. Browse the Internships or Jobs tab to apply!
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                      {app.opportunity_title}
                    </td>
                    <td>{app.company_name}</td>
                    <td><span className="badge badge-neutral">{app.opportunity_type}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                        {app.match_score}%
                      </span>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>{getStatusBadge(app.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
