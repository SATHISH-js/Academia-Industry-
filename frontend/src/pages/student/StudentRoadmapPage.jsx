import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Target,
  Sparkles,
  BookOpen,
  Check,
  Briefcase,
  ShieldCheck,
  HelpCircle,
  X,
  RotateCcw,
  FileCheck,
  Copy,
  Search,
  Filter,
  Layers,
  GraduationCap,
  Star,
  CheckCircle,
  Share2
} from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D'];

const DEPARTMENTS = [
  { id: 'ALL', label: 'All Departments' },
  { id: 'Computer Science & Engineering', label: 'CSE (Computer Science)' },
  { id: 'Information Technology', label: 'IT (Information Tech)' },
  { id: 'Artificial Intelligence & Data Science', label: 'AI & Data Science' },
  { id: 'Electronics & Communication Engineering', label: 'ECE (Electronics)' },
  { id: 'Electrical & Electronics Engineering', label: 'EEE (Electrical)' },
  { id: 'Mechanical Engineering', label: 'MECH (Mechanical)' },
  { id: 'Civil Engineering', label: 'CIVIL (Civil & BIM)' }
];

const DOMAINS = [
  { id: 'ALL', label: 'All Specializations' },
  { id: 'MERN Full Stack', label: 'Full Stack: MERN Stack' },
  { id: 'Java Enterprise Full Stack', label: 'Full Stack: Java & Spring Boot' },
  { id: 'Python Cloud Full Stack', label: 'Full Stack: Python & FastAPI' },
  { id: 'AI & Machine Learning', label: 'AI & Machine Learning' },
  { id: 'Cloud & DevOps SRE', label: 'Cloud Architecture & DevOps' },
  { id: 'Cyber Security & Forensics', label: 'Cyber Security & Forensics' },
  { id: 'Embedded Systems & IoT', label: 'Embedded Systems & IoT' },
  { id: 'VLSI & Chip Design', label: 'VLSI & Chip Design' },
  { id: 'Electric Vehicles & Powertrain', label: 'EV Powertrain & BMS' },
  { id: 'Robotics & Automation', label: 'Robotics & Automation' },
  { id: 'Smart Infrastructure & BIM', label: 'Smart Infra & BIM' },
  { id: 'Top Tech Companies', label: 'Big Tech SDE / SWE' }
];

const LOADING_MESSAGES = [
  'Extracting key concepts and syllabus topics…',
  'Generating 20 rigorous domain-specific questions…',
  'Calibrating question difficulty & explanations…',
  'Initializing 10-minute timed verification session…',
  'Almost ready — get set to test your mastery…'
];

