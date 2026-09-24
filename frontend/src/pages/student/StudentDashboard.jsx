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
  BookOpen,
  Zap,
  Info,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const ROLE_PRESETS = [
  { id: 'fullstack', label: 'Full Stack + Cloud', fullTitle: 'Full Stack Web Developer Track', roadmapId: 1 },
  { id: 'clouddevops', label: 'Cloud & DevOps', fullTitle: 'Cloud Architecture & DevOps Path', roadmapId: 3 },
  { id: 'datascience', label: 'Data Science & AI', fullTitle: 'Data Science & Machine Learning Path', roadmapId: 2 },
  { id: 'swe', label: 'Software Engineer (SWE)', fullTitle: 'Google SWE Track (L3 / Early Career)', roadmapId: 4 }
];

// Helper to provide clean persona names instead of bloated profile headlines
const getPersonaLabel = (roleStr) => {
  if (!roleStr) return 'Full Stack + Cloud';
  const lower = roleStr.toLowerCase();
  if (lower.includes('full') && lower.includes('cloud')) return 'Full Stack + Cloud';
  if (lower.includes('full') || lower.includes('web')) return 'Full Stack Developer';
  if (lower.includes('cloud') || lower.includes('devops')) return 'Cloud & DevOps';
  if (lower.includes('data') || lower.includes('ml') || lower.includes('ai')) return 'Data Science & AI';
  if (lower.includes('swe') || lower.includes('software')) return 'Software Engineering';
  if (roleStr.length > 24) return 'Full Stack + Cloud';
  return roleStr;
};

// Helper for authentic job opening titles
const getJobTitle = (roleStr, type = 'intern') => {
  const lower = (roleStr || '').toLowerCase();
  if (lower.includes('data') || lower.includes('ml') || lower.includes('ai')) {
    return type === 'intern' ? 'Machine Learning Intern' : 'Data Science Associate';
  }
  if (lower.includes('cloud') || lower.includes('devops')) {
    return type === 'intern' ? 'Cloud & DevOps Intern' : 'Cloud Platform Trainee';
  }
  if (lower.includes('swe') || lower.includes('software')) {
    return type === 'intern' ? 'Software Engineering Intern' : 'Junior Software Engineer';
  }
  return type === 'intern' ? 'Full Stack Developer Intern' : 'Junior Full Stack Engineer';
};

