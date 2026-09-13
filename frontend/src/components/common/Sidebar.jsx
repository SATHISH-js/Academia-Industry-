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
  Layers
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Roadmap', path: '/student/roadmap', icon: Compass },
          { name: 'AI Mock Interview', path: '/student/mock-interview', icon: Sparkles },
          { name: 'Resume Builder', path: '/student/resume-builder', icon: FileText },
          { name: 'Profile & Education', path: '/student/profile', icon: User },
          { name: 'Skill Assessment', path: '/student/assessment', icon: Award },
          { name: 'My Skills', path: '/student/skills', icon: Target },
          { name: 'Skill Gap Analysis', path: '/student/skill-gap', icon: BarChart2 },
          { name: 'Learning Programs', path: '/student/learning', icon: BookOpen },
          { name: 'Internships', path: '/student/internships', icon: Briefcase },
          { name: 'Jobs', path: '/student/jobs', icon: Building2 },
          { name: 'Applications', path: '/student/applications', icon: FileText },
          { name: 'Digital Portfolio', path: '/student/portfolio', icon: FolderGit2 },
        ];
      case 'ACADEMICIAN':
        return [
          { name: 'Dashboard', path: '/academician/dashboard', icon: LayoutDashboard },
          { name: 'Academic Profile', path: '/academician/profile', icon: User },
          { name: 'Opportunities', path: '/academician/opportunities', icon: Compass },
          { name: 'Collaborations', path: '/academician/collaboration', icon: Users },
          { name: 'My Applications', path: '/academician/applications', icon: FileText },
        ];
      case 'INDUSTRY':
        return [
          { name: 'Dashboard', path: '/industry/dashboard', icon: LayoutDashboard },
          { name: 'Company Profile', path: '/industry/profile', icon: Building2 },
          { name: 'Manage Internships', path: '/industry/internships', icon: Briefcase },
          { name: 'Manage Jobs', path: '/industry/jobs', icon: Layers },
          { name: 'Candidate Matching', path: '/industry/candidates', icon: Sparkles },
          { name: 'Applications', path: '/industry/applications', icon: FileText },
          { name: 'Programs & Collab', path: '/industry/collaborations', icon: Users },
          { name: 'Recruitment Analytics', path: '/industry/analytics', icon: TrendingUp },
        ];
      case 'INSTITUTION':
        return [
          { name: 'Dashboard', path: '/institution/dashboard', icon: LayoutDashboard },
          { name: 'Student Directory', path: '/institution/students', icon: Users },
          { name: 'Academician Directory', path: '/institution/academicians', icon: User },
          { name: 'Skill Gap Analytics', path: '/institution/skills', icon: BarChart2 },
          { name: 'Placement Analytics', path: '/institution/placements', icon: TrendingUp },
          { name: 'Industry Partners', path: '/institution/partners', icon: Building2 },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 45,
            transition: 'opacity 0.2s'
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          transition: 'transform var(--transition-normal)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'var(--shadow-md)'
        }}
        className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate-400)' }}>
            Role Portal
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
            {user.role} PORTAL
          </div>
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
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
                  transition: 'all var(--transition-fast)'
                })}
              >
                <Icon size={18} />
                <span>{item.name}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
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
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
