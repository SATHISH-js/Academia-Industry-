import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Award,
  BarChart2,
  BookOpen,
  Briefcase,
  FileText,
  FolderGit2,
  Users,
  Compass,
  Building2,
  TrendingUp,
  LogOut,
  Target,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  Handshake,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, isReopening = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { name: 'Profile', path: '/student/profile', icon: User },
          { name: 'Roadmap', path: '/student/roadmap', icon: Compass },
          { name: 'Skills & Gap Analysis', path: '/student/skills-gap', icon: BarChart2 },
          { name: 'Certificate Verifier', path: '/student/certificate-verify', icon: ShieldCheck },
          { name: 'Certifications', path: '/student/certifications', icon: Award },
          { name: 'Internships / Jobs', path: '/student/opportunities', icon: Briefcase },
          { name: 'Applications', path: '/student/applications', icon: FileText },
          { name: 'AI Mock Interview', path: '/student/mock-interview', icon: Sparkles },
          { name: 'Resume Builder', path: '/student/resume-builder', icon: FileText },
          { name: 'Learning Programs', path: '/student/learning', icon: BookOpen },
          { name: 'Digital Portfolio', path: '/student/portfolio', icon: FolderGit2 }
        ];
      case 'ACADEMICIAN':
        return [
          { name: 'Academic Profile', path: '/academician/profile', icon: User },
          { name: 'Opportunities', path: '/academician/opportunities', icon: Compass },
          { name: 'Collaborations', path: '/academician/collaboration', icon: Users },
          { name: 'My Applications', path: '/academician/applications', icon: FileText }
        ];
      case 'INDUSTRY':
        return [
          { name: 'Company Profile', path: '/industry/profile', icon: User },
          { name: 'Candidate Matching', path: '/industry/candidates', icon: Sparkles },
          { name: 'Post & Manage Roles', path: '/industry/opportunities', icon: Briefcase },
          { name: 'Institution Placements', path: '/industry/placements', icon: Building2 },
          { name: 'Direct Outreach', path: '/industry/outreach', icon: FileText },
          { name: 'Applications Received', path: '/industry/applications', icon: Layers },
          { name: 'Recruitment Analytics', path: '/industry/analytics', icon: TrendingUp }
        ];
      case 'INSTITUTION':
        return [
          { name: 'Campus Profile', path: '/institution/profile', icon: User },
          { name: 'Student Roster & Activity', path: '/institution/students', icon: Users },
          { name: 'Faculty Directory', path: '/institution/academicians', icon: GraduationCap },
          { name: 'Industry MoUs & Partners', path: '/institution/partners', icon: Handshake },
          { name: 'Training Programs', path: '/institution/training-programs', icon: BookOpen },
          { name: 'Placement Analytics', path: '/institution/placements', icon: TrendingUp }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Backdrop Overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="sidebar-backdrop"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`sidebar-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'} ${isReopening ? 'sidebar-reopening' : ''}`}
      >
        {/* Sidebar Header with Title & Close Button */}
        <div className="sidebar-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate-400)', fontWeight: 600 }}>
              Role Portal
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.role} PORTAL
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sidebar-close-btn"
            title="Close side menu"
            aria-label="Close side menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List with Staggered Entrance Animations */}
        <nav
          className="sidebar-nav"
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          {navLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
                className={({ isActive }) => 
                  `sidebar-nav-link ${isActive ? 'active' : ''} ${isOpen || isReopening ? 'sidebar-item-animate' : ''}`
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : 'var(--slate-400)',
                  backgroundColor: isActive ? 'var(--primary-600)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  animationDelay: `${index * 25}ms`,
                  transition: 'background-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast)'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                    {isActive && (
                      <span 
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '15%',
                          bottom: '15%',
                          width: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '0 4px 4px 0',
                          boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                        }} 
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / User Profile & Logout */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              onClick={() => {
                const profileRoute = user.role === 'STUDENT' ? '/student/profile'
                  : user.role === 'ACADEMICIAN' ? '/academician/profile'
                  : user.role === 'INDUSTRY' ? '/industry/profile'
                  : user.role === 'INSTITUTION' ? '/institution/profile'
                  : '/settings';
                navigate(profileRoute);
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                overflow: 'hidden',
                cursor: 'pointer',
                flex: 1,
                padding: '0.2rem',
                borderRadius: 'var(--radius-sm)',
                userSelect: 'none'
              }}
              title="View & Edit Profile"
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--primary-500)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  user.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
