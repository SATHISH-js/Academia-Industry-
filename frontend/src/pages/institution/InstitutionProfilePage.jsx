import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  School,
  Building,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Camera,
  Edit3,
  ExternalLink,
  Award,
  Upload,
  Trash2,
  Calendar
} from 'lucide-react';

const LOGO_PRESETS = [
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=256&q=80'
];

export const InstitutionProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    institution_name: '',
    institution_code: '',
    institution_type: 'Autonomous College',
    city: '',
    state: '',
    country: 'India',
    website: '',
    accreditation: 'NAAC A++',
    established_year: '1985',
    description: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [authRes, historyRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/auth/login-history')
      ]);

      if (authRes.data.success) {
        const u = authRes.data.data.user;
        const p = u.profile || {};
        setFormData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          avatar_url: u.avatar_url || '',
          institution_name: p.institution_name || u.name || '',
          institution_code: p.institution_code || '',
          institution_type: p.institution_type || 'Autonomous College',
          city: p.city || '',
          state: p.state || '',
          country: p.country || 'India',
          website: p.website || '',
          accreditation: p.accreditation || 'NAAC A++',
          established_year: p.established_year ? String(p.established_year) : '1995',
          description: p.description || ''
        });
      }

      if (historyRes.data.success) {
        setLoginHistory(historyRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load institution profile', err);
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
      setMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, SVG).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be under 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, avatar_url: event.target.result }));
      setMessage({ type: 'success', text: 'Institution crest/logo selected! Click "Save Changes" to apply.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
    setMessage({ type: 'success', text: 'Preset insignia selected! Click "Save Changes" to apply.' });
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    setMessage({ type: 'success', text: 'Insignia removed. Click "Save Changes" to apply.' });
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
        setMessage({ type: 'success', text: 'Institution profile and insignia updated successfully!' });
        setTimeout(() => setActiveTab('OVERVIEW'), 1200);
      }
    } catch (err) {
      console.error('Failed to update institution profile', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading educational institution profile...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
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
                    alt={formData.institution_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  formData.institution_name ? formData.institution_name.charAt(0).toUpperCase() : 'I'
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
                title="Change Institution Crest / Logo"
              >
                <Camera size={15} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
                  🏛️ Educational Institution
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                  {formData.accreditation || 'NAAC Accredited'}
                </span>
                {formData.institution_code && (
                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                    Code: {formData.institution_code}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {formData.institution_name || user?.name}
              </h1>
              <p style={{ color: 'var(--slate-300)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                {formData.city ? `${formData.city}, ${formData.state || formData.country}` : 'India'} • Authorized Admin: {formData.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('EDIT')}
            className="btn btn-primary"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--slate-900)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem'
            }}
          >
            <Edit3 size={15} /> Edit Institution Profile
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
          <School size={16} /> Campus Overview
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
          <Camera size={16} /> Edit Details & Logo
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
              <School size={22} color="var(--primary-600)" /> Official Institution Profile
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Institution / College Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.2rem' }}>{formData.institution_name}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>AISHE / Institution Code</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.institution_code || 'C-13492'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Institution Type</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-700)', marginTop: '0.2rem' }}>{formData.institution_type}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Accreditation & Rank</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.accreditation}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Year Established</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.established_year}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Campus Location</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                  {formData.city ? `${formData.city}, ${formData.state}` : 'State, India'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Campus Admin Officer</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.name}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Contact Email</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.email}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Official Website</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-600)', marginTop: '0.2rem' }}>
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {formData.website} <ExternalLink size={13} />
                    </a>
                  ) : 'Not specified'}
                </div>
              </div>
            </div>

            {formData.description && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  About the Campus & Vision
                </div>
                <p style={{ color: 'var(--slate-700)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {formData.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT TAB */}
      {activeTab === 'EDIT' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Logo Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={22} color="var(--primary-600)" /> Institution Insignia & Crest
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
                    <img src={formData.avatar_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    formData.institution_name ? formData.institution_name.charAt(0).toUpperCase() : 'I'
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>Current Crest</div>
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <Upload size={15} /> Upload Crest from Device
                  </button>
                  {formData.avatar_url && (
                    <button type="button" onClick={handleRemovePhoto} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--danger-600)' }}>
                      <Trash2 size={15} /> Remove Crest
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '0.4rem' }}>
                    Or select crest preset:
                  </label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {LOGO_PRESETS.map((presetUrl, idx) => (
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
              <School size={22} color="var(--primary-600)" /> Edit Campus Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Institution Name *</label>
                <input type="text" required className="form-control" name="institution_name" value={formData.institution_name} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>AISHE / Institution Code</label>
                <input type="text" className="form-control" name="institution_code" value={formData.institution_code} onChange={handleChange} placeholder="e.g. C-13492" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Campus Officer / Admin Name *</label>
                <input type="text" required className="form-control" name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Official Phone Number</label>
                <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Institution Type</label>
                <select className="form-control" name="institution_type" value={formData.institution_type} onChange={handleChange}>
                  <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                  <option value="Deemed University">Deemed University</option>
                  <option value="State University">State University</option>
                  <option value="Affiliated Engineering College">Affiliated Engineering College</option>
                  <option value="IIT / NIT / IIIT">IIT / NIT / IIIT</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Accreditation Grade</label>
                <input type="text" className="form-control" name="accreditation" value={formData.accreditation} onChange={handleChange} placeholder="e.g. NAAC A++ / NIRF Top 50" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Established Year</label>
                <input type="number" className="form-control" name="established_year" value={formData.established_year} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>City</label>
                <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>State</label>
                <input type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Official Website</label>
                <input type="url" className="form-control" name="website" value={formData.website} onChange={handleChange} placeholder="https://college.edu" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>About the Institution</label>
                <textarea className="form-control" rows={3} name="description" value={formData.description} onChange={handleChange} />
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
            <ShieldCheck size={24} color="var(--primary-600)" /> Security & Campus Session Audit
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
