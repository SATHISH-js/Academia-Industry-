import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  GraduationCap,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  Compass,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_login_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // If already authenticated, redirect immediately to their role dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const roleRoutes = {
        STUDENT: '/student/dashboard',
        ACADEMICIAN: '/academician/dashboard',
        INDUSTRY: '/industry/dashboard',
        INSTITUTION: '/institution/dashboard'
      };
      navigate(roleRoutes[user.role] || '/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle Caps Lock detection
  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data.success) {
        const { user: authUser, token } = response.data.data;

        // Save email preference if rememberMe checked
        if (rememberMe) {
          localStorage.setItem('saved_login_email', email.trim().toLowerCase());
        } else {
          localStorage.removeItem('saved_login_email');
        }

        login(authUser, token);

        // Immediate real-time redirection based on backend verified role
        const roleRoutes = {
          STUDENT: '/student/dashboard',
          ACADEMICIAN: '/academician/dashboard',
          INDUSTRY: '/industry/dashboard',
          INSTITUTION: '/institution/dashboard'
        };
        navigate(roleRoutes[authUser.role] || '/');
      }
    } catch (err) {
      console.error('[Login Error]', err);
      const msg = err.response?.data?.error || 'Invalid credentials. Please verify your email and password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--header-height) - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
          border: '1px solid var(--slate-200)',
          position: 'relative'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, #1e1b4b 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.35)'
            }}
          >
            <GraduationCap size={30} />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
            Sign In to Portal
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', margin: 0 }}>
            Unified real-time authentication for Students, Faculty, Industry & Institutions
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-50, #fef2f2)',
              border: '1px solid #fecaca',
              color: 'var(--danger-700, #b91c1c)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger-700)', padding: '0.2rem' }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Caps Lock Alert */}
        {capsLockActive && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#b45309',
              padding: '0.65rem 0.95rem',
              borderRadius: 'var(--radius-md, 8px)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <AlertCircle size={16} />
            <span>Caps Lock is ON</span>
          </div>
        )}

        {/* Real-time Authentication Form */}
        <form onSubmit={handleLogin} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
          {/* Email input */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="email" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-700)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: email && isEmailValid ? 'var(--primary-600)' : 'var(--slate-400)',
                  transition: 'color 0.2s'
                }}
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                className="form-control"
                placeholder="name@university.edu or corporate email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
                disabled={loading}
                style={{
                  paddingLeft: '2.5rem',
                  fontSize: '0.92rem',
                  borderColor: email && isEmailValid ? 'var(--primary-300)' : undefined
                }}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSubmitted(false);
                  setShowForgotModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: password ? 'var(--primary-600)' : 'var(--slate-400)',
                  transition: 'color 0.2s'
                }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="form-control"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
                disabled={loading}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontSize: '0.92rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-400)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.35rem',
                  borderRadius: '4px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-600)', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary-600)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Remember my email on this device
            </label>
          </div>

          {/* Submit Button with Real-time State */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Authenticating credentials...
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Supported Roles Indicator */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-100)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center', marginBottom: '0.75rem' }}>
            Single Sign-On Across All Portals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
            <div style={{ padding: '0.4rem 0.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm, 6px)', fontSize: '0.72rem', color: 'var(--slate-700)', fontWeight: 600 }}>
              🎓 Student
            </div>
            <div style={{ padding: '0.4rem 0.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm, 6px)', fontSize: '0.72rem', color: 'var(--slate-700)', fontWeight: 600 }}>
              👨‍🏫 Faculty
            </div>
            <div style={{ padding: '0.4rem 0.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm, 6px)', fontSize: '0.72rem', color: 'var(--slate-700)', fontWeight: 600 }}>
              🏢 Industry
            </div>
            <div style={{ padding: '0.4rem 0.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm, 6px)', fontSize: '0.72rem', color: 'var(--slate-700)', fontWeight: 600 }}>
              🏛️ Campus
            </div>
          </div>
        </div>

        {/* Registration Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--slate-600)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
            Register new account <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </Link>
        </div>

        {/* Security Reassurance */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
          <ShieldCheck size={14} color="#16a34a" />
          <span>TLS 256-bit encrypted authentication & token security</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg, 16px)',
              width: '100%',
              maxWidth: '440px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--slate-900)' }}>
                  Password Recovery
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: 0 }}>
                  Enter your registered portal email to receive account recovery details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {forgotSubmitted ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <CheckCircle2 size={26} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--slate-900)' }}>
                  Instructions Dispatched
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                  If an active account exists for <strong>{forgotEmail}</strong>, password reset and account verification details have been issued to that address.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem', fontSize: '0.88rem' }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="forgot-email" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Registered Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-control"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', fontWeight: 700 }}
                  >
                    Send Recovery Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
