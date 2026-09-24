import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BarChart2,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const ROLE_PROFILES = [
  {
    id: 'fullstack',
    title: 'Full Stack Web Developer',
    description: 'React frontends, Node/Java enterprise backends, SQL/NoSQL databases, and cloud deployment pipelines.',
    roadmapId: 1,
    skills: [
      { name: 'React.js', studentScore: 82, requiredScore: 80, category: 'Frontend' },
      { name: 'Node.js & Express', studentScore: 78, requiredScore: 80, category: 'Backend' },
      { name: 'SQL & Relational DBs', studentScore: 85, requiredScore: 75, category: 'Database' },
      { name: 'Data Structures & Algos', studentScore: 65, requiredScore: 80, category: 'Core CS' },
      { name: 'REST & GraphQL APIs', studentScore: 75, requiredScore: 80, category: 'Backend' },
      { name: 'Docker & Containerization', studentScore: 55, requiredScore: 70, category: 'DevOps' }
    ]
  },
  {
    id: 'datascience',
    title: 'Data Scientist & AI/ML Engineer',
    description: 'Deep neural networks, PyTorch, predictive modeling, statistical testing, and BigQuery data processing.',
    roadmapId: 2,
    skills: [
      { name: 'Python for Data Science', studentScore: 90, requiredScore: 85, category: 'Language' },
      { name: 'Machine Learning Models', studentScore: 65, requiredScore: 80, category: 'AI/ML' },
      { name: 'Deep Learning & PyTorch', studentScore: 55, requiredScore: 75, category: 'AI/ML' },
      { name: 'SQL & Data Warehousing', studentScore: 80, requiredScore: 80, category: 'Database' },
      { name: 'Probability & Statistics', studentScore: 70, requiredScore: 80, category: 'Math' },
      { name: 'Data Visualization', studentScore: 85, requiredScore: 70, category: 'Analytics' }
    ]
  },
  {
    id: 'clouddevops',
    title: 'Cloud Architecture & DevOps SRE',
    description: 'Kubernetes orchestration, Terraform infrastructure as code, CI/CD pipelines, and cloud reliability engineering.',
    roadmapId: 3,
    skills: [
      { name: 'Cloud (AWS / GCP)', studentScore: 72, requiredScore: 85, category: 'Cloud' },
      { name: 'Docker & Containers', studentScore: 65, requiredScore: 80, category: 'DevOps' },
      { name: 'CI/CD Automation', studentScore: 58, requiredScore: 75, category: 'DevOps' },
      { name: 'Linux System Admin', studentScore: 80, requiredScore: 80, category: 'Systems' },
      { name: 'Infrastructure as Code', studentScore: 50, requiredScore: 75, category: 'Cloud' },
      { name: 'Network & Security', studentScore: 68, requiredScore: 75, category: 'Security' }
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cyber Security Analyst / Pentester',
    description: 'OWASP vulnerability scanning, network traffic intrusion detection with Wireshark, and defensive cryptography.',
    roadmapId: 10,
    skills: [
      { name: 'Network Penetration Testing', studentScore: 60, requiredScore: 85, category: 'Security' },
      { name: 'OWASP Security Defense', studentScore: 75, requiredScore: 80, category: 'Security' },
      { name: 'Python Scripting', studentScore: 85, requiredScore: 75, category: 'Language' },
      { name: 'Wireshark & Traffic Analysis', studentScore: 55, requiredScore: 80, category: 'Networking' },
      { name: 'Cryptography Protocols', studentScore: 65, requiredScore: 75, category: 'Security' },
      { name: 'Incident Response & Audit', studentScore: 70, requiredScore: 75, category: 'Governance' }
    ]
  },
  {
    id: 'embedded',
    title: 'Embedded Systems & IoT Engineer',
    description: 'Bare-metal Embedded C, ARM Cortex-M architecture, FreeRTOS multithreading, and sensor telemetry.',
    roadmapId: 11,
    skills: [
      { name: 'Embedded C / C++', studentScore: 75, requiredScore: 85, category: 'Firmware' },
      { name: 'ARM Cortex Architecture', studentScore: 60, requiredScore: 80, category: 'Hardware' },
      { name: 'FreeRTOS Concurrency', studentScore: 55, requiredScore: 75, category: 'RTOS' },
      { name: 'I2C / SPI / UART Protocols', studentScore: 80, requiredScore: 80, category: 'Communication' },
      { name: 'Microcontroller Debugging', studentScore: 70, requiredScore: 75, category: 'Hardware' },
      { name: 'IoT Telemetry & MQTT', studentScore: 65, requiredScore: 70, category: 'IoT' }
    ]
  },
  {
    id: 'swe',
    title: 'Big Tech Software Engineer (SWE)',
    description: 'Advanced algorithms, high-concurrency architecture, clean code standards, and large-scale system design.',
    roadmapId: 4,
    skills: [
      { name: 'Data Structures & Algorithms', studentScore: 72, requiredScore: 90, category: 'Core CS' },
      { name: 'System Design & Scalability', studentScore: 60, requiredScore: 85, category: 'Architecture' },
      { name: 'Object-Oriented Design', studentScore: 80, requiredScore: 80, category: 'Architecture' },
      { name: 'Concurrency & Threading', studentScore: 65, requiredScore: 80, category: 'Systems' },
      { name: 'Relational Database Design', studentScore: 75, requiredScore: 75, category: 'Database' },
      { name: 'Complex Problem Solving', studentScore: 78, requiredScore: 85, category: 'Core CS' }
    ]
  }
];

export const StudentSkillsGapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedRoleId, setSelectedRoleId] = useState('fullstack');
  const [profileSkills, setProfileSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentSkills();
  }, []);

  const fetchStudentSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/profile');
      if (res.data.success) {
        setProfileSkills(res.data.data.skills || []);
      }
    } catch (err) {
      console.warn('Could not load student skills:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLE_PROFILES.find(r => r.id === selectedRoleId) || ROLE_PROFILES[0];

  // Calculate Match Score
  const totalSkills = activeRole.skills.length;
  const matchedSkillsCount = activeRole.skills.filter(s => s.studentScore >= s.requiredScore).length;
  const avgStudentScore = Math.round(activeRole.skills.reduce((sum, s) => sum + s.studentScore, 0) / totalSkills);
  const avgRequiredScore = Math.round(activeRole.skills.reduce((sum, s) => sum + s.requiredScore, 0) / totalSkills);
  const roleMatchPct = Math.min(100, Math.round((avgStudentScore / avgRequiredScore) * 100));

  // Chart dataset
  const chartData = activeRole.skills.map(s => ({
    name: s.name.length > 18 ? s.name.substring(0, 16) + '…' : s.name,
    fullName: s.name,
    YourScore: s.studentScore,
    RequiredScore: s.requiredScore,
    gap: s.studentScore - s.requiredScore
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', fontWeight: 700, padding: '0.35rem 0.75rem', marginBottom: '0.75rem' }}>
              📊 Unified Competency & Gap Intelligence
            </span>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Skills & Skill Gap Analysis
            </h1>
            <p style={{ color: '#c7d2fe', fontSize: '0.96rem', lineHeight: 1.6, maxWidth: '720px' }}>
              Track all your verified technical skills, benchmark your competency against real-world industry hiring requirements, 
              and pinpoint exact skill gaps to accelerate your placement readiness.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/student/roadmap')}
              className="btn btn-primary"
              style={{ backgroundColor: '#ffffff', color: 'var(--primary-900)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Compass size={16} /> Open Topic Roadmaps
            </button>
            <button
              onClick={() => navigate('/student/certificate-verify')}
              className="btn btn-outline"
              style={{ borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Award size={16} /> Certifications
            </button>
          </div>
        </div>

        {/* 4 Scorecard Metrics Strip */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Overall Skill Index
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginTop: '0.25rem' }}>
              {avgStudentScore}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '0.2rem' }}>
              Across {totalSkills} target competencies
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Role Readiness
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: roleMatchPct >= 80 ? '#34d399' : '#facc15', marginTop: '0.25rem' }}>
              {roleMatchPct}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '0.2rem' }}>
              {matchedSkillsCount} of {totalSkills} benchmarks satisfied
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Identified Skill Gaps
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: totalSkills - matchedSkillsCount === 0 ? '#34d399' : '#f87171', marginTop: '0.25rem' }}>
              {totalSkills - matchedSkillsCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '0.2rem' }}>
              Topics needing score improvement
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Target Role
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '0.45rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeRole.title}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '0.2rem' }}>
              Active Industry Benchmark
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Role Benchmark Selector Pills */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Target size={20} color="var(--primary-600)" /> Select Target Industry Benchmark
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Switch target role to dynamically re-calibrate benchmarks and visualizations
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
          {ROLE_PROFILES.map(r => {
            const isSelected = r.id === selectedRoleId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--primary-600)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--slate-700)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
                {r.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Comparative Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1fr)', gap: '1.75rem', alignItems: 'start' }}>
        {/* Left Card: Recharts Comparative Bar Chart */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                Comparative Skill Benchmark Matrix
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                Your Verified Competency vs Industry Required Score
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--primary-600)' }} />
                <span>Your Score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#f59e0b' }} />
                <span>Required Score</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--slate-600)', fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: 'var(--slate-500)' }}
                  unit="%"
                />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name === 'YourScore' ? 'Your Verified Score' : 'Required Benchmark']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem'
                  }}
                />
                <Bar dataKey="YourScore" name="Your Score" fill="var(--primary-600)" radius={[4, 4, 0, 0]} maxBarSize={38} />
                <Bar dataKey="RequiredScore" name="Required Benchmark" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>
              Target Role: <strong>{activeRole.title}</strong> • Roadmap ID: <strong>#{activeRole.roadmapId}</strong>
            </div>
            <Link
              to="/student/roadmap"
              style={{ fontSize: '0.82rem', color: 'var(--primary-600)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              Verify Topics in Roadmap <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right Card: Readiness Dial & Gap Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              Role Readiness Assessment
            </h3>

            {/* Circular Gauge */}
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-700)', lineHeight: 1 }}>
                {roleMatchPct}%
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-900)', marginTop: '0.4rem' }}>
                {roleMatchPct >= 80 ? '🎯 Placement Ready (Top 10% Match)' : roleMatchPct >= 65 ? '⚡ Strong Match with Targeted Prep' : '📚 Foundation Building Required'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.35rem' }}>
                {matchedSkillsCount} of {totalSkills} core competencies meet hiring bar
              </div>
            </div>

            {/* Gap Alert / Quick Recommendation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Focus Action
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: 0 }}>
                {totalSkills - matchedSkillsCount === 0
                  ? 'All core competencies for this role exceed hiring benchmarks! You are fully qualified to submit applications.'
                  : `Focus on closing the gap in ${activeRole.skills.filter(s => s.studentScore < s.requiredScore).map(s => s.name).join(', ')}. Complete the 20-question assessments on each topic.`}
              </p>
            </div>
          </div>

          {/* Quick Certifications CTA */}
          <div className="card" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Sparkles size={18} color="#818cf8" />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Automated Verification
              </h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.55, marginBottom: '1rem' }}>
              Every time you complete a 20-question assessment in your Roadmap, your skill score automatically increases 
              and registered credentials appear in your <strong>Certifications</strong> tab.
            </p>
            <button
              onClick={() => navigate('/student/certificate-verify')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              View My Certifications
            </button>
          </div>
        </div>
      </div>

      {/* In-Depth Skill Gap Breakdown Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              Detailed Competency Diagnostics
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Itemized evaluation of each skill against hiring criteria
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--slate-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Skill Competency</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Your Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Required Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Gap / Margin</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {activeRole.skills.map((s, idx) => {
                const diff = s.studentScore - s.requiredScore;
                const isMet = diff >= 0;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: isMet ? '#ffffff' : '#fffbeb' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{s.category}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      {s.studentScore}%
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>
                      {s.requiredScore}%
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${isMet ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
                        {isMet ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                        {isMet ? 'Benchmark Met' : 'Gap Identified'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: isMet ? 'var(--success-600)' : 'var(--danger-600)' }}>
                      {diff > 0 ? `+${diff}%` : `${diff}%`}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link
                        to="/student/roadmap"
                        className={isMet ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        {isMet ? 'Retake 20-Q Quiz' : 'Take 20-Q Quiz'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
