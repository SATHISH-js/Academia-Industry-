import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { CompanyLogo } from '../../components/roadmap/CompanyLogo';
import { AiInterviewerDollGraphic } from '../../components/interview/AiInterviewerDoll';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ThumbsUp,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Star,
  Check,
  Zap,
  ArrowRight,
  GraduationCap,
  Compass,
  Activity
} from 'lucide-react';

export const MockInterviewRoomPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role and Company from query or default
  const [role, setRole] = useState(searchParams.get('role') || 'Wipro Elite & Turbo SDE');
  const [company, setCompany] = useState(searchParams.get('company') || 'Wipro');

  // Interview state
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interimSpeech, setInterimSpeech] = useState(''); // Live real-time words
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Audio & Speech States
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [speakingWordIndex, setSpeakingWordIndex] = useState(-1);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [micError, setMicError] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);

  // Timers & Refs
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const committedAnswerRef = useRef(''); // Holds text finalized or typed
  const speakingIntervalRef = useRef(null);

  // Doll state: 'idle' | 'speaking' | 'listening' | 'evaluating'
  const dollState = evaluating 
    ? 'evaluating' 
    : isSpeakingQuestion 
    ? 'speaking' 
    : isRecording 
    ? 'listening' 
    : 'idle';

  useEffect(() => {
    fetchQuestions();
    initSpeechRecognition();

    return () => {
      stopRecording();
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [role, company]);

  // Keep isRecordingRef in sync for speech callbacks
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await api.get('/mock-interview/questions', {
        params: { role, company }
      });
      if (res.data.success && res.data.data.questions?.length > 0) {
        const fetched = res.data.data.questions;
        setQuestions(fetched);
        setCurrentQIndex(0);
        setCurrentAnswer('');
        committedAnswerRef.current = '';
        setInterimSpeech('');
        // Coach Nova speaks first question aloud automatically
        setTimeout(() => {
          speakQuestionText(fetched[0].question);
        }, 700);
      }
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  /**
   * High-reliability Speech Recognition with LIVE SCRIPTING directly into the answer box
   */
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. You can type or use the sample voice dictation button!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        setInterimSpeech(interim);

        // When a phrase is finalized, commit it to committedAnswerRef
        if (finalChunk) {
          const cleanPrev = committedAnswerRef.current.trim();
          committedAnswerRef.current = cleanPrev ? `${cleanPrev} ${finalChunk.trim()}` : finalChunk.trim();
        }

        // USER FIX: Script directly into the response box in REAL-TIME!
        const liveCombined = committedAnswerRef.current
          ? (interim.trim() ? `${committedAnswerRef.current} ${interim.trim()}` : committedAnswerRef.current)
          : interim.trim();

        setCurrentAnswer(liveCombined);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone permission was denied. Please allow microphone access in your browser or type your answer.');
          setIsRecording(false);
        } else if (event.error === 'no-speech') {
          // Normal pause, keep recording active
        }
      };

      recognition.onend = () => {
        // Auto-restart if candidate didn't deliberately stop recording
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        } else {
          setIsRecording(false);
          setInterimSpeech('');
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition setup failed:', err);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported on this browser. You can type your response directly!');
      return;
    }

    setMicError('');

    if (isRecording) {
      stopRecording();
    } else {
      // If AI doll is speaking, cancel TTS first
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      setSpeakingWordIndex(-1);

      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Recognition start caught:', err);
        setIsRecording(true);
      }
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    // Flush any pending interim speech into committedAnswerRef and currentAnswer
    if (interimSpeech.trim()) {
      const cleanPrev = committedAnswerRef.current.trim();
      committedAnswerRef.current = cleanPrev ? `${cleanPrev} ${interimSpeech.trim()}` : interimSpeech.trim();
      setCurrentAnswer(committedAnswerRef.current);
      setInterimSpeech('');
    }
  };

  /**
   * Speak Question with Animated Word-by-Word Subtitle Highlighting
   */
  const speakQuestionText = (text) => {
    if (speechMuted || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);

    const words = text.split(/\s+/).filter(Boolean);
    setSpeakingWordIndex(0);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.05;

    let wordCounter = 0;
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        setSpeakingWordIndex(wordCounter);
        wordCounter++;
      }
    };

    utterance.onstart = () => {
      setIsSpeakingQuestion(true);
      // Fallback timer if browser voice engine doesn't fire onboundary
      const intervalMs = Math.max(160, Math.min(300, Math.round(60000 / (words.length * 150))));
      speakingIntervalRef.current = setInterval(() => {
        setSpeakingWordIndex(prev => {
          if (prev < words.length - 1) return prev + 1;
          clearInterval(speakingIntervalRef.current);
          return prev;
        });
      }, intervalMs);
    };

    utterance.onend = () => {
      setIsSpeakingQuestion(false);
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      setTimeout(() => setSpeakingWordIndex(-1), 1000);
    };

    utterance.onerror = () => {
      setIsSpeakingQuestion(false);
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      setSpeakingWordIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    const next = !speechMuted;
    setSpeechMuted(next);
    if (next) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      setIsSpeakingQuestion(false);
      setSpeakingWordIndex(-1);
    }
  };

  // Sample voice dictation helper for testing or when mic is disabled
  const handleInsertSampleDictation = () => {
    const qObj = questions[currentQIndex];
    let sample = '';
    if (company.toLowerCase() === 'wipro') {
      sample = "In Spring Boot, I configure HikariCP for high throughput connection pooling. I configure maximumPoolSize based on core capacity and use JPA read-only transactions to avoid dirty checking overhead. We also verify that all foreign keys have indexes.";
    } else if (company.toLowerCase() === 'google') {
      sample = "In modern web applications, I leverage a unified state architecture. For global session state, Context API with granular sub-stores is optimal. For data heavy domains, I utilize Redux Toolkit or Zustand paired with React.memo to prevent render cascading.";
    } else {
      sample = `For ${company}, I structure distributed services with bounded contexts and connection pooling. We ensure ACID compliance through transactional boundaries and monitor latency bottlenecks with distributed telemetry.`;
    }
    setCurrentAnswer(sample);
    committedAnswerRef.current = sample;
  };

  const handleSaveCurrentAnswer = () => {
    const qObj = questions[currentQIndex];
    if (qObj) {
      setAnswers(prev => ({
        ...prev,
        [qObj.id]: {
          question_id: qObj.id,
          question: qObj.question,
          user_response: currentAnswer,
          duration_seconds: elapsedSeconds
        }
      }));
    }
  };

  const handleNextQuestion = () => {
    stopRecording();
    handleSaveCurrentAnswer();
    if (currentQIndex < questions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = questions[nextIdx];
      const existing = answers[nextQ.id]?.user_response || '';
      setCurrentAnswer(existing);
      committedAnswerRef.current = existing;
      setInterimSpeech('');
      setElapsedSeconds(0);
      speakQuestionText(nextQ.question);
    }
  };

  const handlePrevQuestion = () => {
    stopRecording();
    handleSaveCurrentAnswer();
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      const prevQ = questions[prevIdx];
      const existing = answers[prevQ.id]?.user_response || '';
      setCurrentAnswer(existing);
      committedAnswerRef.current = existing;
      setInterimSpeech('');
      setElapsedSeconds(0);
      speakQuestionText(prevQ.question);
    }
  };

  const handleSubmitInterview = async () => {
    stopRecording();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const qObj = questions[currentQIndex];
    const latestAnswers = {
      ...answers,
      [qObj.id]: {
        question_id: qObj.id,
        question: qObj.question,
        user_response: currentAnswer,
        duration_seconds: elapsedSeconds
      }
    };

    const answersArray = Object.values(latestAnswers);
    const totalWords = answersArray.reduce((acc, curr) => {
      const words = (curr.user_response || '').trim().split(/\s+/).filter(Boolean);
      return acc + words.length;
    }, 0);

    if (totalWords < 12) {
      alert('Please speak or type a more substantive answer (at least 12-15 words) before submitting for AI diagnosis.');
      return;
    }

    try {
      setEvaluating(true);
      const payload = {
        role_title: role,
        company_name: company,
        answers: answersArray
      };

      const res = await api.post('/mock-interview/submit', payload);
      if (res.data.success) {
        setReport(res.data.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to analyze interview', err);
      alert('Evaluation error. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const currentQObj = questions[currentQIndex];
  const combinedText = currentAnswer.trim();
  const wordCount = combinedText ? combinedText.split(/\s+/).filter(Boolean).length : 0;
  const estimatedWpm = elapsedSeconds > 0 ? Math.round((wordCount / (elapsedSeconds / 60))) : 0;

  // Split question into words for word-by-word highlight animation
  const questionWords = (currentQObj?.question || '').split(/\s+/).filter(Boolean);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3.5rem' }}>
      <style>{`
        @keyframes eqDance1 { 0%, 100% { height: 6px; } 50% { height: 26px; } }
        @keyframes eqDance2 { 0%, 100% { height: 18px; } 50% { height: 8px; } }
        @keyframes eqDance3 { 0%, 100% { height: 10px; } 50% { height: 28px; } }
        @keyframes eqDance4 { 0%, 100% { height: 24px; } 50% { height: 12px; } }
        @keyframes eqDance5 { 0%, 100% { height: 8px; } 50% { height: 20px; } }
      `}</style>

      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/student/mock-interview')}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <ArrowLeft size={16} /> Exit to Interview Hub
          </button>

          {/* Prominent Mute / Unmute Button for AI Speaking */}
          <button
            onClick={toggleMute}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: speechMuted ? '#fef2f2' : '#f0fdf4',
              border: `1.5px solid ${speechMuted ? '#f87171' : '#34d399'}`,
              borderRadius: '9999px',
              padding: '0.4rem 0.9rem',
              color: speechMuted ? '#dc2626' : '#16a34a',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
            title={speechMuted ? 'Click to UNMUTE Coach Nova' : 'Click to MUTE Coach Nova'}
          >
            {speechMuted ? <VolumeX size={15} color="#dc2626" /> : <Volume2 size={15} color="#16a34a" />}
            <span>{speechMuted ? 'AI Voice Muted' : 'Coach Nova Voice Active'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: '#ffffff', padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <CompanyLogo companyName={company} size={24} />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--slate-800)' }}>
              {company}
            </span>
            <span style={{ color: 'var(--slate-300)' }}>|</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary-700)' }}>
              {role}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--slate-600)', fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            Live Voice Room
          </div>
        </div>
      </div>

      {/* Evaluating Loading State */}
      {evaluating && (
        <div className="card" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xl)',
          border: '2px solid #4f46e5'
        }}>
          <AiInterviewerDollGraphic state="evaluating" size={130} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '1.25rem', marginBottom: '0.5rem' }}>
            Coach Nova is Evaluating Your Interview...
          </h2>
          <p style={{ color: '#a5b4fc', maxWidth: '580px', margin: '0 auto 1.5rem', fontSize: '0.96rem', lineHeight: 1.6 }}>
            Diagnosing grammar mistakes, calculating verbal articulation & confidence scores, and assembling your personalized learning path...
          </p>
          <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Grammar Mistakes Audit
            </span>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Speech Ratings by AI
            </span>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Exemplary Model Answers
            </span>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Connecting Learning Programs
            </span>
          </div>
        </div>
      )}

      {/* Main Live Interview Stage */}
      {!report && !evaluating && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: AI Interviewer Virtual Stage */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            color: '#ffffff',
            padding: '2.25rem 1.75rem',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              border: '1px solid rgba(239, 68, 68, 0.35)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
              LIVE INTERVIEW
            </div>

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              <AiInterviewerDollGraphic state={dollState} size={150} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
              Coach Nova
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600 }}>
              Lead Technical Evaluator ({company})
            </span>

            {/* Dynamic Status Pill */}
            <div style={{
              marginTop: '1rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '9999px',
              backgroundColor: isSpeakingQuestion 
                ? 'rgba(99, 102, 241, 0.3)' 
                : isRecording 
                ? 'rgba(16, 185, 129, 0.25)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: `1.5px solid ${isSpeakingQuestion ? '#818cf8' : isRecording ? '#34d399' : 'rgba(255, 255, 255, 0.2)'}`,
              color: isSpeakingQuestion ? '#c7d2fe' : isRecording ? '#6ee7b7' : '#e2e8f0',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {isSpeakingQuestion ? (
                <>🔊 Speaking Question Aloud...</>
              ) : isRecording ? (
                <>🎙️ Listening & Transcribing Live...</>
              ) : (
                <>Ready & Waiting for Your Voice</>
              )}
            </div>

            {/* TTS Controls */}
            <div style={{ marginTop: '1.5rem', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.65rem', fontWeight: 700 }}>
                TEXT-TO-SPEECH CONTROLS
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => speakQuestionText(currentQObj?.question || '')}
                  disabled={isSpeakingQuestion || speechMuted}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isSpeakingQuestion ? '#4338ca' : '#4f46e5',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    borderRadius: '8px'
                  }}
                  title="Listen to Coach Nova ask this question"
                >
                  <Volume2 size={15} /> {isSpeakingQuestion ? 'Speaking...' : 'Listen Question'}
                </button>

                <button
                  onClick={toggleMute}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: speechMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                    color: speechMuted ? '#fca5a5' : '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 700,
                    borderRadius: '8px'
                  }}
                  title={speechMuted ? 'Unmute Coach Nova voice' : 'Mute Coach Nova voice'}
                >
                  {speechMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  {speechMuted ? 'Muted' : 'Mute Voice'}
                </button>

                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.6rem'
                  }}
                >
                  <option value="0.85" style={{ color: '#000' }}>0.85x Speed</option>
                  <option value="1.0" style={{ color: '#000' }}>1.0x Normal</option>
                  <option value="1.15" style={{ color: '#000' }}>1.15x Speed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live Candidate Audio & Response Console */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Question Progress Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-primary" style={{ fontWeight: 800, padding: '0.35rem 0.75rem' }}>
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                  {currentQObj?.category || 'Technical Assessment'}
                </span>
              </div>

              {/* Response Timer & Word Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: isRecording ? 'var(--danger-600)' : 'var(--slate-600)', fontWeight: 700 }}>
                  <Clock size={16} />
                  <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
                </div>
                <span style={{ color: 'var(--slate-300)' }}>•</span>
                <span style={{ color: 'var(--slate-700)', fontWeight: 700 }}>{wordCount} Words</span>
              </div>
            </div>

            {/* Question Prompt Display Box with Word-by-Word Animation Highlight */}
            <div style={{
              padding: '1.4rem 1.6rem',
              backgroundColor: 'var(--primary-50)',
              borderRadius: '16px',
              borderLeft: '5px solid var(--primary-600)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Question {currentQIndex + 1} Prompt
                </span>
                {isSpeakingQuestion && (
                  <span style={{ fontSize: '0.74rem', color: '#4f46e5', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Volume2 size={14} className="pulse" /> Coach Nova Speaking...
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.5, margin: 0 }}>
                {loadingQuestions ? (
                  'Loading question from company track...'
                ) : (
                  questionWords.map((word, wIdx) => {
                    const isCurrentSpoken = isSpeakingQuestion && speakingWordIndex === wIdx;
                    return (
                      <span
                        key={wIdx}
                        style={{
                          display: 'inline-block',
                          marginRight: '0.28rem',
                          padding: isCurrentSpoken ? '0.1rem 0.4rem' : '0.05rem 0.05rem',
                          borderRadius: '6px',
                          backgroundColor: isCurrentSpoken ? '#fde047' : 'transparent',
                          color: isCurrentSpoken ? '#1e1b4b' : 'inherit',
                          fontWeight: isCurrentSpoken ? 900 : 800,
                          transform: isCurrentSpoken ? 'scale(1.16)' : 'scale(1)',
                          boxShadow: isCurrentSpoken ? '0 0 14px rgba(250, 204, 21, 0.9)' : 'none',
                          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {word}
                      </span>
                    );
                  })
                )}
              </h2>
            </div>

            {/* Mic Permission Warning if error */}
            {micError && (
              <div style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <span>{micError}</span>
                </div>
                <button
                  onClick={handleInsertSampleDictation}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  Insert Sample Voice Dictation
                </button>
              </div>
            )}

            {/* Interactive Mic Centerpiece with Live Equalizer & Status */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.75rem 1.25rem',
              backgroundColor: isRecording ? '#fef2f2' : 'var(--slate-50)',
              borderRadius: '18px',
              border: `2px dashed ${isRecording ? 'var(--danger-500)' : 'var(--border-color)'}`,
              transition: 'all 0.25s ease'
            }}>
              {/* Massive Interactive Mic Button */}
              <button
                type="button"
                onClick={toggleRecording}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isRecording ? 'var(--danger-600)' : 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isRecording 
                    ? '0 0 0 12px rgba(239, 68, 68, 0.25), 0 8px 24px rgba(239, 68, 68, 0.45)' 
                    : '0 0 0 6px rgba(79, 70, 229, 0.15), 0 8px 20px rgba(79, 70, 229, 0.35)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title={isRecording ? 'Click to Pause Recording' : 'Click to Speak into Microphone'}
              >
                {isRecording ? <MicOff size={38} /> : <Mic size={38} />}
              </button>

              {/* Animated Audio Equalizer Bars when Recording */}
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '30px', marginTop: '1rem' }}>
                  <div style={{ width: 5, backgroundColor: '#ef4444', borderRadius: 3, animation: 'eqDance1 0.7s ease-in-out infinite' }} />
                  <div style={{ width: 5, backgroundColor: '#f59e0b', borderRadius: 3, animation: 'eqDance2 0.5s ease-in-out infinite' }} />
                  <div style={{ width: 5, backgroundColor: '#10b981', borderRadius: 3, animation: 'eqDance3 0.8s ease-in-out infinite' }} />
                  <div style={{ width: 5, backgroundColor: '#f59e0b', borderRadius: 3, animation: 'eqDance4 0.6s ease-in-out infinite' }} />
                  <div style={{ width: 5, backgroundColor: '#ef4444', borderRadius: 3, animation: 'eqDance5 0.75s ease-in-out infinite' }} />
                </div>
              )}

              <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: isRecording ? 'var(--danger-700)' : 'var(--slate-800)' }}>
                  {isRecording ? '🎙️ LISTENING TO YOUR VOICE — WORDS STREAMING BELOW' : 'Click the Microphone to Dictate Your Answer'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  {isRecording 
                    ? 'Speak naturally. Every word you utter scripts directly into the Answer Box in real time!' 
                    : 'Your voice is transcribed word-for-word in real time.'}
                </div>
              </div>
            </div>

            {/* Answer Editor & Complete Transcript Box */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Answer Response Box (Spoken Voice or Typed)
                  {isRecording && (
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 800 }}>
                      Live Scripting
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {estimatedWpm > 0 && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: estimatedWpm > 175 ? 'var(--warning-600)' : 'var(--success-600)' }}>
                      Pace: ~{estimatedWpm} WPM {estimatedWpm > 175 ? '(Fast)' : '(Optimal)'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleInsertSampleDictation}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Insert Sample Voice Answer
                  </button>
                </div>
              </div>

              {/* Textarea updating live with candidate's speech */}
              <textarea
                className="form-control"
                rows={6}
                placeholder="Click the microphone above to speak aloud. Your voice will automatically transcribe into this box in real time. You can also edit, format, or type your answer manually..."
                value={currentAnswer}
                onChange={(e) => {
                  setCurrentAnswer(e.target.value);
                  committedAnswerRef.current = e.target.value;
                }}
                style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.6,
                  borderColor: isRecording ? '#ef4444' : 'var(--slate-300)',
                  boxShadow: isRecording ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            {/* Question Step Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentAnswer('');
                    committedAnswerRef.current = '';
                    setInterimSpeech('');
                  }}
                  className="btn btn-secondary btn-sm"
                  title="Clear text for this question"
                >
                  <RotateCcw size={14} /> Clear Response
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentQIndex === 0}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                  >
                    Next Question <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitInterview}
                    className="btn btn-primary"
                    style={{
                      backgroundColor: 'var(--success-600)',
                      borderColor: 'var(--success-600)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <Send size={16} /> Submit & Get AI Diagnosis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Post-Interview AI Diagnostic Evaluation Report */}
      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Score Summary Banner */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)',
            color: '#ffffff',
            padding: '2.5rem',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-xl)',
            border: '2px solid rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '0.5rem',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <AiInterviewerDollGraphic state="idle" size={90} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span className="badge" style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 800 }}>
                      AI Diagnostic Performance Assessment
                    </span>
                    <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}>
                      {report.company} Track
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    {report.role}
                  </h2>

                  <p style={{ color: '#c7d2fe', fontSize: '0.92rem', margin: '0.45rem 0 0 0', maxWidth: '600px', lineHeight: 1.55 }}>
                    {report.feedbackSummary}
                  </p>
                </div>
              </div>

              {/* Overall Star Rating & Score */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '1.75rem 2.25rem',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <Star size={24} fill="#facc15" color="#facc15" />
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff' }}>
                    {report.speechRatingStars}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 700 }}>/ 5.0</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {report.overallScore >= 82 ? '🏆 Strong Hire' : report.overallScore >= 68 ? '✅ Candidate Ready' : '📚 Developing'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#c7d2fe', marginTop: '0.2rem' }}>
                  Overall Readiness: {report.overallScore}%
                </div>
              </div>
            </div>
          </div>

          {/* 4 Multi-Dimensional AI Speech & Technical Ratings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Technical Mastery */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Technical Depth</span>
                <Brain size={20} color="var(--primary-600)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {report.technicalScore}%
              </div>
              <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${report.technicalScore}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.4rem', display: 'block' }}>
                Domain keywords, system trade-offs & architecture.
              </span>
            </div>

            {/* Grammar & Phrasing */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Grammar & Diction</span>
                <CheckCircle2 size={20} color="var(--success-600)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {report.grammarScore}%
              </div>
              <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${report.grammarScore}%`, height: '100%', backgroundColor: 'var(--success-600)' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.4rem', display: 'block' }}>
                Grammatical accuracy, syntax variety & formal vocabulary.
              </span>
            </div>

            {/* Speech & Confidence */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Verbal Confidence</span>
                <Award size={20} color="var(--accent-600)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {report.confidenceScore}%
              </div>
              <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${report.confidenceScore}%`, height: '100%', backgroundColor: 'var(--accent-600)' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.4rem', display: 'block' }}>
                Assertive phrasing, decisiveness & verbal composure.
              </span>
            </div>

            {/* Delivery & Pacing */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-700)' }}>Delivery & Fluency</span>
                <Mic size={20} color="var(--primary-600)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {report.communicationScore}%
              </div>
              <div style={{ width: '100%', height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${report.communicationScore}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.4rem', display: 'block' }}>
                {report.fillerWordsDetected} filler words detected ({report.fillerWordsDetected <= 2 ? 'Minimal / Great' : 'Requires reduction'}).
              </span>
            </div>
          </div>

          {/* Grammar Mistakes & Language Diagnostics */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <AlertTriangle size={22} color="var(--warning-600)" />
                  Grammar & Speech Diagnostics Audit
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  Detailed analysis of syntax issues, conversational slang, and suggested executive replacements.
                </p>
              </div>

              <span className="badge" style={{
                backgroundColor: (report.grammarMistakes?.length || 0) === 0 ? '#ecfdf5' : '#fffbeb',
                color: (report.grammarMistakes?.length || 0) === 0 ? '#047857' : '#92400e',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                {(report.grammarMistakes?.length || 0) === 0 ? '✨ 0 Grammar Mistakes Found!' : `⚠️ ${report.grammarMistakes.length} Grammar Suggestions`}
              </span>
            </div>

            {(!report.grammarMistakes || report.grammarMistakes.length === 0) ? (
              <div style={{ padding: '1.75rem', textAlign: 'center', backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1.5px solid #a7f3d0' }}>
                <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ margin: 0, color: '#065f46', fontSize: '1.05rem', fontWeight: 800 }}>
                  Excellent Grammatical Accuracy!
                </h4>
                <p style={{ margin: '0.35rem 0 0', color: '#047857', fontSize: '0.88rem' }}>
                  No colloquial slang, double negatives, or subject-verb agreement errors were identified in your responses.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {report.grammarMistakes.map((g, idx) => (
                  <div key={idx} style={{
                    padding: '1.2rem 1.4rem',
                    borderRadius: '14px',
                    backgroundColor: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 800 }}>
                        {g.issueType}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#92400e', fontWeight: 600 }}>
                        Question #{g.questionId}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.2rem' }}>
                      <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#dc2626', fontWeight: 800 }}>
                          ❌ Detected in Your Speech:
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#991b1b', marginTop: '0.2rem' }}>
                          "{g.detectedText}"
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#16a34a', fontWeight: 800 }}>
                          ✅ Recommended Executive Phrasing:
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#166534', marginTop: '0.2rem' }}>
                          "{g.suggestedCorrection}"
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#78350f', marginTop: '0.2rem' }}>
                      💡 <strong>Rule Explanation:</strong> {g.ruleExplanation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Requirement: Connecting Learning Path & Learning Programs */}
          <div className="card" style={{
            padding: '2.25rem',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #dbeafe 100%)',
            border: '2px solid #10b981',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: '1 1 500px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                  <GraduationCap size={15} /> Tailored Career Advancement
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#065f46', margin: '0 0 0.35rem 0' }}>
                  Connect Your Results to Learning Programs & Pathway
                </h3>
                <p style={{ color: '#047857', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                  Based on your performance in this mock interview, our AI curriculum engine has identified key improvement modules to help you bridge your technical gaps for <strong>{company}</strong>.
                </p>

                {/* 3 Recommended Learning Modules */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                      Recommended Module 1
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', marginTop: '0.2rem' }}>
                      {company === 'Wipro' ? 'Java Spring Boot Enterprise Architecture' : 'Distributed System Design & Scalability'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                      Recommended Module 2
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', marginTop: '0.2rem' }}>
                      Database Indexing, Locking & ACID Concurrency
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                      Recommended Module 3
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', marginTop: '0.2rem' }}>
                      Executive Communication & STAR Method Fluency
                    </div>
                  </div>
                </div>

                {/* Connect Action Buttons */}
                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate('/student/learning')}
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 800,
                      padding: '0.8rem 1.6rem',
                      borderRadius: '12px',
                      backgroundColor: '#059669',
                      borderColor: '#059669',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
                    }}
                  >
                    <BookOpen size={17} /> Connect to Learning Programs <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => navigate('/student/roadmap')}
                    className="btn btn-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 800,
                      padding: '0.8rem 1.4rem',
                      borderRadius: '12px',
                      color: '#065f46',
                      borderColor: '#059669',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <Compass size={17} /> View Milestone Roadmap
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem 1.5rem',
                borderRadius: '16px',
                border: '1.5px solid #a7f3d0',
                textAlign: 'center',
                minWidth: '200px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                  Pathway Ready
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#065f46', margin: '0.2rem 0' }}>
                  {report.overallScore}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                  Milestone Track Active
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Strengths & Enhancements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ThumbsUp size={20} color="var(--success-600)" />
                What You Mastered (Key Strengths)
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.55 }}>
                {report.strengths?.map((str, idx) => (
                  <li key={idx}>
                    <strong>{str}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={20} color="var(--primary-600)" />
                Targeted Areas for Enhancement
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.55 }}>
                {report.improvements?.map((imp, idx) => (
                  <li key={idx}>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exemplary Model Answers (STAR Method) Comparison */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={22} color="var(--primary-600)" />
              Per-Question Performance & Exemplary Model Answers
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Compare your answer with the gold-standard reference response to elevate your technical depth.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {report.questionsFeedback?.map((q, idx) => (
                <div key={idx} style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
                        Question {idx + 1}: {q.category}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                        {q.question}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className="badge badge-neutral">Tech: {q.technical_score}%</span>
                      <span className="badge badge-neutral">Grammar: {q.grammar_score}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {/* Your Answer */}
                    <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--slate-600)', marginBottom: '0.35rem' }}>
                        Your Answer ({q.word_count} words)
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--slate-800)', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
                        "{q.user_response || 'No response provided.'}"
                      </p>
                    </div>

                    {/* Exemplary Model Answer */}
                    <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: '#047857', marginBottom: '0.35rem' }}>
                        🌟 Exemplary Model Answer (STAR Method)
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#065f46', lineHeight: 1.55, margin: 0 }}>
                        {q.ideal_answer}
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '0.75rem', fontWeight: 600 }}>
                    💡 <strong>Interviewer Critique:</strong> {q.critique}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons to Practice Again or Return */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem' }}>
            <button
              onClick={() => {
                setReport(null);
                setCurrentQIndex(0);
                setCurrentAnswer('');
                committedAnswerRef.current = '';
                setInterimSpeech('');
                setAnswers({});
                setElapsedSeconds(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.85rem 1.75rem' }}
            >
              <RefreshCw size={18} /> Retake / Practice Another Round
            </button>

            <button
              onClick={() => navigate('/student/mock-interview')}
              className="btn btn-outline"
              style={{ fontWeight: 700, padding: '0.85rem 1.75rem' }}
            >
              Return to Mock Interview Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
