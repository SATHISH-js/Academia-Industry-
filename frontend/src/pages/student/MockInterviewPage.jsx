import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CompanyLogo } from '../../components/roadmap/CompanyLogo';
import {
  AiInterviewerDollGraphic,
  AiInterviewGreetingModal,
  AiInterviewCornerDoll
} from '../../components/interview/AiInterviewerDoll';
import {
  Sparkles,
  Mic,
  Volume2,
  Award,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  BarChart2,
  Building2,
  Bot,
  Brain,
  History,
  MessageSquare,
  HelpCircle,
  Clock,
  TrendingUp,
  Star,
  Play,
  ChevronRight,
  ThumbsUp,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';

export const MockInterviewPage = () => {
  const navigate = useNavigate();

  const [presets, setPresets] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Wipro Elite & Turbo SDE');
  const [selectedCompany, setSelectedCompany] = useState('Wipro');
  const [historyList, setHistoryList] = useState([]);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('TRACKS'); // 'TRACKS', 'REPORT', 'HISTORY'
  const [loadingPresets, setLoadingPresets] = useState(true);

  // AI Doll Greeting Modal state
  const [showGreetingModal, setShowGreetingModal] = useState(false);

  useEffect(() => {
    fetchPresets();
    fetchHistory();
  }, []);

  const fetchPresets = async () => {
    try {
      setLoadingPresets(true);
      const res = await api.get('/mock-interview/presets');
      if (res.data.success) {
        setPresets(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch presets', err);
    } finally {
      setLoadingPresets(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/mock-interview/history');
      if (res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch interview history', err);
    }
  };

  const handleLaunchPreset = (p) => {
    setSelectedRole(p.role);
    setSelectedCompany(p.company);
    setShowGreetingModal(true);
  };

  const handleEnterLiveRoom = () => {
    setShowGreetingModal(false);
    navigate(`/student/mock-interview/room?company=${encodeURIComponent(selectedCompany)}&role=${encodeURIComponent(selectedRole)}`);
  };

  const handleViewHistoricalReport = async (item) => {
    try {
      const res = await api.get(`/mock-interview/history/${item.id}`);
      if (res.data.success) {
        const raw = res.data.data;
        const meta = raw.transcript || {};
        setReport({
          role: raw.role_title,
          company: raw.company_name,
          overallScore: raw.overall_score,
          speechRatingStars: meta.speechRatingStars || (raw.overall_score / 20).toFixed(1),
          confidenceScore: raw.confidence_score,
          technicalScore: raw.technical_score,
          communicationScore: raw.communication_score,
          grammarScore: meta.grammarScore || 85,
          wordCount: raw.words_analyzed,
          fillerWordsDetected: raw.filler_words_count,
          feedbackSummary: raw.feedback_summary,
          grammarMistakes: meta.grammarMistakes || [],
          strengths: meta.strengths || [],
          improvements: meta.improvements || [],
          questionsFeedback: meta.analyzedQuestions || []
        });
        setActiveTab('REPORT');
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to fetch report detail', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Banner with Animated AI Doll Preview */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: '24px',
        border: 'none',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.35)', color: '#ffffff', border: '1px solid rgba(165, 180, 252, 0.3)', fontWeight: 800 }}>
                🎙️ Professional AI Mock Interviewer
              </span>
              <span style={{ fontSize: '0.82rem', color: '#c7d2fe', fontWeight: 600 }}>
                Voice-Enabled • Grammar Audit • Speech Ratings
              </span>
            </div>

            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.6rem', lineHeight: 1.2 }}>
              Master Top Tech Interviews with AI Coach Nova
            </h1>

            <p style={{ color: '#c7d2fe', maxWidth: '640px', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Experience authentic technical interview simulations tailored to <strong>Wipro</strong>, Google, Amazon, Microsoft, and TCS. 
              Our AI doll reads questions aloud, listens to your voice, audits grammatical errors, rates verbal pacing, and gives exemplary STAR model answers.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setShowGreetingModal(true)}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1.65rem',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 18px rgba(79, 70, 229, 0.5)',
                  borderRadius: '12px'
                }}
              >
                <Play size={18} fill="#ffffff" /> Ready to Take AI Mock Interview Test
              </button>

              <button
                onClick={() => navigate('/student/mock-interview/room?company=Wipro&role=Wipro%20Elite%20%26%20Turbo%20SDE')}
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontWeight: 700,
                  padding: '0.85rem 1.35rem',
                  fontSize: '0.9rem',
                  borderRadius: '12px'
                }}
              >
                Launch Wipro SDE Round 🚀
              </button>
            </div>
          </div>

          {/* Interactive AI Doll Banner Companion */}
          <div
            onClick={() => setShowGreetingModal(true)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '1.25rem 1.75rem',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
              transition: 'transform 0.2s ease',
              textAlign: 'center'
            }}
            title="Click to talk with Coach Nova!"
          >
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#facc15',
              marginBottom: '6px',
              backgroundColor: '#1e1b4b',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #eab308'
            }}>
              🎙️ Coach Nova (AI)
            </div>
            <AiInterviewerDollGraphic state="speaking" size={100} />
            <span style={{ fontSize: '0.78rem', color: '#c7d2fe', marginTop: '6px', fontWeight: 700 }}>
              Click to Start Test! ✨
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'inline-flex', backgroundColor: 'var(--slate-100)', padding: '0.3rem', borderRadius: 'var(--radius-md)', gap: '0.3rem' }}>
          <button
            onClick={() => setActiveTab('TRACKS')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'TRACKS' ? '#ffffff' : 'transparent',
              color: activeTab === 'TRACKS' ? 'var(--primary-700)' : 'var(--slate-600)',
              boxShadow: activeTab === 'TRACKS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🏢 Available Interview Tracks ({presets.length})
          </button>

          {report && (
            <button
              onClick={() => setActiveTab('REPORT')}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'REPORT' ? '#ffffff' : 'transparent',
                color: activeTab === 'REPORT' ? 'var(--primary-700)' : 'var(--slate-600)',
                boxShadow: activeTab === 'REPORT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📊 Active AI Report
            </button>
          )}

          <button
            onClick={() => setActiveTab('HISTORY')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'HISTORY' ? '#ffffff' : 'transparent',
              color: activeTab === 'HISTORY' ? 'var(--primary-700)' : 'var(--slate-600)',
              boxShadow: activeTab === 'HISTORY' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <History size={15} /> Past Sessions ({historyList.length})
          </button>
        </div>

        <button
          onClick={() => setShowGreetingModal(true)}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
        >
          <Sparkles size={15} color="var(--primary-600)" /> Custom Role Interview
        </button>
      </div>

      {/* Tab 1: Available Interview Tracks */}
      {activeTab === 'TRACKS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={22} color="var(--primary-600)" />
              Select an Engineering & Company Track
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: 0 }}>
              Each track is curated with real company technical interview questions, system architecture scenarios, and behavioral probes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {presets.map((p) => {
              const isWipro = p.company.toLowerCase() === 'wipro';
              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    border: isWipro ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    backgroundColor: isWipro ? '#fcfcff' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    transition: 'all 0.2s ease',
                    boxShadow: isWipro ? '0 4px 14px rgba(79, 70, 229, 0.12)' : 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    {/* Header Row: Company Logo + Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CompanyLogo companyName={p.company} size={42} showNameBelow={false} />
                        <div>
                          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)', fontWeight: 800 }}>
                            {p.company} Interview Track
                          </span>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.1rem 0 0 0' }}>
                            {p.role}
                          </h3>
                        </div>
                      </div>

                      <span className="badge badge-primary" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                        {p.difficulty}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
                      {p.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      <span>🎯 <strong>{p.questions?.length || 4} Questions</strong></span>
                      <span>🎙️ Voice Dictation</span>
                      <span>✍️ Grammar Check</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => handleLaunchPreset(p)}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        fontWeight: 800,
                        fontSize: '0.86rem'
                      }}
                    >
                      <Play size={15} fill="#ffffff" /> Start Interview Round
                    </button>

                    <button
                      onClick={() => navigate(`/student/mock-interview/room?company=${encodeURIComponent(p.company)}&role=${encodeURIComponent(p.role)}`)}
                      className="btn btn-outline btn-sm"
                      title="Direct Room Jump"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Detailed AI Diagnostic Report */}
      {activeTab === 'REPORT' && (
        report ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Score Summary Banner */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
              color: '#ffffff',
              padding: '2.5rem',
              borderRadius: '24px',
              border: '2px solid rgba(99, 102, 241, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 800 }}>
                      AI Diagnostic Performance Assessment
                    </span>
                    <span className="badge" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                      {report.company} Track
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>
                    {report.role}
                  </h2>
                  <p style={{ color: '#c7d2fe', fontSize: '0.92rem', margin: '0.45rem 0 0 0', maxWidth: '650px', lineHeight: 1.55 }}>
                    {report.feedbackSummary}
                  </p>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '1.75rem 2.25rem',
                  borderRadius: '20px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                    <Star size={24} fill="#facc15" color="#facc15" />
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff' }}>
                      {report.speechRatingStars}
                    </span>
                    <span style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 700 }}>/ 5.0</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>
                    {report.overallScore >= 82 ? '🏆 Strong Hire' : report.overallScore >= 68 ? '✅ Candidate Ready' : '📚 Developing'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#c7d2fe', marginTop: '0.2rem' }}>
                    Readiness Score: {report.overallScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Score Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Technical Depth</span>
                  <Brain size={20} color="var(--primary-600)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                  {report.technicalScore}%
                </div>
                <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${report.technicalScore}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Grammar & Diction</span>
                  <CheckCircle2 size={20} color="var(--success-600)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                  {report.grammarScore}%
                </div>
                <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${report.grammarScore}%`, height: '100%', backgroundColor: 'var(--success-600)' }} />
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Verbal Confidence</span>
                  <Award size={20} color="var(--accent-600)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                  {report.confidenceScore}%
                </div>
                <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${report.confidenceScore}%`, height: '100%', backgroundColor: 'var(--accent-600)' }} />
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Delivery & Fluency</span>
                  <Mic size={20} color="var(--primary-600)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                  {report.communicationScore}%
                </div>
                <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${report.communicationScore}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                </div>
              </div>
            </div>

            {/* Grammar Mistakes Audit Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--warning-600)" /> Grammar Mistakes & Language Diagnostics
              </h3>

              {(!report.grammarMistakes || report.grammarMistakes.length === 0) ? (
                <div style={{ padding: '1.5rem', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0', color: '#047857' }}>
                  🎉 <strong>Zero grammar errors detected!</strong> You spoke with exceptional clarity and grammatical precision.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {report.grammarMistakes.map((g, idx) => (
                    <div key={idx} style={{ padding: '1rem 1.25rem', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 800 }}>
                          {g.issueType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#991b1b', fontWeight: 700 }}>
                        ❌ Detected: "{g.detectedText}"
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#166534', fontWeight: 700, marginTop: '0.2rem' }}>
                        ✅ Recommended: "{g.suggestedCorrection}"
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '0.25rem' }}>
                        💡 {g.ruleExplanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strengths and Enhancements */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ThumbsUp size={18} color="var(--success-600)" /> Key Strengths
                </h3>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
                  {report.strengths?.map((str, idx) => <li key={idx}><strong>{str}</strong></li>)}
                </ul>
              </div>

              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--primary-600)" /> Enhancement Recommendations
                </h3>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
                  {report.improvements?.map((imp, idx) => <li key={idx}>{imp}</li>)}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate(`/student/mock-interview/room?company=${encodeURIComponent(report.company)}&role=${encodeURIComponent(report.role)}`)}
                className="btn btn-primary"
                style={{ fontWeight: 800, padding: '0.85rem 1.75rem' }}
              >
                <RotateCcw size={16} /> Retake This Track Round
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Brain size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary-400)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              No Active Diagnostic Report Selected
            </h3>
            <p style={{ color: 'var(--slate-600)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
              Complete an interview round or select a session from your past history to view its AI speech ratings and grammar breakdown.
            </p>
            <button onClick={() => setShowGreetingModal(true)} className="btn btn-primary" style={{ margin: '0 auto', fontWeight: 700 }}>
              Launch New Interview Round 🚀
            </button>
          </div>
        )
      )}

      {/* Tab 3: Past Sessions History */}
      {activeTab === 'HISTORY' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--primary-600)" /> AI Mock Interview Practice History
          </h3>

          {historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
              No previous mock interview rounds found. Start your first practice round with Coach Nova!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Target Role</th>
                    <th>Company</th>
                    <th>AI Rating</th>
                    <th>Readiness</th>
                    <th>Technical</th>
                    <th>Grammar</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                        {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{h.role}</td>
                      <td>
                        <span className="badge badge-primary">{h.company}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          ⭐ {h.speechRatingStars} / 5.0
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: h.overall_score >= 80 ? 'var(--success-600)' : h.overall_score >= 60 ? 'var(--primary-600)' : 'var(--warning-600)', fontSize: '0.95rem' }}>
                          {h.overall_score}%
                        </strong>
                      </td>
                      <td>{h.technical_score}%</td>
                      <td>{h.grammarScore || 85}%</td>
                      <td>
                        <button
                          onClick={() => handleViewHistoricalReport(h)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          View Full Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Animated AI Doll Greeting Modal */}
      <AiInterviewGreetingModal
        isOpen={showGreetingModal}
        onClose={() => setShowGreetingModal(false)}
        onEnterRoom={handleEnterLiveRoom}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
      />

      {/* Floating AI Doll Corner Assistant */}
      <AiInterviewCornerDoll
        onLaunchTest={() => setShowGreetingModal(true)}
      />
    </div>
  );
};
