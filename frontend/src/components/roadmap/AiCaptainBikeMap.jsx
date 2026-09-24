import React, { useMemo } from 'react';
import { Compass, Flag, MapPin, CheckCircle2, Trophy, Clock, Target, ArrowRight, ShieldCheck } from 'lucide-react';
import { AiDollGraphic } from './AiDollMascot';
import { CompanyLogo } from './CompanyLogo';

/**
 * AiCaptainBikeMap:
 * Tech Sprint Highway Pipeline where Sparky (AI Career Navigator)
 * moves step-by-step along the tech pipeline as tasks and milestones are completed!
 */
export const AiCaptainBikeMap = ({
  roadmap,
  milestones = [],
  completedTasks = 0,
  totalTasks = 0,
  progressPercentage = 0,
  onSelectMilestone
}) => {
  const companyName = roadmap?.company_name || '';
  const targetRole = roadmap?.target_role || roadmap?.title || 'Software Engineer';
  const estimatedWeeks = roadmap?.estimated_weeks || 12;

  // Calculate ETA remaining based on completion
  const weeksLeft = Math.max(1, Math.round(estimatedWeeks * (1 - progressPercentage / 100)));

  // Calculate which phase Sparky is currently navigating towards
  const currentPhaseIndex = useMemo(() => {
    if (progressPercentage >= 100) return 4;
    if (milestones.length === 0) return 0;

    let accumulated = 0;
    for (let i = 0; i < milestones.length; i++) {
      const mTasks = milestones[i].tasks?.length || 0;
      const mDone = milestones[i].tasks?.filter(t => t.is_completed).length || 0;
      if (mDone < mTasks) {
        return i;
      }
      accumulated += mDone;
    }
    return Math.min(milestones.length - 1, Math.floor((progressPercentage / 100) * milestones.length));
  }, [milestones, progressPercentage]);

  // Compute position percentage along the highway track (constrained between 4% and 95%)
  const bikePositionPct = Math.min(94, Math.max(4, progressPercentage));

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #172554 100%)',
        color: '#ffffff',
        boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.4)',
        border: '1.5px solid #334155',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}
    >
      <style>{`
        @keyframes radarPulse {
          0% { transform: scale(0.8); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -40; }
        }
        @keyframes floatMarker {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* Tech Sprint Pipeline Header HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        paddingBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            backgroundColor: '#facc15',
            color: '#78350f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(250, 204, 21, 0.4)'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Tech Sprint Pipeline Tracker
              </span>
              <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem' }}>
                ⚡ In Sprint
              </span>
            </div>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Sparky's Tech Pipeline: {targetRole} {companyName ? `@ ${companyName}` : ''}
            </h3>
          </div>
        </div>

        {/* Live Sprint Stats HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sprint Progress
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: progressPercentage === 100 ? '#34d399' : '#38bdf8' }}>
              {completedTasks}/{totalTasks} Verified ({progressPercentage}%)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Milestone ETA
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#facc15' }}>
              {progressPercentage === 100 ? '🎉 Goal Achieved!' : `~${weeksLeft} Wks to Destination`}
            </div>
          </div>
        </div>
      </div>

      {/* TECH SPRINT PIPELINE HIGHWAY CONTAINER */}
      <div style={{
        position: 'relative',
        padding: '2.5rem 0.5rem 3.5rem 0.5rem',
        minHeight: '190px'
      }}>
        {/* Asphalt Road Body */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '44px',
          backgroundColor: '#1e293b',
          borderRadius: '22px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 4px 14px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Completed Paved Road (Emerald Green Highway) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${bikePositionPct}%`,
            background: 'linear-gradient(90deg, #059669 0%, #10b981 80%, #34d399 100%)',
            transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.7)'
          }} />

          {/* Road White Center Lane Dashes */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '4px',
            backgroundImage: 'repeating-linear-gradient(90deg, #ffffff 0, #ffffff 16px, transparent 16px, transparent 32px)',
            opacity: 0.6,
            zIndex: 1
          }} />
        </div>

        {/* Milestone Checkpoint Stations along the Highway */}
        <div style={{
          position: 'absolute',
          top: '2.5rem',
          left: 0,
          right: 0,
          height: '44px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1rem',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          {/* Station 0: Start Base */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '3px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              🏁
            </div>
            <div style={{
              position: 'absolute',
              top: '36px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              Start Base
            </div>
          </div>

          {/* Milestones 1 to 4 */}
          {milestones.map((m, idx) => {
            const mTotal = m.tasks?.length || 0;
            const mDone = m.tasks?.filter(t => t.is_completed).length || 0;
            const isFinished = mTotal > 0 && mDone === mTotal;
            const isCurrent = idx === currentPhaseIndex && !isFinished;

            return (
              <div
                key={m.id || idx}
                onClick={() => onSelectMilestone && onSelectMilestone(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: 'translateX(0)',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title={`Phase ${idx + 1}: ${m.title} (${mDone}/${mTotal} done)`}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: isFinished ? '#10b981' : isCurrent ? '#facc15' : '#334155',
                  border: `3px solid ${isFinished ? '#a7f3d0' : isCurrent ? '#ffffff' : '#475569'}`,
                  color: isFinished ? '#ffffff' : isCurrent ? '#78350f' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  boxShadow: isCurrent ? '0 0 16px rgba(250, 204, 21, 0.8)' : '0 2px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  {isFinished ? <CheckCircle2 size={16} /> : idx + 1}
                </div>

                <div style={{
                  position: 'absolute',
                  top: '38px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: isFinished ? '#34d399' : isCurrent ? '#facc15' : '#94a3b8'
                  }}>
                    Phase {idx + 1}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#cbd5e1',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {mDone}/{mTotal} done
                  </span>
                </div>
              </div>
            );
          })}

          {/* Destination: Dream Company */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translateX(50%)',
            pointerEvents: 'auto'
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              backgroundColor: progressPercentage === 100 ? '#10b981' : '#f59e0b',
              border: '3px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              color: '#ffffff',
              fontWeight: 900
            }}>
              {progressPercentage === 100 ? <Trophy size={20} /> : <Target size={20} />}
            </div>
            <div style={{
              position: 'absolute',
              top: '42px',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: progressPercentage === 100 ? '#34d399' : '#fde047',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              {companyName || 'Dream Career'} 🏆
            </div>
          </div>
        </div>

        {/* MOVING HIGH-TECH SPARKY TECH NAVIGATOR */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${bikePositionPct}%`,
            transform: 'translateX(-50%)',
            zIndex: 10,
            transition: 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Floating Live GPS Speech Callout */}
          <div style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '0.4rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
            border: '2px solid #facc15',
            whiteSpace: 'nowrap',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            animation: 'floatMarker 2s ease-in-out infinite'
          }}>
            <span>⚡ Sparky (AI Navigator):</span>
            <span style={{ color: '#4f46e5' }}>
              {progressPercentage === 100
                ? 'Sprint Mastered! 🎉'
                : `Sprinting to Phase ${currentPhaseIndex + 1}`}
            </span>
          </div>

          {/* Cyber Hover-Pod Graphic */}
          <div style={{ position: 'relative' }}>
            {/* Cyber Radar Pulse Circle under hover-pod */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.35)',
              border: '2px solid #38bdf8',
              animation: 'radarPulse 1.8s ease-out infinite',
              zIndex: -1
            }} />

            <AiDollGraphic size={70} isRidingBike={true} />
          </div>
        </div>
      </div>

      {/* Route Quick Status Footer */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: '#cbd5e1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} color="#facc15" />
          <span>
            {progressPercentage === 100
              ? '🏁 You have reached your target destination!'
              : `Current Location: Phase ${currentPhaseIndex + 1} (${milestones[currentPhaseIndex]?.title || 'En Route'})`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#94a3b8' }}>
            Complete milestone tasks below to advance Sparky forward along the tech pipeline!
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiCaptainBikeMap;
