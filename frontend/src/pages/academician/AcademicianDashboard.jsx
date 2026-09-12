import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Building2, 
  Compass, 
  FileText, 
  GraduationCap, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ArrowRight 
} from 'lucide-react';

export const AcademicianDashboard = () => {
  const { user } = useAuth();

  const metrics = [
    { label: 'Active Faculty Internships', value: '2', sub: 'Infosys & Intel Labs' },
    { label: 'Research Proposals', value: '3', sub: '2 Under Industry Review' },
    { label: 'FDP Registrations', value: '4', sub: 'Next starting Monday' },
    { label: 'Industry Consultancies', value: '1', sub: 'Cloud Systems Architecture' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        color: '#ffffff',
        padding: '2rem',
        border: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', marginBottom: '0.75rem' }}>
            👨‍🏫 Academician Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Welcome, Dr. {user?.name || 'Professor'}
          </h1>
          <p style={{ color: 'var(--slate-300)', maxWidth: '600px', fontSize: '0.95rem' }}>
            Explore industry-sponsored research projects, faculty development training, consultancies, and academician mentorship programs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/academician/opportunities" className="btn btn-primary">
            <Compass size={18} /> Explore Industry Programs
          </Link>
          <Link to="/academician/collaboration" className="btn btn-secondary">
            <Users size={18} /> Joint Research
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {metrics.map((m, i) => (
          <div key={i} className="card">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>{m.label}</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-600)', fontWeight: 600, marginTop: '0.25rem' }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Collaboration Opportunities Feed */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Recommended Industry Collaborations
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Recent research grants and industrial immersion openings
            </p>
          </div>
          <Link to="/academician/opportunities" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            View All
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-primary">Research Project</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
                Edge Computing & AI Optimization for Industrial IoT
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Sponsor: Cisco Systems • Grant: INR 8,50,000 • Duration: 12 Months
              </p>
            </div>
            <Link to="/academician/opportunities" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
              Express Interest
            </Link>
          </div>

          <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-success">Faculty Internship</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
                Cloud Architecture & Microservices Immersion (Summer 2026)
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Host: Amazon Web Services • Mode: Hybrid • Duration: 4 Weeks
              </p>
            </div>
            <Link to="/academician/opportunities" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
