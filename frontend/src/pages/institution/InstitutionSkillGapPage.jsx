import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BarChart2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  ArrowUpRight,
  Mail,
  CheckCircle2,
  Users,
  Compass,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { InstitutionContactModal } from '../../components/institution/InstitutionContactModal';

export const InstitutionSkillGapPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [contactStudent, setContactStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, studentsRes] = await Promise.all([
        api.get('/institution/analytics'),
        api.get('/institution/students')
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (studentsRes.data.success) {
        setStudents(Array.isArray(studentsRes.data.data) ? studentsRes.data.data : []);
      }
    } catch (err) {
      console.error('Failed to load skill gap analytics', err);
    } finally {
      setLoading(false);
    }
  };

  // Skill Benchmark Matrix comparing college cohort vs industry demand
  const skillBenchmarks = [
    { skill: 'Data Structures & Algorithms', industryRequired: 85, collegeAvg: 68, deficit: 17, category: 'Technical' },
    { skill: 'Cloud & Distributed Systems (AWS/GCP)', industryRequired: 80, collegeAvg: 58, deficit: 22, category: 'Technical' },
    { skill: 'Full-Stack Web (React & Node.js)', industryRequired: 75, collegeAvg: 74, deficit: 1, category: 'Technical' },
    { skill: 'Database Optimization & SQL', industryRequired: 80, collegeAvg: 71, deficit: 9, category: 'Technical' },
    { skill: 'AI/ML & Deep Learning', industryRequired: 78, collegeAvg: 60, deficit: 18, category: 'Technical' },
    { skill: 'Professional Communication & Teamwork', industryRequired: 85, collegeAvg: 79, deficit: 6, category: 'Soft Skill' }
  ];

  // Radar chart data
  const radarData = skillBenchmarks.map(s => ({
    subject: s.skill.split(' ')[0],
    CollegeAvg: s.collegeAvg,
    IndustryStandard: s.industryRequired
  }));

  // Filter students needing skill interventions (overall score < 75% or specific gaps)
  const studentsNeedingIntervention = students.filter(s => {
    const score = Number(s.overall_skill_score) || 0;
    const matchesDept = selectedDept === 'ALL' || s.department.toLowerCase().includes(selectedDept.toLowerCase());
    return matchesDept && score < 80;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '2.25rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              📊 Academic Capability & Curriculum Alignment
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Institutional Skill Gap Analytics & Diagnostics
            </h1>
            <p style={{ color: 'var(--primary-200)', maxWidth: '680px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Identify discrepancies between campus classroom learning outcomes and live corporate industry requirements. Launch targeted faculty interventions and remedial technical workshops.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                padding: '1rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {analytics?.averageSkillScore || 72}%
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-200)', marginTop: '0.25rem' }}>
                Cohort Avg Score
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                padding: '1rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                14.8%
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-200)', marginTop: '0.25rem' }}>
                Aggregate Skill Deficit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Skill Gap Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#dc2626' }}>
              <AlertTriangle size={18} /> High Priority Deficit: Cloud & DevOps
            </div>
            <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>22% Gap</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
            Industry hiring benchmarks demand CI/CD pipelines, Docker containerization, and AWS/GCP architectures. College cohort average is currently 58%.
          </p>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={14} /> Recommended Action: Organize 24h Cloud Native Bootcamp
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#d97706' }}>
              <AlertTriangle size={18} /> Moderate Deficit: Applied AI & ML
            </div>
            <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>18% Gap</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
            Core theory on algorithms is strong, but hands-on model deployment, vector embeddings, and LLM fine-tuning show an 18% deficit against current market job requisitions.
          </p>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={14} /> Recommended Action: Add Generative AI Laboratory Practical
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#059669' }}>
              <CheckCircle2 size={18} /> Strong Alignment: Full-Stack Web
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>1% Gap (On Track)</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
            Students in Computer Science and IT show exceptional mastery in React, Express, and RESTful API engineering, performing on par with entry-level corporate benchmarks.
          </p>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={14} /> Recommended Action: Channel candidates toward early internship drives
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Benchmark Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.35rem' }}>
            College Average vs Industry Demand Standard (%)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
            Comparative proficiency score index across high-demand industry capabilities
          </p>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillBenchmarks} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate-200)" />
                <XAxis dataKey="skill" tick={{ fill: 'var(--slate-600)', fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--slate-600)', fontSize: 11 }} />
                <Tooltip />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                <Bar dataKey="collegeAvg" name="College Cohort Avg %" fill="var(--primary-600)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="industryRequired" name="Industry Requirement %" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Map */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.35rem' }}>
            Domain Competency Perimeter (Radar Map)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
            Multi-axis diagnostic showing technical strengths vs areas needing remediation
          </p>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={95}>
                <PolarGrid stroke="var(--slate-200)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--slate-700)', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="College Avg" dataKey="CollegeAvg" stroke="var(--primary-600)" fill="var(--primary-600)" fillOpacity={0.4} />
                <Radar name="Industry Standard" dataKey="IndustryStandard" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Intervention List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Students Targeted for Skill Intervention & Remediation
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Enrolled students with critical skill deficits requiring academic notices or mentorship workshops
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={15} color="var(--slate-500)" />
            <select
              className="form-control"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', width: 'auto' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science & Eng</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science / AI</option>
              <option value="Electronics">Electronics & Communication</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
            Analyzing institutional student skill profiles...
          </div>
        ) : studentsNeedingIntervention.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <CheckCircle2 size={32} color="var(--success-500)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>No Critical Interventions Required</div>
            <div style={{ fontSize: '0.85rem' }}>All enrolled students in this filter meet or exceed baseline skill benchmarks.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student & Register Number</th>
                  <th>Department & Degree</th>
                  <th>Overall Skill Score</th>
                  <th>Primary Deficit Area</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentsNeedingIntervention.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{student.name}</div>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.15rem' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: 'var(--slate-100)',
                            color: 'var(--slate-700)'
                          }}
                        >
                          {student.enrollment_number || 'REG: Pending'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{student.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{student.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{student.degree} (Batch {student.graduation_year})</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 60, height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${student.overall_skill_score || 0}%`,
                              height: '100%',
                              backgroundColor: (student.overall_skill_score || 0) < 60 ? 'var(--danger-500)' : 'var(--warning-500)'
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{student.overall_skill_score || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                        Cloud & Advanced Problem Solving
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setContactStudent(student)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.3rem' }}
                      >
                        <Mail size={13} /> Contact Student
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactStudent && (
        <InstitutionContactModal
          recipient={contactStudent}
          type="STUDENT"
          onClose={() => setContactStudent(null)}
          onMessageSent={() => fetchData()}
        />
      )}
    </div>
  );
};
