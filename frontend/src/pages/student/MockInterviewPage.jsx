import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CompanyLogo } from '../../components/roadmap/CompanyLogo';
import {
  AiInterviewerDollGraphic,
  AiInterviewCornerDoll
} from '../../components/interview/AiInterviewerDoll';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Award,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  BarChart2,
  Building2,
  Brain,
  History,
  MessageSquare,
  Clock,
  TrendingUp,
  Star,
  Play,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Check
} from 'lucide-react';

const COMPANIES = [
  {
    name: 'Google',
    roleDefault: 'Full Stack Software Engineer',
    speechText: "Great choice! Preparing for Google. Google focuses heavily on scalable distributed systems, clean data structures, and algorithmic complexity. Select your target role and let's step into the interview room!"
  },
  {
    name: 'Wipro',
    roleDefault: 'Wipro Elite & Turbo SDE',
    speechText: "Excellent choice! Preparing for Wipro Elite and Turbo SDE. Wipro values strong Java fundamentals, Spring Boot architecture, REST APIs, and production troubleshooting. Select your target role and let's step into the interview room!"
  },
  {
    name: 'Amazon',
    roleDefault: 'Backend Developer',
    speechText: "Great choice! Preparing for Amazon. Amazon values Leadership Principles, distributed cloud systems, high concurrency, and customer obsession. Select your target role and let's step into the interview room!"
  },
  {
    name: 'Microsoft',
    roleDefault: 'Cloud & DevOps Engineer',
    speechText: "Great choice! Preparing for Microsoft. Microsoft values Azure cloud architecture, full stack scalability, CI/CD pipelines, and clean code. Select your target role and let's step into the interview room!"
  },
  {
    name: 'TCS',
    roleDefault: 'Wipro Elite & Turbo SDE',
    speechText: "Great choice! Preparing for TCS Digital. TCS values robust Java and Python fundamentals, data structures, algorithms, and agile delivery. Select your target role and let's step into the interview room!"
  },
  {
    name: 'Infosys',
    roleDefault: 'Full Stack Software Engineer',
    speechText: "Great choice! Preparing for Infosys Power Programmer. Infosys values full stack architecture, problem solving, and enterprise system design. Select your target role and let's step into the interview room!"
  },
  {
    name: 'Meta',
    roleDefault: 'Frontend Engineer',
    speechText: "Great choice! Preparing for Meta. Meta values frontend architecture, React internals, Core Web Vitals, and responsive UI performance. Select your target role and let's step into the interview room!"
  },
  {
    name: 'Tesla',
    roleDefault: 'Backend Developer',
    speechText: "Great choice! Preparing for Tesla. Tesla values high-performance computing, low-latency concurrent systems, autonomous architectures, and embedded efficiency. Select your target role and let's step into the interview room!"
  }
];

const ROLES = [
  { id: 'Wipro Elite & Turbo SDE', label: 'Wipro Elite & Turbo SDE (Java & Spring Boot)' },
  { id: 'Full Stack Software Engineer', label: 'Full Stack Software Engineer (MERN / React / Node)' },
  { id: 'Backend Developer', label: 'Backend Developer (Microservices & Databases)' },
  { id: 'Frontend Engineer', label: 'Frontend Engineer (React / Next.js / Performance)' },
  { id: 'Cloud & DevOps Engineer', label: 'Cloud & DevOps Engineer (Kubernetes & CI/CD)' },
  { id: 'Data Scientist / ML Engineer', label: 'Data Scientist / ML Engineer (AI & Modeling)' }
];

