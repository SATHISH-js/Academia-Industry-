import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ProfileModal } from './ProfileModal';
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Briefcase, 
  Layers, 
  Settings, 
  CheckCheck, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarOpen = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardActive = location.pathname.includes('/dashboard');

  // Dropdown & Modal states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState('ALL'); // 'ALL' or 'APPLICATIONS'

  // Refs for click outside
  const profileDropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      // Graceful fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Click outside and Escape key handler (Requirement 7)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sign out redirect to landing page (User Request: "if signout means show landing page")
  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'ACADEMICIAN': return '/academician/dashboard';
      case 'INDUSTRY': return '/industry/dashboard';
      case 'INSTITUTION': return '/institution/dashboard';
      default: return '/';
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  // Click single notification
  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        // Continue navigation
      }
    }

    setNotificationOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Filter application notifications
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'APPLICATIONS') {
      const text = `${n.title} ${n.message} ${n.type}`.toLowerCase();
      return text.includes('application') || text.includes('internship') || text.includes('interview') || text.includes('shortlist') || text.includes('offer');
    }
    return true;
  });

  return (
    <>
      <header className="app-topbar-fixed">
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
              {!isSidebarOpen && (
                <span className="menu-toggle-label">
                  Menu
                </span>
              )}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Prominent Top Bar Dashboard Button (User Request 1: "remove dasboard in the side menu ,put only in top bar") */}
              <Link 
                to={getDashboardRoute()} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  backgroundColor: isDashboardActive ? 'var(--primary-600)' : 'var(--primary-50)',
                  color: isDashboardActive ? '#ffffff' : 'var(--primary-700)',
                  border: isDashboardActive ? '1px solid var(--primary-600)' : '1px solid var(--primary-200)',
                  boxShadow: isDashboardActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Go to Dashboard"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>

              {/* Requirement 3: Notification Bell Button (For All Logins) */}
              <div style={{ position: 'relative' }} ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    setDropdownOpen(false);
                  }}
                  style={{
                    background: notificationOpen ? 'var(--primary-50)' : 'none',
                    border: '1px solid var(--border-color)',
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: notificationOpen ? 'var(--primary-600)' : 'var(--slate-700)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                  title="Notifications & Application Messages"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      background: 'var(--danger-500, #ef4444)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      border: '2px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {notificationOpen && (
                  <div style={{
                    position: 'absolute',
                    right: -40,
                    top: '125%',
                    width: '360px',
                    maxWidth: '90vw',
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg, 12px)',
                    boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden',
                    zIndex: 60,
                    animation: 'fadeIn 0.15s ease'
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--slate-50)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {unreadCount} New
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary-600)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Mark all as read"
                          >
                            <CheckCheck size={14} /> Mark all read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNotificationOpen(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--slate-400)',
                            cursor: 'pointer',
                            padding: '0.2rem'
                          }}
                          aria-label="Close notifications"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                      display: 'flex',
                      borderBottom: '1px solid var(--border-color)',
                      background: '#ffffff'
                    }}>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('ALL')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: notifFilter === 'ALL' ? '2px solid var(--primary-600)' : '2px solid transparent',
                          color: notifFilter === 'ALL' ? 'var(--primary-600)' : 'var(--slate-600)',
                          fontSize: '0.8rem',
                          fontWeight: notifFilter === 'ALL' ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('APPLICATIONS')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: notifFilter === 'APPLICATIONS' ? '2px solid var(--primary-600)' : '2px solid transparent',
                          color: notifFilter === 'APPLICATIONS' ? 'var(--primary-600)' : 'var(--slate-600)',
                          fontSize: '0.8rem',
                          fontWeight: notifFilter === 'APPLICATIONS' ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        Applications
                      </button>
                    </div>

                    {/* Notification List */}
                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                      {filteredNotifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                          <Bell size={28} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No notifications found</div>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            {notifFilter === 'APPLICATIONS' ? 'No application alerts currently.' : 'You are all caught up!'}
                          </div>
                        </div>
                      ) : (
                        filteredNotifications.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--slate-100)',
                              backgroundColor: item.is_read ? '#ffffff' : 'var(--primary-50, #f8faff)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: item.type === 'APPLICATION' ? 'var(--primary-100)' : item.type === 'SHORTLIST' ? 'var(--success-50)' : 'var(--slate-100)',
                              color: item.type === 'APPLICATION' ? 'var(--primary-700)' : item.type === 'SHORTLIST' ? 'var(--success-700)' : 'var(--slate-600)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: 2
                            }}>
                              {item.type === 'APPLICATION' ? <FileText size={16} /> : item.type === 'SHORTLIST' ? <Sparkles size={16} /> : <Bell size={16} />}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: item.is_read ? 600 : 700, color: 'var(--slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.title}
                                </div>
                                {!item.is_read && (
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary-600)', flexShrink: 0 }} />
                                )}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.2rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.message}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                                <Clock size={11} />
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                {item.link && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--primary-600)', fontWeight: 600, marginLeft: 'auto' }}>
                                    View <ExternalLink size={10} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Requirement 4, 6 & 7: User Profile Avatar & Dropdown */}
              <div style={{ position: 'relative' }} ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotificationOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: dropdownOpen ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                    padding: '0.25rem 0.6rem 0.25rem 0.35rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Profile menu"
                  aria-label="User Profile"
                  aria-expanded={dropdownOpen}
                >
                  {/* Requirement 6: Profile Picture Display */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}>
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.name || 'User Profile'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>

                  <div style={{ textAlign: 'left', display: 'none', minWidth: 80 }} className="nav-user-info">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                      {user?.role}
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown Menu with Close Option (Requirement 7) */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '125%',
                    width: 250,
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg, 12px)',
                    boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15)',
                    padding: '0.4rem 0',
                    zIndex: 50,
                    animation: 'fadeIn 0.15s ease'
                  }}>
                    {/* Header with Close (X) button */}
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--slate-400)',
                          cursor: 'pointer',
                          padding: '0.2rem'
                        }}
                        aria-label="Close profile menu"
                        title="Close menu"
                      >
                        <X size={16} />
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingRight: '1.25rem' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                          flexShrink: 0
                        }}>
                          {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                          )}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                          {user?.role} PORTAL
                        </span>
                      </div>
                    </div>

                    {/* Requirement 4: "Profile Tab inside Profile Icon to view and change details" */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--slate-700)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slate-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User size={16} color="var(--primary-600)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>My Profile</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>View & edit personal details</div>
                      </div>
                    </button>

                    {/* Requirement 5 Link: Settings & Password Option */}
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--slate-700)',
                        textDecoration: 'none',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slate-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Settings size={16} color="var(--primary-600)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Settings & Password</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Change password & options</div>
                      </div>
                    </Link>

                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--slate-700)',
                        textDecoration: 'none',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slate-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Layers size={16} color="var(--slate-500)" />
                      <span>My Dashboard</span>
                    </Link>

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.35rem 0' }} />

                    {/* Sign Out Button (navigates to Landing Page) */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--danger-600)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      <span style={{ fontWeight: 600 }}>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Profile Details & Avatar Editor Modal (Requirement 4 & 6) */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};
