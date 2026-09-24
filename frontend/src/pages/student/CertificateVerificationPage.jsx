import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldCheck,
  UploadCloud,
  FileImage,
  Clock,
  ListChecks,
  BadgeCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  PartyPopper,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  Code2,
  Cpu,
  Database,
  Cloud,
  Terminal,
  Trophy,
  Award,
  Check,
  Copy,
  Lock,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D'];

const POPULAR_SKILLS = [
  {
    name: 'Python',
    subtitle: 'FastAPI, Asyncio, OOP & Algorithms',
    icon: Terminal,
    color: '#38bdf8',
    bg: '#0f172a',
    border: '#0284c7'
  },
  {
    name: 'Java & Spring Boot',
    subtitle: 'Virtual Threads, JPA & Microservices',
    icon: Code2,
    color: '#f97316',
    bg: '#1e1b4b',
    border: '#c2410c'
  },
  {
    name: 'React & Frontend',
    subtitle: 'Hooks, Concurrent Mode & Architecture',
    icon: Sparkles,
    color: '#06b6d4',
    bg: '#0f172a',
    border: '#0891b2'
  },
  {
    name: 'SQL & Database Design',
    subtitle: 'Indexing, ACID Transactions & Query Tuning',
    icon: Database,
    color: '#10b981',
    bg: '#064e3b',
    border: '#059669'
  },
  {
    name: 'Cloud & DevOps',
    subtitle: 'AWS, Docker Containers & CI/CD Pipelines',
    icon: Cloud,
    color: '#6366f1',
    bg: '#1e1b4b',
    border: '#4f46e5'
  },
  {
    name: 'AI & Machine Learning',
    subtitle: 'Neural Networks, Transformers & PyTorch',
    icon: Cpu,
    color: '#ec4899',
    bg: '#500724',
    border: '#db2777'
  },
  {
    name: 'Cyber Security',
    subtitle: 'OWASP Top 10, Network Defense & Auth',
    icon: ShieldCheck,
    color: '#ef4444',
    bg: '#450a0a',
    border: '#dc2626'
  },
  {
    name: 'Embedded Systems & IoT',
    subtitle: 'ARM Cortex, Interrupts & FreeRTOS',
    icon: Layers,
    color: '#eab308',
    bg: '#422006',
    border: '#ca8a04'
  }
];

const LOADING_MESSAGES = [
  'Preparing your technical skill curriculum…',
  'Formulating 20 rigorous domain and architecture questions…',
  'Calibrating 10-minute assessment window…',
  'Initializing server-side evaluation session…',
  'Almost ready — get set…'
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
  const ringColor = badgeAwarded ? 'var(--primary-600)' : percentage >= 60 ? 'var(--success-600)' : 'var(--danger-600)';

  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--slate-200)" strokeWidth="10" />
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
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          {percentage}%
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>
          {badgeAwarded ? 'VERIFIED' : percentage >= 60 ? 'PASSED' : 'NEEDS PRACTICE'}
        </span>
      </div>
    </div>
  );
}

