import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart2, 
  Building2, 
  CheckCircle2, 
  FileSpreadsheet, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const InstitutionDashboard = () => {
  const { user } = useAuth();

  const metrics = [
    { label: 'Enrolled Students', value: '3,450', sub: 'Across 6 Departments' },
    { label: 'Assessed Students', value: '2,890', sub: '83.7% Completion Rate' },
    { label: 'Campus Placement Rate', value: '78.5%', sub: 'Target: 85%' },
    { label: 'Industry MoUs Active', value: '28', sub: 'Tech & Engineering' },
  ];

  const departmentData = [
    { dept: 'Computer Science', avgScore: 78, placedPct: 86 },
    { dept: 'Information Tech', avgScore: 74, placedPct: 82 },
    { dept: 'Electronics (ECE)', avgScore: 68, placedPct: 70 },
    { dept: 'Data Science / AI', avgScore: 82, placedPct: 89 },
    { dept: 'Mechanical', avgScore: 62, placedPct: 65 },
  ];

  const placementDistribution = [
    { name: 'Placed (FTE / PPO)', value: 1650, color: 'var(--success-500)' },
    { name: 'Active Internships', value: 840, color: 'var(--primary-500)' },
    { name: 'Interview Stages', value: 420, color: 'var(--accent-500)' },
    { name: 'Upskilling Needed', value: 540, color: 'var(--warning-500)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Institution Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
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
            🏛️ Institutional Leadership Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {user?.name || 'National Institute of Technology'}
          </h1>
          <p style={{ color: 'var(--slate-300)', maxWidth: '600px', fontSize: '0.95rem' }}>
            Monitor campus skill development, track department-level readiness against industry benchmarks, and manage corporate recruitment partnerships.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/institution/students" className="btn btn-primary">
            <Users size={18} /> Student Roster
          </Link>
          <Link to="/institution/skills" className="btn btn-secondary">
            <BarChart2 size={18} /> Skill Gap Trends
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

      {/* Analytics Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Department Readiness & Placement */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Department Benchmark: Skill Score vs Placement %
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Correlation between verified skill scores and placement success
              </p>
            </div>
            <Link to="/institution/placements" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Details
            </Link>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate-200)" />
                <XAxis dataKey="dept" tick={{ fill: 'var(--slate-600)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--slate-600)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="avgScore" name="Avg Skill Score %" fill="var(--primary-600)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placedPct" name="Placement Rate %" fill="var(--success-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placement Status Distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Overall Placement Distribution
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Current career status of final & pre-final year cohorts
              </p>
            </div>
            <Link to="/institution/partners" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Partners
            </Link>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={placementDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {placementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
