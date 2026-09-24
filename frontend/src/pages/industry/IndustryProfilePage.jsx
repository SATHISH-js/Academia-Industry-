import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Building2,
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
  Briefcase,
  Upload,
  Trash2
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'
];

export const IndustryProfilePage = () => {
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
    company_name: '',
    industry_domain: 'Information Technology',
    company_size: '50-200',
    website: '',
    city: '',
    state: '',
    country: 'India',
    address: '',
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
          company_name: p.company_name || u.name || '',
          industry_domain: p.industry_domain || 'Information Technology',
          company_size: p.company_size || '50-200',
          website: p.website || '',
          city: p.city || '',
          state: p.state || '',
          country: p.country || 'India',
          address: p.address || '',
          description: p.description || ''
        });
      }

      if (historyRes.data.success) {
        setLoginHistory(historyRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load industry profile', err);
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
      setMessage({ type: 'error', text: 'Please select an image file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, avatar_url: event.target.result }));
      setMessage({ type: 'success', text: 'Logo/Photo selected! Click Save Changes to apply.' });
    };
    reader.readAsDataURL(file);
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
        setMessage({ type: 'success', text: 'Enterprise profile details updated successfully!' });
        setTimeout(() => setActiveTab('OVERVIEW'), 1200);
      }
    } catch (err) {
      console.error('Failed to update industry profile', err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading industry partner profile...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
                  <img src={formData.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  formData.company_name ? formData.company_name.charAt(0).toUpperCase() : 'C'
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
                  cursor: 'pointer'
                }}
                title="Change Logo / Picture"
              >
                <Camera size={15} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span className="badge badge-primary">🏢 Industry Partner</span>
                <span className="badge badge-neutral">{formData.industry_domain}</span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>{formData.company_name || formData.name}</h1>
              <p style={{ color: 'var(--slate-300)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                {formData.city ? `${formData.city}, ${formData.state || formData.country}` : 'India'} • Authorized Representative: {formData.name}
              </p>
            </div>
          </div>

          <button onClick={() => setActiveTab('EDIT')} className="btn btn-primary" style={{ backgroundColor: '#ffffff', color: 'var(--slate-900)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Edit3 size={15} /> Edit Enterprise Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
            fontWeight: activeTab === 'OVERVIEW' ? 700 : 500, fontSize: '0.875rem', backgroundColor: activeTab === 'OVERVIEW' ? 'var(--primary-600)' : 'transparent', color: activeTab === 'OVERVIEW' ? '#ffffff' : 'var(--slate-600)'
          }}
        >
          <Building2 size={16} /> Enterprise Overview
        </button>

        <button
          onClick={() => setActiveTab('EDIT')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
            fontWeight: activeTab === 'EDIT' ? 700 : 500, fontSize: '0.875rem', backgroundColor: activeTab === 'EDIT' ? 'var(--primary-600)' : 'transparent', color: activeTab === 'EDIT' ? '#ffffff' : 'var(--slate-600)'
          }}
        >
          <Camera size={16} /> Edit Details & Logo
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
            fontWeight: activeTab === 'SECURITY' ? 700 : 500, fontSize: '0.875rem', backgroundColor: activeTab === 'SECURITY' ? 'var(--primary-600)' : 'transparent', color: activeTab === 'SECURITY' ? '#ffffff' : 'var(--slate-600)'
          }}
        >
          <ShieldCheck size={16} /> Security Audit
        </button>
      </div>

      {message && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: message.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)', color: message.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)', border: `1px solid ${message.type === 'success' ? 'var(--success-500)' : 'var(--danger-500)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={22} color="var(--primary-600)" /> Company & Enterprise Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Company Name</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.2rem' }}>{formData.company_name}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Industry Sector</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.industry_domain}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Authorized Representative</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.name}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Official Email</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.email}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Contact Phone</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>{formData.phone || 'Not specified'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Website</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-600)', marginTop: '0.2rem' }}>
                {formData.website ? <a href={formData.website} target="_blank" rel="noreferrer">{formData.website}</a> : 'Not specified'}
              </div>
            </div>
          </div>

          {formData.description && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>About Enterprise</div>
              <p style={{ color: 'var(--slate-700)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>{formData.description}</p>
            </div>
          )}
        </div>
      )}

      {/* EDIT */}
      {activeTab === 'EDIT' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>Company Logo / Avatar</h2>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <Upload size={15} /> Upload Company Logo
              </button>
              {formData.avatar_url && (
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))} className="btn btn-secondary" style={{ fontSize: '0.85rem', color: 'var(--danger-600)' }}>
                  <Trash2 size={15} /> Remove
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem' }}>Edit Enterprise Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Company Name *</label>
                <input type="text" required className="form-control" name="company_name" value={formData.company_name} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Industry Domain</label>
                <input type="text" className="form-control" name="industry_domain" value={formData.industry_domain} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Representative Name *</label>
                <input type="text" required className="form-control" name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Contact Phone</label>
                <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Website URL</label>
                <input type="url" className="form-control" name="website" value={formData.website} onChange={handleChange} placeholder="https://company.com" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>City</label>
                <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>About the Company</label>
                <textarea className="form-control" rows={3} name="description" value={formData.description} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', gap: '0.75rem' }}>
              <button type="button" onClick={() => setActiveTab('OVERVIEW')} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 700 }}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SECURITY */}
      {activeTab === 'SECURITY' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>Security & Authenticated Sessions</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr><th>Timestamp</th><th>IP Address</th><th>Browser Agent</th><th>Status</th></tr>
              </thead>
              <tbody>
                {loginHistory.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td><code>{log.ip_address || '127.0.0.1'}</code></td>
                    <td>{log.user_agent}</td>
                    <td><span className="badge badge-success">Authenticated</span></td>
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
