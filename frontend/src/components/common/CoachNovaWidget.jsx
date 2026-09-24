import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { AiInterviewerDollGraphic } from '../interview/AiInterviewerDoll';
import { 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronRight, 
  RotateCcw,
  Zap,
  HelpCircle,
  ExternalLink,
  Compass,
  Award,
  Briefcase,
  Play
} from 'lucide-react';

const GENERAL_PROMPTS = [
  'How do I close my System Design gap (-25 pts)?',
  'Explain Master Theorem & Big-O in simple terms',
  'What are top questions in TCS & TechCorp interviews?',
  'How do I build a Docker & Cloud CI/CD pipeline?',
  'How do I optimize my resume for ATS?'
];

const ROADMAP_PROMPTS = [
  'How do I complete my active phase tasks?',
  'How do I generate a custom dynamic roadmap?',
  'What are the core skills for this roadmap?',
  'Which roadmap track fits Full Stack + Cloud best?'
];

const INTERVIEW_PROMPTS = [
  'What are top technical questions for Wipro Elite?',
  'How do I structure answers using the STAR method?',
  'Explain database indexing and B-Trees simply',
  'How can I improve my interview articulation score?'
];

export const CoachNovaWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRoadmapPage = location.pathname.includes('roadmap');
  const isInterviewPage = location.pathname.includes('mock-interview');

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const messagesEndRef = useRef(null);

  // Determine contextual prompts
  const activePrompts = isRoadmapPage 
    ? ROADMAP_PROMPTS 
    : isInterviewPage 
    ? INTERVIEW_PROMPTS 
    : GENERAL_PROMPTS;

  // Initialize greeting
  useEffect(() => {
    const studentName = user?.name ? user.name.split(' ')[0] : 'there';

    let pageGreeting = `I am your **AI Mock Interview Coach & Universal Career Guide** across the platform! 🤖✨`;
    if (isRoadmapPage) {
      pageGreeting = `I see you are viewing your **Career Roadmap**! I can guide you through each milestone task and explain industry pathways. (Voice audio is muted on this roadmap). 🗺️✨`;
    } else if (isInterviewPage) {
      pageGreeting = `Welcome to the **AI Mock Interview Studio**! Ask me any interview question, explore STAR response frameworks, or step into the live room! 🎙️✨`;
    }

    setMessages([
      {
        id: 'welcome',
        sender: 'nova',
        text: `### 👋 Hi ${studentName}! I'm Coach Nova

${pageGreeting}

What would you like to master today?`,
        followUps: activePrompts
      }
    ]);
  }, [user, isRoadmapPage, isInterviewPage]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Text-to-speech helper (STRICTLY MUTED on roadmap per user requirement: "no speaking in roadmap ai")
  const speakText = (text) => {
    if (isRoadmapPage) return; // Zero audio on roadmap
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_$\\]/g, '').slice(0, 280);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Ignore speech failure
    }
  };

  const handleSend = async (messageText) => {
    const query = (messageText || inputVal).trim();
    if (!query || loading) return;

    setInputVal('');

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload = {
        message: query,
        context: {
          targetRole: user?.profile?.headline || 'Full Stack + Cloud',
          currentRoute: location.pathname,
          userName: user?.name
        }
      };

      const res = await api.post('/coach-nova/ask', payload);
      if (res.data.success) {
        const novaMsg = {
          id: Date.now() + 1,
          sender: 'nova',
          text: res.data.answer,
          followUps: res.data.suggestedFollowUps || []
        };
        setMessages(prev => [...prev, novaMsg]);
        speakText(res.data.answer);
      } else {
        throw new Error('No answer received');
      }
    } catch (err) {
      console.error('[CoachNova Error]', err);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'nova',
        text: `### 💡 Coach Nova Quick Guidance

Immediate advice for **${query}**:
* Focus on hands-on code implementations rather than rote memorization.
* For System Design: master **Redis caching, horizontal load balancing, and consistent hashing**.
* For Roadmaps: check off your active milestone tasks to boost verified technical readiness!`,
        followUps: activePrompts.slice(0, 3)
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const studentName = user?.name ? user.name.split(' ')[0] : 'there';
    setMessages([
      {
        id: Date.now(),
        sender: 'nova',
        text: `Chat cleared! How else can I assist your learning journey, ${studentName}? 🚀`,
        followUps: activePrompts
      }
    ]);
  };

  // Do not render floating corner doll when user is in the AI Mock Interview section
  // Only the mock interview's own AI and speech should be visible
  if (isInterviewPage) {
    return null;
  }

  return (
    <>
      {/* Floating Launcher Button - Authentic Animated Coach Nova AI Doll */}
      {!isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9990,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          {/* Tooltip speech pill */}
          <div 
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.55rem 0.95rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1.5px solid rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Sparkles size={14} color="#facc15" />
            <span>
              {isRoadmapPage 
                ? 'Roadmap AI • Coach Nova' 
                : isInterviewPage 
                ? 'Mock Interview Coach' 
                : 'Ask Coach Nova 🎙️'}
            </span>
          </div>

          {/* Original Coach Nova AI Doll Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              border: '3px solid #6366f1',
              boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.6), 0 0 16px rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 14px 34px -5px rgba(99, 102, 241, 0.75), 0 0 22px rgba(56, 189, 248, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.6), 0 0 16px rgba(56, 189, 248, 0.35)';
            }}
            title="Coach Nova - Universal AI Career & Interview Coach"
          >
            <AiInterviewerDollGraphic state={loading ? 'evaluating' : 'idle'} size={54} />
            {/* Pulsing online badge */}
            <span style={{
              position: 'absolute',
              top: '3px',
              right: '3px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #ffffff',
              boxShadow: '0 0 8px #10b981'
            }} />
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9995,
          width: isMinimized ? '320px' : '420px',
          height: isMinimized ? '54px' : '620px',
          maxHeight: 'calc(100vh - 48px)',
          maxWidth: 'calc(100vw - 32px)',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          border: '1.5px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header with Coach Nova Doll Avatar */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            color: '#ffffff',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(129, 140, 248, 0.5)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <AiInterviewerDollGraphic state={loading ? 'evaluating' : 'idle'} size={38} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff' }}>
                  <span>Coach Nova</span>
                  <span style={{ fontSize: '0.66rem', backgroundColor: '#4f46e5', color: '#ffffff', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 800, border: '1px solid #818cf8' }}>
                    AI COACH 🎙️
                  </span>
                </div>
                {!isMinimized && (
                  <div style={{ fontSize: '0.72rem', color: '#c7d2fe' }}>
                    {isRoadmapPage ? 'Roadmap Guide (Muted)' : 'Mock Interview & Career Coach'}
                  </div>
                )}
              </div>
            </div>

            {/* Header Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {!isMinimized && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (isRoadmapPage) return;
                      setVoiceEnabled(prev => !prev);
                    }}
                    disabled={isRoadmapPage}
                    style={{
                      background: voiceEnabled && !isRoadmapPage ? 'rgba(56, 189, 248, 0.25)' : 'none',
                      border: 'none',
                      color: isRoadmapPage ? '#64748b' : voiceEnabled ? '#38bdf8' : '#cbd5e1',
                      cursor: isRoadmapPage ? 'not-allowed' : 'pointer',
                      padding: '0.35rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isRoadmapPage ? 0.6 : 1
                    }}
                    title={isRoadmapPage ? 'Voice is disabled on Roadmap' : voiceEnabled ? 'Mute Coach Nova voice' : 'Enable voice responses'}
                  >
                    {voiceEnabled && !isRoadmapPage ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearChat}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      padding: '0.35rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Restart chat"
                  >
                    <RotateCcw size={16} />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setIsMinimized(prev => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Mock Interview Launch Card */}
          {!isMinimized && (
            <div style={{
              margin: '0.65rem 0.85rem 0.15rem 0.85rem',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              flexShrink: 0
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#facc15', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={13} /> AI Mock Interview Studio
                </div>
                <div style={{ fontSize: '0.7rem', color: '#c7d2fe', marginTop: '1px' }}>
                  Live voice dictation, STAR scores & grammar analysis
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsOpen(false); navigate('/student/mock-interview'); }}
                style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: '1px solid #818cf8',
                  borderRadius: '8px',
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)'
                }}
              >
                <span>Enter Room</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Chat Messages Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              <div style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: 'var(--slate-50, #f8fafc)'
              }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '100%'
                    }}
                  >
                    <div style={{
                      backgroundColor: msg.sender === 'user' ? '#2563eb' : '#ffffff',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--slate-800)',
                      padding: '0.85rem 1rem',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      maxWidth: '88%',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {msg.text}
                    </div>

                    {/* Follow-up question chips */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        marginTop: '0.65rem',
                        width: '100%',
                        maxWidth: '88%'
                      }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 700 }}>
                          💡 Suggested by Coach Nova:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {msg.followUps.map((prompt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(prompt)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '12px',
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.75rem',
                                color: '#1e40af',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                e.currentTarget.style.borderColor = '#3b82f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#bfdbfe';
                              }}
                            >
                              {prompt} →
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading typing indicator */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.8rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#4338ca', fontSize: '0.82rem', fontWeight: 600 }}>
                    <AiInterviewerDollGraphic state="evaluating" size={26} />
                    <span>Coach Nova is analyzing and formulating guidance...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Jump Bar */}
              <div style={{
                padding: '0.45rem 0.75rem',
                background: '#ffffff',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                fontSize: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); navigate('/student/roadmap'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                >
                  <Compass size={13} /> Roadmap
                </button>
                <span style={{ color: 'var(--slate-300)' }}>•</span>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); navigate('/student/mock-interview'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                >
                  <Sparkles size={13} /> Mock Interview
                </button>
                <span style={{ color: 'var(--slate-300)' }}>•</span>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); navigate('/student/skills-gap'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                >
                  <Award size={13} /> Assess Skills
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                style={{
                  padding: '0.75rem 1rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask Coach Nova any question..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.95rem',
                    borderRadius: '24px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    color: 'var(--slate-900)'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-600)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || loading}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: inputVal.trim() && !loading ? 'var(--primary-600)' : 'var(--slate-200)',
                    color: inputVal.trim() && !loading ? '#ffffff' : 'var(--slate-400)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputVal.trim() && !loading ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
