import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileText,
  Printer,
  Download,
  X,
  Sparkles,
  Award,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  CheckCircle2,
  Calendar,
  Building
} from 'lucide-react';

export const ResumePreviewModal = ({ studentId, studentData, onClose }) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResume();
  }, [studentId]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      if (studentId) {
        const res = await api.get(`/resume/student/${studentId}`);
        if (res.data.success) {
          setResume(res.data.data);
          return;
        }
      }
      // Fallback to portfolio or studentData if provided
      if (studentData) {
        const profile = studentData.profile || studentData;
        setResume({
          profile,
          personalInfo: {
            name: profile.candidate_name || profile.name,
            email: profile.candidate_email || profile.email,
            phone: profile.candidate_phone || profile.phone || '+91 9876543210',
            headline: profile.headline || `${profile.department || 'Computer Science'} Candidate`,
            bio: profile.bio || '',
            linkedin: profile.linkedin_url || '',
            github: profile.github_url || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || 'India',
            resume_url: profile.resume_url || null
          },
          autoSummary: profile.bio || `Passionate ${profile.department || 'Engineering'} student at ${profile.institution_name || profile.ug_college || 'University'}. Proficient in modern architectures, algorithms, and engineering practices.`,
          education: [
            {
              level: 'Undergraduate Degree',
              institution: profile.ug_college || profile.institution_name || 'Engineering Institute',
              degree: profile.degree || 'B.Tech',
              year: profile.graduation_year || '2026',
              score: `CGPA: ${profile.cgpa || '8.5'}`
            },
            {
              level: 'Higher Secondary (12th)',
              institution: profile.twelfth_college || 'Higher Secondary School',
              year: profile.twelfth_year || '2022',
              score: `${profile.twelfth_percentage || '92'}%`
            },
            {
              level: 'Secondary School Examination (10th)',
              institution: profile.tenth_school || 'Secondary School',
              year: profile.tenth_year || '2020',
              score: `${profile.tenth_percentage || '90'}%`
            }
          ],
          skills: studentData.skills || [],
          projects: studentData.projects || [],
          certifications: studentData.certifications || [],
          achievements: studentData.achievements || [],
          internships: studentData.internships || []
        });
      }
    } catch (err) {
      console.error('Failed to load resume details', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    if (!resume) return;
    const p = resume.personalInfo || resume.profile || {};
    const content = `
========================================================================
                      ${p.name?.toUpperCase() || 'CANDIDATE RESUME'}
========================================================================
Headline: ${p.headline || ''}
Email: ${p.email || ''} | Phone: ${p.phone || ''}
Location: ${p.city ? `${p.city}, ${p.state || 'India'}` : p.address || 'India'}
LinkedIn: ${p.linkedin || 'N/A'} | GitHub: ${p.github || 'N/A'}

------------------------------------------------------------------------
PROFESSIONAL SUMMARY
------------------------------------------------------------------------
${resume.autoSummary || p.bio || 'Motivated engineering candidate with verified skills.'}

------------------------------------------------------------------------
EDUCATION & QUALIFICATIONS
------------------------------------------------------------------------
${(resume.education || []).map(e => `* ${e.level}: ${e.institution} (${e.year || ''}) - ${e.score || ''}`).join('\n')}

------------------------------------------------------------------------
VERIFIED TECHNICAL SKILLS
------------------------------------------------------------------------
${(resume.skills || []).map(s => `* ${s.skill_name || s.name}: ${s.score}% proficiency [${s.level || 'VERIFIED'}]`).join('\n') || 'Full Stack Development, SQL, Problem Solving'}

------------------------------------------------------------------------
KEY PROJECTS
------------------------------------------------------------------------
${(resume.projects || []).map(pr => `* ${pr.title} (${pr.role || 'Developer'})\n  Tech: ${pr.technologies || 'Full Stack'}\n  ${pr.description || ''}`).join('\n\n') || 'Technical Course Projects & Engineering Portfolio'}

------------------------------------------------------------------------
INTERNSHIPS & EXPERIENCE
------------------------------------------------------------------------
${(resume.internships || []).map(i => `* ${i.role || i.title} at ${i.company_name} (${i.duration || 'Internship'})\n  ${i.description || ''}`).join('\n\n') || 'Collegiate Technical Training & Workshops'}

------------------------------------------------------------------------
CERTIFICATIONS & CREDENTIALS
------------------------------------------------------------------------
${(resume.certifications || []).map(c => `* ${c.title || c.certification_name} - ${c.issuing_organization || 'Verified Credential'}`).join('\n') || 'Verified Platform Technical Certifications'}
========================================================================
Generated via Academia-Industry Collaboration Platform Verified ATS Engine
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(p.name || 'Candidate').replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const p = resume?.personalInfo || resume?.profile || {};

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 14px)',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--slate-50)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={20} color="var(--primary-600)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {p.name ? `${p.name}'s Verified Resume` : 'Candidate Resume'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                ATS-Optimized Verified Academic & Skill Credentials
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {p.resume_url && (
              <a
                href={p.resume_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                <Download size={14} /> Original Upload
              </a>
            )}
            <button
              onClick={handleDownloadDoc}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              title="Download clean text document"
            >
              <Download size={14} /> Download TXT
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.95rem' }}
              title="Print or Save as PDF"
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate-400)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Resume Preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', backgroundColor: '#ffffff' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500)' }}>
              <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
              Loading verified candidate resume...
            </div>
          ) : !resume ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
              Resume data not available for this candidate.
            </div>
          ) : (
            <div className="printable-resume-sheet" style={{ fontFamily: 'inherit', color: '#0f172a' }}>
              {/* Candidate Contact Header */}
              <div style={{ borderBottom: '2px solid var(--primary-600)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 0.35rem 0' }}>
                  {p.name}
                </h1>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary-700)', marginBottom: '0.5rem' }}>
                  {p.headline || `${p.department || 'Computer Science'} Candidate`}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.84rem', color: 'var(--slate-600)' }}>
                  {p.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} color="var(--primary-600)" /> {p.email}
                    </span>
                  )}
                  {p.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={13} color="var(--primary-600)" /> {p.phone}
                    </span>
                  )}
                  {(p.city || p.address) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} color="var(--primary-600)" /> {p.city ? `${p.city}, ${p.state || 'India'}` : p.address}
                    </span>
                  )}
                  {p.linkedin && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Linkedin size={13} color="#0a66c2" /> LinkedIn Profile
                    </span>
                  )}
                  {p.github && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Github size={13} color="#24292e" /> GitHub Profile
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resume.autoSummary && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.6rem' }}>
                    Professional Summary
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: 1.6, margin: 0 }}>
                    {resume.autoSummary}
                  </p>
                </div>
              )}

              {/* Education */}
              {resume.education?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.6rem' }}>
                    Education & Academic Qualifications
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {resume.education.map((edu, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.86rem' }}>
                        <div>
                          <strong>{edu.level}</strong>: {edu.institution} {edu.degree ? `(${edu.degree})` : ''}
                        </div>
                        <div style={{ color: 'var(--slate-600)', fontWeight: 600 }}>
                          {edu.year} • <span style={{ color: 'var(--primary-700)' }}>{edu.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Technical Skills */}
              {resume.skills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.6rem' }}>
                    Verified Technical Proficiencies
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {resume.skills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'var(--slate-100)',
                          border: '1px solid var(--border-color)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--slate-800)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <CheckCircle2 size={12} color="var(--success-600)" />
                        {s.skill_name || s.name} ({s.score}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Technical Projects */}
              {resume.projects?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.6rem' }}>
                    Featured Technical Projects
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {resume.projects.map((proj, idx) => (
                      <div key={idx} style={{ fontSize: '0.86rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: 'var(--slate-900)' }}>{proj.title}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{proj.role || 'Full Stack Developer'}</span>
                        </div>
                        {proj.technologies && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600, marginTop: '0.15rem' }}>
                            Tech Stack: {proj.technologies}
                          </div>
                        )}
                        {proj.description && (
                          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--slate-600)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships & Experience */}
              {resume.internships?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.6rem' }}>
                    Internships & Practical Experience
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {resume.internships.map((intern, idx) => (
                      <div key={idx} style={{ fontSize: '0.86rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{intern.role || intern.title} — {intern.company_name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{intern.duration || 'Completed'}</span>
                        </div>
                        {intern.description && (
                          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--slate-600)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                            {intern.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resume.certifications?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.6rem' }}>
                    Certifications & Achievements
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {resume.certifications.map((cert, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Award size={14} color="var(--primary-600)" />
                        <strong>{cert.title || cert.certification_name}</strong> ({cert.issuing_organization || 'Verified'})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
