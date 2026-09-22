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
  Mail,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  Phone,
  BookmarkCheck
} from 'lucide-react';
import { InstitutionContactModal } from '../../components/institution/InstitutionContactModal';

export const StudentDirectoryPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // View Mode: 'TABLE' | 'DEPARTMENT_GROUPED'
  const [viewMode, setViewMode] = useState('TABLE');

  // Contact Modal State
  const [contactStudentTarget, setContactStudentTarget] = useState(null);

  // Monitoring Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMonitoringData, setStudentMonitoringData] = useState(null);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [modalTab, setModalTab] = useState('ACTIVITIES'); // 'ACTIVITIES' | 'SKILLS' | 'INTERVIEWS' | 'APPLICATIONS'

  const departmentsList = [
    { label: 'All Departments', value: '', match: '' },
    { label: 'Computer Science', value: 'Computer Science', match: 'Computer Science' },
    { label: 'Information Tech', value: 'Information Technology', match: 'Information Technology' },
    { label: 'Data Science / AI', value: 'Data Science', match: 'Data Science' },
    { label: 'Electronics & Comm', value: 'Electronics', match: 'Electronics' }
  ];

  useEffect(() => {
    fetchStudents();
  }, [department, minCgpa, graduationYear]);

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

  // Group students by department for Department-Wise Cohort View
  const groupedStudents = students.reduce((acc, student) => {
    const dept = student.department || 'General Engineering';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(student);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              🎓 Institutional Student Governance & Roster
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Enrolled College Student Directory & Cohort Access
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '680px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Inspect all students affiliated with your institution. Look up candidates instantly by Register Number, monitor department-wise benchmarks, review mock interview transcripts, and dispatch official communications.
            </p>
          </div>

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
        </div>
      </div>

      {/* Department Tabs Bar (Requirement 3: department-wise every student is visible) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.4rem',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {departmentsList.map(dept => {
          const isSelected = dept.value === department;
          const count = dept.value === ''
            ? students.length
            : students.filter(s => s.department?.toLowerCase().includes(dept.match.toLowerCase())).length;

          return (
            <button
              key={dept.label}
              onClick={() => setDepartment(dept.value)}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.9rem',
                whiteSpace: 'nowrap',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <span>{dept.label}</span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--slate-200)',
                color: isSelected ? '#ffffff' : 'var(--slate-700)'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
            <Filter size={18} color="var(--primary-600)" />
            <span>Search & Filter Enrolled Students</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                style={{
                  border: 'none',
                  background: viewMode === 'TABLE' ? '#ffffff' : 'transparent',
                  color: viewMode === 'TABLE' ? 'var(--primary-700)' : 'var(--slate-600)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'TABLE' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <List size={14} /> Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('DEPARTMENT_GROUPED')}
                style={{
                  border: 'none',
                  background: viewMode === 'DEPARTMENT_GROUPED' ? '#ffffff' : 'transparent',
                  color: viewMode === 'DEPARTMENT_GROUPED' ? 'var(--primary-700)' : 'var(--slate-600)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'DEPARTMENT_GROUPED' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Grid size={14} /> Department Wise View
              </button>
            </div>

            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Search Register No, Name or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 2022-CSE-045, Aarav..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', right: 12, top: 12, color: 'var(--slate-400)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Department</label>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science / AI</option>
              <option value="Electronics">Electronics & Communication</option>
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
            </select>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
          Loading enrolled student roster...
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          No enrolled students match current filter criteria.
        </div>
      ) : viewMode === 'DEPARTMENT_GROUPED' ? (
        /* Department Grouped View (Requirement 3: deptartment vise every student is visible) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(groupedStudents).map(([deptName, deptStudents]) => (
            <div key={deptName} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: 'var(--slate-50)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <GraduationCap size={20} color="var(--primary-600)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {deptName}
                  </h3>
                </div>
                <span className="badge badge-primary" style={{ fontWeight: 800 }}>
                  {deptStudents.length} Students Enrolled
                </span>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student & Register No</th>
                      <th>Batch / CGPA</th>
                      <th>Overall Skill Score</th>
                      <th>Verified Skills</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptStudents.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{s.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.1rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: 'var(--primary-50)',
                                color: 'var(--primary-700)',
                                border: '1px solid var(--primary-200)'
                              }}
                            >
                              {s.enrollment_number || 'REG: PENDING'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.email}</span>
                          </div>
                        </td>
                        <td>
                          <div><strong>CGPA: {s.cgpa || 'N/A'}</strong></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Batch {s.graduation_year}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: 7, backgroundColor: 'var(--slate-200)', borderRadius: 3.5, overflow: 'hidden', minWidth: 60 }}>
                              <div style={{ width: `${s.overall_skill_score || 0}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{s.overall_skill_score || 0}%</span>
                          </div>
                        </td>
                        <td style={{ maxWidth: '250px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {s.verifiedSkills?.slice(0, 3).map((sk, i) => (
                              <span key={i} className="badge badge-neutral" style={{ fontSize: '0.68rem', textTransform: 'none' }}>
                                {sk.skill_name} ({sk.score}%)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleOpenMonitoringModal(s)}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                            >
                              <Activity size={13} color="var(--primary-600)" /> Monitor
                            </button>
                            <button
                              onClick={() => setContactStudentTarget(s)}
                              className="btn btn-primary"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                            >
                              <Mail size={13} /> Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Table View */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student & Register No</th>
                  <th>Department & Degree</th>
                  <th>Batch / CGPA</th>
                  <th>Overall Skill Score</th>
                  <th>Verified Skills</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{s.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-700)',
                            border: '1px solid var(--primary-200)'
                          }}
                        >
                          {s.enrollment_number || 'REG: PENDING'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.email}</span>
                      </div>
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
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {s.verifiedSkills?.slice(0, 3).map((sk, i) => (
                          <span key={i} className="badge badge-neutral" style={{ fontSize: '0.68rem', textTransform: 'none' }}>
                            {sk.skill_name} ({sk.score}%)
                          </span>
                        ))}
                        {s.verifiedSkills?.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', alignSelf: 'center' }}>
                            +{s.verifiedSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenMonitoringModal(s)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                        >
                          <Activity size={13} color="var(--primary-600)" /> Monitor
                        </button>
                        <button
                          onClick={() => setContactStudentTarget(s)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                        >
                          <Mail size={13} /> Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact Student Modal */}
      {contactStudentTarget && (
        <InstitutionContactModal
          recipient={contactStudentTarget}
          type="STUDENT"
          onClose={() => setContactStudentTarget(null)}
          onMessageSent={() => fetchStudents()}
        />
      )}

      {/* Student Activity Timeline Monitoring Modal */}
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
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Student Activity & Performance Monitor
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-300)', marginTop: '0.15rem' }}>
                  {selectedStudent.name} • Reg No: <strong>{selectedStudent.enrollment_number || 'N/A'}</strong> • {selectedStudent.department} • CGPA: {selectedStudent.cgpa}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setContactStudentTarget(selectedStudent)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
                >
                  <Mail size={13} /> Contact Student
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--slate-100)',
              borderBottom: '1px solid var(--border-color)',
              padding: '0.5rem 1.5rem',
              gap: '0.5rem',
              overflowX: 'auto'
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
                      padding: '0.4rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? 'var(--primary-700)' : 'var(--slate-600)',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {monitoringLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                  <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
                  Loading student timeline...
                </div>
              ) : (
                <>
                  {/* TAB 1: ACTIVITIES */}
                  {modalTab === 'ACTIVITIES' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(!studentMonitoringData?.activities || studentMonitoringData.activities.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                          No in-app activities recorded for this student yet.
                        </div>
                      ) : (
                        studentMonitoringData.activities.map(act => (
                          <div
                            key={act.id}
                            style={{
                              display: 'flex',
                              gap: '1rem',
                              padding: '0.9rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--slate-50)',
                              border: '1px solid var(--border-light)'
                            }}
                          >
                            <div style={{
                              padding: '0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: '#ffffff',
                              boxShadow: 'var(--shadow-sm)',
                              alignSelf: 'flex-start'
                            }}>
                              {getActivityIcon(act.action_type)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                                  {act.title}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                                  {new Date(act.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                                {act.description}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: SKILLS */}
                  {modalTab === 'SKILLS' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      {studentMonitoringData?.verifiedSkills?.map((sk, idx) => (
                        <div key={idx} className="card" style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{sk.skill_name}</span>
                            <span className="badge badge-success">{sk.level}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <div style={{ flex: 1, height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${sk.score}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{sk.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: INTERVIEWS */}
                  {modalTab === 'INTERVIEWS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(!studentMonitoringData?.mockInterviews || studentMonitoringData.mockInterviews.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                          No AI mock interviews taken yet.
                        </div>
                      ) : (
                        studentMonitoringData.mockInterviews.map(mi => (
                          <div key={mi.id} className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{mi.job_role || 'Software Engineer'}</div>
                              <span className="badge badge-primary">{mi.score || 85}% Score</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                              {mi.feedback || 'Demonstrated solid algorithm fundamentals and clear architecture explanations.'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 4: APPLICATIONS */}
                  {modalTab === 'APPLICATIONS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(!studentMonitoringData?.applications || studentMonitoringData.applications.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                          No internship or job applications recorded yet.
                        </div>
                      ) : (
                        studentMonitoringData.applications.map(app => (
                          <div key={app.id} className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{app.opportunity_title}</div>
                              <span className="badge badge-neutral">{app.status}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                              Submitted on: {new Date(app.created_at).toLocaleDateString()}
                            </div>
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