export const MockInterviewPage = () => {
  const navigate = useNavigate();

  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedRole, setSelectedRole] = useState('Full Stack Software Engineer');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();

    // Welcome speech by Coach Nova on load
    const timer = setTimeout(() => {
      speakAloud("Welcome to your AI Mock Interview! I am Coach Nova. Please select your target company and engineering role to begin.");
    }, 800);

    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/mock-interview/history');
      if (res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const speakAloud = (text) => {
    if (speechMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // User Requirement: "when the user choose google thats the time the ai also speek"
  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp.name);
    if (comp.roleDefault) {
      setSelectedRole(comp.roleDefault);
    }
    // AI Doll speaks aloud immediately
    speakAloud(comp.speechText);
  };

  const handleLaunchRoom = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    navigate(`/student/mock-interview/room?company=${encodeURIComponent(selectedCompany)}&role=${encodeURIComponent(selectedRole)}`);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3.5rem' }}>
      {/* Unified AI Interviewer Centerpiece Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-xl)',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Sound Mute Toggle */}
        <button
          onClick={() => {
            const next = !speechMuted;
            setSpeechMuted(next);
            if (next && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '9999px',
            padding: '0.4rem 0.85rem',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          title={speechMuted ? 'Unmute AI voice' : 'Mute AI voice'}
        >
          {speechMuted ? <VolumeX size={15} color="#f87171" /> : <Volume2 size={15} color="#4ade80" />}
          {speechMuted ? 'Voice Muted' : 'Coach Nova Voice ON'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 540px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '0.35rem 0.85rem', borderRadius: '9999px', marginBottom: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <Sparkles size={14} color="#facc15" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#facc15' }}>
                Next-Gen AI Mock Interview Simulator
              </span>
            </div>

            <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0 0 0.5rem 0', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Speak with AI Coach Nova
            </h1>

            <p style={{ color: '#c7d2fe', fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 1.5rem 0', maxWidth: '640px' }}>
              Select your target company below. Coach Nova will verbally guide you, read real company questions aloud, listen via your mic, identify grammar mistakes, rate your delivery, and connect your results directly to tailored learning programs.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handleLaunchRoom}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.9rem 1.8rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)'
                }}
              >
                <Play size={18} fill="#ffffff" /> Enter Live Interview Room ({selectedCompany})
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontWeight: 700,
                  padding: '0.9rem 1.4rem',
                  fontSize: '0.9rem',
                  borderRadius: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <History size={16} /> Past Practice Sessions ({historyList.length})
              </button>
            </div>
          </div>

          {/* Animated AI Doll Mascot Booth */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '1.5rem 2rem',
            borderRadius: '24px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            textAlign: 'center',
            minWidth: '240px'
          }}>
            <div style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#38bdf8',
              backgroundColor: '#0f172a',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #38bdf8',
              marginBottom: '0.5rem'
            }}>
              {isSpeaking ? '🔊 Coach Nova is Speaking...' : '🎙️ Ready for Your Voice'}
            </div>

            <AiInterviewerDollGraphic state={isSpeaking ? 'speaking' : 'idle'} size={120} />

            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Coach Nova</div>
              <div style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600 }}>
                Selected Target: <span style={{ color: '#facc15' }}>{selectedCompany}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Target Company Selector (Single Clean Unified Section) */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={22} color="var(--primary-600)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              Select Your Target Company
            </h2>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--slate-500)' }}>
            Click on any company below. Coach Nova will verbally brief you on that company's engineering interview culture!
          </p>
        </div>

        {/* Company Cards Grid with Logo and Name Underneath */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {COMPANIES.map((c) => {
            const isSelected = selectedCompany.toLowerCase() === c.name.toLowerCase();
            return (
              <div
                key={c.name}
                onClick={() => handleSelectCompany(c)}
                style={{
                  cursor: 'pointer',
                  padding: '1.25rem 0.85rem',
                  borderRadius: '16px',
                  backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                  border: isSelected ? '2.5px solid var(--primary-600)' : '1.5px solid var(--border-color)',
                  boxShadow: isSelected ? '0 6px 18px rgba(79, 70, 229, 0.22)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                )}

                {/* Company Logo Image with Company Name Underneath */}
                <CompanyLogo
                  companyName={c.name}
                  size={52}
                  showNameBelow={true}
                  nameStyle={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: isSelected ? 'var(--primary-800)' : 'var(--slate-800)',
                    marginTop: '0.35rem'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Target Role Selector */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
              Target Engineering Role / Track
            </label>
            <select
              className="form-control"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ fontSize: '0.94rem', fontWeight: 600, padding: '0.75rem 1rem' }}
            >
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'flex-end' }}>
            <button
              onClick={handleLaunchRoom}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.6rem',
                fontSize: '0.98rem',
                fontWeight: 800,
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              <Play size={17} fill="#ffffff" /> Launch Interview Room for {selectedCompany} <ArrowRight size={17} />
            </button>
            <span style={{ fontSize: '0.76rem', color: 'var(--slate-500)', textAlign: 'center' }}>
              Includes Real-time Mic Dictation, TTS, Grammar Diagnosis & Learning Program Connections
            </span>
          </div>
        </div>
      </div>

      {/* Past Practice Sessions Section */}
      {showHistory && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} color="var(--primary-600)" /> Past AI Mock Interview Rounds
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="btn btn-outline btn-sm"
            >
              Hide Past Sessions
            </button>
          </div>

          {historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
              No previous mock interview rounds found. Start your first session above!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Target Role</th>
                    <th>Company</th>
                    <th>Speech Rating</th>
                    <th>Readiness</th>
                    <th>Technical</th>
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
                        <strong style={{ color: h.overall_score >= 80 ? 'var(--success-600)' : 'var(--primary-600)' }}>
                          {h.overall_score}%
                        </strong>
                      </td>
                      <td>{h.technical_score}%</td>
                      <td>
                        <button
                          onClick={() => navigate(`/student/mock-interview/room?company=${encodeURIComponent(h.company)}&role=${encodeURIComponent(h.role)}`)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          Practice Again
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

      {/* Floating Corner Companion */}
      <AiInterviewCornerDoll onLaunchTest={handleLaunchRoom} />
    </div>
  );
};
