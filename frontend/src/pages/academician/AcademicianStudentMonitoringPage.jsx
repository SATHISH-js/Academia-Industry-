import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Eye,
  MessageSquare,
  ShieldCheck,
  Compass,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { StudentMonitoringModal } from '../../components/academician/StudentMonitoringModal';
import { StudentGuidanceModal } from '../../components/academician/StudentGuidanceModal';
import { InstitutionalDirectivesModal } from '../../components/academician/InstitutionalDirectivesModal';

export const AcademicianStudentMonitoringPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [homeDepartment, setHomeDepartment] = useState('');
  const [directivesSummary, setDirectivesSummary] = useState({ total: 0, urgentCount: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // 'ALL', 'LOW', 'CRITICAL', 'GOOD'
  const [minCgpa, setMinCgpa] = useState('');

  // Modals state
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [selectedStudentForGuidance, setSelectedStudentForGuidance] = useState(null);
  const [showDirectivesModal, setShowDirectivesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchStudents();
    }
  }, [selectedDepartment, yearFilter, sectionFilter, attendanceFilter, minCgpa]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [deptRes, dirRes] = await Promise.all([
        api.get('/academician/departments'),
        api.get('/academician/directives')
      ]);

      if (deptRes.data.success) {
        const myDept = deptRes.data.data.myDepartment || 'Computer Science & Engineering';
        setHomeDepartment(myDept);
        setSelectedDepartment(myDept);
        setDepartments(deptRes.data.data.departments || []);
      }

      if (dirRes.data.success) {
        const dirs = dirRes.data.data.directives || [];
        const urgent = dirs.filter((d) => d.priority === 'URGENT' || d.priority === 'HIGH').length;
        setDirectivesSummary({ total: dirs.length, urgentCount: urgent });
      }
    } catch (err) {
      console.error('Failed to load initial academician monitoring data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDepartment && selectedDepartment !== 'ALL') params.append('department', selectedDepartment);
      if (yearFilter !== 'ALL') params.append('year', yearFilter);
      if (sectionFilter !== 'ALL') params.append('section', sectionFilter);
      if (attendanceFilter !== 'ALL') params.append('attendance_status', attendanceFilter);
      if (minCgpa) params.append('min_cgpa', minCgpa);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await api.get(`/academician/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.data.students || []);
      }
    } catch (err) {
      console.error('Failed to load department students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchStudents();
  };

  // KPIs
  const totalMonitored = students.length;
  const avgCgpa =
    totalMonitored > 0
      ? (
          students.reduce((acc, s) => acc + (parseFloat(s.cgpa) || 0), 0) /
          totalMonitored
        ).toFixed(2)
      : '0.00';

  const criticalAttendanceCount = students.filter((s) => {
    const att = parseFloat((s.attendance_percentage || '85').replace('%', ''));
    return att < 75;
  }).length;

  const placedCount = students.filter((s) => s.is_placed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1250px', margin: '0 auto' }}>
      {/* Institutional Directives Banner (Requirement 1) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          color: '#ffffff',
          padding: '2rem 2.25rem',
          borderRadius: 'var(--radius-lg, 16px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.35)', color: '#c7d2fe', fontSize: '0.75rem' }}>
              🎓 Faculty Academic Supervision & Student Mentorship
            </span>
            {directivesSummary.urgentCount > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '0.72rem', animation: 'pulse 2s infinite' }}>
                ⚠️ {directivesSummary.urgentCount} Urgent Campus Commands
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            Department Student Monitoring & Institutional Commands
          </h1>
          <p style={{ color: 'var(--slate-300)', maxWidth: '680px', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
            Inspect student CGPA progression, attendance compliance meters, and verified skill badges. Send direct mentorship guidance and review institutional directives.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowDirectivesModal(true)}
            className="btn btn-secondary"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              fontSize: '0.85rem',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700
            }}
          >
            <Building2 size={16} /> Campus Commands ({directivesSummary.total})
          </button>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--success-50, #ecfdf5)',
            color: 'var(--success-700, #047857)',
            border: '1px solid var(--success-500, #10b981)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cohort Visit & Department Selector Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GraduationCap size={16} color="var(--primary-600)" />
              Visiting Department Cohort:
            </span>
            <select
              className="form-control"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{ fontWeight: 700, fontSize: '0.88rem', width: 'auto', minWidth: '260px', borderColor: 'var(--primary-300)' }}
            >
              {departments.length === 0 ? (
                <option value={homeDepartment}>{homeDepartment} (Home Department)</option>
              ) : (
                departments.map((d) => (
                  <option key={d.department} value={d.department}>
                    {d.department} ({d.student_count} students) {d.department === homeDepartment ? '★ Primary Dept' : ''}
                  </option>
                ))
              )}
            </select>
            {selectedDepartment === homeDepartment && (
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                Your Assigned Department
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Inspecting <strong>{totalMonitored}</strong> registered student(s) in this cohort
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>
            Monitored Students
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.35rem' }}>
            {totalMonitored}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)', marginTop: '0.25rem' }}>
            Active cohort enrollment
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>
            Cohort Average CGPA
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.35rem' }}>
            {avgCgpa}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 600, marginTop: '0.25rem' }}>
            Academic benchmark
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: criticalAttendanceCount > 0 ? '#fef2f2' : '#ffffff',
            border: criticalAttendanceCount > 0 ? '1px solid #fecaca' : '1px solid var(--border-color)'
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: criticalAttendanceCount > 0 ? '#991b1b' : 'var(--slate-500)', fontWeight: 700 }}>
            Attendance &lt; 75% Warning
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: criticalAttendanceCount > 0 ? '#dc2626' : 'var(--slate-900)', marginTop: '0.35rem' }}>
            {criticalAttendanceCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: criticalAttendanceCount > 0 ? '#dc2626' : 'var(--slate-500)', fontWeight: 600, marginTop: '0.25rem' }}>
            {criticalAttendanceCount > 0 ? 'Remedial action required' : 'All students compliant'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>
            Corporate Placements
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.35rem' }}>
            {placedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)', marginTop: '0.25rem' }}>
            {totalMonitored > 0 ? Math.round((placedCount / totalMonitored) * 100) : 0}% placement rate
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by student name, register number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}>
              Search
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--slate-100)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>
              <Filter size={14} /> Filter Cohort:
            </div>

            {/* Year */}
            <select
              className="form-control"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year (Final)</option>
              <option value="2026">Class of 2026</option>
              <option value="2027">Class of 2027</option>
            </select>

            {/* Section */}
            <select
              className="form-control"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>

            {/* Attendance Status */}
            <select
              className="form-control"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Attendance</option>
              <option value="LOW">Below 75% (Shortage)</option>
              <option value="CRITICAL">Below 65% (Critical)</option>
              <option value="GOOD">75% & Above (Eligible)</option>
            </select>

            {/* Min CGPA */}
            <select
              className="form-control"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              style={{ width: 'auto', fontSize: '0.8rem' }}
            >
              <option value="">Any CGPA</option>
              <option value="9.0">CGPA &gt;= 9.0 (Distinction)</option>
              <option value="8.0">CGPA &gt;= 8.0</option>
              <option value="7.0">CGPA &gt;= 7.0</option>
            </select>
          </div>
        </form>
      </div>

      {/* Student Monitoring Roster Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
            Loading cohort students and academic telemetry...
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--slate-500)' }}>
            <Users size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--slate-400)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              No students found in this department or filter
            </h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Switch department above or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Cohort Details</th>
                  <th>CGPA</th>
                  <th>Attendance Meter</th>
                  <th>Roadmap Progress</th>
                  <th>Verified Skills</th>
                  <th style={{ textAlign: 'right' }}>Faculty Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => {
                  const attNum = parseFloat((stu.attendance_percentage || '85').replace('%', ''));
                  const isLowAtt = attNum < 75;

                  return (
                    <tr key={stu.id}>
                      {/* Student info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-600)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              flexShrink: 0
                            }}
                          >
                            {(stu.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                              {stu.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                              Reg: {stu.register_number || stu.enrollment_number || '2026-CSE-001'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cohort */}
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                          Year {stu.current_year || '3rd'} • Sem {stu.current_semester || '6th'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                          Section: <strong>{stu.section || 'A'}</strong> • {stu.department}
                        </div>
                      </td>

                      {/* CGPA */}
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                          {stu.cgpa || '8.50'}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                          {stu.active_backlogs > 0 ? (
                            <span style={{ color: 'var(--danger-600)', fontWeight: 600 }}>{stu.active_backlogs} Backlog(s)</span>
                          ) : (
                            '0 Backlogs'
                          )}
                        </div>
                      </td>

                      {/* Attendance */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span
                            className={`badge ${isLowAtt ? 'badge-danger' : 'badge-success'}`}
                            style={{ fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            {stu.attendance_percentage || '85%'}
                          </span>
                          {isLowAtt && (
                            <span title="Attendance below 75% prerequisite threshold" style={{ color: 'var(--danger-600)' }}>
                              <AlertTriangle size={13} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Roadmap */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600 }}>
                            <span>Progress</span>
                            <span style={{ color: 'var(--primary-600)' }}>{stu.roadmapStats?.pct || 65}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--slate-200)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${stu.roadmapStats?.pct || 65}%`,
                                height: '100%',
                                backgroundColor: 'var(--primary-600)',
                                borderRadius: '9999px'
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Skills */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '200px' }}>
                          {(stu.verifiedSkills || []).slice(0, 2).map((sk) => (
                            <span key={sk.skill_id} className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                              {sk.skill_name} ({sk.score}%)
                            </span>
                          ))}
                          {(stu.verifiedSkills || []).length > 2 && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)', alignSelf: 'center' }}>
                              +{stu.verifiedSkills.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedStudentForModal(stu)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            title="Monitor Student Performance & History"
                          >
                            <Eye size={13} /> Monitor
                          </button>

                          <button
                            onClick={() => setSelectedStudentForGuidance(stu)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            title="Direct Mentorship Guidance"
                          >
                            <MessageSquare size={13} /> Direct Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Monitoring Modal */}
      {selectedStudentForModal && (
        <StudentMonitoringModal
          studentId={selectedStudentForModal.id}
          onClose={() => setSelectedStudentForModal(null)}
          onOpenGuidance={(stu) => {
            setSelectedStudentForModal(null);
            setSelectedStudentForGuidance(stu);
          }}
        />
      )}

      {/* Student Direct Guidance Messaging Modal */}
      {selectedStudentForGuidance && (
        <StudentGuidanceModal
          student={selectedStudentForGuidance}
          onClose={() => setSelectedStudentForGuidance(null)}
          onMessageSent={(stu) => {
            setToastMessage(`Mentorship guidance sent to ${stu.name}!`);
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />
      )}

      {/* Institutional Directives & Commands Modal */}
      {showDirectivesModal && (
        <InstitutionalDirectivesModal
          onClose={() => {
            setShowDirectivesModal(false);
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
};
