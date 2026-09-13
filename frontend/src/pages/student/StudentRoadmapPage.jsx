import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Compass,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Target,
  Sparkles,
  BookOpen,
  Check,
  Briefcase
} from 'lucide-react';

export const StudentRoadmapPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [roadmapDetail, setRoadmapDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'COMPANY', 'CAREER_PATH'
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmaps');
      if (res.data.success) {
        setRoadmaps(res.data.data);
        if (res.data.data.length > 0) {
          // Default to first company track or first item
          const firstCompany = res.data.data.find(r => r.type === 'COMPANY') || res.data.data[0];
          setSelectedRoadmapId(firstCompany.id);
          fetchRoadmapDetail(firstCompany.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch roadmaps', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmapDetail = async (roadmapId) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/roadmaps/${roadmapId}`);
      if (res.data.success) {
        setRoadmapDetail(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch roadmap detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectRoadmap = (id) => {
    setSelectedRoadmapId(id);
    fetchRoadmapDetail(id);
  };

  const handleToggleTask = async (taskId) => {
    if (!selectedRoadmapId || togglingTaskId) return;
    try {
      setTogglingTaskId(taskId);
      const res = await api.post(`/roadmaps/${selectedRoadmapId}/tasks/${taskId}/toggle`);
      if (res.data.success) {
        // Update local state smoothly
        setRoadmapDetail(prev => {
          if (!prev) return prev;
          let newCompleted = prev.stats.completed_tasks;
          const updatedMilestones = prev.milestones.map(m => {
            const updatedTasks = m.tasks.map(t => {
              if (t.id === taskId) {
                const toggled = !t.is_completed;
                if (toggled) newCompleted += 1;
                else newCompleted -= 1;
                return { ...t, is_completed: toggled };
              }
              return t;
            });
            return { ...m, tasks: updatedTasks };
          });

          const total = prev.stats.total_tasks || 1;
          const newPct = Math.min(100, Math.round((newCompleted / total) * 100));

          return {
            ...prev,
            milestones: updatedMilestones,
            stats: {
              ...prev.stats,
              completed_tasks: newCompleted,
              completion_percentage: newPct
            }
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle roadmap task', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const filteredRoadmaps = roadmaps.filter(r => {
    if (activeTab === 'COMPANY') return r.type === 'COMPANY';
    if (activeTab === 'CAREER_PATH') return r.type === 'CAREER_PATH';
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading Career & Company Roadmaps...</p>
      </div>
    );
  }

  const { roadmap, milestones = [], companyMatch, stats } = roadmapDetail || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', marginBottom: '0.75rem' }}>
              🎯 Interactive Milestone Navigator
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Career & Company Roadmaps
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Select target tech giants or core engineering tracks. Complete structured milestones, track your personal progress, and see exactly how your verified skills match company hiring benchmarks.
            </p>
          </div>

          {/* Quick Switch Filter */}
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.25)', padding: '0.35rem', borderRadius: 'var(--radius-md)', gap: '0.25rem' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                background: activeTab === 'ALL' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Tracks
            </button>
            <button
              onClick={() => setActiveTab('COMPANY')}
              style={{
                background: activeTab === 'COMPANY' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Building2 size={15} /> Company Roadmaps
            </button>
            <button
              onClick={() => setActiveTab('CAREER_PATH')}
              style={{
                background: activeTab === 'CAREER_PATH' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Compass size={15} /> Career Paths
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Roadmap Picker Carousel */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {filteredRoadmaps.map(r => {
          const isSelected = r.id === selectedRoadmapId;
          const isCompany = r.type === 'COMPANY';
          return (
            <div
              key={r.id}
              onClick={() => handleSelectRoadmap(r.id)}
              style={{
                minWidth: '240px',
                flex: '0 0 auto',
                padding: '1.1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-card)',
                border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{
                  backgroundColor: isCompany ? 'var(--accent-500)' : 'var(--slate-200)',
                  color: isCompany ? '#ffffff' : 'var(--slate-800)',
                  fontSize: '0.7rem'
                }}>
                  {isCompany ? (r.company_name || 'Company') : 'Career Track'}
                </span>
                {isSelected && <Check size={16} color="var(--primary-600)" strokeWidth={3} />}
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {r.title}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Clock size={13} /> {r.estimated_duration}
              </div>
            </div>
          );
        })}
      </div>

      {detailLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
          Loading track roadmap milestones & company matching analytics...
        </div>
      ) : roadmapDetail && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.75rem', alignItems: 'start' }}>
          {/* Main Milestones & Interactive Tasks Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Roadmap Header Summary Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {roadmap?.title}
                    </h2>
                    <span className="badge badge-primary">{roadmap?.difficulty_level}</span>
                  </div>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: 1.5, maxWidth: '680px' }}>
                    {roadmap?.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Target Role
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {roadmap?.target_role}
                  </div>
                </div>
              </div>

              {/* Progress Overview Bar */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    Your Roadmap Task Progress
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                    {stats?.completed_tasks || 0} of {stats?.total_tasks || 0} Tasks Completed ({stats?.completion_percentage || 0}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: 10, backgroundColor: 'var(--slate-200)', borderRadius: 5, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${stats?.completion_percentage || 0}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-600)',
                      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Milestones & Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="var(--primary-600)" /> Structured Milestone Objectives
              </h3>

              {milestones.map((milestone, mIdx) => (
                <div key={milestone.id} className="card" style={{ padding: '1.5rem' }}>
                  {/* Milestone Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        {mIdx + 1}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                          {milestone.title}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                      <Clock size={12} /> {milestone.estimated_weeks} Weeks
                    </span>
                  </div>

                  {/* Tasks Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {milestone.tasks?.map((task) => {
                      const isCompleted = task.is_completed;
                      const isBusy = togglingTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.85rem',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isCompleted ? 'var(--slate-50)' : '#ffffff',
                            border: `1px solid ${isCompleted ? 'var(--slate-200)' : 'var(--border-color)'}`,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Interactive Toggle Checkbox */}
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            disabled={isBusy}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: isBusy ? 'wait' : 'pointer',
                              padding: 0,
                              marginTop: '0.15rem',
                              color: isCompleted ? 'var(--success-600)' : 'var(--slate-400)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'color 0.15s ease'
                            }}
                            title={isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={22} />
                            ) : (
                              <Circle size={22} />
                            )}
                          </button>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <span style={{
                                fontSize: '0.92rem',
                                fontWeight: 600,
                                color: isCompleted ? 'var(--slate-500)' : 'var(--slate-800)',
                                textDecoration: isCompleted ? 'line-through' : 'none'
                              }}>
                                {task.title}
                              </span>
                              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                                  ~{task.estimated_hours}h
                                </span>
                                <span className={`badge ${task.difficulty === 'ADVANCED' ? 'badge-danger' : task.difficulty === 'INTERMEDIATE' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                                  {task.difficulty}
                                </span>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                              {task.description}
                            </p>
                            {task.resource_url && (
                              <a
                                href={task.resource_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--primary-600)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  marginTop: '0.4rem',
                                  fontWeight: 600
                                }}
                              >
                                <ExternalLink size={12} /> Reference Guide & Documentation
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Company Matching Gauge & Benchmarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Company Match Score Card */}
            <div className="card" style={{
              border: '1px solid var(--primary-200)',
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building2 size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {companyMatch?.isCompanyTrack ? `${companyMatch.company_name} Match %` : 'Track Industry Match %'}
                </h3>
              </div>

              {/* Match Dial / Gauge */}
              <div style={{
                textAlign: 'center',
                padding: '1.25rem',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-700)', lineHeight: 1 }}>
                  {companyMatch?.overallMatchPercentage || 0}%
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-800)', marginTop: '0.4rem' }}>
                  {companyMatch?.overallMatchPercentage >= 80 ? '🎯 Exceptional Fit for Hiring' : companyMatch?.overallMatchPercentage >= 60 ? '⚡ Strong Potential with Targeted Prep' : '📚 Foundation Building Recommended'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.35rem' }}>
                  Compared against {companyMatch?.benchmarks?.length || 0} required core competencies
                </div>
              </div>

              {/* Benchmark Skill Breakdown */}
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Benchmark Evaluation
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {companyMatch?.benchmarks?.map((bm, bIdx) => {
                  const studentScore = bm.student_score || 0;
                  const reqScore = bm.required_score || 0;
                  const isMet = studentScore >= reqScore;
                  return (
                    <div
                      key={bIdx}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--slate-50)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                          {bm.skill_name}
                        </span>
                        <span className={`badge ${isMet ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                          {isMet ? 'Matched' : 'Gap Identified'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.35rem' }}>
                        <span>Your Score: <strong>{studentScore}%</strong></span>
                        <span>Required: <strong>{reqScore}%</strong></span>
                      </div>

                      {/* Dual Bar */}
                      <div style={{ width: '100%', height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${studentScore}%`,
                            height: '100%',
                            backgroundColor: isMet ? 'var(--success-600)' : 'var(--warning-500)',
                            borderRadius: 3
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preparation Strategy Tip */}
            <div className="card" style={{ backgroundColor: 'var(--slate-900)', color: '#ffffff', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} color="var(--primary-400)" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  AI Recommendation
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-300)', lineHeight: 1.5 }}>
                Mark milestone tasks as completed as you study. Your progress is continuously recorded in your <strong>Digital Portfolio Activity History</strong> and showcased to prospective recruiters.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
