import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  X,
  User,
  GraduationCap,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Compass,
  FileText,
  Mail,
  Phone,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export const StudentMonitoringModal = ({
  studentId,
  onClose,
  onOpenGuidance
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/academician/students/${studentId}`);
      if (res.data.success) {
        setDetail(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student monitoring details', err);
      setError('Unable to load student metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) return null;

  const stu = detail?.student;
  const skills = detail?.verifiedSkills || [];
  const roadmapTasks = detail?.roadmapTasks || [];
  const mockInterviews = detail?.mockInterviews || [];
  const applications = detail?.applications || [];

  const attendanceNum = stu?.attendance_percentage
    ? parseFloat(stu.attendance_percentage.replace('%', ''))
    : 85;

  const isLowAttendance = attendanceNum < 75;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 16px)',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 800,
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              {(stu?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {stu?.name || 'Student Profile'}
                </h2>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontSize: '0.75rem' }}>
                  Reg: {stu?.register_number || stu?.enrollment_number || '2026-CSE-001'}
                </span>
                {stu?.is_placed ? (
                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                    Placed ({stu.placed_company || 'Enterprise'})
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-300)', marginTop: '0.2rem' }}>
                {stu?.department} • {stu?.degree || 'B.Tech'} (Year {stu?.current_year || '3rd'}, Sem {stu?.current_semester || '6th'}, Sec {stu?.section || 'A'})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-500)' }}>
              <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
              Loading student academic monitoring indicators...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-600)' }}>{error}</div>
          ) : (
            <>
              {/* Metric Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                {/* CGPA */}
                <div className="card" style={{ padding: '1.15rem', backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Current CGPA</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                    {stu?.cgpa || '8.5'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 600, marginTop: '0.25rem' }}>
                    Scale: 10.0
                  </div>
                </div>

                {/* Attendance */}
                <div
                  className="card"
                  style={{
                    padding: '1.15rem',
                    backgroundColor: isLowAttendance ? '#fef2f2' : 'var(--slate-50)',
                    border: isLowAttendance ? '1px solid #fecaca' : '1px solid var(--slate-200)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isLowAttendance ? '#991b1b' : 'var(--slate-500)', textTransform: 'uppercase' }}>
                    Attendance Percentage
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isLowAttendance ? '#dc2626' : 'var(--slate-900)', marginTop: '0.2rem' }}>
                    {stu?.attendance_percentage || '85%'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isLowAttendance ? '#dc2626' : 'var(--slate-600)', fontWeight: 700, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {isLowAttendance ? (
                      <>
                        <AlertTriangle size={12} /> Below 75% Threshold
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} color="#16a34a" /> Compliant
                      </>
                    )}
                  </div>
                </div>

                {/* Active Backlogs */}
                <div className="card" style={{ padding: '1.15rem', backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Active Backlogs</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stu?.active_backlogs > 0 ? 'var(--danger-600)' : 'var(--slate-900)', marginTop: '0.2rem' }}>
                    {stu?.active_backlogs || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                    {stu?.active_backlogs > 0 ? 'Remedial lab needed' : 'Clean academic record'}
                  </div>
                </div>

                {/* Overall Skill Score */}
                <div className="card" style={{ padding: '1.15rem', backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Skill Benchmark</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.2rem' }}>
                    {stu?.overall_skill_score || 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                    {skills.length} verified badges
                  </div>
                </div>
              </div>

              {/* Academic Background Details */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <GraduationCap size={16} color="var(--primary-600)" /> Prior Academic Track Record
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>10th Standard:</span>{' '}
                    <strong>{stu?.tenth_percentage ? `${stu.tenth_percentage}%` : '92%'}</strong> ({stu?.tenth_board || 'CBSE'}, {stu?.tenth_school || 'Secondary School'})
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>12th Standard:</span>{' '}
                    <strong>{stu?.twelfth_percentage ? `${stu.twelfth_percentage}%` : '94%'}</strong> ({stu?.twelfth_board || 'CBSE'}, {stu?.twelfth_college || 'Senior College'})
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Email & Contact:</span>{' '}
                    <strong>{stu?.email}</strong> • {stu?.phone || '+91 98765 43210'}
                  </div>
                </div>
              </div>

              {/* Verified Technical Skills */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="var(--primary-600)" /> Verified Skill Badges & Competencies
                </h4>
                {skills.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>No skills assessed yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {skills.map((sk) => (
                      <div
                        key={sk.skill_id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          backgroundColor: 'var(--primary-50)',
                          borderRadius: 'var(--radius-md, 8px)',
                          border: '1px solid var(--primary-100)',
                          fontSize: '0.82rem'
                        }}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--primary-900)' }}>{sk.skill_name}</span>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {sk.score}% ({sk.level})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roadmap Milestones Progress */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={16} color="var(--primary-600)" /> Active Roadmap Milestones
                </h4>
                {roadmapTasks.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>No roadmap tasks recorded for this student.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {roadmapTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--slate-50)',
                          borderRadius: 'var(--radius-md, 6px)',
                          fontSize: '0.82rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {task.is_completed ? (
                            <CheckCircle2 size={16} color="#16a34a" />
                          ) : (
                            <Clock size={16} color="var(--slate-400)" />
                          )}
                          <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{task.task_title || 'Roadmap Milestone Task'}</span>
                        </div>
                        <span className={`badge ${task.is_completed ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                          {task.is_completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--slate-200)',
            backgroundColor: 'var(--slate-50)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            onClick={() => {
              onClose();
              if (onOpenGuidance && stu) onOpenGuidance(stu);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
          >
            <MessageSquare size={16} /> Direct Message & Mentorship Guidance
          </button>

          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
