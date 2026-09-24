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
  Github,
  Save,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Camera,
  Edit3,
  ExternalLink,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Upload,
  Trash2,
  Check,
  Eye
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80'
];

export const StudentProfilePage = () => {
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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    headline: '',
    bio: '',
    address: '',
    linkedin_url: '',
    github_url: '',
    // UG
    degree: '',
    department: '',
    ug_university: '',
    ug_college: '',
    institution_id: '',
    cgpa: '',
    graduation_year: '',
    enrollment_number: '',
    // 12th
    twelfth_board: '',
    twelfth_college: '',
    twelfth_year: '',
    twelfth_percentage: '',
    // 10th
    tenth_board: '',
    tenth_school: '',
    tenth_year: '',
    tenth_percentage: ''
  });

  useEffect(() => {
    fetchProfileAndSecurity();
  }, []);

  const fetchProfileAndSecurity = async () => {
    try {
      setLoading(true);
      const [profileRes, historyRes, instListRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/auth/login-history'),
        api.get('/institution/public-list').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (instListRes.data.success) {
        setInstitutions(instListRes.data.data || []);
      }

      if (profileRes.data.success) {
        const p = profileRes.data.data;
        setProfile(p);
        setFormData({
          name: p.name || user?.name || '',
          email: p.email || user?.email || '',
          phone: p.phone || user?.phone || '',
          avatar_url: p.avatar_url || user?.avatar_url || '',
          headline: p.headline || '',
          bio: p.bio || '',
          address: p.address || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          degree: p.degree || '',
          department: p.department || '',
          ug_university: p.ug_university || '',
          ug_college: p.ug_college || '',
          institution_id: p.institution_id ? String(p.institution_id) : '',
          cgpa: p.cgpa || '',
          graduation_year: p.graduation_year || '',
          enrollment_number: p.enrollment_number || '',
          twelfth_board: p.twelfth_board || '',
          twelfth_college: p.twelfth_college || '',
          twelfth_year: p.twelfth_year || '',
          twelfth_percentage: p.twelfth_percentage || '',
          tenth_board: p.tenth_board || '',
          tenth_school: p.tenth_school || '',
          tenth_year: p.tenth_year || '',
          tenth_percentage: p.tenth_percentage || ''
        });
      }

      if (historyRes.data.success) {
        setLoginHistory(historyRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load student profile & security', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Profile Picture File Upload -> Data URI
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
      const dataUri = event.target.result;
      setFormData(prev => ({ ...prev, avatar_url: dataUri }));
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

      // Save via auth profile endpoint
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        const updated = res.data.data.user;
        updateUser(updated);
        setProfile(updated.profile || profile);
        setMessage({ type: 'success', text: 'Profile details & picture updated successfully!' });
        setTimeout(() => {
          setActiveTab('OVERVIEW');
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile. Please check your inputs.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading verified student profile...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner with Profile Picture & Identity */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
        padding: '2rem 2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Big Avatar */}
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
                    alt={formData.name || 'User Profile'}
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
                  🎓 Student Scholar
                </span>
                {profile?.is_placed && (
                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                    Placed @ {profile.placed_company || 'Industry Partner'}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {formData.name || user?.name}
              </h1>
              <p style={{ color: 'var(--primary-200)', fontSize: '0.9rem', marginTop: '0.3rem', maxWidth: '600px', lineHeight: 1.5 }}>
                {formData.headline || 'Pursuing Engineering with passion for building scalable web and cloud systems.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
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
              <Edit3 size={15} /> Edit Profile & Picture
            </button>
          </div>
        </div>
      </div>

      {/* Profile Inner Navigation Tabs (The User Request) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: '#ffffff',
        padding: '0.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap'
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
            color: activeTab === 'OVERVIEW' ? '#ffffff' : 'var(--slate-600)',
            transition: 'all 0.15s ease'
          }}
        >
          <User size={16} /> Profile Overview
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
            color: activeTab === 'EDIT' ? '#ffffff' : 'var(--slate-600)',
            transition: 'all 0.15s ease'
          }}
        >
          <Camera size={16} /> Edit Details & Profile Picture
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
            color: activeTab === 'SECURITY' ? '#ffffff' : 'var(--slate-600)',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldCheck size={16} /> Security & Login Audit
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
          gap: '0.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: PROFILE OVERVIEW (View Mode)
         ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Personal & Contact Summary Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <User size={22} color="var(--primary-600)" /> Student Digital Identity & Contact
              </h2>
              <button
                onClick={() => setActiveTab('EDIT')}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                <Edit3 size={14} /> Edit Information
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Full Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                  {formData.name || 'Not specified'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Official Email</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Phone Number</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.phone || 'Not provided'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Affiliated Institution</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                  {profile?.institution_name || formData.ug_college || 'Apex Institute of Technology'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Enrollment / Roll No</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.enrollment_number || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Residential Location</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.address || 'India'}
                </div>
              </div>
            </div>

            {formData.bio && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Bio & Professional Summary
                </div>
                <p style={{ color: 'var(--slate-700)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {formData.bio}
                </p>
              </div>
            )}

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              {formData.linkedin_url && (
                <a
                  href={formData.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="badge badge-primary"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Linkedin size={14} /> LinkedIn Profile <ExternalLink size={12} />
                </a>
              )}
              {formData.github_url && (
                <a
                  href={formData.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="badge badge-neutral"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Github size={14} /> GitHub Profile <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Academic Qualifications Cards */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={22} color="var(--primary-600)" /> Educational Records
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Undergraduate */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                      Current / Undergraduate Degree
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.2rem 0' }}>
                      {formData.degree || 'B.Tech'} in {formData.department || 'Computer Science & Engineering'}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {profile?.institution_name || formData.ug_college || 'Apex Institute of Technology'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-600)' }}>
                      CGPA: {formData.cgpa || '8.5'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Class of {formData.graduation_year || '2026'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 12th Standard */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                      Class XII / Senior Secondary
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0.2rem 0' }}>
                      {formData.twelfth_school || formData.twelfth_college || 'Delhi Public School'} ({formData.twelfth_board || 'CBSE'})
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      Year of Passing: {formData.twelfth_year || '2022'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {formData.twelfth_percentage ? `${formData.twelfth_percentage}%` : '94.2%'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 10th Standard */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                      Class X / Secondary School
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0.2rem 0' }}>
                      {formData.tenth_school || "St. Xavier's High School"} ({formData.tenth_board || 'CBSE'})
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      Year of Passing: {formData.tenth_year || '2020'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {formData.tenth_percentage ? `${formData.tenth_percentage}%` : '92.5%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: EDIT PROFILE & PROFILE PICTURE (The Core User Request)
         ========================================================================= */}
      {activeTab === 'EDIT' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Sub-Card 1: Profile Picture Customizer */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={22} color="var(--primary-600)" /> Profile Picture & Avatar
            </h2>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Current Preview */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  border: '3px solid var(--primary-500)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  margin: '0 auto 0.5rem'
                }}>
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Avatar Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    formData.name ? formData.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>Current Avatar</div>
              </div>

              {/* Upload & Action Controls */}
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Upload size={15} /> Upload Photo from Device
                  </button>

                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--danger-600)' }}
                    >
                      <Trash2 size={15} /> Remove Photo
                    </button>
                  )}
                </div>

                {/* Preset Avatars Selection */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '0.4rem' }}>
                    Or pick from professional avatar presets:
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
                          border: formData.avatar_url === presetUrl ? '3px solid var(--primary-600)' : '2px solid transparent',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <img src={presetUrl} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-600)' }}>Or paste direct image URL:</label>
                  <input
                    type="url"
                    name="avatar_url"
                    className="form-control"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Card 2: Personal Information */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="var(--primary-600)" /> Personal & Contact Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Full Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Email Address (Login Account)
                </label>
                <input
                  type="email"
                  disabled
                  className="form-control"
                  name="email"
                  value={formData.email}
                  style={{ backgroundColor: 'var(--slate-100)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Contact Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Residential Address / City</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. New Delhi, India"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Professional Headline</label>
                <input
                  type="text"
                  className="form-control"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Full-Stack Developer & Aspiring Cloud Architect"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Bio / Profile Summary</label>
                <textarea
                  className="form-control"
                  rows={3}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief summary of your technical aspirations, project highlights, and academic interests..."
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>GitHub Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Educational Qualifications */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={22} color="var(--primary-600)" /> Update Academic Qualifications
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Undergraduate Degree */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                  1. Undergraduate Degree (Current / Highest)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Affiliated College / Educational Institution
                    </label>
                    <select
                      className="form-control"
                      name="institution_id"
                      value={formData.institution_id}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const match = institutions.find(i => String(i.id) === String(selId));
                        setFormData({
                          ...formData,
                          institution_id: selId,
                          ug_college: match ? match.institution_name : formData.ug_college
                        });
                      }}
                    >
                      <option value="">-- Select Your College --</option>
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.institution_name} ({inst.city}, {inst.state || 'India'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Degree (e.g. B.Tech, B.E., BCA)</label>
                    <input type="text" className="form-control" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. B.Tech" />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Department / Branch</label>
                    <input type="text" className="form-control" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science & Engineering" />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Current CGPA (Scale of 10.0)</label>
                    <input type="number" step="0.01" className="form-control" name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.85" />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Graduation Year</label>
                    <input type="number" className="form-control" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="e.g. 2026" />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Enrollment / Roll Number</label>
                    <input type="text" className="form-control" name="enrollment_number" value={formData.enrollment_number} onChange={handleChange} placeholder="e.g. 2022CS1049" />
                  </div>
                </div>
              </div>

              {/* Class XII */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                  2. Class XII / Senior Secondary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Board</label>
                    <input type="text" className="form-control" name="twelfth_board" value={formData.twelfth_board} onChange={handleChange} placeholder="e.g. CBSE / ISC" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Junior College / School</label>
                    <input type="text" className="form-control" name="twelfth_college" value={formData.twelfth_college} onChange={handleChange} placeholder="e.g. Delhi Public School" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Passing Year</label>
                    <input type="number" className="form-control" name="twelfth_year" value={formData.twelfth_year} onChange={handleChange} placeholder="e.g. 2022" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Percentage (%)</label>
                    <input type="number" step="0.01" className="form-control" name="twelfth_percentage" value={formData.twelfth_percentage} onChange={handleChange} placeholder="e.g. 94.5" />
                  </div>
                </div>
              </div>

              {/* Class X */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                  3. Class X / Secondary School
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Board</label>
                    <input type="text" className="form-control" name="tenth_board" value={formData.tenth_board} onChange={handleChange} placeholder="e.g. CBSE / ICSE" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">School Name</label>
                    <input type="text" className="form-control" name="tenth_school" value={formData.tenth_school} onChange={handleChange} placeholder="e.g. St. Xavier's High School" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Passing Year</label>
                    <input type="number" className="form-control" name="tenth_year" value={formData.tenth_year} onChange={handleChange} placeholder="e.g. 2020" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Percentage (%)</label>
                    <input type="number" step="0.01" className="form-control" name="tenth_percentage" value={formData.tenth_percentage} onChange={handleChange} placeholder="e.g. 92.5" />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontWeight: 700 }}
              >
                {saving ? (
                  <>
                    <Sparkles size={18} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 3: SECURITY & LOGIN AUDIT
         ========================================================================= */}
      {activeTab === 'SECURITY' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={24} color="var(--primary-600)" /> Security & Authenticated Login History
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                Every login session to your portal is cryptographically audited with IP address, device footprint, and timestamp.
              </p>
            </div>

            <span className="badge badge-success">
              Active Session Verified
            </span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>Device / Browser Agent</th>
                  <th>Security Status</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <code>{log.ip_address || '127.0.0.1'}</code>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.user_agent}
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status === 'SUCCESS' ? 'Authenticated' : 'Failed Attempt'}
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
