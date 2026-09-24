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
  GraduationCap,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ROLE_PRESETS = [
  { id: 'fullstack', label: 'Full Stack Developer', roadmapId: 1 },
  { id: 'datascience', label: 'Data Scientist / ML Engineer', roadmapId: 2 },
  { id: 'clouddevops', label: 'Cloud DevOps Engineer', roadmapId: 3 },
  { id: 'swe', label: 'Software Engineer (SWE)', roadmapId: 4 },
  { id: 'cybersecurity', label: 'Cyber Security Analyst', roadmapId: 10 },
  { id: 'embedded', label: 'Embedded Systems & IoT', roadmapId: 11 },
  { id: 'mobile', label: 'Mobile App Developer', roadmapId: 1 }
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

  // Fresh user starts with 0 scores and 0 applications
  const [summary, setSummary] = useState({
    profileCompletion: user?.profile?.profile_completed_pct || 20,
    overallScore: user?.profile?.overall_skill_score || 0,
    techScore: user?.profile?.technical_skill_score || 0,
    softScore: user?.profile?.soft_skill_score || 0,
    totalApplications: 0,
    shortlisted: 0,
    activeInternships: 0,
    certifications: 0
  });

  const [userSkills, setUserSkills] = useState([]);

  // Faculty guidance messages
  const [facultyMessages, setFacultyMessages] = useState([]);
  const [activeReplyMsg, setActiveReplyMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState(null);

  // Role-specific benchmark skills with dynamic student scores from real assessment data
  const getSkillDataForRole = (role, assessed = []) => {
    let benchmarks = [];
    const rLower = (role || '').toLowerCase();

    if (rLower.includes('data') || rLower.includes('ml') || rLower.includes('ai')) {
      benchmarks = [
        { skill: 'Python', required: 90 },
        { skill: 'SQL & DBs', required: 85 },
        { skill: 'Data Analysis', required: 80 },
        { skill: 'Machine Learning', required: 80 },
        { skill: 'Math & Stats', required: 75 },
        { skill: 'Problem Solving', required: 85 }
      ];
    } else if (rLower.includes('cloud') || rLower.includes('devops')) {
      benchmarks = [
        { skill: 'Cloud (AWS/GCP)', required: 85 },
        { skill: 'Docker', required: 80 },
        { skill: 'CI/CD Pipelines', required: 75 },
        { skill: 'Linux & Scripting', required: 80 },
        { skill: 'Networking', required: 70 },
        { skill: 'System Design', required: 75 }
      ];
    } else if (rLower.includes('software') || rLower.includes('swe')) {
      benchmarks = [
        { skill: 'DSA', required: 90 },
        { skill: 'Python/Java', required: 85 },
        { skill: 'OOP Architecture', required: 80 },
        { skill: 'System Design', required: 80 },
        { skill: 'SQL', required: 80 },
        { skill: 'Problem Solving', required: 90 }
      ];
    } else if (rLower.includes('cyber') || rLower.includes('security')) {
      benchmarks = [
        { skill: 'Network Security', required: 85 },
        { skill: 'OWASP Defense', required: 80 },
        { skill: 'Linux & Systems', required: 80 },
        { skill: 'Cryptography', required: 75 },
        { skill: 'Wireshark & Audit', required: 80 },
        { skill: 'Python Scripting', required: 75 }
      ];
    } else if (rLower.includes('embedded') || rLower.includes('iot')) {
      benchmarks = [
        { skill: 'Embedded C/C++', required: 85 },
        { skill: 'ARM Cortex', required: 80 },
        { skill: 'RTOS Concurrency', required: 75 },
        { skill: 'I2C/SPI Protocols', required: 80 },
        { skill: 'Hardware Debug', required: 75 },
        { skill: 'IoT Telemetry', required: 70 }
      ];
    } else {
      // Default Full Stack
      benchmarks = [
        { skill: 'React.js', required: 80 },
        { skill: 'Node & Express', required: 80 },
        { skill: 'SQL & Relational', required: 75 },
        { skill: 'DSA', required: 75 },
        { skill: 'API Architecture', required: 80 },
        { skill: 'Docker Basics', required: 70 }
      ];
    }

    // Map real scores: if not assessed, score is 0
    return benchmarks.map(b => {
      const match = assessed.find(a => 
        (a.skill_name && a.skill_name.toLowerCase().includes(b.skill.toLowerCase().slice(0, 4))) ||
        (b.skill.toLowerCase().includes((a.skill_name || '').toLowerCase()))
      );
      return {
        skill: b.skill,
        score: match ? (match.score || 0) : 0,
        required: b.required
      };
    });
  };

  // Synchronize when user profile updates
  useEffect(() => {
    if (user?.profile?.headline) {
      setActiveRole(user.profile.headline);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardSummary();
    fetchStudentSkills();
    fetchRoadmaps();
    fetchFacultyMessages();
  }, [activeRole]);

  const fetchDashboardSummary = async () => {
    try {
      const res = await api.get('/student/dashboard-summary');
      if (res.data.success && res.data.data) {
        setSummary(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (e) {
      // Keep existing state
    }
  };

  const fetchStudentSkills = async () => {
    try {
      const res = await api.get('/student/skills');
      if (res.data.success) {
        setUserSkills(res.data.data || []);
      }
    } catch (e) {
      // Keep empty
    }
  };

  const fetchFacultyMessages = async () => {
    try {
      const res = await api.get('/student/faculty-guidance');
      if (res.data.success) {
        setFacultyMessages(res.data.data || []);
      }
    } catch (e) {
      // Continue without faculty messages
    }
  };

  const handleSendFacultyReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !activeReplyMsg || sendingReply) return;
    try {
      setSendingReply(true);
      const res = await api.post('/student/faculty-guidance/reply', {
        academician_id: activeReplyMsg.academician_id,
        subject: `Re: ${activeReplyMsg.subject || 'Faculty Mentorship'}`,
        message: replyText.trim()
      });
      if (res.data.success) {
        setReplyFeedback('Your response has been sent to faculty!');
        setReplyText('');
        fetchFacultyMessages();
        setTimeout(() => {
          setReplyFeedback(null);
          setActiveReplyMsg(null);
        }, 3000);
      }
    } catch (err) {
      setReplyFeedback('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const fetchRoadmaps = async () => {
    try {
      setLoadingRoadmap(true);
      const res = await api.get('/roadmaps');
      if (res.data.success) {
        const all = res.data.data || [];
        setRoadmaps(all);

        // Find best match for activeRole
        let matched = all.find(r => {
          const rTitle = (r.title || '').toLowerCase();
          const rTarget = (r.target_role || '').toLowerCase();
          const rText = `${rTitle} ${rTarget}`;
          const target = activeRole.toLowerCase();

          if ((target.includes('full') || target.includes('web') || target.includes('mern')) && (rText.includes('full') || rText.includes('web'))) return true;
          if ((target.includes('data') || target.includes('ml') || target.includes('ai')) && (rText.includes('data') || rText.includes('machine') || rText.includes('ai'))) return true;
          if ((target.includes('cloud') || target.includes('devops')) && (rText.includes('cloud') || rText.includes('devops'))) return true;
          if ((target.includes('cyber') || target.includes('security')) && (rText.includes('cyber') || rText.includes('security'))) return true;
          if ((target.includes('embedded') || target.includes('iot')) && (rText.includes('embedded') || rText.includes('iot'))) return true;
          if ((target.includes('mobile') || target.includes('flutter')) && (rText.includes('mobile') || rText.includes('app'))) return true;
          if ((target.includes('swe') || target.includes('software')) && (rText.includes('swe') || rText.includes('software') || rText.includes('google'))) return true;
          return rText.includes(target) || (rTarget && target.includes(rTarget));
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
      const res = await api.put('/auth/profile', { headline: newRoleTitle, target_role: newRoleTitle });
      if (res.data.success && res.data.data?.user) {
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

  const skillData = getSkillDataForRole(activeRole, userSkills);
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

      {/* Faculty Academic Guidance & Department Mentorship Widget (Requirement 1) */}
      {facultyMessages.length > 0 && (
        <div
          className="card"
          style={{
            padding: '1.5rem 1.75rem',
            border: '1.5px solid var(--primary-300)',
            backgroundColor: 'var(--primary-50, #f8fafc)',
            boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
                  Faculty Mentorship & Department Guidance ({facultyMessages.length})
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                  Direct academic advisories and milestone feedback from your department professors
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {facultyMessages.slice(0, 3).map((m) => {
              const isWarning = m.message_type === 'ACADEMIC_WARNING';
              return (
                <div
                  key={m.id}
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md, 10px)',
                    border: isWarning ? '1.5px solid #fecaca' : '1px solid var(--slate-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                        {m.academician_name} ({m.designation || 'Faculty'}, {m.department})
                      </span>
                      <span className={`badge ${isWarning ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.68rem' }}>
                        {m.message_type || 'GUIDANCE'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <button
                        onClick={() => {
                          setActiveReplyMsg(m);
                          setReplyText('');
                          setReplyFeedback(null);
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <MessageSquare size={12} /> Reply to Faculty
                      </button>
                    </div>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-800)' }}>
                    {m.subject || 'Academic Guidance'}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: 0, lineHeight: 1.5 }}>
                    "{m.message}"
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Drawer / Modal */}
          {activeReplyMsg && (
            <form
              onSubmit={handleSendFacultyReply}
              style={{
                marginTop: '1rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--primary-400)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  Replying to {activeReplyMsg.academician_name} regarding "{activeReplyMsg.subject}"
                </span>
                <button
                  type="button"
                  onClick={() => setActiveReplyMsg(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                >
                  <X size={16} />
                </button>
              </div>

              <textarea
                className="form-control"
                placeholder="Type your response or update on your milestone progress..."
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {replyFeedback ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--success-700)', fontWeight: 600 }}>
                    {replyFeedback}
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {sendingReply ? 'Sending...' : (
                    <>
                      <Send size={13} /> Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

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

          {userSkills.length === 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--primary-50, #eef2ff)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--primary-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                  <strong>Fresh Student Account:</strong> 0 skills assessed yet. Complete your first role assessment for <strong>{activeRole}</strong> to earn verified points!
                </span>
              </div>
              <Link to="/student/assessment" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                Take Skill Assessment
              </Link>
            </div>
          )}
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
