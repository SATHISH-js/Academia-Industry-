import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Briefcase, 
  Layers 
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarOpen = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'ACADEMICIAN': return '/academician/dashboard';
      case 'INDUSTRY': return '/industry/dashboard';
      case 'INSTITUTION': return '/institution/dashboard';
      default: return '/login';
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem'
    }}>
      {/* Left Branding / Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated && onToggleSidebar && (
          <button 
            type="button"
            onClick={onToggleSidebar}
            className={`menu-toggle-btn ${isSidebarOpen ? 'is-open' : 'is-closed'}`}
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            aria-label={isSidebarOpen ? "Close side menu" : "Open side menu"}
            title={isSidebarOpen ? "Close side menu (Ctrl+B)" : "Reopen side menu (Ctrl+B)"}
          >
            <div className="menu-toggle-icon-wrap">
              <Menu size={20} className="menu-icon-svg icon-menu" />
              <X size={20} className="menu-icon-svg icon-close" />
            </div>
            <span className="menu-toggle-label">
              {isSidebarOpen ? 'Close' : 'Menu'}
            </span>
          </button>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)', lineHeight: 1.1 }}>
              Academia<span style={{ color: 'var(--primary-600)' }}>Industry</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              Collaboration Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Get Started
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Quick Link to Dashboard */}
            <Link to={getDashboardRoute()} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Layers size={16} />
              Dashboard
            </Link>

            {/* User Profile Badge & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', display: 'none', minWidth: 80 }} className="nav-user-info">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 600 }}>{user.role}</div>
                </div>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: 220,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem 0',
                  zIndex: 50
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-900)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', wordBreak: 'break-all' }}>{user.email}</div>
                    <span className="badge badge-primary" style={{ marginTop: '0.4rem' }}>{user.role}</span>
                  </div>

                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--slate-700)'
                    }}
                  >
                    <Layers size={16} /> My Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--danger-600)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
