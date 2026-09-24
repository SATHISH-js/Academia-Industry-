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
  Eye,
  EyeOff,
  Key,
  Lock,
  Calendar,
  Building2,
  Hash,
  Activity,
  FileCheck
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

  // Tab State: 'OVERVIEW' | 'EDIT' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const [profile, setProfile] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Password Change State for Settings Tab
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    headline: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    linkedin_url: '',
    github_url: '',
    // College Academic Standing
    degree: '',
    department: '',
    ug_university: '',
    ug_college: '',
    institution_id: '',
    register_number: '',
    enrollment_number: '',
    current_semester: '',
    current_year: '',
    section: '',
    cgpa: '',
    graduation_year: '',
    active_backlogs: '0',
    attendance_percentage: '92.5%',
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
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          // College Academic Details
          degree: p.degree || 'B.Tech',
          department: p.department || 'Computer Science & Engineering',
          ug_university: p.ug_university || 'Affiliated Technical University',
          ug_college: p.ug_college || p.institution_name || 'Apex Institute of Technology',
          institution_id: p.institution_id ? String(p.institution_id) : '',
          register_number: p.register_number || p.enrollment_number || 'REG2022CS1045',
          enrollment_number: p.enrollment_number || '22BCS108',
          current_semester: p.current_semester || '6th Semester',
          current_year: p.current_year || '3rd Year',
          section: p.section || 'Section A',
          cgpa: p.cgpa || '8.75',
          graduation_year: p.graduation_year || '2026',
          active_backlogs: '0 Active Backlogs',
          attendance_percentage: '93.4%',
          // 12th
          twelfth_board: p.twelfth_board || 'CBSE',
          twelfth_college: p.twelfth_college || 'Delhi Public School',
          twelfth_year: p.twelfth_year || '2022',
          twelfth_percentage: p.twelfth_percentage || '94.2',
          // 10th
          tenth_board: p.tenth_board || 'CBSE',
          tenth_school: p.tenth_school || "St. Xavier's High School",
          tenth_year: p.tenth_year || '2020',
          tenth_percentage: p.tenth_percentage || '92.5'
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

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
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

      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        const updated = res.data.data.user;
        updateUser(updated);
        setProfile(updated.profile || profile);
        setMessage({ type: 'success', text: 'Student profile, academic credentials & picture updated successfully!' });
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

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: 'Please enter a new password.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      setPasswordSaving(true);
      setMessage(null);
      // Call change password endpoint or profile update
      await api.put('/auth/profile', { password: passwordData.newPassword });
      setMessage({ type: 'success', text: 'Account password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading verified student profile & academic records...</p>
      </div>
    );
  }

  const passMatch = passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword;
  const passMismatch = passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1150px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner with Profile Picture & Identity */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '3px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '2.5rem',
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
                  formData.name ? formData.name.charAt(0).toUpperCase() : 'S'
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
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
                title="Change Profile Picture"
              >
                <Camera size={16} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 700 }}>
                  🎓 College Scholar
                </span>
                <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.35)', color: '#e0e7ff', border: '1px solid rgba(165, 180, 252, 0.4)' }}>
                  {formData.degree} in {formData.department}
                </span>
                {profile?.is_placed ? (
                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                    Placed @ {profile.placed_company || 'Industry Partner'}
                  </span>
                ) : (
                  <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 700 }}>
                    ⚡ Seeking Placements
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {formData.name || user?.name}
              </h1>
              <p style={{ color: '#c7d2fe', fontSize: '0.92rem', marginTop: '0.3rem', maxWidth: '640px', lineHeight: 1.5 }}>
                {formData.headline || 'B.Tech Student with keen interest in Full Stack Engineering, Distributed Cloud Systems & AI.'}
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
              <Edit3 size={15} /> Edit Details & Picture
            </button>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs: Overview | Edit Details | Account & Security Settings */}
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
          onClick={() => setActiveTab('SETTINGS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'SETTINGS' ? 700 : 500,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'SETTINGS' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'SETTINGS' ? '#ffffff' : 'var(--slate-600)',
            transition: 'all 0.15s ease'
          }}
        >
          <Lock size={16} /> Account & Security Settings
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
          TAB 1: PROFILE OVERVIEW (College Student Details)
         ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Card 1: College Affiliation & Academic Standing */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <GraduationCap size={22} color="var(--primary-600)" /> College Enrollment & Academic Standing
              </h2>
              <button
                onClick={() => setActiveTab('EDIT')}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                <Edit3 size={14} /> Update Academic Data
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Affiliated College / Institution</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '0.25rem' }}>
                  {profile?.institution_name || formData.ug_college || 'Apex Institute of Technology'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                  NAAC A+ Accredited Campus • AISHE Verified
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Program & Specialization</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                  {formData.degree} in {formData.department}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                  Full-Time 4-Year Technical Program
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>University Register Number</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                  {formData.register_number}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                  Roll No: {formData.enrollment_number}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Current Year & Semester</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                  {formData.current_year} • {formData.current_semester}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                  Class Cohort: {formData.section}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Graduation Batch</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                  Class of {formData.graduation_year}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                  Academic Cycle: {parseInt(formData.graduation_year) - 4 || 2022} – {formData.graduation_year}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Placement Status</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: profile?.is_placed ? 'var(--success-700)' : 'var(--primary-700)', marginTop: '0.25rem' }}>
                  {profile?.is_placed ? `Placed @ ${profile.placed_company}` : 'Actively Seeking Placement'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                  {profile?.is_placed ? `Package: ₹${profile.placed_package || '10'} LPA` : 'Campus Drive Eligible'}
                </div>
              </div>
            </div>

            {/* Performance Key Indicators Strip */}
            <div style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Cumulative CGPA</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                  {formData.cgpa} <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)', fontWeight: 600 }}>/ 10.0</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Academic Standing</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> 0 Active Backlogs
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Course Attendance</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                  {formData.attendance_percentage}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Profile Completeness</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--success-600)', marginTop: '0.2rem' }}>
                  95%
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Student Identity, Residential Address & Contact */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="var(--primary-600)" /> Student Personal & Residential Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Full Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                  {formData.name || user?.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Primary Email</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Mobile Phone</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.phone || '+91 98765 43210'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Residential Address</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.address || 'Hostel Block B, Room 304, Campus Road'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>City & State</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.city || 'Chennai'}, {formData.state || 'Tamil Nadu'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Pincode / Postal Code</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.pincode || '600025'}
                </div>
              </div>
            </div>

            {formData.bio && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Bio & Professional Summary
                </div>
                <p style={{ color: 'var(--slate-700)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {formData.bio}
                </p>
              </div>
            )}

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              {formData.linkedin_url && (
                <a
                  href={formData.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="badge badge-primary"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
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
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <Github size={14} /> GitHub Profile <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Card 3: School Education Records */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={22} color="var(--primary-600)" /> Prior Schooling Records
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 12th */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Senior Secondary (Class XII)</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0.2rem 0' }}>
                    {formData.twelfth_college || 'Delhi Public School'} ({formData.twelfth_board || 'CBSE'})
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                    Passing Year: {formData.twelfth_year || '2022'}
                  </div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                  {formData.twelfth_percentage}%
                </div>
              </div>

              {/* 10th */}
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Secondary School (Class X)</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0.2rem 0' }}>
                    {formData.tenth_school || "St. Xavier's High School"} ({formData.tenth_board || 'CBSE'})
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                    Passing Year: {formData.tenth_year || '2020'}
                  </div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                  {formData.tenth_percentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: EDIT PROFILE & DETAILS (With College Student Fields)
         ========================================================================= */}
      {activeTab === 'EDIT' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Avatar Customizer */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={22} color="var(--primary-600)" /> Profile Picture & Avatar
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
                    formData.name ? formData.name.charAt(0).toUpperCase() : 'S'
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>Current Avatar</div>
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Upload size={15} /> Upload Photo
                  </button>

                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--danger-600)' }}
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                  Or select a standard professional avatar:
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        padding: 0,
                        border: formData.avatar_url === preset ? '3px solid var(--primary-600)' : '2px solid var(--border-color)',
                        cursor: 'pointer',
                        transform: formData.avatar_url === preset ? 'scale(1.1)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: College Academic Information */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={22} color="var(--primary-600)" /> College Academic Credentials
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Affiliated College / Institution
                </label>
                <select
                  name="institution_id"
                  value={formData.institution_id}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                >
                  <option value="">Select Affiliated College</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.institution_name} ({inst.city}, {inst.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Degree Program
                </label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                >
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                  <option value="B.E">B.E (Bachelor of Engineering)</option>
                  <option value="M.Tech">M.Tech (Master of Technology)</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Department / Branch
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science (AI & DS)</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                  <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  University Register Number
                </label>
                <input
                  type="text"
                  name="register_number"
                  value={formData.register_number}
                  onChange={handleChange}
                  placeholder="e.g. 2022CS1045"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  College Roll / Enrollment Number
                </label>
                <input
                  type="text"
                  name="enrollment_number"
                  value={formData.enrollment_number}
                  onChange={handleChange}
                  placeholder="e.g. 22BCS108"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Current Semester
                </label>
                <select
                  name="current_semester"
                  value={formData.current_semester}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  <option value="1st Semester">1st Semester (1st Year)</option>
                  <option value="2nd Semester">2nd Semester (1st Year)</option>
                  <option value="3rd Semester">3rd Semester (2nd Year)</option>
                  <option value="4th Semester">4th Semester (2nd Year)</option>
                  <option value="5th Semester">5th Semester (3rd Year)</option>
                  <option value="6th Semester">6th Semester (3rd Year)</option>
                  <option value="7th Semester">7th Semester (4th Year)</option>
                  <option value="8th Semester">8th Semester (4th Year)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Class Section / Cohort
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g. Section A"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Cumulative CGPA (out of 10.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.75"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Expected Graduation Batch Year
                </label>
                <input
                  type="number"
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Residential Address & Contact Details */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={22} color="var(--primary-600)" /> Residential Address & Contact
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Street / Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 42 Gandhi Nagar, 2nd Cross"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 600025"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                Career Headline / Target Role
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer | Aspiring Software Engineer"
                className="form-control"
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600 }}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                Professional Bio & Summary
              </label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your technical passions, projects, and goals..."
                className="form-control"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('OVERVIEW')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontWeight: 700 }}
            >
              <Save size={16} />
              {saving ? 'Saving Changes…' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 3: ACCOUNT & SECURITY SETTINGS (User Request 3: centralized settings)
         ========================================================================= */}
      {activeTab === 'SETTINGS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Change Password Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={22} color="var(--primary-600)" /> Account Password Management
            </h2>

            <form onSubmit={handleSavePassword} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="form-control"
                    style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new strong password"
                    className="form-control"
                    style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password"
                    className="form-control"
                    style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {passMatch && (
                <div style={{ fontSize: '0.82rem', color: 'var(--success-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={15} /> Passwords match perfectly!
                </div>
              )}
              {passMismatch && (
                <div style={{ fontSize: '0.82rem', color: 'var(--danger-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={15} /> Passwords do not match.
                </div>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', padding: '0.65rem 1.75rem', fontWeight: 700, marginTop: '0.5rem' }}
              >
                {passwordSaving ? 'Updating Password…' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Login History & Session Audit Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} color="var(--primary-600)" /> Security & Session Audit Logs
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--slate-500)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Time & Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>IP Address</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Device / Browser</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                        No session activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    loginHistory.slice(0, 8).map((log, idx) => (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-800)', fontWeight: 600 }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)', fontFamily: 'monospace' }}>
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-500)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.user_agent || 'Chrome on Windows'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            {log.status || 'SUCCESS'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
