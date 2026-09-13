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
  Sliders
} from 'lucide-react';

export const ResumeBuilderPage = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('MODERN'); // 'MODERN', 'MINIMAL', 'EXECUTIVE'
  const [customObjective, setCustomObjective] = useState('');
  const [sectionsVisibility, setSectionsVisibility] = useState({
    objective: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    achievements: true
  });

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resume/data');
      if (res.data.success) {
        setResumeData(res.data.data);
        if (res.data.data?.profile?.headline) {
          setCustomObjective(
            `Motivated ${res.data.data.profile.headline} with solid foundations in computer science and modern software engineering practices. Committed to delivering high-impact solutions through industry collaboration.`
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
      // Log export activity to backend
      await api.post('/resume/export-log');
    } catch (err) {
      console.warn('Could not log resume export', err);
    }
    window.print();
  };

  const toggleSection = (section) => {
    setSectionsVisibility(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Assembling your verified portfolio into a professional resume...</p>
      </div>
    );
  }

  const { profile, education, skills = [], projects = [], certifications = [], achievements = [] } = resumeData || {};

  return (
    <div className="resume-builder-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Controls Banner (Hidden in Print) */}
      <div className="card no-print" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.5rem' }}>
              📄 Dynamic Resume Engine
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Verified Portfolio Resume Builder
            </h1>
            <p style={{ color: 'var(--primary-200)', fontSize: '0.9rem', maxWidth: '600px' }}>
              Instantly generate an industry-formatted resume compiled with your 10th, 12th, and UG academic credentials, verified skills, and technical projects.
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
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Printer size={18} /> Print / Save to PDF
            </button>
          </div>
        </div>

        {/* Customization Toolbar */}
        <div style={{
          marginTop: '1.5rem',
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
            <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.2)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', gap: '0.25rem' }}>
              <button
                onClick={() => setSelectedTemplate('MODERN')}
                style={{
                  background: selectedTemplate === 'MODERN' ? 'var(--primary-600)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Modern Tech
              </button>
              <button
                onClick={() => setSelectedTemplate('MINIMAL')}
                style={{
                  background: selectedTemplate === 'MINIMAL' ? 'var(--primary-600)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clean ATS Minimal
              </button>
              <button
                onClick={() => setSelectedTemplate('EXECUTIVE')}
                style={{
                  background: selectedTemplate === 'EXECUTIVE' ? 'var(--primary-600)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Classic Academic
              </button>
            </div>
          </div>

          {/* Section Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-200)' }}>Toggle:</span>
            {['objective', 'education', 'skills', 'projects', 'certifications'].map(sec => (
              <button
                key={sec}
                onClick={() => toggleSection(sec)}
                style={{
                  background: sectionsVisibility[sec] ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {sec} {sectionsVisibility[sec] ? '✓' : '✗'}
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
          maxWidth: '900px',
          margin: '0 auto',
          fontFamily: selectedTemplate === 'MINIMAL' ? 'var(--font-family)' : selectedTemplate === 'EXECUTIVE' ? 'Georgia, serif' : 'var(--font-family)',
          lineHeight: 1.5
        }}
      >
        {/* Header / Contact Info */}
        <header style={{
          borderBottom: selectedTemplate === 'MODERN' ? '3px solid var(--primary-600)' : selectedTemplate === 'EXECUTIVE' ? '2px solid #000000' : '1px solid #cbd5e1',
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
              fontSize: '2.2rem',
              fontWeight: 800,
              color: selectedTemplate === 'MODERN' ? 'var(--primary-800)' : '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              {profile?.name || 'Your Full Name'}
            </h1>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--slate-600)', marginTop: '0.25rem' }}>
              {profile?.headline || 'Aspiring Software Engineer & Problem Solver'}
            </div>
            {profile?.address && (
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} /> {profile.address}
              </div>
            )}
          </div>

          {/* Contact Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--slate-600)', textAlign: 'right' }}>
            {profile?.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Mail size={13} /> {profile.email}
              </div>
            )}
            {profile?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Phone size={13} /> {profile.phone}
              </div>
            )}
            {profile?.linkedin_url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Linkedin size={13} /> {profile.linkedin_url.replace('https://', '')}
              </div>
            )}
            {profile?.github_url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <Github size={13} /> {profile.github_url.replace('https://', '')}
              </div>
            )}
          </div>
        </header>

        {/* Professional Objective / Summary */}
        {sectionsVisibility.objective && (
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
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
              {customObjective}
            </p>
          </section>
        )}

        {/* Verified Education Credentials */}
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
              {education?.undergraduate && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {education.undergraduate.degree} in {education.undergraduate.department}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                      CGPA: <strong>{education.undergraduate.cgpa} / 10.0</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {education.undergraduate.college} • {education.undergraduate.university}
                  </div>
                </div>
              )}

              {/* 12th / Intermediate */}
              {education?.twelfth?.college && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Senior Secondary (12th Standard / Pre-University)
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                      Percentage: <strong>{education.twelfth.percentage}%</strong> ({education.twelfth.passing_year})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {education.twelfth.college} • Board: {education.twelfth.board}
                  </div>
                </div>
              )}

              {/* 10th / Secondary */}
              {education?.tenth?.school && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Secondary School Certificate (10th Standard)
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                      Percentage: <strong>{education.tenth.percentage}%</strong> ({education.tenth.passing_year})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {education.tenth.school} • Board: {education.tenth.board}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Verified Technical Skills */}
        {sectionsVisibility.skills && (
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.25rem 0.65rem',
                    backgroundColor: '#f1f5f9',
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

        {/* Featured Technical Projects */}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {proj.title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {proj.technologies}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                    {proj.description}
                  </p>
                  {(proj.github_url || proj.project_url) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', marginTop: '0.25rem' }}>
                      {proj.github_url && <span>Repo: {proj.github_url} </span>}
                      {proj.project_url && <span>• Demo: {proj.project_url}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Honors */}
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
              Certifications & Achievements
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {certifications.map((c) => (
                <div key={c.id} style={{ fontSize: '0.88rem', color: 'var(--slate-700)' }}>
                  • <strong>{c.name}</strong> — {c.issuing_organization} ({c.issue_date ? new Date(c.issue_date).toLocaleDateString() : ''})
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
    </div>
  );
};