function formatTime(totalSeconds) {
  const m = Math.floor(Math.max(0, totalSeconds) / 60).toString().padStart(2, '0');
  const s = Math.floor(Math.max(0, totalSeconds) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ScoreRing({ percentage, badgeAwarded }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const ringColor = badgeAwarded ? '#4f46e5' : percentage >= 60 ? '#10b981' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          {percentage}%
        </span>
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
          {badgeAwarded ? '🏆 MASTERY' : percentage >= 60 ? '✅ PASSED' : 'NEEDS PRACTICE'}
        </span>
      </div>
    </div>
  );
}

export const StudentRoadmapPage = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [roadmapDetail, setRoadmapDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'RECOMMENDED', 'COMPANY', 'CAREER_PATH'
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 20-Question Topic Assessment Modal States
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentError, setAssessmentError] = useState('');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(600); // 10 minutes
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const autoSubmittedRef = useRef(false);

  // Cycling loading phrases
  useEffect(() => {
    if (!assessmentLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [assessmentLoading]);

  // 10-Minute Assessment Countdown Timer
  useEffect(() => {
    if (!assessmentModalOpen || assessmentLoading || quizResult || !assessmentData) return;
    if (quizTimeLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        handleSubmitAssessment(true);
      }
      return;
    }
    const timer = setTimeout(() => {
      setQuizTimeLeft(t => t - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [assessmentModalOpen, assessmentLoading, quizTimeLeft, quizResult, assessmentData]);

  useEffect(() => {
    fetchRoadmaps();
  }, [selectedDept, selectedDomain]);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (selectedDomain !== 'ALL') params.domain = selectedDomain;

      const res = await api.get('/roadmaps', { params });
      if (res.data.success) {
        const list = res.data.data;
        setRoadmaps(list);
        if (list.length > 0) {
          // Keep current selected if still present, or pick first recommended or first item
          const stillExists = list.find(r => r.id === selectedRoadmapId);
          if (stillExists) {
            fetchRoadmapDetail(selectedRoadmapId);
          } else {
            const recommended = list.find(r => r.isRecommended) || list[0];
            setSelectedRoadmapId(recommended.id);
            fetchRoadmapDetail(recommended.id);
          }
        } else {
          setRoadmapDetail(null);
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

  // Manual Checkbox Toggle
  const handleToggleTask = async (taskId) => {
    if (!selectedRoadmapId || togglingTaskId) return;
    try {
      setTogglingTaskId(taskId);
      const res = await api.post(`/roadmaps/${selectedRoadmapId}/tasks/${taskId}/toggle`);
      if (res.data.success) {
        const isNowCompleted = res.data.data.is_completed;
        setRoadmapDetail(prev => {
          if (!prev) return prev;
          let newCompleted = prev.completedTasks || prev.stats?.completed_tasks || 0;
          const updatedMilestones = prev.milestones.map(m => {
            const updatedTasks = m.tasks.map(t => {
              if (t.id === taskId) {
                if (isNowCompleted && !t.is_completed) newCompleted += 1;
                else if (!isNowCompleted && t.is_completed) newCompleted -= 1;
                return { ...t, is_completed: isNowCompleted };
              }
              return t;
            });
            return { ...m, tasks: updatedTasks };
          });

          const total = prev.totalTasks || prev.stats?.total_tasks || 1;
          const newPct = Math.min(100, Math.round((newCompleted / total) * 100));

          return {
            ...prev,
            milestones: updatedMilestones,
            completedTasks: newCompleted,
            progressPercentage: newPct,
            stats: {
              ...prev.stats,
              completed_tasks: newCompleted,
              completion_percentage: newPct
            }
          };
        });

        // Update roadmaps list card
        setRoadmaps(prev => prev.map(r => {
          if (r.id === selectedRoadmapId) {
            const total = r.total_tasks || 1;
            const curDone = r.completedTasks || 0;
            const updatedDone = isNowCompleted ? curDone + 1 : Math.max(0, curDone - 1);
            return {
              ...r,
              completedTasks: updatedDone,
              progressPercentage: Math.min(100, Math.round((updatedDone / total) * 100))
            };
          }
          return r;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle roadmap task', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Open 20-Question Topic Assessment Modal
  const handleOpenAssessment = async (task, milestone) => {
    setAssessmentModalOpen(true);
    setAssessmentLoading(true);
    setAssessmentError('');
    setAssessmentData(null);
    setQuizResult(null);
    setQuizAnswers({});
    setCurrentQIndex(0);
    setQuizTimeLeft(600);
    setShowReview(false);
    setConfirmSubmitOpen(false);
    autoSubmittedRef.current = false;

    try {
      const res = await api.get(`/roadmaps/${selectedRoadmapId}/tasks/${task.id}/assessment`);
      if (res.data.success) {
        setAssessmentData(res.data.data);
      } else {
        setAssessmentError(res.data.message || 'Failed to generate assessment questions');
      }
    } catch (err) {
      console.error('Failed to start topic assessment', err);
      setAssessmentError(err.response?.data?.message || err.message || 'Unable to connect to assessment service');
    } finally {
      setAssessmentLoading(false);
    }
  };

  const handleSelectOption = (qId, letter) => {
    if (quizResult || quizSubmitting) return;
    setQuizAnswers(prev => ({
      ...prev,
      [qId]: letter
    }));
  };

  // Submit 20-Question Assessment
  const handleSubmitAssessment = async (force = false) => {
    if (!assessmentData || quizSubmitting) return;

    const totalQuestions = assessmentData.questions?.length || 20;
    const answeredCount = Object.keys(quizAnswers).length;

    if (!force && answeredCount < totalQuestions && !confirmSubmitOpen) {
      setConfirmSubmitOpen(true);
      return;
    }

    try {
      setQuizSubmitting(true);
      setConfirmSubmitOpen(false);
      const res = await api.post(
        `/roadmaps/${assessmentData.roadmapId}/tasks/${assessmentData.taskId}/assessment/submit`,
        {
          sessionId: assessmentData.sessionId,
          answers: quizAnswers
        }
      );

      if (res.data.success) {
        const resultData = res.data.data;
        setQuizResult(resultData);

        // Core Requirement #1: AUTOMATICALLY check list item & update roadmap progress dynamically
        setRoadmapDetail(prev => {
          if (!prev) return prev;
          const updatedMilestones = prev.milestones.map(m => {
            const updatedTasks = m.tasks.map(t => {
              if (t.id === resultData.taskId) {
                return {
                  ...t,
                  is_completed: true,
                  score_percentage: resultData.scorePercentage,
                  badge_awarded: resultData.badgeAwarded,
                  verification_code: resultData.verificationCode
                };
              }
              return t;
            });
            return { ...m, tasks: updatedTasks };
          });

          return {
            ...prev,
            milestones: updatedMilestones,
            completedTasks: resultData.updatedProgress?.completedTasks ?? prev.completedTasks,
            progressPercentage: resultData.updatedProgress?.completionPercentage ?? prev.progressPercentage,
            stats: {
              ...prev.stats,
              completed_tasks: resultData.updatedProgress?.completedTasks,
              completion_percentage: resultData.updatedProgress?.completionPercentage
            }
          };
        });

        // Update roadmaps list carousel
        setRoadmaps(prev => prev.map(r => {
          if (r.id === resultData.roadmapId) {
            return {
              ...r,
              completedTasks: resultData.updatedProgress?.completedTasks,
              progressPercentage: resultData.updatedProgress?.completionPercentage
            };
          }
          return r;
        }));
      }
    } catch (err) {
      console.error('Failed to submit assessment', err);
      alert('Error submitting assessment: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!quizResult && Object.keys(quizAnswers).length > 0 && quizTimeLeft > 0) {
      if (!window.confirm('You have an active assessment in progress. Are you sure you want to exit? Your answers will be lost.')) {
        return;
      }
    }
    setAssessmentModalOpen(false);
    setAssessmentData(null);
    setQuizResult(null);
  };

  const copyVerificationCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter Roadmaps
  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(r => {
      // Category / Type Tab
      if (activeTab === 'COMPANY') {
        const isCompany = r.category === 'COMPANY_TRACK' || r.type === 'COMPANY' || Boolean(r.company_name);
        if (!isCompany) return false;
      }
      if (activeTab === 'CAREER_PATH') {
        const isPath = r.category === 'CAREER_PATH' || r.type === 'CAREER_PATH' || !r.company_name;
        if (!isPath) return false;
      }
      if (activeTab === 'RECOMMENDED') {
        if (!r.isRecommended) return false;
      }

      // Department Filter
      if (selectedDept !== 'ALL') {
        const d = (r.department || '').toLowerCase();
        const sel = selectedDept.toLowerCase();
        if (d !== 'all' && !d.includes(sel) && !sel.includes(d)) return false;
      }

      // Domain Filter
      if (selectedDomain !== 'ALL') {
        if (r.domain !== selectedDomain) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (r.title || '').toLowerCase().includes(q);
        const matchRole = (r.target_role || '').toLowerCase().includes(q);
        const matchCompany = (r.company_name || '').toLowerCase().includes(q);
        const matchDept = (r.department || '').toLowerCase().includes(q);
        const matchDomain = (r.domain || '').toLowerCase().includes(q);
        if (!matchTitle && !matchRole && !matchCompany && !matchDept && !matchDomain) return false;
      }

      return true;
    });
  }, [roadmaps, activeTab, selectedDept, selectedDomain, searchQuery]);

  // Selected Roadmap details normalization
  const roadmapInfo = roadmapDetail?.roadmap || roadmapDetail;
  const milestones = roadmapDetail?.milestones || [];
  const companyMatch = roadmapDetail?.companyMatch;
  const totalTasks = roadmapDetail?.totalTasks ?? roadmapDetail?.stats?.total_tasks ?? 0;
  const completedTasks = roadmapDetail?.completedTasks ?? roadmapDetail?.stats?.completed_tasks ?? 0;
  const progressPercentage = roadmapDetail?.progressPercentage ?? roadmapDetail?.stats?.completion_percentage ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: '1 1 600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', fontWeight: 700, padding: '0.35rem 0.75rem' }}>
                🎯 Department & Domain Milestone Engine
              </span>
              {user?.department && (
                <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.4)', color: '#e0e7ff', border: '1px solid rgba(165, 180, 252, 0.4)' }}>
                  <GraduationCap size={13} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> {user.department}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
              Personalized Career & Topic Roadmaps
            </h1>
            <p style={{ color: '#c7d2fe', fontSize: '0.96rem', lineHeight: 1.6, maxWidth: '720px' }}>
              Master structured milestones across all engineering college departments. Complete every topic through our 
              <strong> 20-Question Timed Assessment</strong> to automatically update your progress and earn verifiable mastery credentials.
            </p>
          </div>

          {/* Quick Switch Filter Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: '0.35rem', borderRadius: 'var(--radius-md)', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                background: activeTab === 'ALL' ? '#4f46e5' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Tracks ({roadmaps.length})
            </button>
            <button
              onClick={() => setActiveTab('RECOMMENDED')}
              style={{
                background: activeTab === 'RECOMMENDED' ? '#4f46e5' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 0.9rem',
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
              <Star size={14} color="#facc15" fill="#facc15" /> Recommended for You
            </button>
            <button
              onClick={() => setActiveTab('COMPANY')}
              style={{
                background: activeTab === 'COMPANY' ? '#4f46e5' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 0.9rem',
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
              <Building2 size={14} /> Big Tech Roadmaps
            </button>
            <button
              onClick={() => setActiveTab('CAREER_PATH')}
              style={{
                background: activeTab === 'CAREER_PATH' ? '#4f46e5' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 0.9rem',
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
              <Compass size={14} /> Domain Specializations
            </button>
          </div>
        </div>

        {/* Filter Controls Row: Search + Department + Domain */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Real-time search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by topic, role, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: '#1e1b4b',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id} style={{ background: '#1e293b', color: '#ffffff' }}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: '#1e1b4b',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {DOMAINS.map(dm => (
                <option key={dm.id} value={dm.id} style={{ background: '#1e293b', color: '#ffffff' }}>
                  {dm.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Roadmap Picker Strip */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary-600)" />
            Available Curriculum Tracks ({filteredRoadmaps.length})
          </h2>
          {(selectedDept !== 'ALL' || selectedDomain !== 'ALL' || searchQuery) && (
            <button
              onClick={() => { setSelectedDept('ALL'); setSelectedDomain('ALL'); setSearchQuery(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredRoadmaps.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Filter size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
            <p style={{ fontWeight: 600 }}>No roadmaps match the selected department or domain criteria.</p>
            <button
              onClick={() => { setSelectedDept('ALL'); setSelectedDomain('ALL'); setSearchQuery(''); }}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '1rem' }}
            >
              View All Roadmaps
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            scrollbarWidth: 'thin'
          }}>
            {filteredRoadmaps.map(r => {
              const isSelected = r.id === selectedRoadmapId;
              const isCompany = r.category === 'COMPANY_TRACK' || Boolean(r.company_name);
              const pct = r.progressPercentage || 0;
              const done = r.completedTasks || 0;
              const tot = r.total_tasks || 0;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRoadmap(r.id)}
                  style={{
                    minWidth: '280px',
                    maxWidth: '320px',
                    flex: '0 0 auto',
                    padding: '1.15rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                    border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.65rem',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{
                          backgroundColor: isCompany ? '#0284c7' : '#e0e7ff',
                          color: isCompany ? '#ffffff' : '#3730a3',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          {isCompany ? (r.company_name || 'Big Tech') : 'Curriculum Track'}
                        </span>
                        {r.isRecommended && (
                          <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Star size={11} fill="#d97706" color="#d97706" /> Recommended
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={13} color="#ffffff" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.35, marginBottom: '0.35rem' }}>
                      {r.title}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Target size={13} color="var(--primary-600)" /> {r.target_role}
                    </div>
                  </div>

                  <div>
                    {/* Domain & Department Tag */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{r.domain || 'Engineering'}</span>
                      <span>{r.estimated_weeks ? `${r.estimated_weeks} Wks` : r.estimated_duration || 'Self-paced'}</span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                        <span>Progress</span>
                        <span>{done}/{tot} Tasks ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? 'var(--success-600)' : 'var(--primary-600)', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailLoading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
          <p style={{ fontWeight: 600 }}>Loading track milestones & topic verification engine...</p>
        </div>
      ) : roadmapDetail && (
        <div className="roadmap-detail-grid">
          {/* Main Milestones & Tasks Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Summary Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {roadmapInfo?.title}
                    </h2>
                    <span className="badge badge-primary">{roadmapInfo?.difficulty || roadmapInfo?.difficulty_level || 'INTERMEDIATE'}</span>
                    {roadmapInfo?.department && (
                      <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                        {roadmapInfo.department}
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: 1.55, maxWidth: '700px' }}>
                    {roadmapInfo?.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Target Career Role
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {roadmapInfo?.target_role}
                  </div>
                </div>
              </div>

              {/* Progress Overview Bar */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    Overall Track Completion
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: progressPercentage === 100 ? 'var(--success-600)' : 'var(--primary-600)' }}>
                    {completedTasks} of {totalTasks} Tasks Verified ({progressPercentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: 10, backgroundColor: 'var(--slate-200)', borderRadius: 5, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progressPercentage}%`,
                      height: '100%',
                      backgroundColor: progressPercentage === 100 ? 'var(--success-600)' : 'var(--primary-600)',
                      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Milestones & Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={22} color="var(--primary-600)" /> Structured Milestone Objectives
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  Take 20-Q assessments on each topic to verify mastery automatically
                </span>
              </div>

              {milestones.map((milestone, mIdx) => (
                <div key={milestone.id} className="card" style={{ padding: '1.5rem' }}>
                  {/* Milestone Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
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
                      <Clock size={12} /> {milestone.estimated_weeks || 2} Weeks
                    </span>
                  </div>

                  {/* Tasks Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {milestone.tasks?.map((task) => {
                      const isCompleted = task.is_completed;
                      const isBusy = togglingTaskId === task.id;
                      const hasBadge = task.badge_awarded;
                      const hasScore = task.score_percentage !== null && task.score_percentage !== undefined;

                      return (
                        <div
                          key={task.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            padding: '1rem 1.15rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isCompleted ? 'var(--slate-50)' : '#ffffff',
                            border: `1px solid ${isCompleted ? 'var(--success-500)' : 'var(--border-color)'}`,
                            boxShadow: isCompleted ? '0 1px 3px rgba(16, 185, 129, 0.1)' : 'var(--shadow-sm)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                            {/* Checkbox */}
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
                                flexShrink: 0
                              }}
                              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete manually'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={24} color="#059669" />
                              ) : (
                                <Circle size={24} />
                              )}
                            </button>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{
                                  fontSize: '0.96rem',
                                  fontWeight: 700,
                                  color: isCompleted ? 'var(--slate-700)' : 'var(--slate-900)'
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

                              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', marginTop: '0.3rem', lineHeight: 1.45 }}>
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
                                  <ExternalLink size={12} /> Reference Documentation
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Verification & 20-Q Assessment Action Footer */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            paddingTop: '0.6rem',
                            borderTop: '1px dashed var(--border-light)',
                            marginTop: '0.2rem'
                          }}>
                            {/* Status Chip */}
                            {isCompleted && hasScore ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.6rem' }}>
                                  <CheckCircle size={13} /> Verified: {task.score_percentage}% Score
                                </span>
                                {hasBadge && (
                                  <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Award size={13} color="#d97706" /> Mastery Badge
                                  </span>
                                )}
                                {task.verification_code && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                                    ID: {task.verification_code}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} color="var(--primary-600)" />
                                Complete 20 topic-specific questions in 10 minutes to verify competency
                              </div>
                            )}

                            {/* Action Button: Verify Topic or Retake */}
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                onClick={() => handleOpenAssessment(task, milestone)}
                                className={isCompleted && hasScore ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 700
                                }}
                              >
                                <ShieldCheck size={14} />
                                {isCompleted && hasScore ? 'Retake 20-Q Assessment' : 'Verify Topic (20-Q Assessment)'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Company & Skill Match */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Match Score Card */}
            <div className="card" style={{
              border: '1px solid var(--primary-200)',
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building2 size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {companyMatch?.companyName || 'Target Industry'} Match
                </h3>
              </div>

              {/* Gauge */}
              <div style={{
                textAlign: 'center',
                padding: '1.25rem',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-700)', lineHeight: 1 }}>
                  {companyMatch?.score || 0}%
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-800)', marginTop: '0.4rem' }}>
                  {(companyMatch?.score || 0) >= 80 ? '🎯 Exceptional Fit for Hiring' : (companyMatch?.score || 0) >= 60 ? '⚡ Strong Match with Targeted Prep' : '📚 Foundation Building Recommended'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.35rem' }}>
                  Calculated against industry skill benchmarks
                </div>
              </div>

              {/* Matched Skills */}
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                Skills Analysis
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {companyMatch?.matchedSkills?.length > 0 ? (
                  companyMatch.matchedSkills.map((sk, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#166534' }}>
                        {sk.skill_name}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        Score: {sk.score}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
                    Complete topic assessments above to build your matched skills.
                  </div>
                )}

                {companyMatch?.missingSkills?.slice(0, 4).map((sk, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                      {sk.skill_name}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      Required: {sk.min_required_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Career Coaching Card */}
            <div className="card" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '1.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <Sparkles size={16} color="#818cf8" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                  Smart Verification Method
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                Passing each 20-question assessment automatically ticks off the roadmap task, recalculates your completion percentage, 
                and registers a tamper-proof certificate in your <strong>Certificate Verifier</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 20-QUESTION TOPIC ASSESSMENT MODAL (Core User Requirement #1)            */}
      {/* ========================================================================= */}
      {assessmentModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#818cf8" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {assessmentData?.taskTitle ? `${assessmentData.taskTitle} Mastery` : 'Topic Assessment'}
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.15rem' }}>
                    <span>20 Domain Questions</span> • 
                    <span>10-Minute Timer</span> • 
                    <span>Automatic Roadmap Verification</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Timer Badge (Only when quiz is active) */}
                {assessmentData && !quizResult && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: quizTimeLeft < 120 ? '#dc2626' : 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em'
                  }}>
                    <Clock size={16} />
                    {formatTime(quizTimeLeft)}
                  </div>
                )}

                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.35rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close Assessment"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {assessmentLoading ? (
                <div style={{ padding: '3.5rem', textAlign: 'center' }}>
                  <Sparkles size={36} className="animate-spin" style={{ margin: '0 auto 1.25rem', color: 'var(--primary-600)' }} />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                    Preparing Your 20-Question Assessment
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', maxWidth: '480px', margin: '0 auto' }}>
                    {LOADING_MESSAGES[loadingMsgIndex]}
                  </p>
                </div>
              ) : assessmentError ? (
                <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 1rem', color: 'var(--danger-600)' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                    Assessment Generation Error
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                    {assessmentError}
                  </p>
                  <button onClick={() => handleOpenAssessment({ id: assessmentData?.taskId, title: assessmentData?.taskTitle })} className="btn btn-primary">
                    <RotateCcw size={16} /> Retry Assessment
                  </button>
                </div>
              ) : quizResult ? (
                /* ================= RESULTS VIEW ================= */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Score & Verdict Banner */}
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem 1.5rem',
                    backgroundColor: quizResult.passed ? 'var(--primary-50)' : '#fef2f2',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${quizResult.passed ? 'var(--primary-200)' : '#fecaca'}`
                  }}>
                    <ScoreRing percentage={quizResult.scorePercentage} badgeAwarded={quizResult.badgeAwarded} />

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: quizResult.passed ? 'var(--slate-900)' : 'var(--danger-700)', marginTop: '1.25rem' }}>
                      {quizResult.badgeAwarded
                        ? '🎉 Outstanding Mastery! Skill Badge Awarded!'
                        : quizResult.passed
                        ? '✅ Assessment Passed! Competency Verified!'
                        : '⚠️ Score Below Passing Threshold (60%)'}
                    </h3>

                    <p style={{ fontSize: '0.92rem', color: 'var(--slate-600)', maxWidth: '600px', margin: '0.5rem auto 1.25rem', lineHeight: 1.5 }}>
                      You answered <strong>{quizResult.correctCount} of {quizResult.totalQuestions} questions correctly</strong>.
                      {quizResult.passed && ' This task has been automatically marked as COMPLETED in your roadmap.'}
                    </p>

                    {/* Verification Code Box */}
                    {quizResult.verificationCode && (
                      <div style={{
                        maxWidth: '520px',
                        margin: '0 auto',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#ffffff',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{ textAlign: 'left', minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Certificate Verification Code
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {quizResult.verificationCode}
                          </div>
                        </div>

                        <button
                          onClick={() => copyVerificationCode(quizResult.verificationCode)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
                        >
                          {copiedCode ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                          {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Roadmap Update Alert */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: '#ecfdf5',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: '0.88rem', color: '#065f46' }}>
                      <strong>Automatic Roadmap Sync:</strong> "{assessmentData?.taskTitle}" is now checked off. 
                      Your roadmap progress is now <strong>{quizResult.updatedProgress?.completionPercentage || progressPercentage}%</strong>.
                    </div>
                  </div>

                  {/* Question Review Toggle */}
                  <div>
                    <button
                      onClick={() => setShowReview(!showReview)}
                      className="btn btn-outline"
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem' }}
                    >
                      <span style={{ fontWeight: 700 }}>
                        {showReview ? 'Hide Question Explanations' : 'Review All 20 Questions & Explanations'}
                      </span>
                      <ChevronRight size={18} style={{ transform: showReview ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {showReview && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {quizResult.questionsReview?.map((q, idx) => {
                          const isCorrect = q.isCorrect;
                          return (
                            <div
                              key={q.id || idx}
                              style={{
                                padding: '1.1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                                  Q{idx + 1}. {q.question}
                                </span>
                                <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                  {isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                <div>Your Answer: <strong>Option {q.userAnswer}</strong></div>
                                {!isCorrect && (
                                  <div style={{ color: '#047857' }}>Correct Answer: <strong>Option {q.correctAnswer}</strong></div>
                                )}
                              </div>

                              {q.explanation && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary-500)' }}>
                                  <strong>Explanation:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Done / Return to Roadmap Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={handleCloseModal}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 2rem', fontWeight: 700 }}
                    >
                      Return to Roadmap
                    </button>
                  </div>
                </div>
              ) : assessmentData ? (
                /* ================= 20-QUESTION ACTIVE QUIZ VIEW ================= */
                <div>
                  {/* Question Navigator Pills (1 to 20) */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                        Question Navigator ({Object.keys(quizAnswers).length} of {assessmentData.questions?.length || 20} Answered)
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                        Click any number to jump
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
                      gap: '0.35rem'
                    }}>
                      {assessmentData.questions?.map((q, idx) => {
                        const isCurrent = currentQIndex === idx;
                        const isAnswered = Boolean(quizAnswers[q.id]);
                        return (
                          <button
                            key={q.id || idx}
                            onClick={() => setCurrentQIndex(idx)}
                            style={{
                              height: 34,
                              borderRadius: 'var(--radius-sm)',
                              border: isCurrent ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                              backgroundColor: isCurrent ? 'var(--primary-600)' : isAnswered ? '#10b981' : '#ffffff',
                              color: isCurrent || isAnswered ? '#ffffff' : 'var(--slate-700)',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            title={`Jump to Question ${idx + 1}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Question Card */}
                  {assessmentData.questions && assessmentData.questions[currentQIndex] && (
                    <div style={{
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-primary" style={{ fontWeight: 800 }}>
                          Question {currentQIndex + 1} of {assessmentData.questions.length}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                          Topic: {assessmentData.taskTitle}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                        {assessmentData.questions[currentQIndex].question}
                      </h4>

                      {/* 4 Choices */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {assessmentData.questions[currentQIndex].options?.map((optText, oIdx) => {
                          const letter = LETTERS[oIdx] || 'A';
                          const qId = assessmentData.questions[currentQIndex].id;
                          const isSelected = quizAnswers[qId] === letter;

                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleSelectOption(qId, letter)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.85rem',
                                padding: '0.85rem 1.1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                                border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 1px 3px rgba(79, 70, 229, 0.15)' : 'none'
                              }}
                            >
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--slate-100)',
                                color: isSelected ? '#ffffff' : 'var(--slate-700)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                flexShrink: 0
                              }}>
                                {letter}
                              </div>
                              <span style={{ fontSize: '0.92rem', color: isSelected ? 'var(--primary-900)' : 'var(--slate-800)', fontWeight: isSelected ? 600 : 400 }}>
                                {optText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Confirmation Alert if Unanswered */}
                  {confirmSubmitOpen && (
                    <div style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ fontSize: '0.88rem', color: '#92400e' }}>
                        <strong>⚠️ Notice:</strong> You have only answered <strong>{Object.keys(quizAnswers).length} of 20</strong> questions. 
                        Unanswered questions will be scored as 0. Submit now?
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setConfirmSubmitOpen(false)} className="btn btn-outline btn-sm">
                          Continue Answering
                        </button>
                        <button onClick={() => handleSubmitAssessment(true)} className="btn btn-primary btn-sm" style={{ backgroundColor: '#d97706' }}>
                          Yes, Submit Anyway
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Navigation Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQIndex === 0}
                      className="btn btn-outline"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', visibility: currentQIndex === 0 ? 'hidden' : 'visible' }}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {currentQIndex < (assessmentData.questions?.length || 20) - 1 ? (
                        <button
                          onClick={() => setCurrentQIndex(prev => prev + 1)}
                          className="btn btn-outline"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      ) : null}

                      <button
                        onClick={() => handleSubmitAssessment(false)}
                        disabled={quizSubmitting}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                      >
                        {quizSubmitting ? 'Evaluating 20 Answers…' : 'Submit 20-Q Assessment'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
