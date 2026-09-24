import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Save,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Camera,
  Edit3,
  ExternalLink,
  BookOpen,
  Briefcase,
  Upload,
  Trash2,
  Award
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80'
];

export const AcademicianProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Tab State: 'OVERVIEW' | 'EDIT' | 'SECURITY'
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const [profile, setProfile] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    designation: '',
    department: '',
    employee_id: '',
    qualification: '',
    experience_years: '',
    specialization: '',
    research_interests: '',
    publications_count: '',
    linkedin_url: '',
    institution_id: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, historyRes, instRes] = await Promise.all([
        api.get('/academician/profile'),
        api.get('/auth/login-history'),
        api.get('/institution/public-list').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (instRes.data.success) {
        setInstitutions(instRes.data.data || []);
      }

      if (profileRes.data.success) {
        const p = profileRes.data.data;
        setProfile(p);
        setFormData({
          name: p.name || user?.name || '',
          email: p.email || user?.email || '',
          phone: p.phone || user?.phone || '',
          avatar_url: p.avatar_url || user?.avatar_url || '',
          designation: p.designation || 'Assistant Professor',
          department: p.department || 'Computer Science & Engineering',
          employee_id: p.employee_id || '',
          qualification: p.qualification || 'Ph.D. in Engineering',
          experience_years: p.experience_years ? String(p.experience_years) : '5',
          specialization: p.specialization || '',
          research_interests: p.research_interests || '',
          publications_count: p.publications_count ? String(p.publications_count) : '0',
          linkedin_url: p.linkedin_url || '',
          institution_id: p.institution_id ? String(p.institution_id) : '',
          bio: p.bio || ''
        });
      }

      if (historyRes.data.success) {
        setLoginHistory(historyRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load academician profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WebP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image file size must be under 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, avatar_url: event.target.result }));
      setMessage({ type: 'success', text: 'Photo selected! Click "Save Profile Changes" to apply.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
    setMessage({ type: 'success', text: 'Preset avatar selected! Click "Save Profile Changes" to apply.' });
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    setMessage({ type: 'success', text: 'Profile picture removed. Click "Save Profile Changes" to apply.' });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        const updated = res.data.data.user;
        updateUser(updated);
        setProfile(updated.profile || profile);
        setMessage({ type: 'success', text: 'Faculty profile & picture updated successfully!' });
        setTimeout(() => setActiveTab('OVERVIEW'), 1200);
      }
    } catch (err) {
      console.error('Failed to update academician profile', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading academician profile...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '2rem 2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '2.25rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt={formData.name || 'Faculty Profile'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  formData.name ? formData.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('EDIT');
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--primary-600)',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
                title="Change Profile Picture"
              >
                <Camera size={15} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
                  📚 Faculty Academician
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                  {formData.designation || 'Assistant Professor'}
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {formData.name || user?.name}
              </h1>
              <p style={{ color: 'var(--primary-200)', fontSize: '0.9rem', marginTop: '0.3rem', maxWidth: '600px', lineHeight: 1.5 }}>
                {profile?.institution_name || 'Apex Institute of Technology'} • Department of {formData.department}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('EDIT')}
            className="btn btn-primary"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--primary-900)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem'
            }}
          >
            <Edit3 size={15} /> Edit Faculty Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: '#ffffff',
        padding: '0.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'OVERVIEW' ? 700 : 500,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'OVERVIEW' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'OVERVIEW' ? '#ffffff' : 'var(--slate-600)'
          }}
        >
          <User size={16} /> Faculty Overview
        </button>

        <button
          onClick={() => setActiveTab('EDIT')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'EDIT' ? 700 : 500,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'EDIT' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'EDIT' ? '#ffffff' : 'var(--slate-600)'
          }}
        >
          <Camera size={16} /> Edit Details & Picture
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'SECURITY' ? 700 : 500,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'SECURITY' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'SECURITY' ? '#ffffff' : 'var(--slate-600)'
          }}
        >
          <ShieldCheck size={16} /> Security Audit
        </button>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: message.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
          color: message.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
          border: `1px solid ${message.type === 'success' ? 'var(--success-500)' : 'var(--danger-500)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="var(--primary-600)" /> Faculty Profile & Academic Specialization
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Faculty Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.2rem' }}>{formData.name}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Official Email</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.email}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Designation</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: '0.2rem' }}>{formData.designation}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Department</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.department}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Highest Qualification</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.qualification || 'Ph.D.'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Experience</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.experience_years} Years</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Employee ID</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.employee_id || 'N/A'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Contact Phone</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.phone || 'Not provided'}</div>
              </div>
            </div>

            {formData.specialization && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Research Areas & Specialization
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {formData.specialization.split(',').map((spec, i) => (
                    <span key={i} className="badge badge-neutral" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT TAB */}
      {activeTab === 'EDIT' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Avatar Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={22} color="var(--primary-600)" /> Faculty Profile Picture
            </h2>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  border: '3px solid var(--primary-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  margin: '0 auto 0.5rem'
                }}>
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    formData.name ? formData.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>Current Avatar</div>
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <Upload size={15} /> Upload Photo from Device
                  </button>
                  {formData.avatar_url && (
                    <button type="button" onClick={handleRemovePhoto} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--danger-600)' }}>
                      <Trash2 size={15} /> Remove Photo
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '0.4rem' }}>
                    Or select avatar preset:
                  </label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {AVATAR_PRESETS.map((presetUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPreset(presetUrl)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: formData.avatar_url === presetUrl ? '3px solid var(--primary-600)' : '2px solid transparent'
                        }}
                      >
                        <img src={presetUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="var(--primary-600)" /> Update Faculty Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Full Name *</label>
                <input type="text" required className="form-control" name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Contact Phone</label>
                <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Faculty Designation *</label>
                <input type="text" required className="form-control" name="designation" value={formData.designation} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Department *</label>
                <input type="text" required className="form-control" name="department" value={formData.department} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Highest Qualification</label>
                <input type="text" className="form-control" name="qualification" value={formData.qualification} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Experience in Years</label>
                <input type="number" className="form-control" name="experience_years" value={formData.experience_years} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Employee / Faculty ID</label>
                <input type="text" className="form-control" name="employee_id" value={formData.employee_id} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>LinkedIn URL</label>
                <input type="url" className="form-control" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Research Specialization (comma separated)</label>
                <input type="text" className="form-control" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Artificial Intelligence, Cloud Computing, VLSI Design" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', gap: '0.75rem' }}>
              <button type="button" onClick={() => setActiveTab('OVERVIEW')} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 700 }}>
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'SECURITY' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={24} color="var(--primary-600)" /> Security & Authenticated Sessions
          </h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>Device / Browser Agent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td><code>{log.ip_address || '127.0.0.1'}</code></td>
                    <td>{log.user_agent}</td>
                    <td>
                      <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status === 'SUCCESS' ? 'Authenticated' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
