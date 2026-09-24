import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, MessageSquare, Compass, ShieldCheck, Zap } from 'lucide-react';

/**
 * Animated SVG of the AI Doll Mascot ("Captain Sparky")
 */
export const AiDollGraphic = ({ size = 80, isWaving = true, isRidingBike = false, mood = 'happy' }) => {
  if (isRidingBike) {
    // High-Tech Cyber Hover-Pod / Tech Jet Navigator for Sparky along the Sprint Pipeline
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

        {/* Sparky Body seated inside Hover-Pod cockpit */}
        <path d="M68 62 C68 50 74 42 84 42 C94 42 100 50 100 62 C100 70 94 74 84 74 C74 74 68 70 68 62 Z" fill="#4f46e5" />

        {/* Holographic Controls Console / Pilot Hands */}
        <path d="M72 65 Q84 58 96 65" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="72" cy="65" r="3" fill="#38bdf8" />
        <circle cx="96" cy="65" r="3" fill="#38bdf8" />

        {/* Sparky Head */}
        <circle cx="84" cy="27" r="18" fill="#ffffff" stroke="#c7d2fe" strokeWidth="2.5" />

        {/* High-Tech Cyber Visor (Neon Cyan / Electric Indigo) */}
        <path d="M68 22 C68 14 74 9 84 9 C94 9 100 14 100 22 Z" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
        <path d="M72 23 Q84 19 96 23 Q84 27 72 23 Z" fill="#38bdf8">
          <animate attributeName="opacity" values="0.75;1;0.75" dur="1.5s" repeatCount="indefinite" />
        </path>

        {/* Cute Sparky Cheeks & Smile */}
        <circle cx="75" cy="32" r="2.5" fill="#fda4af" />
        <circle cx="93" cy="32" r="2.5" fill="#fda4af" />
        <path d="M81 33 Q84 36 87 33" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Lightning Beacon Antenna */}
        <line x1="84" y1="9" x2="84" y2="2" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="84" cy="2" r="3" fill="#facc15">
          <animate attributeName="fill" values="#facc15;#38bdf8;#facc15" dur="1.2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  // Standing / Floating AI Doll Graphic
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 6px 12px rgba(79, 70, 229, 0.25))',
        animation: 'dollFloat 3s ease-in-out infinite'
      }}
    >
      <style>{`
        @keyframes dollFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes dollWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes eyeBlink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
      `}</style>

      {/* Glow Aura */}
      <circle cx="50" cy="55" r="42" fill="url(#dollAura)" opacity="0.4" />
      <defs>
        <radialGradient id="dollAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Floating Shadow */}
      <ellipse cx="50" cy="108" rx="24" ry="4" fill="#64748b" opacity="0.25" />

      {/* Doll Body */}
      <rect x="34" y="52" width="32" height="38" rx="16" fill="url(#bodyGrad)" stroke="#4338ca" strokeWidth="2.5" />
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#4338ca"/>
        </linearGradient>
      </defs>

      {/* Chest Core Badge */}
      <circle cx="50" cy="70" r="8" fill="#1e1b4b" stroke="#a5b4fc" strokeWidth="1.5" />
      <path d="M50 65 L52 69 L56 70 L52 72 L50 76 L48 72 L44 70 L48 69 Z" fill="#fbbf24" />

      {/* Arms */}
      {/* Left arm resting */}
      <path d="M34 60 Q24 68 28 78" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="78" r="4" fill="#a5b4fc" />

      {/* Right arm waving */}
      <g style={{ transformOrigin: '66px 60px', animation: isWaving ? 'dollWave 1.8s ease-in-out infinite' : 'none' }}>
        <path d="M66 60 Q76 52 82 42" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="82" cy="42" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        {/* Sparkles from waving hand */}
        <path d="M88 36 L90 32 L92 36 L96 38 L92 40 L90 44 L88 40 L84 38 Z" fill="#f59e0b" />
      </g>

      {/* Doll Head */}
      <rect x="25" y="16" width="50" height="42" rx="21" fill="#ffffff" stroke="#c7d2fe" strokeWidth="3" />

      {/* Headset / Helmet band */}
      <path d="M25 34 C25 20 35 12 50 12 C65 12 75 20 75 34" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Earphone caps (Yellow & Indigo) */}
      <rect x="20" y="28" width="7" height="15" rx="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      <rect x="73" y="28" width="7" height="15" rx="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />

      {/* Antenna with pulsing orb */}
      <line x1="50" y1="12" x2="50" y2="4" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="4" r="4" fill="#38bdf8">
        <animate attributeName="r" values="3.5;5;3.5" dur="1.2s" repeatCount="indefinite" />
      </circle>

      {/* Animated Face */}
      <g style={{ transformOrigin: '50px 36px', animation: 'eyeBlink 4s infinite' }}>
        {/* Big expressive anime-style eyes */}
        <ellipse cx="40" cy="35" rx="4.5" ry="5.5" fill="#1e1b4b" />
        <circle cx="38.5" cy="33" r="1.8" fill="#ffffff" />
        <ellipse cx="60" cy="35" rx="4.5" ry="5.5" fill="#1e1b4b" />
        <circle cx="58.5" cy="33" r="1.8" fill="#ffffff" />
      </g>

      {/* Cute Blush */}
      <circle cx="33" cy="41" r="3.5" fill="#fda4af" opacity="0.8" />
      <circle cx="67" cy="41" r="3.5" fill="#fda4af" opacity="0.8" />

      {/* Smile */}
      <path d="M45 42 Q50 48 55 42" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * Interactive AI Doll Mascot Card / Modal / Corner Assistant
 */
export const AiDollGreetingModal = ({
  isOpen = false,
  onClose,
  onProceed,
  title = "Hi there! I'm Sparky! 🤖✨",
  message = "I'm your AI Career Captain! Ready to construct your personalized dream roadmap with interactive milestones?",
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
