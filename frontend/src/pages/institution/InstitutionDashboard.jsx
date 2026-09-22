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
  UserCheck,
  Activity,
  Brain,
  FileText,
  Briefcase,
  Layers,
  Filter
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
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, activitiesRes] = await Promise.all([
        api.get('/institution/analytics'),
        api.get('/institution/activities?limit=20')
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load institution dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      label: 'Enrolled College Students',
      value: analytics?.totalStudents ?? 0,
      sub: `${analytics?.assessedStudents ?? 0} Skill-Assessed`,
      icon: Users,
      color: 'var(--primary-600)',
      link: '/institution/students'
    },
    {
      label: 'Staffs & Academicians',
      value: analytics?.totalFaculty ?? 0,
      sub: 'Faculty & Research Roster',
      icon: GraduationCap,
      color: '#0d9488',
      link: '/institution/academicians'
    },
    {
      label: 'Campus Placement Rate',
      value: `${analytics?.placementRate ?? 0}%`,
      sub: `${analytics?.placedStudents ?? 0} Students Placed`,
      icon: TrendingUp,
      color: 'var(--success-600)',
      link: '/institution/placements'
    },
    {
      label: 'Active Industry MoUs',
      value: analytics?.activePartners ?? 0,
      sub: 'Bilateral Partnerships',
      icon: Handshake,
      color: '#7c3aed',
      link: '/institution/partners'
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ASSESSMENT': return <Award size={15} color="var(--accent-600)" />;
      case 'MOCK_INTERVIEW': return <Brain size={15} color="var(--warning-600)" />;
      case 'APPLICATION': return <Briefcase size={15} color="var(--success-600)" />;
      case 'ROADMAP_TASK': return <Layers size={15} color="var(--primary-600)" />;
      case 'COMMUNICATION': return <FileText size={15} color="#7c3aed" />;
      default: return <Activity size={15} color="var(--slate-500)" />;
    }
  };

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'ALL') return true;
    return act.action_type === activityFilter;
  });

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
            🏛️ Institutional Leadership & Governance
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            {analytics?.institutionName || user?.name || 'Academic Institution'}
          </h1>
          <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Unified dashboard monitoring enrolled students across departments, faculty academicians, live regular campus activities, skill benchmarks, and industry MoUs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/institution/students" className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Users size={16} /> Students ({analytics?.totalStudents || 0})
          </Link>
          <Link to="/institution/academicians" className="btn btn-secondary" style={{ gap: '0.4rem' }}>
            <GraduationCap size={16} /> Faculty ({analytics?.totalFaculty || 0})
          </Link>
          <Link to="/institution/skills" className="btn" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', gap: '0.4rem' }}>
            <BarChart2 size={16} /> Skill Gaps
          </Link>
          <Link to="/institution/placements" className="btn" style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700, gap: '0.4rem' }}>
            <TrendingUp size={16} /> Placements
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics (Requirement 4: number of student and see number of staffs) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem'
      }}>
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Link key={i} to={m.link} style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                height: '100%',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-600)' }}>{m.label}</span>
                  <div style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    color: m.color
                  }}>
                    <Icon size={18} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--slate-900)', lineHeight: 1 }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: m.color, fontWeight: 700, marginTop: '0.35rem' }}>
                    {m.sub}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Feature Navigation Cards */}
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
            borderLeft: '4px solid var(--primary-600)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Users size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Enrolled Students Directory
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Filter cohorts by Department, search instantly by Register Number, inspect activity logs, and contact candidates directly.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-600)', marginTop: '1rem' }}>
              View Students <ArrowRight size={14} />
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
            borderLeft: '4px solid #0d9488'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <GraduationCap size={20} color="#0d9488" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Faculty & Staffs Roster
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Manage affiliated professors across departments ({analytics?.totalFaculty || 0} registered). Onboard faculty by Employee/Reg ID and dispatch notices.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#0d9488', marginTop: '1rem' }}>
              View Faculty <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        <Link to="/institution/skills" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <BarChart2 size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Skill Gap Analytics
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Identify capability deficits between college courses and corporate expectations. Review intervention targets and bootcamps.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6', marginTop: '1rem' }}>
              Inspect Skill Gaps <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        <Link to="/institution/placements" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #10b981'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Campus Placement Portal
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Track placed students ({analytics?.placedStudents || 0} offers), upcoming on-campus placement drives, and verified package distributions.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginTop: '1rem' }}>
              View Placements <ArrowRight size={14} />
            </div>
          </div>
        </Link>
      </div>

      {/* REGULAR ACTIVITIES STREAM (Requirement 4: see regular activitys) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Institutional Regular Activity Stream & Live Student Logs
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
              Real-time feed of regular student assessments, mock interviews, roadmap milestones, and applications
            </p>
          </div>

          {/* Activity Filters */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['ALL', 'ASSESSMENT', 'MOCK_INTERVIEW', 'APPLICATION', 'COMMUNICATION'].map(f => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                className={`btn ${activityFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                {f === 'ALL' ? 'All Activities' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
              No recent regular activities match current filter.
            </div>
          ) : (
            filteredActivities.map((act, i) => (
              <div
                key={act.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '260px', flex: 1 }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getActivityIcon(act.action_type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.1rem' }}>
                      <strong>{act.user_name}</strong> {act.register_number ? `(${act.register_number})` : ''} • {act.department || 'Engineering'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span
                    className={`badge ${
                      act.action_type === 'ASSESSMENT' ? 'badge-primary' :
                      act.action_type === 'APPLICATION' ? 'badge-success' :
                      act.action_type === 'MOCK_INTERVIEW' ? 'badge-warning' : 'badge-neutral'
                    }`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {act.action_type}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {new Date(act.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Department Benchmark */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Department Benchmark: Skill Score vs Placement %
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Correlation between verified skill scores and placement success
              </p>
            </div>
            <Link to="/institution/students" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
              Students
            </Link>
          </div>

          <div style={{ width: '100%', height: 260 }}>
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

        {/* Cohort Distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Cohort Career Readiness Distribution
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Status breakdown of registered candidates across departments
              </p>
            </div>
            <Link to="/institution/placements" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
              Placements
            </Link>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={placementDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {placementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.82rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
