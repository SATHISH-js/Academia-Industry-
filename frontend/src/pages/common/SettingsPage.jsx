import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Bell, 
  History, 
  Settings as SettingsIcon,
  Save
} from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();

  // Password change state
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    applicationUpdates: true,
    internshipRecommendations: true,
    systemAnnouncements: false
  });

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwords.oldPassword) {
      return setError('Please enter your current (old) password.');
    }

    if (!passwords.newPassword) {
      return setError('Please enter your new password.');
    }

    if (passwords.newPassword.length < 8) {
      return setError('New password must be at least 8 characters long.');
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setError('New password and confirm password do not match.');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
      return setError('New password must contain at least one uppercase letter, one lowercase letter, and one number.');
    }

    setLoading(true);

    try {
      const res = await api.put('/auth/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      if (res.data.success) {
        setSuccess('Password updated successfully! Please use your new password next time you sign in.');
        setPasswords({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('[Change Password Error]', err);
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update password. Please verify your current password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--slate-900), var(--primary-900))',
        color: '#ffffff',
        padding: '1.75rem',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <SettingsIcon size={26} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
            Account Settings & Security
          </h1>
          <p style={{ color: 'var(--slate-300)', fontSize: '0.9rem', marginTop: '0.2rem', margin: 0 }}>
            Manage your credentials, password security, and account preferences
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Requirement 5: Change Password Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <KeyRound size={20} color="var(--primary-600)" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                Change Password
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Enter your old password to authorize setting a new password
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--danger-50)',
              border: '1px solid #fca5a5',
              color: 'var(--danger-600)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: 'var(--success-50, #f0fdf4)',
              border: '1px solid #bbf7d0',
              color: 'var(--success-700, #15803d)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            {/* Old / Current Password */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Current (Old) Password <span style={{ color: 'var(--danger-600)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOld ? 'text' : 'password'}
                  name="oldPassword"
                  className="form-control"
                  placeholder="Enter your existing password"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-400)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label="Toggle old password visibility"
                >
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                New Password <span style={{ color: 'var(--danger-600)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  className="form-control"
                  placeholder="Min 8 characters (uppercase, lowercase, number)"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-400)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Confirm New Password <span style={{ color: 'var(--danger-600)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-400)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--slate-50)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--slate-600)',
              marginBottom: '1.25rem',
              lineHeight: 1.5,
              border: '1px solid var(--border-color)'
            }}>
              <strong>Security Rule:</strong> Minimum 8 characters with at least one uppercase letter (A-Z), one lowercase letter (a-z), and one number (0-9).
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', fontWeight: 700, padding: '0.7rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying & Updating...' : (
                <>
                  <Lock size={16} /> Update Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Info & Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User Account Overview */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <User size={20} color="var(--primary-600)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                Account Identity
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Account Name</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>{user?.name}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Registered Email</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>{user?.email}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Portal Role</span>
                <span className="badge badge-primary">{user?.role}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Account Status</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success-600)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Verified Active
                </span>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <Bell size={20} color="var(--primary-600)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                Notification Preferences
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-700)', fontWeight: 500 }}>
                  Application Status & Shortlist Alerts
                </span>
                <input
                  type="checkbox"
                  checked={notifications.applicationUpdates}
                  onChange={(e) => setNotifications({ ...notifications, applicationUpdates: e.target.checked })}
                  style={{ accentColor: 'var(--primary-600)', width: 18, height: 18 }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-700)', fontWeight: 500 }}>
                  Roadmap Milestone Reminders
                </span>
                <input
                  type="checkbox"
                  checked={notifications.internshipRecommendations}
                  onChange={(e) => setNotifications({ ...notifications, internshipRecommendations: e.target.checked })}
                  style={{ accentColor: 'var(--primary-600)', width: 18, height: 18 }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-700)', fontWeight: 500 }}>
                  Email Notifications
                </span>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  style={{ accentColor: 'var(--primary-600)', width: 18, height: 18 }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
