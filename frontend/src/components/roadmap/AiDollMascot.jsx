import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, MessageSquare, Compass, ShieldCheck, Zap } from 'lucide-react';
import { AiInterviewerDollGraphic } from '../interview/AiInterviewerDoll';

/**
 * Animated SVG of the AI Career Coach ("Coach Nova")
 * Replacing legacy Captain Sparky with the authentic Coach Nova AI doll
 */
export const AiDollGraphic = ({ size = 80, isWaving = true, isRidingBike = false, mood = 'happy' }) => {
  if (isRidingBike) {
    // High-Tech Cyber Hover-Pod / Tech Jet Navigator for Coach Nova along the Sprint Pipeline
    return (
      <svg
        width={size * 1.5}
        height={size}
        viewBox="0 0 160 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 6px 14px rgba(56, 189, 248, 0.35))' }}
      >
        <defs>
          <linearGradient id="plasmaGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="cyberPodGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="thrusterFlame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="novaHeadsetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Cyber Speed & Energy Warp Lines */}
        <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          <line x1="8" y1="42" x2="32" y2="42">
            <animate attributeName="x2" values="32;18;32" dur="0.8s" repeatCount="indefinite" />
          </line>
          <line x1="4" y1="60" x2="26" y2="60">
            <animate attributeName="x2" values="26;12;26" dur="0.6s" repeatCount="indefinite" />
          </line>
          <line x1="10" y1="78" x2="36" y2="78">
            <animate attributeName="x2" values="36;20;36" dur="1s" repeatCount="indefinite" />
          </line>
        </g>

        {/* Dual Plasma Thruster Energy Jets underneath */}
        <ellipse cx="50" cy="92" rx="14" ry="4" fill="url(#plasmaGlow)" />
        <ellipse cx="118" cy="92" rx="14" ry="4" fill="url(#plasmaGlow)" />
        <polygon points="44,88 56,88 52,104 48,104" fill="url(#thrusterFlame)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="0.4s" repeatCount="indefinite" />
        </polygon>
        <polygon points="112,88 124,88 120,104 116,104" fill="url(#thrusterFlame)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="0.4s" repeatCount="indefinite" />
        </polygon>

        {/* Futuristic Cyber Hover-Pod Aerodynamic Chassis */}
        <path
          d="M32 82 C32 72 50 68 84 68 C118 68 136 72 136 82 C136 88 116 92 84 92 C52 92 32 88 32 82 Z"
          fill="url(#cyberPodGrad)"
          stroke="#38bdf8"
          strokeWidth="2.5"
        />

        {/* Tech Circuit Inlays & Holographic Strip */}
        <path d="M48 82 L120 82" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" opacity="0.9" />
        <circle cx="84" cy="82" r="3.5" fill="#facc15">
          <animate attributeName="r" values="3;4.5;3" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* Coach Nova Seated in Cockpit with Blazer & Tie */}
        {/* Blazer & Torso */}
        <path d="M68 62 C68 48 76 44 84 44 C92 44 100 48 100 62 L100 74 L68 74 Z" fill="#1e293b" />
        {/* Shirt & Tie */}
        <polygon points="81,44 87,44 85,58 83,58" fill="#ffffff" />
        <polygon points="83.5,46 84.5,46 85,56 83,56" fill="#4f46e5" />

        {/* Holographic Controls Console / Pilot Hands */}
        <path d="M72 65 Q84 58 96 65" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="72" cy="65" r="3" fill="#38bdf8" />
        <circle cx="96" cy="65" r="3" fill="#38bdf8" />

        {/* Coach Nova Head (Indigo Body) */}
        <circle cx="84" cy="27" r="18" fill="#312e81" stroke="#4f46e5" strokeWidth="2" />

        {/* Face Plate Display */}
        <rect x="71" y="16" width="26" height="20" rx="7" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />

        {/* Digital Cyan Expressive Eyes */}
        <ellipse cx="78" cy="25" rx="2.5" ry="3" fill="#38bdf8" />
        <ellipse cx="90" cy="25" rx="2.5" ry="3" fill="#38bdf8" />
        <circle cx="79" cy="24" r="0.8" fill="#ffffff" />
        <circle cx="91" cy="24" r="0.8" fill="#ffffff" />

        {/* Smiling Cyan Mouth */}
        <path d="M81 31 Q84 34 87 31" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Coach Nova Headset Arc */}
        <path d="M66 26 A19 19 0 0 1 102 26" fill="none" stroke="url(#novaHeadsetGrad)" strokeWidth="3.5" strokeLinecap="round" />
        {/* Earphone Caps */}
        <rect x="64" y="21" width="5" height="11" rx="2" fill="#06b6d4" />
        <rect x="99" y="21" width="5" height="11" rx="2" fill="#8b5cf6" />

        {/* Microphone Boom to Mouth with Glowing Tip */}
        <path d="M101 27 Q97 39 88 37" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="87" cy="37" r="2.2" fill="#10b981" />
      </svg>
    );
  }

  // Authentic Coach Nova AI Doll (Standing / Floating)
  return <AiInterviewerDollGraphic state="idle" size={size} />;
};

/**
 * Interactive AI Doll Mascot Card / Modal / Corner Assistant
 */
export const AiDollGreetingModal = ({
  isOpen = false,
  onClose,
  onProceed,
  title = "Hi there! I'm Coach Nova! 🤖✨",
  message = "I'm your AI Career Coach! Ready to construct your personalized dream roadmap with interactive milestones?",
  confirmText = "Let's Build My Roadmap! 🚀"
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.35)',
        border: '2px solid #e0e7ff',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--slate-400)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Mascot */}
        <div style={{ marginBottom: '1rem' }}>
          <AiDollGraphic size={110} isWaving={true} />
        </div>

        {/* Speech Bubble Card */}
        <div style={{
          backgroundColor: '#f5f3ff',
          border: '1.5px solid #ddd6fe',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          position: 'relative',
          maxWidth: '440px'
        }}>
          {/* Triangular Tail */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '10px solid #ddd6fe'
          }} />

          <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#4338ca' }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#4b5563', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ flex: 1, maxWidth: '160px', padding: '0.75rem 1rem', fontWeight: 600 }}
          >
            Explore First
          </button>
          <button
            onClick={onProceed}
            className="btn btn-primary"
            style={{
              flex: 2,
              padding: '0.75rem 1.5rem',
              fontWeight: 800,
              fontSize: '0.98rem',
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={18} />
            {confirmText}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Floating Corner Assistant
 */
export const AiDollCornerAssistant = ({
  speechText = "Hey! Need help selecting your dream roadmap? Click here!",
  onClick
}) => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem',
        cursor: 'pointer'
      }}
    >
      {!minimized && (
        <div
          onClick={onClick}
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #818cf8',
            borderRadius: '16px',
            padding: '0.75rem 1rem',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)',
            maxWidth: '240px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#1e1b4b',
            lineHeight: 1.4,
            animation: 'slideUp 0.3s ease',
            position: 'relative'
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={12} />
          </button>
          <span>{speechText}</span>
        </div>
      )}

      <div
        onClick={onClick}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
          border: '3px solid #6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'transform 0.2s ease',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="AI Career Companion"
      >
        <AiDollGraphic size={52} isWaving={true} />
      </div>
    </div>
  );
};

export default AiDollMascot;
function AiDollMascot(props) {
  return <AiDollGraphic {...props} />;
}
