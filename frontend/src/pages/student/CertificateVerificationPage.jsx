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
  ExternalLink
} from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D'];

const LOADING_MESSAGES = [
  'Reading your certificate details…',
  'Analyzing skills, syllabus, and concepts…',
  'Generating 20 rigorous aptitude questions…',
  'Preparing your 10-minute assessment window…',
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
  // Stages: "upload" -> "quiz" -> "results"
  const [stage, setStage] = useState('upload');
  const [assessment, setAssessment] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Upload Stage State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

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

  // Start Assessment Flow
  const handleStartAssessment = async () => {
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
    setStage('upload');
  };

  // Quiz progress stats
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessment?.questions?.length || 20;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);
  const currentQ = assessment?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isUrgent = timeLeft <= 60;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--slate-900), var(--primary-900))',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-300)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <ShieldCheck size={18} color="var(--primary-400)" />
              Smart AI Credential Verifier
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
              Turn Your Certificate into an AI-Verified Skill Badge
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-300)', marginTop: '0.4rem', maxWidth: '620px' }}>
              Upload any completion certificate (PNG or JPG). Our multimodal AI parses the syllabus, creates 20 personalized MCQs, and awards a verified industry credential upon scoring 90%+.
            </p>
          </div>
          <button
            onClick={() => navigate('/student/feed')}
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            Explore Credential Feed <ArrowRight size={16} />
          </button>
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
          fontWeight: 600
        }}>
          {error}
        </div>
      )}

      {/* STAGE 1: UPLOAD CERTIFICATE */}
      {stage === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Feature Highlight Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <ListChecks size={24} color="var(--primary-600)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--slate-900)' }}>20 Questions</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Domain & Aptitude Reasoning</div>
            </div>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <Clock size={24} color="var(--primary-600)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--slate-900)' }}>10 Minutes</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Server-Enforced Timer</div>
            </div>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <BadgeCheck size={24} color="var(--primary-600)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--slate-900)' }}>18 / 20 = Badge</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Verified Credential + Feed Post</div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '3rem 2rem',
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
                    maxHeight: '220px',
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Drag & drop your certificate here, or browse files
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                  Supports PNG, JPG, or WEBP images up to 15MB
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                  <FileImage size={14} /> AI extracts course title, topics & verifies syllabus automatically
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            disabled={!selectedFile || loading}
            onClick={handleStartAssessment}
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
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '0.35rem' }}>
                <span>Answered: {answeredCount} / {totalQuestions}</span>
                <span>{progressPct}% Completed</span>
              </div>
              <div style={{ height: 8, backgroundColor: 'var(--slate-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  backgroundColor: 'var(--primary-600)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Question Palette / Direct Jump Grid */}
          <div className="card" style={{ padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Question Palette
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {assessment.questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = i === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      backgroundColor: isCurrent ? 'var(--primary-600)' : isAnswered ? 'var(--primary-100)' : 'var(--slate-100)',
                      color: isCurrent ? '#ffffff' : isAnswered ? 'var(--primary-800)' : 'var(--slate-600)'
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          {currentQ && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                  4 Options
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {currentQ.question}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQ.options.map((option, optIdx) => {
                  const letter = LETTERS[optIdx];
                  const isSelected = answers[currentQ.id] === letter;
                  return (
                    <div
                      key={letter}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: letter }))}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--slate-100)',
                        color: isSelected ? '#ffffff' : 'var(--slate-600)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {letter}
                      </div>
                      <span style={{
                        fontSize: '0.92rem',
                        color: isSelected ? 'var(--primary-900)' : 'var(--slate-800)',
                        fontWeight: isSelected ? 700 : 500
                      }}>
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ChevronLeft size={18} /> Previous
            </button>

            {isLastQuestion ? (
              <button
                disabled={loading}
                onClick={() => {
                  if (answeredCount < totalQuestions) {
                    setConfirmModalOpen(true);
                  } else {
                    handleQuizSubmit(answers);
                  }
                }}
                className="btn btn-primary"
                style={{
                  backgroundColor: 'var(--success-600)',
                  borderColor: 'var(--success-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 800
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(i => Math.min(totalQuestions - 1, i + 1))}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* Unanswered Confirmation Modal */}
          {confirmModalOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}>
              <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Submit with unanswered questions?
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginTop: '0.6rem' }}>
                  You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions. Unanswered questions count as incorrect.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setConfirmModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Keep Going
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModalOpen(false);
                      handleQuizSubmit(answers);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Submit Anyway
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 3: RESULTS & BADGE */}
      {stage === 'results' && result && assessment && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Headline Summary Card */}
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            {result.badge_awarded ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-700)',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-xl)',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                <PartyPopper size={20} /> VERIFIED SKILL BADGE EARNED!
              </div>
            ) : result.passed ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--success-50)',
                color: 'var(--success-700)',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-xl)',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                <CheckCircle2 size={20} /> PASSED ASSESSMENT
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--danger-50)',
                color: 'var(--danger-600)',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-xl)',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                <XCircle size={20} /> ASSESSMENT COMPLETED
              </div>
            )}

            <ScoreRing percentage={result.score_percentage} badgeAwarded={result.badge_awarded} />

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '1.25rem' }}>
              {result.correct_count} of {result.total_questions} Correct
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Completed in {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
              {result.time_expired && <span style={{ color: 'var(--danger-600)', fontWeight: 700, marginLeft: '0.5rem' }}>(time expired)</span>}
            </p>

            {result.badge_awarded ? (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-md)',
                maxWidth: '520px',
                margin: '1.5rem auto 0',
                border: '1.5px solid var(--primary-200)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary-800)', fontSize: '1.05rem' }}>
                  <BadgeCheck size={22} color="var(--primary-600)" /> Official Verified Skill Credential
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--primary-700)', marginTop: '0.35rem' }}>
                  This credential has been saved to your digital portfolio and is now visible to industry recruiters matching for this skill domain.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', maxWidth: '440px', margin: '1rem auto 0' }}>
                {result.passed
                  ? `Great effort! You need ${result.badge_threshold}/${result.total_questions} (90%) within time to claim the Verified Skill Badge. You can re-verify anytime!`
                  : `You need ${result.badge_threshold}/${result.total_questions} correct answers within the time limit to earn the Verified Badge. Review the solutions below and try again.`}
              </p>
            )}
          </div>

          {/* Publish to Community Feed Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src={assessment.certificate_url}
                alt="Certificate"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {result.badge_awarded ? 'Publish Certificate with Verified Badge to Feed' : 'Share Certificate to Community Feed'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Showcase your verified achievement to faculty peers and industry scouts on the portal feed.
                </p>
              </div>
              {result.badge_awarded && (
                <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <BadgeCheck size={16} /> Verified
                </div>
              )}
            </div>

            {!posted ? (
              <div style={{ marginTop: '1.25rem' }}>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a comment about your experience or key concepts learned…"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  disabled={posting}
                  onClick={handleCreatePost}
                  className="btn btn-primary"
                  style={{
                    marginTop: '0.75rem',
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
                marginTop: '1.25rem',
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleRestart}
              className="btn btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
            >
              <RefreshCcw size={16} /> Verify Another Certificate
            </button>
            <button
              onClick={() => navigate('/student/portfolio')}
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
            >
              View Digital Portfolio <ExternalLink size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
