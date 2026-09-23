import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Award,
  RotateCcw,
  Plus,
  Building2,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Briefcase
} from 'lucide-react';

export const AcademicianDirectoryPage = () => {
  const [academicians, setAcademicians] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  // Onboard Academician Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: 'Assistant Professor',
    employee_id: '',
    experience_years: 5,
    specialization: '',
    qualification: 'Ph.D. in Engineering',
    phone: ''
  });

  // Department Creation Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptSubmitting, setDeptSubmitting] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: ''
  });

  // Notifications
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAcademicians();
  }, [department]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/institution/departments');
      if (res.data.success && Array.isArray(res.data.data)) {
        setDepartments(res.data.data);
        if (res.data.data.length > 0 && !onboardForm.department) {
          setOnboardForm(prev => ({ ...prev, department: res.data.data[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to load institution departments', err);
    }
  };

  const fetchAcademicians = async () => {
    try {
      setLoading(true);
      const params = {};
      if (department) params.department = department;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/institution/academicians', { params });
      if (res.data.success) {
        setAcademicians(res.data.data.academicians || []);
        setTotalCount(res.data.data.totalAcademicians || 0);
      }
    } catch (err) {
      console.error('Failed to load academicians directory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAcademicians();
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('');
    fetchAcademicians();
  };

  // Submit Academician Onboarding
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.email || !onboardForm.password || !onboardForm.department) {
      setNotice({ type: 'error', message: 'Please fill in all required fields (Name, Email, Password, Department).' });
      return;
    }

    try {
      setOnboardSubmitting(true);
      const res = await api.post('/institution/academicians', onboardForm);
      if (res.data.success) {
        setNotice({
          type: 'success',
          message: `Academician account created for ${onboardForm.name}! Credentials: Email: "${onboardForm.email}". The faculty member can now log in directly at the login portal.`
        });
        setShowOnboardModal(false);
        setOnboardForm({
          name: '',
          email: '',
          password: '',
          department: departments[0]?.name || '',
          designation: 'Assistant Professor',
          employee_id: '',
          experience_years: 5,
          specialization: '',
          qualification: 'Ph.D. in Engineering',
          phone: ''
        });
        fetchAcademicians();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to onboard academician. Please ensure email is unique.';
      setNotice({ type: 'error', message: errMsg });
    } finally {
      setOnboardSubmitting(false);
    }
  };

  // Submit Department Creation
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      setNotice({ type: 'error', message: 'Department name is required.' });
      return;
    }

    try {
      setDeptSubmitting(true);
      const res = await api.post('/institution/departments', deptForm);
      if (res.data.success) {
        const createdName = deptForm.name.trim();
        setNotice({
          type: 'success',
          message: `Department "${createdName}" created successfully!`
        });
        setShowDeptModal(false);
        setDeptForm({ name: '', code: '', description: '' });
        await fetchDepartments();
        setOnboardForm(prev => ({ ...prev, department: createdName }));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create department. Name may already exist.';
      setNotice({ type: 'error', message: errMsg });
    } finally {
      setDeptSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Notice Banner */}
      {notice && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: notice.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${notice.type === 'success' ? '#86efac' : '#fecaca'}`,
          color: notice.type === 'success' ? '#166534' : '#991b1b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {notice.type === 'success' ? <CheckCircle2 size={20} color="#16a34a" /> : <AlertCircle size={20} color="#dc2626" />}
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Banner & Header Actions */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              📚 Institutional Faculty Roster
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Academician & Faculty Directory
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Onboard faculty members with login credentials, organize departments, track academic research, and foster industry research partnerships.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {totalCount}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-200)', marginTop: '0.25rem' }}>
                Total Faculty Members
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => setShowOnboardModal(true)}
                className="btn btn-primary"
                style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--primary-900)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
                }}
              >
                <Plus size={18} /> Onboard New Faculty
              </button>
              <button
                onClick={() => setShowDeptModal(true)}
                className="btn btn-secondary"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Building2 size={15} /> + Add Department
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search faculty by name, research area, or designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ width: '240px' }}>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.length > 0 ? (
                  departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science / AI</option>
                    <option value="Electronics">Electronics & Communication</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Search size={15} /> Search
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
          Loading faculty directory...
        </div>
      ) : academicians.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          No faculty members found matching search criteria. Click "+ Onboard New Faculty" to register professors and researchers.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {academicians.map(acad => (
            <div key={acad.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '0.4rem', fontSize: '0.7rem' }}>
                      {acad.department}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {acad.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-700)', marginTop: '0.15rem' }}>
                      {acad.designation || 'Faculty Member'}
                      {acad.qualification ? ` • ${acad.qualification}` : ''}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--slate-100)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--slate-800)' }}>
                      {acad.experience_years || 5}+
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                      Yrs Exp
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  {acad.bio || 'Experienced academician focusing on applied research, student mentoring, and industry curriculum alignment.'}
                </p>

                {acad.research_areas && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                      Research & Specialization:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {acad.research_areas.split(', ').map((ra, idx) => (
                        <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.72rem', textTransform: 'none' }}>
                          {ra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: 'var(--slate-600)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="var(--primary-600)" /> {acad.email}
                </div>
                {acad.google_scholar_url && (
                  <a
                    href={acad.google_scholar_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                  >
                    Publications <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Faculty Modal */}
      {showOnboardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowOnboardModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              boxShadow: 'var(--shadow-xl)',
              overflowY: 'auto',
              zIndex: 1050,
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--slate-900)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GraduationCap size={22} color="var(--primary-400)" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Onboard New Faculty / Academician
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-300)' }}>
                    Add faculty credentials so they can immediately sign in to the portal
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleOnboardSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '0.6rem',
                fontSize: '0.85rem',
                color: 'var(--primary-900)'
              }}>
                <CheckCircle2 size={18} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Immediate Login Authorization:</strong> The academician created here will be automatically registered under your institution. They can sign in at <code>/login</code> with the email and password specified below.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Full Faculty Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Suresh Nair"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Faculty Email Address (Login ID) <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="e.g. suresh.nair@apex-tech.edu"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Initial Login Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={onboardForm.password}
                    onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>
                      Department <span style={{ color: 'red' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDeptModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      + Add New Dept
                    </button>
                  </div>
                  <select
                    required
                    className="form-control"
                    value={onboardForm.department}
                    onChange={(e) => setOnboardForm({ ...onboardForm, department: e.target.value })}
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    {departments.length === 0 && (
                      <>
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Data Science & AI">Data Science & AI</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Designation</label>
                  <select
                    className="form-control"
                    value={onboardForm.designation}
                    onChange={(e) => setOnboardForm({ ...onboardForm, designation: e.target.value })}
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Professor">Professor</option>
                    <option value="Dean / Research Director">Dean / Research Director</option>
                    <option value="Visiting Faculty">Visiting Faculty</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Faculty / Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. FAC-2024-001"
                    value={onboardForm.employee_id}
                    onChange={(e) => setOnboardForm({ ...onboardForm, employee_id: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="form-control"
                    value={onboardForm.experience_years}
                    onChange={(e) => setOnboardForm({ ...onboardForm, experience_years: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Highest Qualification</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ph.D. in Computer Science"
                    value={onboardForm.qualification}
                    onChange={(e) => setOnboardForm({ ...onboardForm, qualification: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +91 98765 43210"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Specialization & Research Areas</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Deep Learning, Distributed Systems, Cloud Architecture"
                  value={onboardForm.specialization}
                  onChange={(e) => setOnboardForm({ ...onboardForm, specialization: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="btn btn-secondary"
                  disabled={onboardSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={onboardSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {onboardSubmitting ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      Creating Faculty Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Complete Faculty Onboarding
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowDeptModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '520px',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              zIndex: 1150
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--slate-900)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="var(--primary-400)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Create Academic Department
                </h3>
              </div>
              <button
                onClick={() => setShowDeptModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Department Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Artificial Intelligence & Robotics"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Department Code (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AIR or AI-ROB"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Brief overview of department focus and industry curriculum..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="btn btn-secondary"
                  disabled={deptSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={deptSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {deptSubmitting ? <Sparkles size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
