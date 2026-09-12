import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  Building2, 
  Layers, 
  PlusCircle, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const IndustryDashboard = () => {
  const { user } = useAuth();

  const metrics = [
    { label: 'Active Opportunities', value: '6', sub: '4 Internships, 2 Jobs' },
    { label: 'Applications Received', value: '48', sub: '12 new this week' },
    { label: 'Shortlisted Candidates', value: '14', sub: 'Matching > 80%' },
    { label: 'Interviews Scheduled', value: '5', sub: 'Next today at 3 PM' },
  ];

  const candidateLeaderboard = [
    { name: 'Aditya Verma', role: 'Full Stack Engineer Intern', match: 94, skills: 'Python, React, SQL, DSA' },
    { name: 'Priya Sundaram', role: 'Data Analytics Intern', match: 88, skills: 'Python, SQL, Tableau, Stats' },
    { name: 'Kunal Deshmukh', role: 'Backend Developer', match: 82, skills: 'Node.js, Express, MySQL' },
    { name: 'Ananya Roy', role: 'Cloud DevOps Trainee', match: 78, skills: 'Docker, AWS, Linux' },
  ];

  const skillDemandData = [
    { skill: 'Python', demand: 82 },
    { skill: 'Java', demand: 70 },
    { skill: 'SQL', demand: 68 },
    { skill: 'React', demand: 64 },
    { skill: 'Cloud/AWS', demand: 58 },
    { skill: 'DSA', demand: 75 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
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
            🏢 Industry Recruitment Hub
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {user?.name || 'TechCorp Global'}
          </h1>
          <p style={{ color: 'var(--slate-300)', maxWidth: '600px', fontSize: '0.95rem' }}>
            Discover skill-assessed candidates with compatibility matching, post verified openings, and host joint campus workshops.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/industry/internships" className="btn btn-primary">
            <PlusCircle size={18} /> Post Internship
          </Link>
          <Link to="/industry/jobs" className="btn btn-secondary">
            <Layers size={18} /> Post Job
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

      {/* Grid: Candidate Match Leaderboard & Skill Demand */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Candidate Matching Leaderboard */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={18} color="var(--primary-600)" /> Top Matched Candidates
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Candidates ranked by automated skill compatibility algorithm
              </p>
            </div>
            <Link to="/industry/candidates" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {candidateLeaderboard.map((c, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{c.role} • {c.skills}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'var(--success-50)',
                    color: 'var(--success-700)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {c.match}% Match
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Demanded Skills Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Most Demanded Skills
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Frequency of skills requested across active job and internship postings
              </p>
            </div>
            <Link to="/industry/analytics" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Full Analytics
            </Link>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDemandData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--slate-200)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--slate-600)', fontSize: 12 }} />
                <YAxis dataKey="skill" type="category" tick={{ fill: 'var(--slate-700)', fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="demand" fill="var(--primary-600)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
