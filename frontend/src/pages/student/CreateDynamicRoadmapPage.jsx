import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowLeft,
  Compass,
  Building2,
  Clock,
  Layers,
  Check,
  ChevronRight,
  Target,
  GraduationCap,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { CompanyLogo } from '../../components/roadmap/CompanyLogo';
import { AiDollGraphic } from '../../components/roadmap/AiDollMascot';

const POPULAR_ROLES = [
  { value: 'Full Stack Web Developer', label: '🌐 Full Stack Web Developer (MERN / Next.js)', domain: 'Full Stack Web Development', defaultTopics: 'React, Node.js, Express, PostgreSQL, Docker' },
  { value: 'AI & Machine Learning Engineer', label: '🤖 AI & Machine Learning Engineer', domain: 'Artificial Intelligence & Machine Learning', defaultTopics: 'Python, PyTorch, Scikit-Learn, Pandas, FastAPI' },
  { value: 'Cloud & DevOps SRE Engineer', label: '☁️ Cloud & DevOps SRE Engineer', domain: 'Cloud Computing & DevOps', defaultTopics: 'Docker, Kubernetes, Terraform, AWS, Prometheus' },
  { value: 'Google SWE (Early Career)', label: '🚀 Google SWE (Early Career Preparation)', domain: 'Top Tech Companies', defaultTopics: 'Data Structures, Dynamic Programming, System Design, Graphs' },
  { value: 'Amazon SDE-1 Preparation', label: '💼 Amazon SDE-1 Preparation Track', domain: 'Top Tech Companies', defaultTopics: 'Java, Object-Oriented Design, High-Throughput APIs, AWS' },
  { value: 'Wipro Project Engineer (Elite/Turbo)', label: '🏢 Wipro Project Engineer (Elite & Turbo)', domain: 'Enterprise & Full Stack', defaultTopics: 'Java 17, Spring Boot, Microservices, Angular, SQL' },
  { value: 'Data Scientist & Analyst', label: '📊 Data Scientist & Business Intelligence', domain: 'Artificial Intelligence & Machine Learning', defaultTopics: 'Python, SQL, Tableau, Pandas, Statistical Modeling' },
  { value: 'Cyber Security Analyst', label: '🛡️ Cyber Security & Penetration Tester', domain: 'Cyber Security & Forensics', defaultTopics: 'Network Security, OWASP Top 10, Wireshark, Penetration Testing' },
  { value: 'Mobile App Engineer', label: '📱 Mobile App Engineer (React Native / Flutter)', domain: 'Mobile Engineering', defaultTopics: 'React Native, Flutter, Mobile UI, Offline Storage, REST APIs' },
  { value: 'Embedded Systems & IoT Engineer', label: '⚡ Embedded Systems & IoT Engineer', domain: 'Embedded Systems & IoT', defaultTopics: 'Embedded C, ARM Cortex, FreeRTOS, I2C, SPI, MQTT' },
  { value: 'CUSTOM', label: '✏️ Other Custom Role (Type your own)' }
];

const POPULAR_COMPANIES = [
  { name: 'Wipro', label: 'Wipro' },
  { name: 'Google', label: 'Google' },
  { name: 'Amazon', label: 'Amazon' },
  { name: 'Microsoft', label: 'Microsoft' },
  { name: 'TCS', label: 'TCS' },
  { name: 'Infosys', label: 'Infosys' },
  { name: 'Tesla', label: 'Tesla' },
  { name: 'Meta', label: 'Meta' },
  { name: 'Cisco', label: 'Cisco' }
];

const SKILL_CHIPS = [
  'React.js', 'Node.js', 'Python', 'Java', 'Data Structures & Algorithms',
  'SQL & Databases', 'Docker & Containers', 'Kubernetes', 'AWS / Cloud',
  'PyTorch', 'System Design', 'Spring Boot', 'TypeScript', 'REST APIs', 'GitOps'
];