// Custom Tooltip with explicit gap computation and accessible styling
const CustomSkillTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGap = data.gap < 0;
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        minWidth: '190px'
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--slate-900)', marginBottom: '0.45rem' }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.82rem', color: '#2563eb', fontWeight: 600 }}>
          <span>Your Assessed Score:</span>
          <span style={{ fontWeight: 800 }}>{data.score}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginTop: '0.2rem' }}>
          <span>Industry Benchmark:</span>
          <span style={{ fontWeight: 800 }}>{data.required}%</span>
        </div>
        <div style={{
          marginTop: '0.5rem',
          paddingTop: '0.45rem',
          borderTop: '1px solid var(--slate-100)',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: isGap ? 'var(--danger-600)' : 'var(--success-600)'
        }}>
          {isGap ? `Skill Gap: ${data.gap} pts (Action required)` : `Target Met (${data.score}% >= ${data.required}%) ✓`}
        </div>
      </div>
    );
  }
  return null;
};

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
    profileCompletion: user?.profile?.profile_completed_pct || 85,
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
    const lower = (role || '').toLowerCase();
    if (lower.includes('data') || lower.includes('ml') || lower.includes('ai')) {
      return [
        { skill: 'Python', score: 85, required: 90 },
        { skill: 'SQL & DBs', score: 75, required: 85 },
        { skill: 'Data Analysis', score: 70, required: 80 },
        { skill: 'Machine Learning', score: 60, required: 80 },
        { skill: 'Math & Stats', score: 65, required: 75 },
        { skill: 'Problem Solving', score: 80, required: 85 }
      ];
    } else if (lower.includes('cloud') || lower.includes('devops') || lower.includes('enthusiast')) {
      return [
        { skill: 'Cloud (AWS/GCP)', score: 70, required: 85 },
        { skill: 'Docker', score: 65, required: 80 },
        { skill: 'CI/CD Pipelines', score: 55, required: 75 },
        { skill: 'Linux & Scripting', score: 80, required: 80 },
        { skill: 'Networking', score: 60, required: 70 },
        { skill: 'System Design', score: 50, required: 75 }
      ];
    } else if (lower.includes('software') || lower.includes('swe')) {
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
    if (user?.profile?.profile_completed_pct) {
      setSummary(prev => ({ ...prev, profileCompletion: user.profile.profile_completed_pct }));
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

  const personaLabel = getPersonaLabel(activeRole);
  const rawSkillData = getSkillDataForRole(activeRole);

  // Compute skill gaps & sort by biggest deficit (gap = score - required)
  const skillsWithGaps = rawSkillData.map(s => ({
    ...s,
    gap: s.score - s.required,
    absGap: s.required - s.score
  }));
  const sortedSkillData = [...skillsWithGaps].sort((a, b) => b.absGap - a.absGap);
  const topGaps = sortedSkillData.filter(s => s.gap < 0).slice(0, 2);

  // Mathematical consistency: Technical Skills score = average of chart bars
  const techSkillAvg = Math.round(sortedSkillData.reduce((acc, s) => acc + s.score, 0) / sortedSkillData.length);
  const targetSkillAvg = Math.round(sortedSkillData.reduce((acc, s) => acc + s.required, 0) / sortedSkillData.length);

  // Explicit, transparent Overall Readiness calculation:
  // 60% Assessed Technical Skills + 25% Active Track Tasks + 15% Profile Completeness
  const taskProgress = activeRoadmap?.progressPercentage ?? 0;
  const profileCompletionPct = summary.profileCompletion || 85;
  const calculatedReadiness = Math.round(
    (techSkillAvg * 0.60) + (taskProgress * 0.25) + (profileCompletionPct * 0.15)
  );

  const currentMilestone = activeRoadmap?.milestones?.[activeMilestoneIndex] || activeRoadmap?.milestones?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. Next Best Action Card (High Priority Recommendation) */}
      {topGaps.length > 0 && (
        <div className="card" style={{
          background: 'linear-gradient(90deg, #f0fdf4 0%, #f8fafc 100%)',
          border: '1px solid #bbf7d0',
          borderLeft: '5px solid #16a34a',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                    ⚡ NEXT BEST ACTION
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                    ⏱️ Closes biggest deficit ({topGaps[0].gap} pts)
                  </span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {topGaps[0].skill.includes('Design') 
                    ? 'Start "High-Level System Design: Caching, Sharding & Load Balancing" (10h)'
                    : topGaps[0].skill.includes('CI/CD')
                      ? 'Start "Automated Multi-Stage CI/CD Pipeline with GitHub Actions" (9h)'
                      : `Start "${topGaps[0].skill} Production Mastery Task" (8h)`}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                  Closes your largest skill gap (<strong>{topGaps[0].gap} pts in {topGaps[0].skill}</strong> vs. industry target) and directly raises candidate match for <strong>{personaLabel}</strong> openings.
                </div>
              </div>
            </div>

            <Link 
              to={activeRoadmap ? `/student/roadmap?id=${activeRoadmap.id}` : '/student/roadmap'} 
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <span>Jump to Roadmap Task</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* 2. Personalized Welcome & Career Role Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
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
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700 }}>
                🎓 Student Portal
              </span>
              <span className="badge" style={{ background: '#f59e0b', color: '#0f172a', fontSize: '0.8rem', fontWeight: 800 }}>
                🎯 Focus: {personaLabel}
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p style={{ color: '#e0e7ff', maxWidth: '650px', fontSize: '0.95rem', margin: 0, lineHeight: 1.55 }}>
              Your curriculum is customized for <strong>{personaLabel}</strong>. 
              Address high-priority skill gaps in System Design and CI/CD, complete milestone tasks, and unlock verified internship referrals.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/student/roadmap" className="btn" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700, fontSize: '0.85rem' }}>
              <Compass size={18} /> Explore All Roadmaps
            </Link>
            <Link to="/student/internships" className="btn btn-outline" style={{ borderColor: 'rgba(255, 255, 255, 0.45)', color: '#ffffff', fontSize: '0.85rem' }}>
              <Briefcase size={18} /> View Openings
            </Link>
          </div>
        </div>

        {/* Quick Role Switcher Chips with Accessible Contrast */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#e0e7ff', fontWeight: 700 }}>
            Switch Career Focus:
          </span>
          {ROLE_PRESETS.map(preset => {
            const isSelected = personaLabel.toLowerCase().includes(preset.label.toLowerCase().slice(0, 6));
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSwitchRole(preset.fullTitle)}
                style={{
                  background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
                  color: isSelected ? '#1e3a8a' : '#ffffff',
                  border: isSelected ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '20px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
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

      {/* 3. Active Personalized Roadmap Widget */}
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
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                  ACTIVE CAREER TRACK
                </span>
                {activeRoadmap?.estimated_weeks && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                    ⏱️ {activeRoadmap.estimated_weeks} Weeks
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.2rem 0 0 0' }}>
                {activeRoadmap ? activeRoadmap.title : `${personaLabel} Learning Roadmap`}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 700 }}>Track Progress</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {taskProgress}% Complete
              </div>
            </div>
            <Link 
              to={activeRoadmap ? `/student/roadmap?id=${activeRoadmap.id}` : '/student/roadmap'} 
              className="btn btn-outline" 
              style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <span>Open Roadmap Track</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Progress Bar (Exact 0% when empty, no fake 15% minimum) */}
        <div style={{ width: '100%', height: '9px', background: 'var(--slate-200)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{
            width: `${Math.max(0, Math.min(100, taskProgress))}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary-500), var(--primary-700))',
            borderRadius: '6px',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Milestone Steps Tabs */}
        {activeRoadmap?.milestones && activeRoadmap.milestones.length > 0 && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
              gap: '0.85rem',
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
                      padding: '0.9rem 1rem',
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
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isActive ? 'var(--primary-700)' : 'var(--slate-600)' }}>
                        STAGE {idx + 1}
                      </span>
                      {isAllDone ? (
                        <CheckCircle2 size={16} color="var(--success-600)" />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                          {completedTasksInM}/{totalInM} tasks
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.3 }}>
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
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--slate-900)' }}>
                    {currentMilestone.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    {currentMilestone.description}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentMilestone.tasks?.map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      style={{
                        padding: '0.9rem 1.15rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderLeft: task.is_completed ? '4px solid #16a34a' : '4px solid #3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-400)';
                        e.currentTarget.style.borderLeftColor = task.is_completed ? '#16a34a' : 'var(--primary-600)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.borderLeftColor = task.is_completed ? '#16a34a' : '#3b82f6';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {task.is_completed ? (
                          <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                        ) : (
                          <Circle size={20} color="var(--slate-400)" style={{ flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: task.is_completed ? 'var(--slate-400)' : 'var(--slate-900)',
                            textDecoration: task.is_completed ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.15rem' }}>
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                        {task.difficulty && (
                          <span className={`badge ${task.difficulty === 'HARD' ? 'badge-danger' : task.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                            {task.difficulty}
                          </span>
                        )}
                        {task.estimated_hours && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Clock size={13} /> {task.estimated_hours}h
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

      {/* 4. KPI Cards Grid with Mathematical Transparency & Clickable Applications */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Overall Readiness */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-600)' }}>Overall Readiness</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {calculatedReadiness}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--slate-600)', marginTop: '0.35rem', lineHeight: 1.35 }}>
            <strong>Formula:</strong> 60% Skills ({techSkillAvg}%) + 25% Tasks ({taskProgress}%) + 15% Profile ({profileCompletionPct}%)
          </div>
        </div>

        {/* Card 2: Technical Skills (Computed from chart) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-600)' }}>Technical Skills</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {techSkillAvg}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--slate-600)', marginTop: '0.35rem' }}>
            Average of 6 core skills (Benchmark: {targetSkillAvg}%)
          </div>
        </div>

        {/* Card 3: Clickable Applications Submitted */}
        <Link 
          to="/student/applications" 
          className="card"
          style={{
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            border: '1px solid var(--border-color)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-400)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-600)' }}>Applications Tracker</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {summary.totalApplications}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-600)', fontWeight: 700 }}>
              View all →
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.68rem', fontWeight: 700 }}>2 In Review</span>
            <span className="badge badge-success" style={{ fontSize: '0.68rem', fontWeight: 700 }}>1 Shortlisted</span>
            <span className="badge badge-warning" style={{ fontSize: '0.68rem', fontWeight: 700 }}>1 Interview</span>
          </div>
        </Link>

        {/* Card 4: Profile Completion */}
        <Link 
          to="/student/profile" 
          className="card"
          style={{ textDecoration: 'none', transition: 'all 0.2s ease', border: '1px solid var(--border-color)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-400)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-600)' }}>Profile Completion</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {profileCompletionPct}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--success-600)', fontWeight: 700, marginTop: '0.35rem' }}>
            Verified & Ready for Matching →
          </div>
        </Link>
      </div>

      {/* 5. Role Skill Demand & Internship Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        
        {/* Dynamic Skill Demand Chart: Sorted by Largest Gap First */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 800 }}>TARGET BENCHMARK</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Sorted by largest gap</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                {personaLabel} Skill Gap Analysis
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: '0.2rem 0 0 0' }}>
                Assessed score vs. industry benchmark. Priority gaps appear first.
              </p>
            </div>
            <Link 
              to="/student/assessment" 
              className="btn btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Assess Skills
            </Link>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedSkillData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate-200)" />
                <XAxis 
                  dataKey="skill" 
                  tick={{ fill: 'var(--slate-700)', fontSize: 11, fontWeight: 600 }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--slate-600)', fontSize: 11 }} />
                <Tooltip content={<CustomSkillTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontWeight: 600 }} 
                />
                <Bar 
                  dataKey="score" 
                  name="Your Score" 
                  fill="#2563eb" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="required" 
                  name="Industry Benchmark" 
                  fill="#64748b" 
                  stroke="#334155"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 2 Skill Gaps Highlight Box */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem 1.15rem',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> Top 2 Priority Skill Gaps to Close
              </span>
              <Link to="/student/skills-gap" style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700, textDecoration: 'none' }}>
                Full Breakdown →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {topGaps.map(gapItem => (
                <div key={gapItem.skill} style={{
                  background: '#ffffff',
                  border: '1px solid #ffedd5',
                  borderRadius: '8px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                      {gapItem.skill}
                    </span>
                    <span className="badge badge-danger" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                      {gapItem.gap} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                    Your Score: {gapItem.score}% • Target: {gapItem.required}%
                  </div>
                  <Link 
                    to={activeRoadmap ? `/student/roadmap?id=${activeRoadmap.id}` : '/student/roadmap'}
                    style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700, marginTop: '0.25rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    View Roadmap Task <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Curated Openings with Transparent "Why You Matched" Rationale */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  Curated Openings for {personaLabel}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                  Transparent algorithmic matching based on your assessed competencies
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              
              {/* Opening 1 */}
              <div style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
                      {getJobTitle(activeRole, 'intern')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.1rem' }}>
                      TechCorp Solutions • Bengaluru (Hybrid) • ₹25,000/mo
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 800 }}>92% Match</span>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '6px', padding: '0.55rem 0.75rem', border: '1px solid var(--slate-200)', fontSize: '0.76rem', color: 'var(--slate-700)', lineHeight: 1.4 }}>
                  <div><strong style={{ color: '#16a34a' }}>✓ Match Drivers:</strong> Strong match on React.js (78%) and Linux & Scripting (80%).</div>
                  <div style={{ marginTop: '0.2rem' }}><strong style={{ color: '#ea580c' }}>⚠️ Skill Gap:</strong> Missing Docker orchestration & CI/CD Pipelines.</div>
                </div>
              </div>

              {/* Opening 2 */}
              <div style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
                      {getJobTitle(activeRole, 'trainee')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.1rem' }}>
                      CloudScale Networks • Remote • ₹20,000/mo
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 800 }}>88% Match</span>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '6px', padding: '0.55rem 0.75rem', border: '1px solid var(--slate-200)', fontSize: '0.76rem', color: 'var(--slate-700)', lineHeight: 1.4 }}>
                  <div><strong style={{ color: '#16a34a' }}>✓ Match Drivers:</strong> Aligned on Cloud fundamentals (70%) and SQL Relational DBs (75%).</div>
                  <div style={{ marginTop: '0.2rem' }}><strong style={{ color: '#ea580c' }}>⚠️ Skill Gap:</strong> Missing System Design caching depth.</div>
                </div>
              </div>

              {/* Assessment Verification Prompt */}
              <div style={{ padding: '0.9rem', background: 'var(--primary-50, #f8faff)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Award size={16} color="var(--primary-600)" />
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-800)' }}>
                    Verify Your {personaLabel} Skills
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-700)', lineHeight: 1.4 }}>
                  Take a 15-minute AI assessment calibrated to industry standards to earn a verified credential badge.
                </div>
              </div>
            </div>
          </div>

          {/* CTAs (No duplicates) */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link to="/student/internships" className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem', justifyContent: 'center', fontWeight: 700 }}>
              Explore All Openings <ArrowRight size={16} />
            </Link>
            <Link to="/student/mock-interview" className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              Practice AI Interview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
