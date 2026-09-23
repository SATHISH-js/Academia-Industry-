import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  Send,
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
  TrendingUp
} from 'lucide-react';

export const MockInterviewPage = () => {
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer (SWE)');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('STUDIO'); // 'STUDIO', 'REPORT', 'HISTORY'
  const [loadingPresets, setLoadingPresets] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchPresets();
    fetchHistory();
    setupSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchPresets = async () => {
    try {
      setLoadingPresets(true);
      const res = await api.get('/mock-interview/presets');
      if (res.data.success) {
        setPresets(res.data.data);
        if (res.data.data.length > 0) {
          const first = res.data.data[0];
          setSelectedPresetId(first.id);
          setTargetRole(first.role);
          setTargetCompany(first.company);
          setQuestions(first.questions);
        }
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

  const setupSpeechRecognition = () => {
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
        setCurrentAnswer((prev) => {
          const prefix = prev ? prev + ' ' : '';
          return prefix + transcript;
        });
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const handleSelectPreset = (presetId) => {
    const found = presets.find(p => p.id === presetId);
    if (found) {
      setSelectedPresetId(found.id);
      setTargetRole(found.role);
      setTargetCompany(found.company);
      setQuestions(found.questions);
      setCurrentQIndex(0);
      setAnswers({});
      setCurrentAnswer('');
      setReport(null);
      setActiveTab('STUDIO');
    }
  };

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your answers directly in the response box!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  const handleSaveCurrentAnswer = () => {
    const currentQ = questions[currentQIndex]?.question;
    if (currentQ) {
      setAnswers(prev => ({ ...prev, [currentQ]: currentAnswer }));
    }
  };

  const handleNextQuestion = () => {
    handleSaveCurrentAnswer();
    if (currentQIndex < questions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = questions[nextIdx]?.question;
      setCurrentAnswer(answers[nextQ] || '');
    }
  };

  const handlePrevQuestion = () => {
    handleSaveCurrentAnswer();
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      const prevQ = questions[prevIdx]?.question;
      setCurrentAnswer(answers[prevQ] || '');
    }
  };

  const handleSubmitInterview = async () => {
    // Save latest
    const currentQ = questions[currentQIndex]?.question;
    const finalAnswers = { ...answers };
    if (currentQ && currentAnswer) {
      finalAnswers[currentQ] = currentAnswer;
    }

    // Combine responses into continuous text for AI evaluation
    const combinedResponse = Object.values(finalAnswers).join(' ');
    if (!combinedResponse.trim() || combinedResponse.trim().split(/\s+/).length < 10) {
      alert('Please provide a substantive response (at least 10-15 words) before requesting an AI evaluation.');
      return;
    }

    try {
      setEvaluating(true);
      const payload = {
        role: targetRole,
        company: targetCompany,
        userResponse: combinedResponse,
        questionsAsked: questions.map(q => q.question)
      };

      const res = await api.post('/mock-interview/submit', payload);
      if (res.data.success) {
        setReport(res.data.data);
        setActiveTab('REPORT');
        fetchHistory(); // Refresh past sessions
      }
    } catch (err) {
      console.error('Failed to evaluate mock interview', err);
      alert('Failed to evaluate interview response. Please ensure your response is detailed.');
    } finally {
      setEvaluating(false);
    }
  };

  const currentQObj = questions[currentQIndex];
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', marginBottom: '0.75rem' }}>
              <Brain size={13} /> Next-Gen AI Mock Interview Simulator
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              AI Role & Company Mock Interview
            </h1>
            <p style={{ color: 'var(--slate-300)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Experience realistic interview rounds tailored to top companies. Our AI evaluates every word of your response—measuring technical accuracy, speech confidence, delivery clarity, and filler words.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem', borderRadius: 'var(--radius-md)', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('STUDIO')}
              style={{
                background: activeTab === 'STUDIO' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Interview Studio
            </button>
            {report && (
              <button
                onClick={() => setActiveTab('REPORT')}
                style={{
                  background: activeTab === 'REPORT' ? 'var(--primary-600)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                AI Diagnostic Report
              </button>
            )}
            <button
              onClick={() => setActiveTab('HISTORY')}
              style={{
                background: activeTab === 'HISTORY' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <History size={14} /> Past Sessions ({historyList.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'STUDIO' && (
        <div className="interview-studio-grid">
          {/* Left Column: Preset Track Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="var(--primary-600)" /> Company & Role Track
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {presets.map(p => {
                  const isSelected = p.id === selectedPresetId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--slate-50)',
                        border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? 'var(--primary-700)' : 'var(--slate-500)', textTransform: 'uppercase' }}>
                          {p.company}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                          {p.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                        {p.role}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                        {p.questions?.length} Target Questions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Real-time Audio Guidance */}
            <div className="card" style={{ backgroundColor: 'var(--slate-900)', color: '#ffffff', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Bot size={18} color="var(--primary-400)" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  AI Interviewer Tips
                </h4>
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--slate-300)', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
                <li>Listen to question audio with the <strong>Speak Question</strong> button.</li>
                <li>Speak naturally into your microphone or type your responses.</li>
                <li>Structure answers with the <strong>STAR method</strong> (Situation, Task, Action, Result).</li>
                <li>Avoid excessive filler words like <em>um</em>, <em>like</em>, <em>basically</em>.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Interactive Interview Studio */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Question Header & Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-primary">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="badge badge-neutral">
                  Category: {currentQObj?.category || 'Technical'}
                </span>
              </div>

              {/* Text-to-Speech Question Reader */}
              <button
                onClick={() => speakQuestion(currentQObj?.question || '')}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                title="Listen to interviewer speak this question aloud"
              >
                <Volume2 size={16} color={isSpeaking ? 'var(--primary-600)' : 'inherit'} />
                {isSpeaking ? 'Speaking Question...' : 'Speak Question'}
              </button>
            </div>

            {/* Prompt Display */}
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--primary-600)'
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.5 }}>
                {currentQObj?.question || 'Select a role to start interview.'}
              </h2>
            </div>

            {/* Response Studio Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--slate-800)', margin: 0 }}>
                  Your Response (Spoken Voice or Typed)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  <span>Words: <strong>{wordCount}</strong></span>
                  {isRecording && (
                    <span style={{ color: 'var(--danger-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--danger-500)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                      Microphone Active
                    </span>
                  )}
                </div>
              </div>

              <textarea
                className="form-control"
                rows={7}
                placeholder="Click 'Start Voice Dictation' to speak naturally, or type your comprehensive response here. Include technical details, trade-offs, and examples..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  borderColor: isRecording ? 'var(--danger-500)' : 'var(--slate-300)'
                }}
              />
            </div>

            {/* Control Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                  style={{
                    backgroundColor: isRecording ? 'var(--danger-600)' : '#ffffff',
                    color: isRecording ? '#ffffff' : 'var(--slate-800)',
                    borderColor: isRecording ? 'var(--danger-600)' : 'var(--slate-300)'
                  }}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} color="var(--primary-600)" />}
                  {isRecording ? 'Stop Recording' : 'Start Voice Dictation'}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentAnswer('')}
                  className="btn btn-secondary"
                  title="Clear current text"
                >
                  <RotateCcw size={16} /> Clear
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentQIndex === 0}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitInterview}
                    disabled={evaluating}
                    className="btn btn-primary"
                    style={{ backgroundColor: 'var(--success-600)', borderColor: 'var(--success-600)' }}
                  >
                    {evaluating ? (
                      <>
                        <Sparkles size={18} className="animate-spin" /> Analyzing Every Word...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit & Get AI Report
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Detailed AI Diagnostic Report */}
      {activeTab === 'REPORT' && (
        report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Score Summary Banner */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
                  AI NLP Diagnostic Evaluation
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                  Interview Performance: {report.role}
                </h2>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--primary-200)', fontSize: '0.9rem' }}>
                  <span>Company Track: <strong>{report.company}</strong></span>
                  <span>Words Analyzed: <strong>{report.wordCount}</strong></span>
                  <span>Filler Words Detected: <strong>{report.fillerWordsCount}</strong></span>
                </div>
              </div>

              {/* Overall Score Dial */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '1.5rem 2rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: '#ffffff' }}>
                  {report.overallScore}%
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-200)', marginTop: '0.35rem' }}>
                  Role Readiness Score
                </div>
              </div>
            </div>
          </div>

          {/* Tri-Metric Score Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-600)' }}>Confidence Score</span>
                <Award size={22} color="var(--primary-600)" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {report.confidenceScore}%
              </div>
              <div style={{ width: '100%', height: 8, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{ width: `${report.confidenceScore}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                Based on authoritative phrasing, assertion clarity, and lack of hesitation.
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-600)' }}>Technical Mastery</span>
                <Brain size={22} color="var(--accent-600)" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {report.technicalScore}%
              </div>
              <div style={{ width: '100%', height: 8, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{ width: `${report.technicalScore}%`, height: '100%', backgroundColor: 'var(--accent-600)' }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                Matches key architectural patterns, CS fundamentals, and industry keywords.
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-600)' }}>Communication Clarity</span>
                <MessageSquare size={22} color="var(--success-600)" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                {report.communicationScore}%
              </div>
              <div style={{ width: '100%', height: 8, backgroundColor: 'var(--slate-200)', borderRadius: 4, marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{ width: `${report.communicationScore}%`, height: '100%', backgroundColor: 'var(--success-600)' }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                Evaluates vocabulary variety, sentence pacing, and clean structure.
              </div>
            </div>
          </div>

          {/* Keywords & Filler Words Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--primary-600)" /> Detected Technical Concepts
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {report.detectedKeywords?.length > 0 ? (
                  report.detectedKeywords.map((kw, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      ✔ {kw}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>No specific technical keywords detected. Try mentioning core technologies, data structures, or frameworks.</span>
                )}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="var(--warning-600)" /> Speech & Filler Words Analysis
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
                Total filler words identified: <strong>{report.fillerWordsCount}</strong> ({report.fillerWordsCount > 4 ? 'Moderate' : 'Low/Good'})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {report.detectedFillerWords?.length > 0 ? (
                  report.detectedFillerWords.map((fw, idx) => (
                    <span key={idx} className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      ⚠ "{fw}"
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--success-600)', fontWeight: 600 }}>
                    🎉 Zero or negligible filler words detected! Excellent speech fluency.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Feedback & Growth Plan */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Actionable AI Feedback & Improvement Advice
            </h3>
            <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
              {report.detailedFeedback}
            </p>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button
                onClick={() => {
                  setActiveTab('STUDIO');
                  setCurrentQIndex(0);
                  setAnswers({});
                  setCurrentAnswer('');
                }}
                className="btn btn-primary"
              >
                <RotateCcw size={16} /> Retake / Practice Again
              </button>
            </div>
          </div>
        </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Brain size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary-400)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              No Active Diagnostic Report
            </h3>
            <p style={{ color: 'var(--slate-600)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              Complete a mock interview round in the Interview Studio or select a past session from your history to view its AI diagnostic evaluation.
            </p>
            <button onClick={() => setActiveTab('STUDIO')} className="btn btn-primary" style={{ margin: '0 auto' }}>
              Launch Interview Studio
            </button>
          </div>
        )
      )}

      {/* Tab: Past Sessions History */}
      {activeTab === 'HISTORY' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--primary-600)" /> Mock Interview Practice History
          </h3>

          {historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
              No previous mock interview sessions found. Start a practice round in the Interview Studio!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Target Role</th>
                    <th>Company</th>
                    <th>Overall Score</th>
                    <th>Technical</th>
                    <th>Confidence</th>
                    <th>Communication</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((h) => (
                    <tr key={h.id}>
                      <td>{new Date(h.created_at).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{h.role}</td>
                      <td>
                        <span className="badge badge-primary">{h.company}</span>
                      </td>
                      <td>
                        <strong style={{ color: h.overall_score >= 80 ? 'var(--success-600)' : h.overall_score >= 60 ? 'var(--primary-600)' : 'var(--warning-600)', fontSize: '1rem' }}>
                          {h.overall_score}%
                        </strong>
                      </td>
                      <td>{h.technical_score}%</td>
                      <td>{h.confidence_score}%</td>
                      <td>{h.communication_score}%</td>
                      <td>
                        <button
                          onClick={() => {
                            setReport({
                              role: h.role,
                              company: h.company,
                              overallScore: h.overall_score,
                              confidenceScore: h.confidence_score,
                              technicalScore: h.technical_score,
                              communicationScore: h.communication_score,
                              wordCount: h.word_count,
                              fillerWordsCount: h.filler_words_count,
                              detectedKeywords: Array.isArray(h.detected_keywords) ? h.detected_keywords : [],
                              detectedFillerWords: Array.isArray(h.detected_filler_words) ? h.detected_filler_words : [],
                              detailedFeedback: h.feedback
                            });
                            setActiveTab('REPORT');
                          }}
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          View Report
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
    </div>
  );
};