export const CreateDynamicRoadmapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [roleSelect, setRoleSelect] = useState('Full Stack Web Developer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [companySelect, setCompanySelect] = useState('Wipro');
  const [customCompanyInput, setCustomCompanyInput] = useState('');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [focusTopics, setFocusTopics] = useState('React, Node.js, Express, PostgreSQL, Docker');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');

  // Interactive Mascot speech state
  const [dollTip, setDollTip] = useState("Hi! I'm Sparky! 🤖 Choose your target role and dream company, and I'll build your personal roadmap!");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Role Change
  const handleRoleChange = (val) => {
    setRoleSelect(val);
    if (val !== 'CUSTOM') {
      const match = POPULAR_ROLES.find(r => r.value === val);
      if (match?.defaultTopics) {
        setFocusTopics(match.defaultTopics);
      }
      setDollTip(`Awesome choice! Aiming for ${val}? Let's pick your dream company next! 🚀`);
    } else {
      setDollTip("Custom role? Tell me what you want to become! I'll craft a unique 4-phase route for you! 🌟");
    }
  };

  // Handle Company Selection
  const handleSelectCompany = (compName) => {
    setCompanySelect(compName);
    setCustomCompanyInput('');
    setDollTip(`Targeting ${compName}! 🏢 Your curriculum will calibrate against ${compName}'s hiring benchmarks!`);
  };

  // Handle Skill Chip Toggle
  const handleToggleChip = (chip) => {
    const tokens = focusTopics.split(',').map(s => s.trim()).filter(Boolean);
    if (tokens.some(t => t.toLowerCase() === chip.toLowerCase())) {
      const updated = tokens.filter(t => t.toLowerCase() !== chip.toLowerCase()).join(', ');
      setFocusTopics(updated);
    } else {
      const updated = tokens.length > 0 ? `${focusTopics}, ${chip}` : chip;
      setFocusTopics(updated);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalRole = roleSelect === 'CUSTOM' ? customRoleInput.trim() : roleSelect.trim();
    const finalCompany = companySelect === 'CUSTOM' ? customCompanyInput.trim() : companySelect.trim();

    if (!finalRole) {
      setErrorMsg('Please specify your target career role.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setDollTip("✨ Designing your 4-phase roadmap and calculating GPS milestones... Hang tight!");

      const payload = {
        targetRole: finalRole,
        companyName: finalCompany || undefined,
        difficulty,
        estimatedWeeks: parseInt(durationWeeks, 10) || 12,
        department,
        focusTopics: focusTopics.trim()
      };

      const res = await api.post('/roadmaps/generate', payload);
      if (res.data.success) {
        const newRoadmap = res.data.data;
        setDollTip("🎉 Roadmap ready! Jump on, Captain Sparky is starting your journey!");
        setTimeout(() => {
          navigate(`/student/roadmap?id=${newRoadmap.id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to generate roadmap', err);
      setErrorMsg(err.response?.data?.message || 'Failed to generate dynamic roadmap. Please try again.');
      setDollTip("Oops! Something went wrong while synthesizing the curriculum. Please retry!");
      setSubmitting(false);
    }
  };

  const currentRoleName = roleSelect === 'CUSTOM' ? (customRoleInput || 'Custom Role') : roleSelect;
  const currentCompanyName = companySelect === 'CUSTOM' ? customCompanyInput : companySelect;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem 3rem 1rem' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/student/roadmap')}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
        >
          <ArrowLeft size={16} /> Back to All Roadmaps
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
          <Compass size={16} color="var(--primary-600)" />
          <span>Dynamic Career Navigator</span>
        </div>
      </div>

      {/* Hero Card with Animated AI Doll Greeting */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px -15px rgba(67, 56, 202, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ flex: '1 1 540px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#4f46e5', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              <Sparkles size={14} /> AI Career Companion Cockpit
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
              Design Your Dynamic Milestone Roadmap
            </h1>
            <p style={{ margin: 0, fontSize: '0.96rem', color: '#c7d2fe', lineHeight: 1.55 }}>
              Tell our AI Captain what you want to achieve. We'll generate a personalized 4-phase milestone curriculum with hands-on tasks, 20-Q assessments, and live Rapido-style bike progress tracking!
            </p>
          </div>

          {/* AI Doll in the Corner with Speech Bubble */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Animated Speech Bubble */}
            <div style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '0.75rem 1rem',
              borderRadius: '16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              maxWidth: '260px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              marginBottom: '10px',
              textAlign: 'center',
              lineHeight: 1.45,
              border: '2px solid #facc15'
            }}>
              {/* Pointer triangle */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #ffffff'
              }} />
              {dollTip}
            </div>

            {/* AI Doll Graphic */}
            <AiDollGraphic size={95} isWaving={true} />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#fef2f2',
          border: '1.5px solid #fca5a5',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Interactive Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        {/* Section 1: Target Career Goal */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              1
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              What is your target career or learning goal? <span style={{ color: 'var(--danger-500)' }}>*</span>
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: '0 0 1rem 2.25rem' }}>
            Select from industry-standard roles or choose "Custom Role" to enter your exact goal.
          </p>

          <div style={{ marginLeft: '2.25rem' }}>
            <select
              value={roleSelect}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--slate-800)',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {POPULAR_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            {roleSelect === 'CUSTOM' && (
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => {
                    setCustomRoleInput(e.target.value);
                    setDollTip(`Custom goal: "${e.target.value}"! I'll craft 4 specialized milestones for this! 🎯`);
                  }}
                  placeholder="e.g. Autonomous Vehicle AI Engineer, Web3 Blockchain Developer, Game Physics Programmer..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--primary-500)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    color: 'var(--slate-900)'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Target Dream Company */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              2
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              Target Dream Company (Shows preferred logo image & name)
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: '0 0 1rem 2.25rem' }}>
            Select a top hiring company or enter any dream startup to calibrate your interview milestones.
          </p>

          <div style={{ marginLeft: '2.25rem' }}>
            {/* Visual Company Logo Grid with Company Name Underneath */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
              {POPULAR_COMPANIES.map(comp => {
                const isSelected = companySelect === comp.name;
                return (
                  <button
                    key={comp.name}
                    type="button"
                    onClick={() => handleSelectCompany(comp.name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.75rem 0.5rem',
                      borderRadius: '16px',
                      backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                      border: `2px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-color)'}`,
                      boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '6px', right: '6px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                    <CompanyLogo companyName={comp.name} size={44} showNameBelow={true} nameStyle={{ marginTop: '0.35rem', fontSize: '0.8rem', color: isSelected ? 'var(--primary-800)' : 'var(--slate-700)' }} />
                  </button>
                );
              })}
            </div>

            {/* Custom Company Option */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={customCompanyInput}
                onChange={(e) => {
                  setCustomCompanyInput(e.target.value);
                  setCompanySelect('CUSTOM');
                  if (e.target.value) {
                    setDollTip(`Custom target company: ${e.target.value}! Captain Sparky will set up the GPS to this office! 🛵`);
                  }
                }}
                placeholder="Or enter any custom dream company (e.g. Netflix, Uber, Swiggy, Startup...)"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${companySelect === 'CUSTOM' ? 'var(--primary-600)' : 'var(--border-color)'}`,
                  fontSize: '0.9rem',
                  outline: 'none',
                  color: 'var(--slate-900)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Skill Level & Target Duration */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              3
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              Skill Level & Target Duration
            </h3>
          </div>

          <div style={{ marginLeft: '2.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '0.85rem' }}>
            {/* Difficulty */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', display: 'block', marginBottom: '0.5rem' }}>
                Difficulty / Starting Point
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'BEGINNER', label: '🌱 Beginner', desc: 'From basics' },
                  { id: 'INTERMEDIATE', label: '⚡ Intermediate', desc: 'Industry ready' },
                  { id: 'ADVANCED', label: '🔥 Advanced', desc: 'Hard & LeetCode' }
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDifficulty(d.id);
                      setDollTip(`Difficulty set to ${d.id}! We'll adjust task difficulty and pass thresholds accordingly.`);
                    }}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${difficulty === d.id ? 'var(--primary-600)' : 'var(--border-color)'}`,
                      backgroundColor: difficulty === d.id ? 'var(--primary-50)' : '#ffffff',
                      color: difficulty === d.id ? 'var(--primary-800)' : 'var(--slate-700)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{d.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', display: 'block', marginBottom: '0.5rem' }}>
                Target Timeline (Weeks)
              </label>
              <select
                value={durationWeeks}
                onChange={(e) => {
                  setDurationWeeks(e.target.value);
                  setDollTip(`${e.target.value} weeks planned! Captain Sparky will space milestones accordingly! ⏱️`);
                }}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--slate-800)',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={8}>8 Weeks (Accelerated Crash Track)</option>
                <option value={10}>10 Weeks (Fast-Paced Campus Prep)</option>
                <option value={12}>12 Weeks (Recommended Standard Semester Track)</option>
                <option value={16}>16 Weeks (Comprehensive In-Depth Track)</option>
                <option value={24}>24 Weeks (Extended Full Mastery Career Track)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Focus Topics & Department */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              4
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              Focus Skills, Topics & Academic Department
            </h3>
          </div>

          <div style={{ marginLeft: '2.25rem', marginTop: '0.85rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', display: 'block', marginBottom: '0.4rem' }}>
              Key Topics & Technologies (Click chips to toggle or type below)
            </label>

            {/* Quick Skill Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {SKILL_CHIPS.map(chip => {
                const isSelected = focusTopics.toLowerCase().includes(chip.toLowerCase());
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleToggleChip(chip)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--slate-50)',
                      color: isSelected ? 'var(--primary-700)' : 'var(--slate-600)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={focusTopics}
              onChange={(e) => setFocusTopics(e.target.value)}
              placeholder="e.g. React, Node.js, Docker, Microservices, Python, SQL..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none',
                color: 'var(--slate-900)',
                marginBottom: '1rem'
              }}
            />

            {/* College Department Alignment */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', display: 'block', marginBottom: '0.4rem' }}>
                Academic Department Alignment
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--slate-800)',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="ALL">All Departments (General)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action Strip */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Ready to generate: {currentRoleName} {currentCompanyName ? `@ ${currentCompanyName}` : ''}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
              Synthesizes 4-phase milestone curriculum with hands-on tasks and Rapido bike captain tracking!
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => navigate('/student/roadmap')}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
              }}
            >
              {submitting ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  Generating Route with Captain Sparky...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Dynamic Roadmap & Start Ride 🚀
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateDynamicRoadmapPage;
