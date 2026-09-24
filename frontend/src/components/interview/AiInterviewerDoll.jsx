import React, { useState, useEffect } from 'react';
import { Sparkles, Mic, Volume2, Award, ChevronRight, X, Play, ShieldCheck, CheckCircle2, MessageSquare, Bot } from 'lucide-react';
import { CompanyLogo } from '../roadmap/CompanyLogo';

/**
 * Animated SVG AI Interviewer Doll ("Coach Nova")
 * States: 'idle' | 'speaking' | 'listening' | 'evaluating'
 */
export const AiInterviewerDollGraphic = ({ state = 'idle', size = 120, className = '' }) => {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{
          filter: state === 'speaking' 
            ? 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.6))' 
            : state === 'listening'
            ? 'drop-shadow(0 0 18px rgba(16, 185, 129, 0.7))'
            : state === 'evaluating'
            ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.6))'
            : 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.25))',
          transition: 'all 0.3s ease'
        }}
      >
        <defs>
          <linearGradient id="interviewerBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#3730a3" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          <linearGradient id="headsetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <filter id="aiGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <style>
          {`
            @keyframes dollFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            @keyframes mouthTalk {
              0%, 100% { transform: scaleY(0.4); }
              50% { transform: scaleY(1.3); }
            }
            @keyframes pulseWave {
              0% { r: 12px; opacity: 0.9; }
              100% { r: 24px; opacity: 0; }
            }
            @keyframes eqBar {
              0%, 100% { height: 6px; }
              50% { height: 18px; }
            }
            @keyframes spinWheel {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        <g style={{ animation: 'dollFloat 3.5s ease-in-out infinite', transformOrigin: 'center' }}>
          {/* Professional Blazer & Torso */}
          <path d="M60 145 C60 130, 80 125, 100 125 C120 125, 140 130, 140 145 L145 190 L55 190 Z" fill="url(#suitGrad)" />
          {/* Inner Shirt & Tie */}
          <polygon points="90,126 110,126 104,155 96,155" fill="#ffffff" />
          <polygon points="98,132 102,132 104,152 100,158 96,152" fill="#4f46e5" />
          {/* Blazer Lapels */}
          <polygon points="75,126 90,126 82,165" fill="#334155" />
          <polygon points="125,126 110,126 118,165" fill="#334155" />

          {/* Head */}
          <circle cx="100" cy="85" r="42" fill="url(#interviewerBody)" />

          {/* Face Plate Display */}
          <rect x="72" y="62" width="56" height="46" rx="16" fill="#0f172a" stroke="#6366f1" strokeWidth="2.5" />

          {/* Eyes (Blinking / Expressive) */}
          {state === 'evaluating' ? (
            <g>
              {/* Calculating digital eyes */}
              <text x="78" y="85" fill="#f59e0b" fontSize="13" fontWeight="900" fontFamily="monospace">⚙️</text>
              <text x="108" y="85" fill="#f59e0b" fontSize="13" fontWeight="900" fontFamily="monospace">⚙️</text>
            </g>
          ) : (
            <g>
              <ellipse cx="86" cy="80" rx={state === 'listening' ? '6' : '5'} ry={state === 'listening' ? '7' : '6'} fill={state === 'listening' ? '#10b981' : '#38bdf8'} filter="url(#aiGlow)" />
              <ellipse cx="114" cy="80" rx={state === 'listening' ? '6' : '5'} ry={state === 'listening' ? '7' : '6'} fill={state === 'listening' ? '#10b981' : '#38bdf8'} filter="url(#aiGlow)" />
              <circle cx="88" cy="78" r="1.5" fill="#ffffff" />
              <circle cx="116" cy="78" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Mouth */}
          {state === 'speaking' ? (
            <ellipse
              cx="100"
              cy="96"
              rx="7"
              ry="5"
              fill="#ec4899"
              style={{ animation: 'mouthTalk 0.35s ease-in-out infinite', transformOrigin: '100px 96px' }}
            />
          ) : state === 'listening' ? (
            <path d="M92 95 Q100 101 108 95" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M93 96 Q100 100 107 96" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Headset Arc */}
          <path d="M56 82 A45 45 0 0 1 144 82" fill="none" stroke="url(#headsetGrad)" strokeWidth="6" strokeLinecap="round" />

          {/* Left Earphone Cup */}
          <rect x="52" y="70" width="10" height="25" rx="5" fill="#06b6d4" filter="url(#aiGlow)" />
          {/* Right Earphone Cup */}
          <rect x="138" y="70" width="10" height="25" rx="5" fill="#8b5cf6" filter="url(#aiGlow)" />

          {/* Microphone Boom coming from right earphone */}
          <path d="M142 85 Q135 110 114 108" fill="none" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
          {/* Glowing Microphone Tip */}
          <circle
            cx="112"
            cy="108"
            r="4.5"
            fill={state === 'listening' ? '#10b981' : state === 'speaking' ? '#6366f1' : '#f43f5e'}
            filter="url(#aiGlow)"
          />

          {/* Audio Waves when Speaking */}
          {state === 'speaking' && (
            <g>
              <circle cx="112" cy="108" r="8" fill="none" stroke="#818cf8" strokeWidth="1.5" style={{ animation: 'pulseWave 1.2s infinite' }} />
              <circle cx="112" cy="108" r="14" fill="none" stroke="#a5b4fc" strokeWidth="1" style={{ animation: 'pulseWave 1.2s infinite 0.4s' }} />
            </g>
          )}

          {/* Audio Equalizer Bars when Listening */}
          {state === 'listening' && (
            <g transform="translate(145, 100)">
              <rect x="0" y="-12" width="3" height="14" rx="1.5" fill="#10b981" style={{ animation: 'eqBar 0.5s ease-in-out infinite' }} />
              <rect x="5" y="-16" width="3" height="20" rx="1.5" fill="#10b981" style={{ animation: 'eqBar 0.7s ease-in-out infinite 0.15s' }} />
              <rect x="10" y="-8" width="3" height="10" rx="1.5" fill="#10b981" style={{ animation: 'eqBar 0.4s ease-in-out infinite 0.3s' }} />
              <rect x="15" y="-14" width="3" height="16" rx="1.5" fill="#10b981" style={{ animation: 'eqBar 0.6s ease-in-out infinite 0.1s' }} />
            </g>
          )}

          {/* AI Badge on Chest */}
          <rect x="68" y="152" width="22" height="14" rx="3" fill="#3b82f6" />
          <text x="73" y="162" fill="#ffffff" fontSize="7" fontWeight="900">AI</text>
        </g>
      </svg>
    </div>
  );
};

/**
 * Animated Welcoming Greeting Modal
 * Introduces Coach Nova and prepares candidate for the live room
 */
export const AiInterviewGreetingModal = ({
  isOpen,
  onClose,
  onEnterRoom,
  selectedRole,
  setSelectedRole,
  selectedCompany,
  setSelectedCompany
}) => {
  const [activeSpeechStep, setActiveSpeechStep] = useState(0);

  const SPEECH_POINTS = [
    '🎙️ Real-time Voice Recognition & Speech-to-Text Dictation',
    '🔊 Text-to-Speech Engine: Listen to each question read aloud',
    '✍️ Deep Grammar Diagnostics: Detects mistakes & gives polished corrections',
    '⭐ Multi-Dimensional Speech Ratings: Pace, Articulation & Vocabulary',
    '🚀 Actionable Enhancements: Ideal STAR answers & personalized growth plan'
  ];

  useEffect(() => {
    if (isOpen) {
      setActiveSpeechStep(0);
      const timer = setInterval(() => {
        setActiveSpeechStep(prev => (prev + 1) % SPEECH_POINTS.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '680px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Animated AI Doll */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '0.4rem',
              border: '1.5px solid rgba(255, 255, 255, 0.2)'
            }}>
              <AiInterviewerDollGraphic state="speaking" size={78} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge" style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 800 }}>
                  🎙️ AI Lead Interviewer
                </span>
                <span style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600 }}>Coach Nova</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Welcome to the AI Mock Interview Studio!
              </h2>
              <p style={{ color: '#c7d2fe', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
                "Ready to test your readiness? I'll ask questions aloud, evaluate your grammar, and rate your delivery!"
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem' }}>
          {/* Dynamic AI Doll Speech Box */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.1rem 1.35rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MessageSquare size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                What I Will Assess & Evaluate:
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' }}>
                {SPEECH_POINTS[activeSpeechStep]}
              </div>
            </div>
          </div>

          {/* Quick Selectors for Target Company & Role */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                Target Company
              </label>
              <select
                className="form-control"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="Wipro">Wipro (Elite & Turbo SDE)</option>
                <option value="Google">Google (SWE Core)</option>
                <option value="Amazon">Amazon (SDE Distributed)</option>
                <option value="Microsoft">Microsoft (Cloud & Azure)</option>
                <option value="TCS">TCS (Digital & Ninja)</option>
                <option value="Infosys">Infosys (Power Programmer)</option>
                <option value="Meta">Meta (Frontend & Systems)</option>
                <option value="Tesla">Tesla (Autonomous C++)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                Target Engineering Role
              </label>
              <select
                className="form-control"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="Wipro Elite & Turbo SDE">Wipro Elite & Turbo SDE</option>
                <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                <option value="Backend Developer">Backend Developer (Distributed)</option>
                <option value="Frontend Engineer">Frontend Engineer (React / Next.js)</option>
                <option value="Data Scientist / ML Engineer">Data Scientist / ML Engineer</option>
                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontWeight: 600 }}
            >
              Maybe Later
            </button>
            <button
              onClick={onEnterRoom}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.6rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              <Play size={18} fill="#ffffff" /> Enter Live Interview Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Floating AI Doll Corner Assistant for Mock Interview
 */
export const AiInterviewCornerDoll = ({ onLaunchTest }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      {/* Speech Bubble */}
      {expanded && (
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.85rem 1.15rem',
          borderRadius: '16px',
          borderBottomLeftRadius: '4px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
          border: '1.5px solid #4f46e5',
          maxWidth: '260px',
          fontSize: '0.84rem',
          marginBottom: '10px',
          lineHeight: 1.45,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <strong style={{ color: '#38bdf8' }}>Coach Nova 🎙️</strong>
            <button
              onClick={() => setExpanded(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
          Ready to test your voice & technical interview skills? Click below to start!
          <button
            onClick={() => { setExpanded(false); onLaunchTest(); }}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '0.65rem', width: '100%', fontWeight: 700, fontSize: '0.78rem' }}
          >
            Start Mock Interview 🚀
          </button>
        </div>
      )}

      {/* Floating Doll Avatar Trigger */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: '#ffffff',
          borderRadius: '9999px',
          padding: '0.4rem 0.9rem 0.4rem 0.5rem',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
          border: '2px solid var(--primary-600)',
          transition: 'all 0.2s ease'
        }}
      >
        <AiInterviewerDollGraphic state="idle" size={44} />
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            AI Interview Coach
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--primary-600)', fontWeight: 700 }}>
            {expanded ? 'Close Tip' : 'Click to Chat! 🎙️'}
          </div>
        </div>
      </div>
    </div>
  );
};
