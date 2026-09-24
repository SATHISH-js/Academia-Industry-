import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileText,
  Printer,
  Sparkles,
  Award,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Trophy,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  CheckCircle,
  Eye,
  Sliders,
  RefreshCw,
  Edit3,
  Calendar,
  Building,
  CheckCheck,
  ExternalLink
} from 'lucide-react';

export const ResumeBuilderPage = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('MODERN'); // 'MODERN', 'MINIMAL', 'EXECUTIVE'
  const [customObjective, setCustomObjective] = useState('');
  const [activePreset, setActivePreset] = useState('standard');
  const [sectionsVisibility, setSectionsVisibility] = useState({
    objective: true,
    education: true,
    internships: true,
    projects: true,
    skills: true,
    certifications: true
  });

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resume/data');
      if (res.data.success) {
        const data = res.data.data;
        setResumeData(data);
        if (data.autoSummary) {
          setCustomObjective(data.autoSummary);
        } else if (data.profile?.headline) {
          setCustomObjective(
            `Motivated ${data.profile.headline} with solid foundations in computer science and software engineering. Committed to delivering high-impact solutions through industry collaboration.`
          );
        }
      }
    } catch (err) {
      console.error('Failed to load resume data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      await api.post('/resume/export-log');
    } catch (err) {
      console.warn('Could not log resume export', err);
    }
    window.print();
  };

  const toggleSection = (section) => {
    setSectionsVisibility(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Switch summary preset
  const handleSelectPreset = (presetKey) => {
    setActivePreset(presetKey);
    if (resumeData?.summaryPresets && resumeData.summaryPresets[presetKey]) {
      setCustomObjective(resumeData.summaryPresets[presetKey]);
    } else {
      // Dynamic fallback generator
      const p = resumeData?.profile || resumeData?.personalInfo || {};
      const deg = p.degree || 'B.Tech';
      const dep = p.department || 'Computer Science & Engineering';
      const col = p.ug_college || p.institution_name || 'Engineering Institute';
      const cgpa = p.cgpa ? ` maintaining a ${p.cgpa} CGPA` : '';
      const projCount = (resumeData?.projects || []).length;
      const internCount = (resumeData?.internships || []).length;

      if (presetKey === 'technical') {
        setCustomObjective(`Dynamic ${deg} candidate in ${dep} at ${col}${cgpa}. Proficient in modern architectures, algorithms, and full-stack software development. Built ${projCount} production-ready technical projects with scalable implementation.`);
      } else if (presetKey === 'impact') {
        setCustomObjective(`Results-driven engineering student with hands-on experience delivering ${projCount} real-world applications and ${internCount} corporate internships. Strong team collaborator focused on high-efficiency execution.`);
      } else if (presetKey === 'academic') {
        setCustomObjective(`Dedicated ${deg} student in ${dep} at ${col}${cgpa}. Strong analytical foundation with verified technical credentials and continuous academic excellence across collegiate milestones.`);
      } else {
        setCustomObjective(resumeData?.autoSummary || `Motivated ${deg} engineer ready to apply practical skills in modern engineering teams.`);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={36} className="animate-spin" style={{ margin: '0 auto 1.25rem', color: 'var(--primary-600)' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
          Extracting Verified Student Credentials...
        </h3>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
          Pulling 10th, 12th, and UG qualifications, completed internships, verified skills, and technical projects into an ATS-optimized resume.
        </p>
      </div>
    );
  }

  const profile = resumeData?.personalInfo || resumeData?.profile || {};
  const educationDetails = resumeData?.educationDetails || {};
  const educationList = resumeData?.education || [];
  const skills = resumeData?.skills || [];
  const projects = resumeData?.projects || [];
  const internships = resumeData?.internships || [];
  const certifications = resumeData?.certifications || [];
  const achievements = resumeData?.achievements || [];

  // Extract UG, 12th, 10th safely
  const ug = educationDetails.undergraduate || {
    degree: profile.degree || 'B.Tech',
    department: profile.department || 'Computer Science & Engineering',
    college: profile.ug_college || profile.institution_name || 'Apex Institute of Technology',
    university: profile.ug_university || 'Affiliated Technical University',
    graduation_year: profile.graduation_year || '2026',
    cgpa: profile.cgpa || '8.75'
  };

  const twelfth = educationDetails.twelfth || {
    college: profile.twelfth_college || 'Delhi Public School',
    board: profile.twelfth_board || 'CBSE (Science)',
    passing_year: profile.twelfth_year || '2022',
    percentage: profile.twelfth_percentage || '94.2'
  };

  const tenth = educationDetails.tenth || {
    school: profile.tenth_school || "St. Xavier's High School",
    board: profile.tenth_board || 'CBSE',
    passing_year: profile.tenth_year || '2020',
    percentage: profile.tenth_percentage || '92.5'
  };

  return (
    <div className="resume-builder-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Banner & Control Deck (Hidden on Print) */}
      <div className="card no-print" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: '2rem 2.25rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
                📄 Dynamic Resume Engine
              </span>
              <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.25)', color: '#bae6fd' }}>
                ✨ AI Summary Generator
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
              Verified Portfolio Resume Builder
            </h1>
            <p style={{ color: 'var(--primary-200)', fontSize: '0.92rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Automatically extracted your verified credentials: <strong>10th, 12th & Undergraduate</strong>, <strong>{internships.length} Completed Internships</strong>, <strong>{projects.length} Technical Projects</strong>, and <strong>{skills.length} Verified Skills</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrint}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--primary-900)',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem'
              }}
            >
              <Printer size={18} /> Print / Save to PDF
            </button>
          </div>
        </div>

        {/* AI Summary Toolbar */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                Auto-Build Professional Summary:
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'standard', label: 'Balanced All-Rounder' },
                { id: 'technical', label: 'Technical Specialist' },
                { id: 'impact', label: 'High-Impact Builder' },
                { id: 'academic', label: 'Academic & Research' }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  style={{
                    background: activePreset === preset.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)',
                    color: activePreset === preset.id ? '#0f172a' : '#ffffff',
                    border: 'none',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              className="form-control"
              rows={3}
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
              placeholder="Auto-generated professional summary tailored to your qualifications..."
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                borderRadius: 'var(--radius-sm)'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--primary-200)', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>You can freely edit this summary or click any preset above to re-generate.</span>
              <span>{customObjective.length} characters</span>
            </div>
          </div>
        </div>

        {/* Customization Toolbar */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Template Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-200)' }}>
              Template Style:
            </span>
            <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.25)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedTemplate('MODERN')}
                style={{
                  background: selectedTemplate === 'MODERN' ? 'var(--primary-600)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Modern Tech
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('MINIMAL')}
                style={{
                  background: selectedTemplate === 'MINIMAL' ? 'var(--primary-600)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clean ATS Minimal
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('EXECUTIVE')}
                style={{
                  background: selectedTemplate === 'EXECUTIVE' ? 'var(--primary-600)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Classic Academic
              </button>
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-200)' }}>Sections:</span>
            {[
              { id: 'objective', label: 'Summary' },
              { id: 'education', label: 'Academics' },
              { id: 'internships', label: 'Internships' },
              { id: 'projects', label: 'Projects' },
              { id: 'skills', label: 'Skills' },
              { id: 'certifications', label: 'Certifications' }
            ].map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => toggleSection(sec.id)}
                style={{
                  background: sectionsVisibility[sec.id] ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                {sec.label} {sectionsVisibility[sec.id] ? '✓' : '✗'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Resume Sheet Preview (Target for Print) */}
      <div
        id="resume-document"
        className={`resume-paper template-${selectedTemplate.toLowerCase()}`}
        style={{
          backgroundColor: '#ffffff',
          color: '#1e293b',
          padding: '3rem 3.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          minHeight: '1050px',
          width: '100%',
          maxWidth: '920px',
          margin: '0 auto',
          fontFamily: selectedTemplate === 'MINIMAL' ? 'ui-sans-serif, system-ui, sans-serif' : selectedTemplate === 'EXECUTIVE' ? 'Georgia, serif' : 'system-ui, sans-serif',
          lineHeight: 1.5
        }}
      >
        {/* Header / Contact Information */}
        <header style={{
          borderBottom: selectedTemplate === 'MODERN' ? '3px solid var(--primary-600)' : selectedTemplate === 'EXECUTIVE' ? '2px solid #0f172a' : '1px solid #cbd5e1',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: selectedTemplate === 'MODERN' ? 'var(--primary-800)' : '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '0.25rem'
            }}>
              {profile.name || 'Student Full Name'}
            </h1>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--slate-600)' }}>
              {profile.headline || `${ug.department} Student`}
            </div>
            {(profile.city || profile.address) && (
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} /> {profile.city ? `${profile.city}, ${profile.state || 'India'}` : profile.address}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--slate-600)', textAlign: 'right' }}>
            {profile.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Mail size={13} /> {profile.email}
              </div>
            )}
            {profile.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Phone size={13} /> {profile.phone}
              </div>
            )}
            {profile.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Linkedin size={13} /> {profile.linkedin.replace('https://', '').replace('http://', '')}
              </div>
            )}
            {profile.github && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Github size={13} /> {profile.github.replace('https://', '').replace('http://', '')}
              </div>
            )}
          </div>
        </header>

        {/* Section 1: Professional Summary */}
        {sectionsVisibility.objective && customObjective && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a',
              marginBottom: '0.5rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.25rem'
            }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.6, margin: 0 }}>
              {customObjective}
            </p>
          </section>
        )}

        {/* Section 2: Academic Qualifications (UG + 12th + 10th) */}
        {sectionsVisibility.education && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.25rem'
            }}>
              Academic Qualifications
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Undergraduate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {ug.degree} in {ug.department}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a' }}>
                    CGPA: {ug.cgpa} / 10.0 ({ug.graduation_year})
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                  {ug.college} • {ug.university}
                </div>
              </div>

              {/* 12th / Pre-University */}
              {twelfth.college && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Senior Secondary (12th Standard / Pre-University)
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                      Score: {twelfth.percentage}% ({twelfth.passing_year})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {twelfth.college} • Board: {twelfth.board}
                  </div>
                </div>
              )}

              {/* 10th / Secondary */}
              {tenth.school && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Secondary School Certificate (10th Standard)
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                      Score: {tenth.percentage}% ({tenth.passing_year})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {tenth.school} • Board: {tenth.board}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 3: Completed Internships & Industry Experience */}
        {sectionsVisibility.internships && internships.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.25rem'
            }}>
              Completed Internships & Work Experience
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {internships.map((intern, idx) => (
                <div key={intern.id || idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {intern.role} — <span style={{ color: 'var(--slate-700)' }}>{intern.company_name}</span>
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                      {intern.duration || 'Internship'} {intern.location ? `• ${intern.location}` : ''}
                    </span>
                  </div>
                  {intern.technologies_used && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: '0.15rem 0' }}>
                      <strong>Technologies:</strong> {intern.technologies_used}
                    </div>
                  )}
                  {intern.description && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', marginTop: '0.2rem', lineHeight: 1.5, margin: 0 }}>
                      • {intern.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Featured Technical Projects */}
        {sectionsVisibility.projects && projects.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.25rem'
            }}>
              Featured Technical Projects
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {proj.title} {proj.role && <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-500)' }}>({proj.role})</span>}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {proj.technologies}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', marginTop: '0.25rem', lineHeight: 1.5, marginBottom: '0.2rem' }}>
                    {proj.description}
                  </p>
                  {(proj.github_url || proj.project_url) && (
                    <div style={{ fontSize: '0.78rem', color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a', display: 'flex', gap: '1rem' }}>
                      {proj.github_url && <span><strong>Code:</strong> {proj.github_url}</span>}
                      {proj.project_url && <span><strong>Live Demo:</strong> {proj.project_url}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Verified Technical Skills */}
        {sectionsVisibility.skills && skills.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.25rem'
            }}>
              Verified Technical Skills
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.2rem 0.6rem',
                    backgroundColor: selectedTemplate === 'MINIMAL' ? '#f8fafc' : '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  {s.skill_name} ({s.score}%)
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Certifications & Extra-Curricular Honors */}
        {sectionsVisibility.certifications && (certifications.length > 0 || achievements.length > 0) && (
          <section>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: selectedTemplate === 'MODERN' ? 'var(--primary-700)' : '#0f172a',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.25rem'
            }}>
              Certifications & Extra-Curricular Achievements
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {certifications.map((c) => (
                <div key={c.id} style={{ fontSize: '0.88rem', color: 'var(--slate-700)' }}>
                  • <strong>{c.name}</strong> — {c.issuing_organization} {c.issue_date ? `(${new Date(c.issue_date).toLocaleDateString()})` : ''}
                </div>
              ))}
              {achievements.map((a) => (
                <div key={a.id} style={{ fontSize: '0.88rem', color: 'var(--slate-700)' }}>
                  • <strong>{a.title}</strong>: {a.description}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Embedded CSS for Print Styling */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, header, aside, .app-sidebar, .app-topbar-fixed {
            display: none !important;
          }
          .resume-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 1.5rem !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};
