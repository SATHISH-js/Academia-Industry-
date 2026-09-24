import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Award, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  BarChart2, 
  AlertTriangle,
  Compass,
  CheckCircle2,
  Circle,
  Layers,
  ChevronRight,
  Target,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ROLE_PRESETS = [
  { id: 'fullstack', label: 'Full Stack Developer', roadmapId: 1 },
  { id: 'datascience', label: 'Data Scientist / ML Engineer', roadmapId: 2 },
  { id: 'clouddevops', label: 'Cloud DevOps Engineer', roadmapId: 3 },
  { id: 'swe', label: 'Software Engineer (SWE)', roadmapId: 4 }
];

export const StudentDashboard = () => {
  const { user, updateUser } = useAuth();

  // Active target role (from profile headline or default)
  const currentRole = user?.profile?.headline || 'Full Stack Developer';
  const [activeRole, setActiveRole] = useState(currentRole);

  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);

  const [summary, setSummary] = useState({
    profileCompletion: 80,
    overallScore: 74,
    techScore: 78,
    softScore: 70,
    totalApplications: 4,
    shortlisted: 2,
    activeInternships: 1,
    certifications: 3
  });

  // Role-specific skill data for chart
  const getSkillDataForRole = (role) => {
    if (role.toLowerCase().includes('data') || role.toLowerCase().includes('ml')) {
      return [
        { skill: 'Python', score: 85, required: 90 },
        { skill: 'SQL & DBs', score: 75, required: 85 },
        { skill: 'Data Analysis', score: 70, required: 80 },
        { skill: 'Machine Learning', score: 60, required: 80 },
        { skill: 'Math & Stats', score: 65, required: 75 },
        { skill: 'Problem Solving', score: 80, required: 85 }
      ];
    } else if (role.toLowerCase().includes('cloud') || role.toLowerCase().includes('devops')) {
      return [
        { skill: 'Cloud (AWS/GCP)', score: 70, required: 85 },
        { skill: 'Docker', score: 65, required: 80 },
        { skill: 'CI/CD Pipelines', score: 55, required: 75 },
        { skill: 'Linux & Scripting', score: 80, required: 80 },
        { skill: 'Networking', score: 60, required: 70 },
        { skill: 'System Design', score: 50, required: 75 }
      ];
    } else if (role.toLowerCase().includes('software') || role.toLowerCase().includes('swe')) {
      return [
        { skill: 'DSA', score: 70, required: 90 },
        { skill: 'Python/Java', score: 85, required: 85 },
        { skill: 'OOP Architecture', score: 75, required: 80 },
        { skill: 'System Design', score: 60, required: 80 },
        { skill: 'SQL', score: 75, required: 80 },
        { skill: 'Problem Solving', score: 75, required: 90 }
      ];
    }
    // Default Full Stack
    return [
      { skill: 'React.js', score: 78, required: 80 },
      { skill: 'Node & Express', score: 72, required: 80 },
      { skill: 'SQL & Relational', score: 75, required: 75 },
      { skill: 'DSA', score: 60, required: 75 },
      { skill: 'API Architecture', score: 70, required: 80 },
      { skill: 'Docker Basics', score: 55, required: 70 }
    ];
  };

  // Synchronize when user profile updates
  useEffect(() => {
    if (user?.profile?.headline) {
      setActiveRole(user.profile.headline);
    }
  }, [user]);

  // Load all roadmaps and matched active roadmap
  useEffect(() => {
    fetchRoadmaps();
  }, [activeRole]);

  const fetchRoadmaps = async () => {
    try {
      setLoadingRoadmap(true);
      const res = await api.get('/roadmaps');
      if (res.data.success) {
        const all = res.data.data || [];
        setRoadmaps(all);

        // Find best match for activeRole
        let matched = all.find(r => {
          const rText = `${r.title} ${r.target_role}`.toLowerCase();
          const target = activeRole.toLowerCase();
          if (target.includes('full') && (rText.includes('full') || rText.includes('web'))) return true;
          if (target.includes('data') && rText.includes('data')) return true;
          if (target.includes('cloud') && rText.includes('cloud')) return true;
          if (target.includes('swe') || target.includes('software')) return rText.includes('google') || rText.includes('swe');
          return rText.includes(target);
        });

        if (!matched && all.length > 0) {
          matched = all[0];
        }

        if (matched) {
          // Fetch full roadmap details with milestones and tasks
          const detailRes = await api.get(`/roadmaps/${matched.id}`);
          if (detailRes.data.success) {
            setActiveRoadmap(detailRes.data.data);
          } else {
            setActiveRoadmap(matched);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load personalized roadmap', err);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Switch role handler (persists to backend profile)
  const handleSwitchRole = async (newRoleTitle) => {
    setActiveRole(newRoleTitle);
    try {
      const res = await api.put('/auth/profile', { headline: newRoleTitle });
      if (res.data.success) {
        updateUser(res.data.data.user);
      }
    } catch (e) {
      // Continue locally
    }
  };

  // Toggle task completion directly from dashboard
  const handleToggleTask = async (taskId) => {
    if (!activeRoadmap) return;
    try {
      const res = await api.post(`/roadmaps/${activeRoadmap.id}/tasks/${taskId}/toggle`);
      if (res.data.success) {
        const nextStatus = res.data.data.is_completed;
        setActiveRoadmap(prev => {
          if (!prev) return prev;
          let newCompleted = prev.completedTasks || 0;
          const nextMilestones = prev.milestones?.map(m => ({
            ...m,
            tasks: m.tasks?.map(t => {
              if (t.id === taskId) {
                if (nextStatus && !t.is_completed) newCompleted++;
                if (!nextStatus && t.is_completed) newCompleted--;
                return { ...t, is_completed: nextStatus };
              }
              return t;
            })
          }));
          const total = prev.totalTasks || 1;
          return {
            ...prev,
            milestones: nextMilestones,
            completedTasks: newCompleted,
            progressPercentage: Math.round((newCompleted / total) * 100)
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle task status', err);
    }
  };

  const skillData = getSkillDataForRole(activeRole);
  const currentMilestone = activeRoadmap?.milestones?.[activeMilestoneIndex] || activeRoadmap?.milestones?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Personalized Welcome & Career Role Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 12px 24px -8px rgba(30, 58, 138, 0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700 }}>
                🎓 Student Portal
              </span>
              <span className="badge" style={{ background: 'var(--accent-500, #f59e0b)', color: '#0f172a', fontSize: '0.75rem', fontWeight: 800 }}>
                🎯 Focus: {activeRole}
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p style={{ color: '#93c5fd', maxWidth: '650px', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
              Your learning path is <strong>personalized</strong> for <strong>{activeRole}</strong>. 
              Track milestone tasks, close high-impact skill gaps, and explore algorithm-matched industry internships.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/student/roadmap" className="btn" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
              <Compass size={18} /> Full Career Roadmap
            </Link>
            <Link to="/student/internships" className="btn btn-outline" style={{ borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff' }}>
              <Briefcase size={18} /> View Role Openings
            </Link>
          </div>
        </div>

        {/* Quick Role Switcher Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600 }}>
            Switch Career Focus:
          </span>
          {ROLE_PRESETS.map(preset => {
            const isSelected = activeRole.toLowerCase().includes(preset.label.toLowerCase().slice(0, 8));
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSwitchRole(preset.label)}
                style={{
                  background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#1e3a8a' : '#ffffff',
                  border: isSelected ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '20px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requirement 2: Active Personalized Roadmap Widget */}
      <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--primary-200)', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  ACTIVE CAREER TRACK
                </span>
                {activeRoadmap?.estimated_weeks && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    ⏱️ {activeRoadmap.estimated_weeks} Weeks
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.15rem 0 0 0' }}>
                {activeRoadmap ? activeRoadmap.title : `${activeRole} Learning Roadmap`}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Track Progress</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {activeRoadmap?.progressPercentage || 0}% Complete
              </div>
            </div>
            <Link 
              to={activeRoadmap ? `/student/roadmap?id=${activeRoadmap.id}` : '/student/roadmap'} 
              className="btn btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <span>Full Interactive Roadmap</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{
            width: `${activeRoadmap?.progressPercentage || 15}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary-500), var(--primary-700))',
            borderRadius: '4px',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Milestone Steps Carousel / Tabs */}
        {activeRoadmap?.milestones && activeRoadmap.milestones.length > 0 && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              {activeRoadmap.milestones.map((m, idx) => {
                const isActive = activeMilestoneIndex === idx;
                const completedTasksInM = m.tasks?.filter(t => t.is_completed).length || 0;
                const totalInM = m.tasks?.length || 0;
                const isAllDone = totalInM > 0 && completedTasksInM === totalInM;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMilestoneIndex(idx)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: isActive ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                      backgroundColor: isActive ? 'var(--primary-50, #f8faff)' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? 'var(--primary-700)' : 'var(--slate-500)' }}>
                        STAGE {idx + 1}
                      </span>
                      {isAllDone ? (
                        <CheckCircle2 size={16} color="var(--success-600)" />
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                          {completedTasksInM}/{totalInM}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.25 }}>
                      {m.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Milestone Tasks Card */}
            {currentMilestone && (
              <div style={{
                background: 'var(--slate-50)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                    {currentMilestone.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                    {currentMilestone.description}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentMilestone.tasks?.map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-400)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {task.is_completed ? (
                          <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0 }} />
                        ) : (
                          <Circle size={18} color="var(--slate-400)" style={{ flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: task.is_completed ? 'var(--slate-400)' : 'var(--slate-800)',
                            textDecoration: task.is_completed ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {task.difficulty && (
                          <span className={`badge ${task.difficulty === 'HARD' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                            {task.difficulty}
                          </span>
                        )}
                        {task.estimated_hours && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                            {task.estimated_hours}h
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Overall Readiness</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.overallScore}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            Target: {activeRole}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Technical Skills</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.techScore}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Core {activeRole.split(' ')[0]} Stack
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Applications Submitted</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.totalApplications}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {summary.shortlisted} Shortlisted for Interview
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Profile Completion</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {summary.profileCompletion}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            Ready for Matching
          </div>
        </div>
      </div>

      {/* Requirement 2: Personalized Role Skill Demand & Internship Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Dynamic Skill Demand Chart for Chosen Role */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>TARGET BENCHMARK</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                {activeRole} Skill Level vs. Industry Target
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Comparing your assessed proficiency against market requirements for {activeRole}
              </p>
            </div>
            <Link to="/student/assessment" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              Assess Skills
            </Link>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate-200)" />
                <XAxis dataKey="skill" tick={{ fill: 'var(--slate-600)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--slate-600)', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" name="Your Score" fill="var(--primary-600)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Industry Target" fill="var(--slate-300)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personalized Internship & Assessment Recommendations */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                  Curated Openings for {activeRole}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Algorithm-matched internships aligned with your roadmap track
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                      Junior {activeRole} Intern
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.1rem' }}>
                      TechCorp Solutions • Bengaluru (Hybrid) • ₹25,000/mo
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>92% Match</span>
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                      {activeRole.includes('Data') ? 'AI/ML Engineering Trainee' : `${activeRole} Associate`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.1rem' }}>
                      CloudScale Networks • Remote • ₹20,000/mo
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>88% Match</span>
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--primary-50, #f8faff)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <Award size={16} color="var(--primary-600)" />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-800)' }}>
                    Verify Your {activeRole} Readiness
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                  Take a 15-minute AI assessment calibrated to industry standards to earn a verified skill credential badge.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link to="/student/internships" className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem', justifyContent: 'center' }}>
              Explore All Openings <ArrowRight size={16} />
            </Link>
            <Link to="/student/assessment" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