export const CertificateVerificationPage = () => {
  const navigate = useNavigate();

  // Primary mode in upload stage: 'SKILL_TEST' | 'UPLOAD_DOC' | 'LOOKUP_CODE'
  const [activeTab, setActiveTab] = useState('SKILL_TEST');

  // Stages: "upload" -> "quiz" -> "results"
  const [stage, setStage] = useState('upload');
  const [assessment, setAssessment] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom skill input
  const [customSkill, setCustomSkill] = useState('');

  // Upload Stage State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  // Lookup Code State
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Verified Certificates from DB
  const [pastVerifications, setPastVerifications] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  // Quiz Stage State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const autoSubmitted = useRef(false);

  // Results Stage State
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Fetch student past verified certifications
  const fetchPastVerifications = async () => {
    try {
      const res = await api.get('/certificate-verify/my-verifications');
      if (res.data.success && res.data.data) {
        setPastVerifications(res.data.data.verifiedCertificates || []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchPastVerifications();
  }, []);

  // Cycle animated loading phrases
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  // Quiz countdown timer
  useEffect(() => {
    if (stage !== 'quiz') return;
    if (timeLeft <= 0) {
      if (!autoSubmitted.current) {
        autoSubmitted.current = true;
        handleQuizSubmit(answers);
      }
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, timeLeft, answers]);

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // 1. Direct Technical Skill Test Start
  const handleStartDirectSkillTest = async (skillName) => {
    const skill = (skillName || customSkill).trim();
    if (!skill) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/certificate-verify/start-assessment', {
        skill
      });

      if (res.data.success) {
        const data = res.data.data;
        setAssessment(data);
        setTimeLeft(data.duration_seconds || 600);
        setAnswers({});
        setCurrentQuestionIndex(0);
        autoSubmitted.current = false;
        setStage('quiz');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize technical skill assessment.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload Certificate Flow
  const handleStartUploadAssessment = async () => {
    if (!selectedFile) return;
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/certificate-verify/start-assessment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const data = res.data.data;
        setAssessment(data);
        setTimeLeft(data.duration_seconds || 600);
        setAnswers({});
        setCurrentQuestionIndex(0);
        autoSubmitted.current = false;
        setStage('quiz');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze certificate and generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Lookup Certificate Code
  const handleLookupCode = async (e) => {
    if (e) e.preventDefault();
    const code = lookupCode.trim();
    if (!code) return;

    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await api.get(`/certificate-verify/validate/${encodeURIComponent(code)}`);
      if (res.data.success) {
        setLookupResult(res.data.data);
      }
    } catch (err) {
      setLookupError(err.response?.data?.message || 'No verified certificate found matching this verification code.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Submit Quiz Flow
  const handleQuizSubmit = async (finalAnswers) => {
    if (!assessment) return;
    setError('');
    setLoading(true);

    try {
      const payload = {
        quiz_id: assessment.quiz_id,
        answers: finalAnswers || answers
      };

      const res = await api.post('/certificate-verify/submit-quiz', payload);
      if (res.data.success) {
        setResult(res.data.data);
        setStage('results');
        fetchPastVerifications();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to grade assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Publish to Community Feed
  const handleCreatePost = async () => {
    if (!assessment) return;
    setError('');
    setPosting(true);

    try {
      const payload = {
        quiz_id: assessment.quiz_id,
        caption: caption.trim()
      };

      const res = await api.post('/certificate-verify/create-post', payload);
      if (res.data.success) {
        setPosted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to publish post to feed.');
    } finally {
      setPosting(false);
    }
  };

  const handleRestart = () => {
    setAssessment(null);
    setResult(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnswers({});
    setError('');
    setPosted(false);
    setCaption('');
    setCustomSkill('');
    setStage('upload');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Quiz progress stats
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessment?.questions?.length || 20;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);
  const currentQ = assessment?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isUrgent = timeLeft <= 60;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Top Banner Link to Extra-Curricular Certifications */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#e0e7ff',
        border: '1px solid #c7d2fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#3730a3', fontSize: '0.88rem' }}>
          <Trophy size={18} color="#4f46e5" />
          <span>Looking for <strong>Extra-Curricular Certifications</strong> (Paper Presentations / PPT, Hackathons, Competitions, Workshops)?</span>
        </div>
        <button
          onClick={() => navigate('/student/certifications')}
          className="btn"
          style={{
            backgroundColor: '#4338ca',
            color: '#ffffff',
            padding: '0.4rem 0.9rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          Open Certifications Hub <ArrowRight size={14} />
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              Technical Skill Certificate Verifier
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.4rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Verify Technical Skills by 20-Question Competency Test
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#94a3b8', marginTop: '0.45rem', lineHeight: 1.5 }}>
              Verify your technical proficiency in <strong>Python</strong>, <strong>Java</strong>, <strong>React</strong>, <strong>SQL</strong>, <strong>Cloud</strong>, or <strong>AI/ML</strong>. Score 60%+ to earn an authenticated credential, or 90%+ for the Verified Skill Badge.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/student/feed')}
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Public Credential Feed <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-50)',
          border: '1px solid var(--danger-500)',
          color: 'var(--danger-600)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* STAGE 1: VERIFIER ENTRY & SELECTOR */}
      {stage === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '0.25rem'
          }}>
            <button
              onClick={() => setActiveTab('SKILL_TEST')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === 'SKILL_TEST' ? 'var(--primary-600)' : 'transparent',
                color: activeTab === 'SKILL_TEST' ? '#ffffff' : 'var(--slate-600)',
                transition: 'all 0.2s'
              }}
            >
              <Code2 size={18} /> Verify Technical Skill by Test
            </button>

            <button
              onClick={() => setActiveTab('UPLOAD_DOC')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === 'UPLOAD_DOC' ? 'var(--primary-600)' : 'transparent',
                color: activeTab === 'UPLOAD_DOC' ? '#ffffff' : 'var(--slate-600)',
                transition: 'all 0.2s'
              }}
            >
              <UploadCloud size={18} /> Upload Certificate File
            </button>

            <button
              onClick={() => setActiveTab('LOOKUP_CODE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === 'LOOKUP_CODE' ? 'var(--primary-600)' : 'transparent',
                color: activeTab === 'LOOKUP_CODE' ? '#ffffff' : 'var(--slate-600)',
                transition: 'all 0.2s'
              }}
            >
              <Search size={18} /> Verify Certificate Code
            </button>
          </div>

          {/* Test Specs Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <ListChecks size={22} color="var(--primary-600)" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>20 Questions</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Domain & Aptitude Reasoning</div>
            </div>
            <div className="card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <Clock size={22} color="var(--primary-600)" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>10 Minutes</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Server-Enforced Countdown</div>
            </div>
            <div className="card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <BadgeCheck size={22} color="var(--primary-600)" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>18 / 20 = Verified Badge</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Cryptographic Verification Code</div>
            </div>
          </div>

          {/* TAB 1: DIRECT TECHNICAL SKILL TEST */}
          {activeTab === 'SKILL_TEST' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  Select a Technical Skill to Verify by Test
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Click any domain below to immediately launch a timed 20-question technical competency examination.
                </p>
              </div>

              {/* Skill Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {POPULAR_SKILLS.map((sk) => {
                  const Icon = sk.icon;
                  return (
                    <div
                      key={sk.name}
                      onClick={() => !loading && handleStartDirectSkillTest(sk.name)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid var(--border-color)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 140
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = sk.border;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      <div>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: `${sk.color}15`,
                          color: sk.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '0.75rem'
                        }}>
                          <Icon size={22} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                          {sk.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                          {sk.subtitle}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                          Verify by Test
                        </span>
                        <ChevronRight size={15} color="var(--primary-600)" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Skill Input Card */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--slate-50)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', margin: 0 }}>
                  Or Verify Any Other Technical Skill
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Flutter, Go, Kubernetes, Rust, TypeScript, C++…"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    style={{ flex: '1 1 300px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleStartDirectSkillTest(customSkill);
                      }
                    }}
                  />
                  <button
                    disabled={!customSkill.trim() || loading}
                    onClick={() => handleStartDirectSkillTest(customSkill)}
                    className="btn btn-primary"
                    style={{ fontWeight: 800, padding: '0.75rem 1.4rem' }}
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Start 20-Q Verification Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD CERTIFICATE */}
          {activeTab === 'UPLOAD_DOC' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '3.5rem 2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px dashed ${dragOver ? 'var(--primary-600)' : 'var(--slate-300)'}`,
                  backgroundColor: dragOver ? 'var(--primary-50)' : '#ffffff',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />

                {previewUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                      src={previewUrl}
                      alt="Certificate Preview"
                      style={{
                        maxHeight: '240px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        marginBottom: '1rem'
                      }}
                    />
                    <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.95rem' }}>
                      {selectedFile?.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      Click or drop another file to replace
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem'
                    }}>
                      <UploadCloud size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      Drag & drop your technical certificate here, or browse
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                      Upload Coursera, Udemy, NPTEL, or university certificate (PNG, JPG, or WEBP up to 15MB)
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                      <FileImage size={14} /> AI extracts course title & creates 20 questions based on certificate syllabus
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={!selectedFile || loading}
                onClick={handleStartUploadAssessment}
                className="btn btn-primary"
                style={{
                  padding: '1.1rem',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {LOADING_MESSAGES[msgIndex]}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> Start 10-Minute Assessment
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: LOOKUP CERTIFICATE CODE */}
          {activeTab === 'LOOKUP_CODE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Validate Any Certificate by Verification Code
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Enter an official verification ID (e.g. <code>CERT-AI-FCF457A0</code> or <code>CERT-VERIF-TOPIC-...</code>) to verify authenticity and view official credential proof.
                </p>

                <form onSubmit={handleLookupCode} style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter Certificate Verification Code (e.g. CERT-AI-FCF457A0)"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    style={{ flex: '1 1 320px', fontFamily: 'monospace', fontWeight: 600 }}
                  />
                  <button
                    type="submit"
                    disabled={!lookupCode.trim() || lookupLoading}
                    className="btn btn-primary"
                    style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                  >
                    {lookupLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    Verify Authenticity
                  </button>
                </form>

                {lookupError && (
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--danger-50)',
                    color: 'var(--danger-700)',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}>
                    {lookupError}
                  </div>
                )}

                {lookupResult && (
                  <div style={{
                    marginTop: '1.75rem',
                    padding: '1.75rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--success-500)',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-md)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--success-50)', color: 'var(--success-600)' }}>
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Authentic Verified Credential
                          </span>
                          <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.2rem 0 0' }}>
                            {lookupResult.certificateTitle}
                          </h4>
                        </div>
                      </div>

                      {lookupResult.badgeAwarded && (
                        <span style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: 999,
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--primary-600)',
                          color: '#ffffff'
                        }}>
                          ★ VERIFIED BADGE (90%+)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Candidate</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                          {lookupResult.studentName}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Institution</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                          {lookupResult.institutionName}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Assessment Score</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: lookupResult.scorePercentage >= 90 ? 'var(--primary-600)' : 'var(--success-600)', marginTop: '0.2rem' }}>
                          {lookupResult.scorePercentage}%
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Verified Date</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                          {lookupResult.verifiedAt ? new Date(lookupResult.verifiedAt).toLocaleDateString() : 'Active'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--slate-500)' }}>
                        Verification Code: <strong style={{ color: 'var(--slate-800)', fontFamily: 'monospace' }}>{lookupResult.credentialId}</strong>
                      </span>
                      <button
                        onClick={() => copyToClipboard(lookupResult.credentialId)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        {copiedCode === lookupResult.credentialId ? <Check size={14} color="var(--success-600)" /> : <Copy size={14} />}
                        {copiedCode === lookupResult.credentialId ? 'Copied' : 'Copy Code'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Past Verified Technical Skill Certifications Section */}
          {pastVerifications.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  My Verified Technical Skill Certifications ({pastVerifications.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {pastVerifications.map((v) => (
                  <div key={v.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-600)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                        {v.name}
                      </h4>
                      {v.badge_awarded ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: 'var(--primary-600)', color: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: 999 }}>
                          ★ BADGE
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--success-50)', color: 'var(--success-700)', padding: '0.2rem 0.5rem', borderRadius: 999 }}>
                          VERIFIED
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                      {v.issuing_organization} • Score: <strong style={{ color: 'var(--slate-900)' }}>{v.score_percentage}%</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--slate-400)', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                      <span style={{ fontFamily: 'monospace' }}>{v.credential_id}</span>
                      <button
                        onClick={() => copyToClipboard(v.credential_id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary-600)', fontWeight: 700 }}
                      >
                        {copiedCode === v.credential_id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2: TIMED QUIZ */}
      {stage === 'quiz' && assessment && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card: Course Title & Timer */}
          <div className="card" style={{ padding: '1.25rem 1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.3rem' }}>
                  {assessment.issuing_organization || 'Verified Credential'}
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {assessment.course_title}
                </h2>
              </div>

              {/* Real-time Timer Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isUrgent ? 'var(--danger-50)' : 'var(--primary-50)',
                color: isUrgent ? 'var(--danger-600)' : 'var(--primary-700)',
                fontWeight: 800,
                fontSize: '1.15rem',
                border: `1.5px solid ${isUrgent ? 'var(--danger-500)' : 'var(--primary-200)'}`
              }}>
                <Clock size={20} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.35rem' }}>
                <span>Answered {answeredCount} of {totalQuestions}</span>
                <span>{progressPct}% Completed</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--slate-100)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary-600)',
                  transition: 'width var(--transition-fast)'
                }} />
              </div>
            </div>
          </div>

          {/* Question Navigator Pills */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {assessment.questions?.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentQuestionIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: isCurrent ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                      backgroundColor: isCurrent ? 'var(--primary-50)' : isAnswered ? 'var(--success-50)' : 'var(--card-bg)',
                      color: isCurrent ? 'var(--primary-700)' : isAnswered ? 'var(--success-700)' : 'var(--slate-600)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                {currentQ.question}
              </h3>

              {/* Options Radio List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQ.options?.map((opt, optIdx) => {
                  const letter = LETTERS[optIdx];
                  const isSelected = answers[currentQ.id] === letter;

                  return (
                    <div
                      key={letter}
                      onClick={() => setAnswers({ ...answers, [currentQ.id]: letter })}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--slate-100)',
                        color: isSelected ? '#ffffff' : 'var(--slate-600)',
                        flexShrink: 0
                      }}>
                        {letter}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--primary-900)' : 'var(--slate-800)' }}>
                        {opt}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((i) => i - 1)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={() => setConfirmModalOpen(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                  >
                    <Send size={16} /> Submit Assessment
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Confirm Submission Modal */}
          {confirmModalOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem'
            }}>
              <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Submit Your Assessment?
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginTop: '0.5rem' }}>
                  You have answered <strong>{answeredCount} of {totalQuestions}</strong> questions.
                  {answeredCount < totalQuestions && (
                    <span style={{ color: 'var(--danger-600)', display: 'block', marginTop: '0.35rem' }}>
                      Warning: You have {totalQuestions - answeredCount} unanswered questions!
                    </span>
                  )}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setConfirmModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModalOpen(false);
                      handleQuizSubmit(answers);
                    }}
                    className="btn btn-primary"
                    style={{ fontWeight: 800 }}
                  >
                    Confirm & Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 3: RESULTS & CREDENTIAL BADGE */}
      {stage === 'results' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            {result.badge_awarded ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 800, marginBottom: '1rem' }}>
                <PartyPopper size={24} />
                <span>EXEMPLARY MASTERY (90%+)</span>
              </div>
            ) : result.passed ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-600)', fontWeight: 800, marginBottom: '1rem' }}>
                <BadgeCheck size={24} />
                <span>ASSESSMENT PASSED (60%+)</span>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-600)', fontWeight: 800, marginBottom: '1rem' }}>
                <XCircle size={24} />
                <span>ADDITIONAL PRACTICE RECOMMENDED</span>
              </div>
            )}

            <ScoreRing percentage={result.score_percentage} badgeAwarded={result.badge_awarded} />

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '1.25rem' }}>
              {result.correct_count} of {result.total_questions} Correct
            </h2>

            <p style={{ fontSize: '0.95rem', color: 'var(--slate-600)', maxWidth: '540px', margin: '0.5rem auto 1.5rem' }}>
              {result.badge_awarded
                ? 'Outstanding performance! You demonstrated thorough mastery across all technical concepts. Your Verified Skill Badge has been minted.'
                : result.passed
                ? 'Great work! You demonstrated solid competency and successfully passed the technical evaluation.'
                : 'You scored below the 60% threshold. Review the solutions below and feel free to retake the assessment.'}
            </p>

            {/* Official Verification ID Card */}
            {result.verification_code && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <ShieldCheck size={20} color="var(--primary-600)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                  Verification Code: <strong style={{ color: 'var(--slate-900)', fontFamily: 'monospace' }}>{result.verification_code}</strong>
                </span>
                <button
                  onClick={() => copyToClipboard(result.verification_code)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.82rem' }}
                >
                  {copiedCode === result.verification_code ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {/* Post to Feed Section */}
            {!posted ? (
              <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'left', marginTop: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Share to Public Credential Feed
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Add a comment about your technical achievement…"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={{ marginBottom: '0.75rem' }}
                />
                <button
                  disabled={posting}
                  onClick={handleCreatePost}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 800
                  }}
                >
                  {posting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Post to Community Feed
                </button>
              </div>
            ) : (
              <div style={{
                maxWidth: '520px',
                margin: '1.25rem auto 0',
                backgroundColor: 'var(--success-50)',
                border: '1px solid var(--success-500)',
                color: 'var(--success-700)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} /> Published to Community Credential Feed!
                </div>
                <button
                  onClick={() => navigate('/student/feed')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  View Feed <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Question Review Sheet */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <button
              onClick={() => setShowReview(!showReview)}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--primary-700)'
              }}
            >
              <span>{showReview ? 'Hide Comprehensive Answer Review' : 'View Question-by-Question Solution Review'}</span>
              <span>{showReview ? '▲' : '▼'}</span>
            </button>

            {showReview && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.review?.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${q.is_correct ? 'var(--success-500)' : 'var(--danger-500)'}`,
                      backgroundColor: q.is_correct ? 'var(--success-50)' : 'var(--danger-50)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      {q.is_correct ? (
                        <CheckCircle2 size={20} color="var(--success-600)" style={{ flexShrink: 0, marginTop: 2 }} />
                      ) : (
                        <XCircle size={20} color="var(--danger-600)" style={{ flexShrink: 0, marginTop: 2 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                          {q.id}. {q.question}
                        </div>
                        <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: 'var(--slate-600)' }}>
                          Your choice: <strong>{q.your_answer || 'Unanswered'}</strong> • Correct answer: <strong>{q.correct_answer}</strong>
                        </div>
                        {q.explanation && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-700)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            Explanation: {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleRestart}
              className="btn btn-secondary"
              style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
            >
              <RefreshCcw size={16} /> Verify Another Skill
            </button>
            <button
              onClick={() => navigate('/student/certifications')}
              className="btn btn-primary"
              style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
            >
              View Extra-Curricular Certifications <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
