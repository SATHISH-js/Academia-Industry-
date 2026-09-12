import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';

export const IndustryApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await api.put(`/applications/${appId}/status`, {
        status: newStatus,
        feedback: `Status changed to ${newStatus} by recruitment team`
      });
      if (res.data.success) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading candidate applications...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Candidate Recruitment Management
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          Review applicants, examine compatibility percentages, and advance candidates through the hiring pipeline.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Opportunity</th>
                <th>Department</th>
                <th>CGPA</th>
                <th>Compatibility</th>
                <th>Current Status</th>
                <th>Recruiter Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                    No applications received for active postings yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{app.candidate_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.candidate_email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{app.opportunity_title}</td>
                    <td>{app.department || 'Computer Science'}</td>
                    <td><strong>{app.cgpa || '8.5'}</strong></td>
                    <td>
                      <span style={{
                        fontWeight: 800,
                        color: app.match_score >= 80 ? 'var(--success-600)' : 'var(--primary-600)'
                      }}>
                        {app.match_score}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        app.status === 'SELECTED' ? 'badge-success' :
                        app.status === 'REJECTED' ? 'badge-danger' :
                        app.status === 'SHORTLISTED' || app.status === 'INTERVIEW' ? 'badge-primary' : 'badge-warning'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
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
