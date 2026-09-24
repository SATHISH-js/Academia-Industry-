import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  Search,
  Activity,
  Award,
  Sparkles,
  Calendar,
  Layers,
  Clock,
  Briefcase,
  X,
  FileText,
  TrendingUp,
  Brain,
  Filter,
  RotateCcw,
  Plus,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  BookOpen,
  AlertCircle
} from 'lucide-react';

export const StudentDirectoryPage = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // Monitoring Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMonitoringData, setStudentMonitoringData] = useState(null);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [modalTab, setModalTab] = useState('ACTIVITIES'); // 'ACTIVITIES' | 'SKILLS' | 'INTERVIEWS' | 'APPLICATIONS'

  // Onboard Student Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    degree: 'B.Tech Computer Science & Engineering',
    graduation_year: 2026,
    cgpa: '',
    enrollment_number: '',
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
    fetchStudents();
  }, [department, minCgpa, graduationYear]);

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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (department) params.department = department;
      if (minCgpa) params.min_cgpa = minCgpa;
      if (graduationYear) params.graduation_year = graduationYear;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/institution/students', { params });
      if (res.data.success) {
        setStudents(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.students || []));
      }
    } catch (err) {
      console.error('Failed to load student directory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('');
    setMinCgpa('');
    setGraduationYear('');
    fetchStudents();
  };

  const handleOpenMonitoringModal = async (student) => {
    setSelectedStudent(student);
    setModalTab('ACTIVITIES');
    try {
      setMonitoringLoading(true);
      const res = await api.get(`/institution/students/${student.id}/activity`);
      if (res.data.success) {
        setStudentMonitoringData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student monitoring data', err);
    } finally {
      setMonitoringLoading(false);
    }
  };

  // Submit Student Onboarding
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.email || !onboardForm.password || !onboardForm.department) {
      setNotice({ type: 'error', message: 'Please fill in all required fields (Name, Email, Password, Department).' });
      return;
    }

    try {
      setOnboardSubmitting(true);
      const res = await api.post('/institution/students', onboardForm);
      if (res.data.success) {
        setNotice({
          type: 'success',
          message: `Student account created for ${onboardForm.name}! Credentials: Email: "${onboardForm.email}". The student can now log in directly at the login portal.`
        });
        setShowOnboardModal(false);
        setOnboardForm({
          name: '',
          email: '',
          password: '',
          department: departments[0]?.name || '',
          degree: 'B.Tech Computer Science & Engineering',
          graduation_year: 2026,
          cgpa: '',
          enrollment_number: '',
          phone: ''
        });
        fetchStudents();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to onboard student. Please ensure email is unique.';
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ROADMAP': return <Layers size={16} color="var(--primary-600)" />;
      case 'MOCK_INTERVIEW': return <Brain size={16} color="var(--warning-600)" />;
      case 'ASSESSMENT': return <Award size={16} color="var(--accent-600)" />;
      case 'APPLICATION': return <Briefcase size={16} color="var(--success-600)" />;
      case 'RESUME': return <FileText size={16} color="var(--primary-700)" />;
      default: return <Activity size={16} color="var(--slate-500)" />;
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
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              🎓 Institutional Student Governance
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Enrolled College Student Directory & Activity Monitoring
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Directly onboard students with login credentials, manage academic departments, inspect verified skill scores, and monitor student in-app timelines.
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
                {students.length}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-200)', marginTop: '0.25rem' }}>
                Affiliated Students
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
                <Plus size={18} /> Onboard New Student
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

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
            <Filter size={18} color="var(--primary-600)" /> Filter Student Cohorts
          </div>
          <button
            onClick={handleResetFilters}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            <RotateCcw size={14} /> Reset Filters
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Search Name or Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Aarav, Priya..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Department</label>
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

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Min CGPA</label>
            <select
              className="form-control"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
            >
              <option value="">Any CGPA</option>
              <option value="7.5">7.5+ CGPA</option>
              <option value="8.0">8.0+ CGPA</option>
              <option value="8.5">8.5+ CGPA</option>
              <option value="9.0">9.0+ CGPA</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Graduation Batch</label>
            <select
              className="form-control"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
            >
              <option value="">All Batches</option>
              <option value="2025">Class of 2025</option>
              <option value="2026">Class of 2026</option>
              <option value="2027">Class of 2027</option>
              <option value="2028">Class of 2028</option>
            </select>
          </div>
        </form>
      </div>

      {/* Student List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
            Loading student roster...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No enrolled students match current filter criteria. Click "+ Onboard New Student" above to add college students.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name & Credentials</th>
                  <th>Department & Degree</th>
                  <th>Batch / CGPA</th>
                  <th>Overall Skill Score</th>
                  <th>Placement Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        <Mail size={12} style={{ display: 'inline', marginRight: 3 }} />
                        {s.email}
                      </div>
                      {s.enrollment_number && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                          Roll: {s.enrollment_number}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.degree}</div>
                    </td>
                    <td>
                      <div><strong>CGPA: {s.cgpa || 'N/A'}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Batch {s.graduation_year}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 8, backgroundColor: 'var(--slate-200)', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{ width: `${s.overall_skill_score || 0}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.overall_skill_score || 0}%</span>
                      </div>
                    </td>
                    <td>
                      {s.is_placed ? (
                        <div>
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            Placed • {s.placed_company || 'Industry Partner'}
                          </span>
                          {s.placed_package && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-600)', marginTop: 2 }}>
                              {s.placed_package} LPA ({s.placement_field || 'Tech'})
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          In-Training
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenMonitoringModal(s)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        <Activity size={14} /> Monitor Activity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard New Student Modal */}
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
                <Users size={22} color="var(--primary-400)" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Onboard New Student
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-300)' }}>
                    Add student credentials so they can immediately sign in to the portal
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
                  <strong>Immediate Login Authorization:</strong> The student created here will be automatically registered under your institution. They can sign in at <code>/login</code> with the email and password specified below.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Full Student Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Kavya Patel"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Student Email Address (Login ID) <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="e.g. kavya.patel@apex-tech.edu"
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Degree Program</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. B.Tech Computer Science"
                    value={onboardForm.degree}
                    onChange={(e) => setOnboardForm({ ...onboardForm, degree: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Graduation Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    className="form-control"
                    value={onboardForm.graduation_year}
                    onChange={(e) => setOnboardForm({ ...onboardForm, graduation_year: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Initial CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.65"
                    className="form-control"
                    value={onboardForm.cgpa}
                    onChange={(e) => setOnboardForm({ ...onboardForm, cgpa: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Enrollment / Roll Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 2022CS0104"
                    value={onboardForm.enrollment_number}
                    onChange={(e) => setOnboardForm({ ...onboardForm, enrollment_number: e.target.value })}
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
                      Creating Student Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Complete Student Onboarding
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

      {/* Student Activity Monitoring Modal */}
      {selectedStudent && (
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
          onClick={() => setSelectedStudent(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
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
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Student Activity & Performance Monitor
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-300)' }}>
                  {selectedStudent.name} • {selectedStudent.department} • CGPA: {selectedStudent.cgpa}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--slate-100)',
              borderBottom: '1px solid var(--border-color)',
              padding: '0.5rem 1.5rem',
              gap: '0.5rem',
              overflowX: 'auto',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'ACTIVITIES', label: 'Activity Log', icon: Activity },
                { id: 'SKILLS', label: 'Verified Skills', icon: Award },
                { id: 'INTERVIEWS', label: 'Mock Interviews', icon: Brain },
                { id: 'APPLICATIONS', label: 'Applications', icon: Briefcase }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? 'var(--primary-700)' : 'var(--slate-600)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {monitoringLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                  <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
                  Retrieving student timeline...
                </div>
              ) : studentMonitoringData && (
                <>
                  {/* TAB 1: ACTIVITY LOG */}
                  {modalTab === 'ACTIVITIES' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        In-App Platform Activity History ({studentMonitoringData.activities?.length || 0})
                      </h4>
                      {studentMonitoringData.activities?.length === 0 ? (
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
                          No logged in-app actions recorded yet.
                        </div>
                      ) : (
                        studentMonitoringData.activities.map(act => (
                          <div
                            key={act.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.85rem',
                              padding: '0.85rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--slate-50)',
                              border: '1px solid var(--border-light)'
                            }}
                          >
                            <div style={{ padding: '0.35rem', borderRadius: '6px', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
                              {getActivityIcon(act.action_type)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                                  {act.title}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                  {new Date(act.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.2rem', margin: 0 }}>
                                {act.description}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: VERIFIED SKILLS */}
                  {modalTab === 'SKILLS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        Assessed & Verified Skill Proficiencies ({studentMonitoringData.verifiedSkills?.length || 0})
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                        {studentMonitoringData.verifiedSkills?.map(s => (
                          <div
                            key={s.skill_id}
                            style={{
                              padding: '0.85rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--slate-50)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                              <span>{s.skill_name}</span>
                              <span style={{ color: 'var(--primary-600)' }}>{s.score}%</span>
                            </div>
                            <div style={{ width: '100%', height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${s.score}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                              Level: <strong>{s.level}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MOCK INTERVIEWS */}
                  {modalTab === 'INTERVIEWS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        AI Mock Interview Evaluations ({studentMonitoringData.mockInterviews?.length || 0})
                      </h4>
                      {studentMonitoringData.mockInterviews?.length === 0 ? (
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
                          No mock interviews taken yet.
                        </div>
                      ) : (
                        studentMonitoringData.mockInterviews.map(mi => (
                          <div
                            key={mi.id}
                            style={{
                              padding: '1rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--slate-50)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.75rem'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
                                {mi.role} ({mi.company})
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                                Words Analyzed: {mi.word_count} • Filler Words: {mi.filler_words_count} • Date: {new Date(mi.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', textAlign: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--primary-600)', fontSize: '1.1rem' }}>
                                  {mi.overall_score}%
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>Overall</div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--accent-600)', fontSize: '1.1rem' }}>
                                  {mi.technical_score}%
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>Technical</div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--success-600)', fontSize: '1.1rem' }}>
                                  {mi.confidence_score}%
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>Confidence</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 4: APPLICATIONS */}
                  {modalTab === 'APPLICATIONS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        Internship & Job Applications ({studentMonitoringData.applications?.length || 0})
                      </h4>
                      {studentMonitoringData.applications?.length === 0 ? (
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
                          No applications submitted yet.
                        </div>
                      ) : (
                        studentMonitoringData.applications.map(app => (
                          <div
                            key={app.id}
                            style={{
                              padding: '1rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--slate-50)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.75rem'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
                                {app.opportunity_title}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                                Type: {app.opportunity_type} • Applied on: {new Date(app.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`badge ${app.status === 'SELECTED' ? 'badge-success' : app.status === 'SHORTLISTED' ? 'badge-primary' : 'badge-warning'}`}>
                              {app.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
