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
  RotateCcw
} from 'lucide-react';

export const StudentDirectoryPage = () => {
  const [students, setStudents] = useState([]);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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
              🎓 Institutional Student Governance
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Enrolled College Student Directory & Activity Monitoring
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Track all students registered with your institution. Inspect verified skill scores, monitor roadmap tasks, and view in-app mock interview performance.
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

      {/* Student List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
            Loading student roster...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No enrolled students match current filter criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.email}</div>
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
