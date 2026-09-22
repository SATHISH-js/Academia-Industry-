import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    phone: '',
    address: '',
    linkedin_url: '',
    github_url: '',
    // 10th
    tenth_board: '',
    tenth_school: '',
    tenth_year: '',
    tenth_percentage: '',
    // 12th
    twelfth_board: '',
    twelfth_college: '',
    twelfth_year: '',
    twelfth_percentage: '',
    // UG
    degree: '',
    department: '',
    enrollment_number: '',
    ug_university: '',
    ug_college: '',
    institution_id: '',
    cgpa: '',
    graduation_year: ''
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
          headline: p.headline || '',
          bio: p.bio || '',
          phone: p.phone || '',
          address: p.address || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          tenth_board: p.tenth_board || '',
          tenth_school: p.tenth_school || '',
          tenth_year: p.tenth_year || '',
          tenth_percentage: p.tenth_percentage || '',
          twelfth_board: p.twelfth_board || '',
          twelfth_college: p.twelfth_college || '',
          twelfth_year: p.twelfth_year || '',
          twelfth_percentage: p.twelfth_percentage || '',
          degree: p.degree || '',
          department: p.department || '',
          enrollment_number: p.enrollment_number || '',
          ug_university: p.ug_university || '',
          ug_college: p.ug_college || '',
          institution_id: p.institution_id ? String(p.institution_id) : '',
          cgpa: p.cgpa || '',
          graduation_year: p.graduation_year || ''
        });
      }

      if (historyRes.data.success) {
        setLoginHistory(historyRes.data.data);
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.put('/students/profile', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Academic qualifications & profile updated successfully!' });
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please check your inputs.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading verified student profile & security audit...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Title & Status Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.5rem' }}>
              👤 Academic Profile & Security Dashboard
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              {profile?.name || user?.name}
            </h1>
            <p style={{ color: 'var(--primary-200)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Manage your verified education records, personal contact details, and audit your authenticated login history.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <ShieldCheck size={28} color="#34d399" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>Account Security</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-300)' }}>JWT Session Active • 100% Protected</div>
            </div>
          </div>
        </div>
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

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Section 1: Educational Qualifications (The Core User Request) */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GraduationCap size={24} color="var(--primary-600)" /> Educational & Academic Qualifications
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Undergraduate Degree */}
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                1. Undergraduate Degree (Current / Highest)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                    <Building size={16} color="var(--primary-600)" />
                    <span>Affiliated College / Educational Institution (Links account to your Institution Portal)</span>
                  </label>
                  <select
                    className="form-control"
                    name="institution_id"
                    value={formData.institution_id}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const matched = institutions.find(inst => String(inst.id) === String(selectedId));
                      setFormData({
                        ...formData,
                        institution_id: selectedId,
                        ug_college: matched ? matched.institution_name : formData.ug_college
                      });
                    }}
                    style={{ borderColor: formData.institution_id ? 'var(--primary-500)' : 'var(--border-color)', fontWeight: 600, backgroundColor: formData.institution_id ? 'rgba(37, 99, 235, 0.04)' : '#ffffff' }}
                  >
                    <option value="">-- Select Your College / Institute --</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.institution_name} ({inst.city}, {inst.state || 'India'}) - {inst.institution_type}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                    Selecting your registered institution allows your college administrators, department deans, and placement cells to monitor your roadmap completion, mock interview reports, and application activity.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Degree (e.g. B.Tech, B.E., B.Sc)</label>
                  <input type="text" className="form-control" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. B.Tech" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <input type="text" className="form-control" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" />
                </div>
                <div className="form-group">
                  <label className="form-label">Student Register / Enrollment Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="enrollment_number"
                    value={formData.enrollment_number}
                    onChange={handleChange}
                    placeholder="e.g. 2024-CSE-042"
                    style={{ fontWeight: 600, fontFamily: 'monospace' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                    Used by your institution for identification, academic grading, and placement drives.
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">College / Institute Name (Display)</label>
                  <input type="text" className="form-control" name="ug_college" value={formData.ug_college} onChange={handleChange} placeholder="e.g. National Institute of Technology" />
                </div>
                <div className="form-group">
                  <label className="form-label">Affiliated University</label>
                  <input type="text" className="form-control" name="ug_university" value={formData.ug_university} onChange={handleChange} placeholder="e.g. State Technical University" />
                </div>
                <div className="form-group">
                  <label className="form-label">Current CGPA (Scale of 10.0)</label>
                  <input type="number" step="0.01" className="form-control" name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.85" />
                </div>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input type="number" className="form-control" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="e.g. 2026" />
                </div>
              </div>
            </div>

            {/* 12th Standard / Pre-University / Diploma */}
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                2. Senior Secondary / 12th Standard / Diploma
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Examination Board (e.g. CBSE, ISC, State Board)</label>
                  <input type="text" className="form-control" name="twelfth_board" value={formData.twelfth_board} onChange={handleChange} placeholder="e.g. CBSE" />
                </div>
                <div className="form-group">
                  <label className="form-label">Junior College / School Name</label>
                  <input type="text" className="form-control" name="twelfth_college" value={formData.twelfth_college} onChange={handleChange} placeholder="e.g. Delhi Public School" />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Year</label>
                  <input type="number" className="form-control" name="twelfth_year" value={formData.twelfth_year} onChange={handleChange} placeholder="e.g. 2022" />
                </div>
                <div className="form-group">
                  <label className="form-label">Aggregate Percentage (%)</label>
                  <input type="number" step="0.01" className="form-control" name="twelfth_percentage" value={formData.twelfth_percentage} onChange={handleChange} placeholder="e.g. 95.2" />
                </div>
              </div>
            </div>

            {/* 10th Standard / Secondary School */}
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                3. Secondary School Examination / 10th Standard
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Examination Board (e.g. CBSE, ICSE, State Board)</label>
                  <input type="text" className="form-control" name="tenth_board" value={formData.tenth_board} onChange={handleChange} placeholder="e.g. CBSE" />
                </div>
                <div className="form-group">
                  <label className="form-label">School Name</label>
                  <input type="text" className="form-control" name="tenth_school" value={formData.tenth_school} onChange={handleChange} placeholder="e.g. St. Xavier's High School" />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Year</label>
                  <input type="number" className="form-control" name="tenth_year" value={formData.tenth_year} onChange={handleChange} placeholder="e.g. 2020" />
                </div>
                <div className="form-group">
                  <label className="form-label">Aggregate Percentage (%)</label>
                  <input type="number" step="0.01" className="form-control" name="tenth_percentage" value={formData.tenth_percentage} onChange={handleChange} placeholder="e.g. 93.4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Profile & Contact Info */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={24} color="var(--primary-600)" /> Personal Information & Social Links
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Professional Headline</label>
              <input type="text" className="form-control" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Full-Stack Developer & Aspiring Cloud Architect" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Bio / Profile Summary</label>
              <textarea className="form-control" rows={3} name="bio" value={formData.bio} onChange={handleChange} placeholder="Brief description of your passion, technical domain, and career objectives..." />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} placeholder="City, State, Country" />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input type="url" className="form-control" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub Profile URL</label>
              <input type="url" className="form-control" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/yourhandle" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
            >
              {saving ? (
                <>
                  <Sparkles size={18} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Educational Qualifications & Profile
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Security & Login History Audit (Core User Request) */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={24} color="var(--primary-600)" /> Security & Authenticated Login History
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Every login attempt to your portal is cryptographically audited with IP address, device footprint, and timestamp.
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
    </div>
  );
};
