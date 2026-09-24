import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  X, 
  User, 
  Camera, 
  Mail, 
  Phone, 
  Building2, 
  BookOpen, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Sparkles,
  Compass,
  GraduationCap
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80'
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    // Student
    headline: '',
    department: '',
    degree: '',
    graduation_year: '',
    enrollment_number: '',
    institution_id: '',
    bio: '',
    // Academician / Industry / Institution
    designation: '',
    company_name: '',
    institution_name: '',
    city: '',
    state: ''
  });

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const p = user.profile || {};
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || p.phone || '',
        avatar_url: user.avatar_url || '',
        headline: p.headline || '',
        department: p.department || '',
        degree: p.degree || '',
        graduation_year: p.graduation_year || '',
        enrollment_number: p.enrollment_number || '',
        institution_id: p.institution_id ? String(p.institution_id) : '',
        bio: p.bio || '',
        designation: p.designation || '',
        company_name: p.company_name || '',
        institution_name: p.institution_name || '',
        city: p.city || '',
        state: p.state || ''
      });
      setStatusMessage(null);

      // Load institutions for selection if student/academician
      if (user.role === 'STUDENT' || user.role === 'ACADEMICIAN') {
        api.get('/institution/public-list')
          .then(res => {
            if (res.data.success) {
              setInstitutions(res.data.data || []);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, user]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Local file upload for avatar
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WebP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file size must be under 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData(prev => ({ ...prev, avatar_url: dataUrl }));
      setStatusMessage({ type: 'info', text: 'Profile picture selected! Click "Save Changes" to apply.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
    setStatusMessage({ type: 'info', text: 'Avatar preset selected! Click "Save Changes" to apply.' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        avatar_url: formData.avatar_url,
        headline: formData.headline.trim(),
        department: formData.department.trim(),
        degree: formData.degree.trim(),
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : undefined,
        enrollment_number: formData.enrollment_number.trim(),
        institution_id: formData.institution_id ? parseInt(formData.institution_id, 10) : null,
        bio: formData.bio.trim(),
        designation: formData.designation.trim(),
        company_name: formData.company_name.trim(),
        city: formData.city.trim(),
        state: formData.state.trim()
      };

      const res = await api.put('/auth/profile', payload);

      if (res.data.success) {
        const updated = res.data.data.user;
        updateUser(updated);
        setStatusMessage({ type: 'success', text: 'Profile details and avatar updated successfully!' });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('[Profile Update Error]', err);
      const msg = err.response?.data?.error || 'Failed to update profile details.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Close when clicking outside of modal box
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        ref={modalRef}
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl, 16px)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--slate-50)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                My Profile Details
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                View and update your personal information and profile picture
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: 'var(--slate-500)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {statusMessage && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: statusMessage.type === 'success' ? 'var(--success-50, #f0fdf4)' : statusMessage.type === 'info' ? 'var(--primary-50)' : 'var(--danger-50)',
              color: statusMessage.type === 'success' ? 'var(--success-700, #15803d)' : statusMessage.type === 'info' ? 'var(--primary-700)' : 'var(--danger-600)',
              border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : statusMessage.type === 'info' ? 'var(--primary-200)' : '#fca5a5'}`
            }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} id="profile-edit-form">
            {/* Avatar Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1rem',
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  border: '3px solid #ffffff',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt={formData.name || 'User Avatar'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    formData.name ? formData.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>

                <label 
                  htmlFor="avatar-file-upload" 
                  title="Upload profile picture"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'var(--primary-600)',
                    color: '#ffffff',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  <Camera size={14} />
                  <input 
                    id="avatar-file-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
                    {formData.name || 'Your Name'}
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                    {user?.role}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.6rem' }}>
                  Upload a photo from your computer or pick an avatar preset below:
                </div>

                {/* Preset Avatars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(preset)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: formData.avatar_url === preset ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                        padding: 0,
                        cursor: 'pointer'
                      }}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger-600)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        marginLeft: '0.3rem'
                      }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* General Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Registered)</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                  style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-500)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {user?.role === 'STUDENT' && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Compass size={14} color="var(--primary-600)" />
                    <span>Target Career Role</span>
                  </label>
                  <input
                    type="text"
                    name="headline"
                    className="form-control"
                    placeholder="e.g. Full Stack Developer"
                    value={formData.headline}
                    onChange={handleChange}
                  />
                </div>
              )}

              {user?.role === 'ACADEMICIAN' && (
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    className="form-control"
                    placeholder="e.g. Associate Professor"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
              )}

              {user?.role === 'INDUSTRY' && (
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    className="form-control"
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {/* Student Specific College & Education Fields */}
            {user?.role === 'STUDENT' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={14} color="var(--primary-600)" />
                      <span>College / Educational Institution</span>
                    </label>
                    <select
                      name="institution_id"
                      className="form-control"
                      value={formData.institution_id}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Your College --</option>
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.institution_name} ({inst.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} color="var(--primary-600)" />
                      <span>Department / Branch</span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      className="form-control"
                      placeholder="e.g. Computer Science & Engineering"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      className="form-control"
                      placeholder="e.g. B.Tech"
                      value={formData.degree}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <input
                      type="number"
                      name="graduation_year"
                      className="form-control"
                      placeholder="2026"
                      value={formData.graduation_year}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Roll / Register No.</label>
                    <input
                      type="text"
                      name="enrollment_number"
                      className="form-control"
                      placeholder="2022CS1049"
                      value={formData.enrollment_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Bio */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">About / Bio</label>
              <textarea
                name="bio"
                className="form-control"
                rows={3}
                placeholder="Brief summary of skills, background, and career focus..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          background: 'var(--slate-50)'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="profile-edit-form"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Save size={16} />
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
