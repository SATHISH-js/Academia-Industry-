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
  HelpCircle,
  ThumbsUp,
  TrendingUp,
  Share2,
  BookOpen,
  RefreshCw,
  Star,
  Check,
  XCircle,
  Zap,
  Play
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
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Audio & Speech States
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [audioSupported, setAudioSupported] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);

  // Timers & Metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

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
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [role, company]);

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
        setQuestions(res.data.data.questions);
        setCurrentQIndex(0);
        setCurrentAnswer('');
        // Automatically speak first question after short delay
        setTimeout(() => {
          speakQuestionText(res.data.data.questions[0].question);
        }, 600);
      }
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(prev => {
          const prefix = prev ? prev + ' ' : '';
          return prefix + transcript;
        });
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setAudioSupported(false);
    }
  };

  const toggleRecording = () => {
    if (!audioSupported || !recognitionRef.current) {
      alert('Microphone speech recognition is not supported in this browser. You can type your answer in the box below!');
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      // If AI doll is speaking, cancel it first
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);

      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start microphone:', err);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakQuestionText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
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
      alert('Please speak or type a more detailed answer (at least 12-15 words) before submitting for AI diagnosis.');
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
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedWpm = elapsedSeconds > 0 ? Math.round((wordCount / (elapsedSeconds / 60))) : 0;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => navigate('/student/mock-interview')}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
        >
          <ArrowLeft size={16} /> Exit Studio to Hub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: '#ffffff', padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <CompanyLogo companyName={company} size={22} />
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--slate-800)' }}>
              {company}
            </span>
            <span style={{ color: 'var(--slate-400)' }}>|</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-700)' }}>
              {role}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            AI Interview Engine Active
          </div>
        </div>
      </div>

      {/* Evaluating Loading Overlay */}
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1.25rem', marginBottom: '0.5rem' }}>
            Coach Nova is Evaluating Your Interview...
          </h2>
          <p style={{ color: '#a5b4fc', maxWidth: '580px', margin: '0 auto 1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Analyzing speech patterns, diagnosing grammar mistakes, measuring technical keyword depth, and calculating your executive hireability rating...
          </p>
          <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Grammar Mistakes Audit
            </span>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Filler Words Density
            </span>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Speech Pacing & Articulation
            </span>
            <span className="badge" style={{ backgroundColor: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4338ca' }}>
              ✓ Exemplary Model Answers
            </span>
          </div>
        </div>
      )}

      {/* Main Interview Stage (When NOT viewing report) */}
      {!report && !evaluating && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: AI Interviewer Virtual Stage */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            color: '#ffffff',
            padding: '2rem 1.75rem',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Live Indicator */}
            <div style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
              LIVE ROUND
            </div>

            {/* AI Doll Graphic */}
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
                <>🎙️ Listening to You Speak...</>
              ) : (
                <>Ready & Waiting for Your Voice</>
              )}
            </div>

            {/* Question Audio Controls */}
            <div style={{ marginTop: '1.5rem', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.65rem', fontWeight: 600 }}>
                INTERVIEWER TEXT-TO-SPEECH
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => speakQuestionText(currentQObj?.question || '')}
                  disabled={isSpeakingQuestion}
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
                  title="Listen to Coach Nova ask this question aloud"
                >
                  <Volume2 size={15} /> {isSpeakingQuestion ? 'Speaking...' : 'Listen to Question'}
                </button>

                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.6rem'
                  }}
                  title="Playback Speech Speed"
                >
                  <option value="0.85" style={{ color: '#000' }}>0.85x Speed</option>
                  <option value="1.0" style={{ color: '#000' }}>1.0x Normal</option>
                  <option value="1.15" style={{ color: '#000' }}>1.15x Speed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Candidate Console */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Question Progress Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-primary" style={{ fontWeight: 800, padding: '0.35rem 0.75rem' }}>
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                  {currentQObj?.category || 'Technical Evaluation'}
                </span>
              </div>

              {/* Response Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: isRecording ? 'var(--danger-600)' : 'var(--slate-600)', fontWeight: 700 }}>
                  <Clock size={16} />
                  <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
                </div>
                <span style={{ color: 'var(--slate-300)' }}>•</span>
                <span style={{ color: 'var(--slate-600)', fontWeight: 600 }}>{wordCount} Words</span>
              </div>
            </div>

            {/* Question Prompt Display Box */}
            <div style={{
              padding: '1.4rem 1.6rem',
              backgroundColor: 'var(--primary-50)',
              borderRadius: '16px',
              borderLeft: '5px solid var(--primary-600)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Technical Interview Prompt
              </span>
              <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.45, margin: '0.4rem 0 0 0' }}>
                {loadingQuestions ? 'Preparing targeted company questions...' : currentQObj?.question}
              </h2>
            </div>

            {/* Interactive Mic Button & Audio Equalizer Centerpiece */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.75rem 1rem',
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
                  width: 82,
                  height: 82,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isRecording ? 'var(--danger-600)' : 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isRecording 
                    ? '0 0 0 10px rgba(239, 68, 68, 0.25), 0 8px 24px rgba(239, 68, 68, 0.4)' 
                    : '0 0 0 6px rgba(79, 70, 229, 0.15), 0 8px 20px rgba(79, 70, 229, 0.35)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                title={isRecording ? 'Click to Stop Recording' : 'Click to Speak into Microphone'}
              >
                {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isRecording ? 'var(--danger-700)' : 'var(--slate-800)' }}>
                  {isRecording ? 'Microphone Active — Dictating Your Voice...' : 'Click Mic to Start Speaking'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  {isRecording 
                    ? 'Speak clearly. When finished with this question, click the red button to pause.' 
                    : 'Or type directly in the response box below if you prefer.'}
                </div>
              </div>
            </div>

            {/* Live Dictation & Response Text Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--slate-800)', margin: 0 }}>
                  Your Spoken Answer (Live Transcript & Editor)
                </label>
                {estimatedWpm > 0 && (
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: estimatedWpm > 170 ? 'var(--warning-600)' : 'var(--success-600)' }}>
                    Pace: ~{estimatedWpm} WPM {estimatedWpm > 170 ? '(Fast)' : '(Normal)'}
                  </span>
                )}
              </div>

              <textarea
                className="form-control"
                rows={6}
                placeholder="Your voice transcription will appear here in real time as you speak into the microphone. You can also edit, polish, or type your technical answer manually..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                style={{
                  fontSize: '0.96rem',
                  lineHeight: 1.6,
                  borderColor: isRecording ? 'var(--danger-500)' : 'var(--slate-300)',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Step Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentAnswer('')}
                  className="btn btn-secondary btn-sm"
                  title="Clear text for this question"
                >
                  <RotateCcw size={14} /> Clear Text
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
          {/* Top Score Banner */}
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

          {/* Grammar Mistakes & Language Diagnostics (User Requirement 2) */}
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

          {/* What to Improve & Enhancing the Student (User Requirement 4) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Candidate Superpowers (Strengths) */}
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

            {/* Targeted Enhancement Areas */}
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
