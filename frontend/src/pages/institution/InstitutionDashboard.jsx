import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  BarChart2, 
  Building2, 
  CheckCircle2, 
  FileSpreadsheet, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Sparkles,
  Compass,
  Award,
  Clock,
  Handshake,
  UserCheck
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
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institution/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load institution analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { 
      label: 'Enrolled Students', 
      value: analytics?.totalStudents ?? '...', 
      sub: `${analytics?.assessedStudents ?? 0} Skill-Assessed`,
      icon: Users,
      color: 'var(--primary-600)'
    },
    { 
      label: 'Faculty & Academicians', 
      value: analytics?.totalFaculty ?? '...', 
      sub: 'Active Faculty Roster',
      icon: GraduationCap,
      color: '#0d9488'
    },
    { 
      label: 'Campus Placement Rate', 
      value: `${analytics?.placementRate ?? 0}%`, 
      sub: `${analytics?.placedStudents ?? 0} Students Placed`,
      icon: TrendingUp,
      color: 'var(--success-600)'
    },
    { 
      label: 'Industry MoUs Active', 
      value: analytics?.activePartners ?? '...', 
      sub: 'Bilateral Partnerships',
      icon: Handshake,
      color: '#7c3aed'
    },
  ];

  const departmentData = analytics?.departmentStats?.length > 0
    ? analytics.departmentStats.map(d => ({
        dept: d.dept || 'Engineering',
        avgScore: Number(d.avgScore) || 70,
        placedPct: Number(d.placedPct) || 75
      }))
    : [
        { dept: 'Computer Science', avgScore: 78, placedPct: 86 },
        { dept: 'Information Tech', avgScore: 74, placedPct: 82 },
        { dept: 'Data Science / AI', avgScore: 82, placedPct: 89 },
        { dept: 'Electronics (ECE)', avgScore: 68, placedPct: 70 },
      ];

  const placementDistribution = [
    { name: 'Placed (FTE / PPO)', value: Math.max(analytics?.placedStudents || 1, 1), color: 'var(--success-500)' },
    { name: 'Assessed In-Progress', value: Math.max((analytics?.assessedStudents || 2) - (analytics?.placedStudents || 0), 1), color: 'var(--primary-500)' },
    { name: 'Enrolled / Preparing', value: Math.max((analytics?.totalStudents || 3) - (analytics?.assessedStudents || 1), 1), color: 'var(--accent-500)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Institution Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            {analytics?.institutionName || user?.name || 'National Institute of Technology'}
          </h1>
          <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Monitor enrolled college students, track student in-app activity timelines, browse faculty rosters, and sign bilateral MoUs with industry partners.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/institution/students" className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Users size={17} /> Student Directory & Monitor
          </Link>
          <Link to="/institution/training-programs" className="btn btn-secondary" style={{ gap: '0.4rem' }}>
            <Award size={17} /> Training Programs
          </Link>
          <Link to="/institution/placements" className="btn btn-outline" style={{ gap: '0.4rem', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <TrendingUp size={17} /> Placement Analytics
          </Link>
          <Link to="/institution/partners" className="btn btn-outline" style={{ gap: '0.4rem', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <Handshake size={17} /> Industry MoUs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>{m.label}</span>
                <div style={{
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--slate-50)',
                  color: m.color
                }}>
                  <Icon size={18} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)', lineHeight: 1 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: m.color, fontWeight: 700, marginTop: '0.35rem' }}>
                  {m.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Feature Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        <Link to="/institution/students" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid var(--primary-600)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Users size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Enrolled Students & Activity Monitor
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Filter by department, CGPA, and batch. Click "Monitor Activity" to inspect a student's mock interviews, roadmap tasks, and applications in real time.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-600)', marginTop: '1rem' }}>
              View College Students <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        <Link to="/institution/academicians" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #0d9488',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <GraduationCap size={20} color="#0d9488" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Academician & Faculty Roster
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Browse affiliated professors and research leads ({analytics?.totalFaculty || 0} registered). Inspect research specializations, experience, and Google Scholar publications.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#0d9488', marginTop: '1rem' }}>
              View Faculty Members <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        <Link to="/institution/partners" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #7c3aed',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Handshake size={20} color="#7c3aed" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Industry Partners & Signed MoUs
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Manage corporate partnerships, bilateral MoUs, and placement alliances. Propose new signed agreements directly to industry corporations.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed', marginTop: '1rem' }}>
              Manage Signed MoUs <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        <Link to="/institution/collaborations-search" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #ea580c',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Compass size={20} color="#ea580c" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Discover Industry Collaborations
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Search open innovation challenges, sponsored research grants, and technical workshops. Submit institutional proposals directly.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#ea580c', marginTop: '1rem' }}>
              Search Marketplace <ArrowRight size={14} />
            </div>
          </div>
        </Link>
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
            <Link to="/institution/students" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Students
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
                Cohort Career Readiness Distribution
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Current progress of enrolled students across the institution
              </p>
            </div>
            <Link to="/institution/partners" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              MoUs
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
