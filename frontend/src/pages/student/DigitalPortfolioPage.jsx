import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FolderGit2, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  PlusCircle, 
  Trophy, 
  Sparkles, 
  Github,
  Linkedin,
  Mail,
  History,
  Activity,
  Calendar,
  Layers,
  GraduationCap,
  MapPin,
  Clock,
  BadgeCheck,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Edit3,
  Trash2,
  X,
  Globe,
  Briefcase,
  BookOpen,
  ArrowRight,
  UserCheck,
  Download
} from 'lucide-react';
import { ResumePreviewModal } from '../../components/common/ResumePreviewModal';

const PROJECT_IMAGE_PRESETS = [
  { name: 'SaaS Dashboard', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cloud & DevOps', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
  { name: 'AI & Machine Learning', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mobile & Responsive', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80' },
  { name: 'FinTech & Analytics', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' }
];

const COMMON_TECH_TAGS = ['React', 'Node.js', 'Python', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Express', 'MySQL', 'MongoDB', 'Docker', 'AWS', 'TensorFlow'];

export const DigitalPortfolioPage = ({ isPublic: propIsPublic = false }) => {
  const { studentId: paramStudentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPublicView = propIsPublic || Boolean(paramStudentId);
  const [portfolio, setPortfolio] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PROJECTS', 'CERTIFICATIONS', 'INTERNSHIPS', 'SKILLS'
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Project Modal State (Add or Edit)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    role: 'Full Stack Developer',
    description: '',
    technologies: '',
    github_url: '',
    project_url: '',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    featured: 1
  });
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, [paramStudentId]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      if (paramStudentId) {
        // Public fetch
        const res = await api.get(`/portfolio/${paramStudentId}`);
        if (res.data.success) {
          setPortfolio(res.data.data);
        }
      } else {
        // Authenticated student fetch
        const [portRes, actRes] = await Promise.all([
          api.get('/portfolio'),
          api.get('/activity/history').catch(() => ({ data: { success: false, data: [] } }))
        ]);

        if (portRes.data.success) {
          setPortfolio(portRes.data.data);
        }
        if (actRes.data.success) {
          setActivities(actRes.data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load portfolio data', err);
    } finally {
      setLoading(false);
    }
  };

  // Shareable Link Handling
  const studentProfileId = portfolio?.profile?.id || paramStudentId;
  const shareableUrl = `${window.location.origin}/portfolio/${studentProfileId}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      role: 'Full Stack Developer',
      description: '',
      technologies: 'React, Node.js, Express, MySQL',
      github_url: '',
      project_url: '',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      featured: 1
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj) => {
    setEditingProjectId(proj.id);
    setProjectForm({
      title: proj.title || '',
      role: proj.role || 'Full Stack Developer',
      description: proj.description || '',
      technologies: proj.technologies || '',
      github_url: proj.github_url || '',
      project_url: proj.project_url || '',
      image_url: proj.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      featured: proj.featured ? 1 : 0
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    try {
      setProjectSubmitting(true);
      if (editingProjectId) {
        await api.put(`/portfolio/projects/${editingProjectId}`, projectForm);
      } else {
        await api.post('/portfolio/projects', projectForm);
      }
      setIsProjectModalOpen(false);
      fetchPortfolioData();
    } catch (err) {
      console.error('Failed to save project', err);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove project "${title}"?`)) return;
    try {
      await api.delete(`/portfolio/projects/${id}`);
      fetchPortfolioData();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleAddTechTag = (tag) => {
    const current = projectForm.technologies ? projectForm.technologies.split(',').map(t => t.trim()) : [];
    if (!current.includes(tag)) {
      const updated = current.filter(Boolean).concat(tag).join(', ');
      setProjectForm(prev => ({ ...prev, technologies: updated }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={36} className="animate-spin" style={{ margin: '0 auto 1.25rem', color: 'var(--primary-600)' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-800)' }}>Loading Digital Portfolio...</h3>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Retrieving verified projects, certifications, and academic record.</p>
      </div>
    );
  }

  const { profile, skills = [], projects = [], certifications = [], achievements = [], internships = [] } = portfolio || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1180px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* 1. Shareable Link Alert Banner (Visible only for Owner in private mode) */}
      {!isPublicView && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
              <Globe size={18} /> Your Shareable Public Digital Portfolio
            </div>
            <p style={{ fontSize: '0.85rem', color: '#e0f2fe', margin: '0.2rem 0 0 0' }}>
              Share this public link with recruiters, mentors, and on your LinkedIn profile. External viewers can view all your projects, certifications, and skills without logging in.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              color: '#ffffff',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {shareableUrl}
            </div>

            <button
              onClick={handleCopyShareLink}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                color: '#0369a1',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '0.45rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {copiedLink ? <Check size={16} color="#059669" /> : <Copy size={16} />}
              {copiedLink ? 'Copied to Clipboard!' : 'Copy Share Link'}
            </button>

            <button
              onClick={() => setShowResumeModal(true)}
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                fontSize: '0.82rem',
                padding: '0.45rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
              title="Download ATS-optimized verified resume"
            >
              <Download size={15} /> Download Resume
            </button>

            <a
              href={`/portfolio/${studentProfileId}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.6)',
                color: '#ffffff',
                fontSize: '0.82rem',
                padding: '0.45rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <ExternalLink size={15} /> Preview Public View
            </a>
          </div>
        </div>
      )}

      {/* 2. Hero Profile Header (Responsive Card) */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              flexShrink: 0
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'
              )}
            </div>

            {/* Core Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                  {profile?.name || 'Student Name'}
                </h1>
                <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.25)', color: '#bae6fd', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <BadgeCheck size={14} /> Verified Candidate
                </span>
                {profile?.current_semester && (
                  <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}>
                    {profile.current_semester}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '1.05rem', color: '#e2e8f0', marginTop: '0.35rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                {profile?.headline || `${profile?.department || 'Computer Science'} Candidate`}
              </p>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={15} color="#38bdf8" /> {profile?.department} • {profile?.degree || 'B.Tech'}
                </span>
                {profile?.cgpa && (
                  <span>
                    CGPA: <strong style={{ color: '#38bdf8' }}>{profile.cgpa} / 10.0</strong>
                  </span>
                )}
                {profile?.institution_name && (
                  <span>Institution: {profile.institution_name}</span>
                )}
                {(profile?.city || profile?.address) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#f472b6" /> {profile.city ? `${profile.city}, ${profile.state || 'India'}` : profile.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Collaborate & Social Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowResumeModal(true)}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-500, #6366f1), var(--accent-500, #0ea5e9))',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  padding: '0.45rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                  cursor: 'pointer'
                }}
                title="Download verified student resume"
              >
                <Download size={16} /> Download Resume
              </button>

              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    backgroundColor: '#0a66c2',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: 'none'
                  }}
                >
                  <Linkedin size={16} /> Connect on LinkedIn
                </a>
              )}

              {profile?.github_url && (
                <a
                  href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    backgroundColor: '#24292e',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Github size={16} /> GitHub Profile
                </a>
              )}

              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="btn"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Mail size={16} /> Email Student
                </a>
              )}

              <button
                onClick={handleCopyShareLink}
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {copiedLink ? <Check size={16} color="#34d399" /> : <Share2 size={16} />}
                {copiedLink ? 'Link Copied!' : 'Share Portfolio'}
              </button>
            </div>

            {profile?.bio && (
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '480px', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Navigation Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', background: 'var(--slate-100)', padding: '0.3rem', borderRadius: 'var(--radius-md)', gap: '0.3rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Sections` },
            { id: 'PROJECTS', label: `Projects (${projects.length})` },
            { id: 'INTERNSHIPS', label: `Internships (${internships.length})` },
            { id: 'CERTIFICATIONS', label: `Certifications (${certifications.length})` },
            { id: 'SKILLS', label: `Verified Skills (${skills.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--slate-600)',
                border: 'none',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!isPublicView && (
          <button
            onClick={handleOpenAddProject}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <PlusCircle size={16} /> Add New Project
          </button>
        )}
      </div>

      {/* 4. Section: Featured Technical Projects (Front View Responsive Showcase) */}
      {(activeTab === 'ALL' || activeTab === 'PROJECTS') && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                <FolderGit2 size={24} color="var(--primary-600)" /> Featured Technical Projects ({projects.length})
              </h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Architected software systems, live production deployments, and open-source contributions.
              </p>
            </div>

            {!isPublicView && (
              <button
                onClick={handleOpenAddProject}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <PlusCircle size={15} /> Add Project
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
              <FolderGit2 size={40} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>No Projects Added Yet</h4>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1rem' }}>
                Add your technical projects with code repositories, screenshots, and live demo links to impress recruiters.
              </p>
              {!isPublicView && (
                <button onClick={handleOpenAddProject} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  <PlusCircle size={15} /> Add Your First Project
                </button>
              )}
            </div>
          ) : (
            /* Responsive Front View Project Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {projects.map((proj) => {
                const techList = proj.technologies ? proj.technologies.split(',').map(t => t.trim()).filter(Boolean) : [];
                return (
                  <div
                    key={proj.id}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: '1px solid var(--border-color)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    {/* Visual Mockup Header Image */}
                    <div style={{
                      position: 'relative',
                      height: '180px',
                      backgroundColor: 'var(--slate-900)',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={proj.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
                        alt={proj.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                      />
                      
                      {/* Top Badges */}
                      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          color: '#ffffff',
                          backdropFilter: 'blur(4px)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {proj.role || 'Full Stack'}
                        </span>

                        {proj.featured ? (
                          <span style={{
                            backgroundColor: 'rgba(234, 179, 8, 0.95)',
                            color: '#713f12',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            ★ Featured
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Card Content Front View */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0, lineHeight: 1.3 }}>
                          {proj.title}
                        </h3>
                        {!isPublicView && (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditProject(proj)}
                              style={{ background: 'none', border: 'none', color: 'var(--slate-500)', cursor: 'pointer', padding: '0.2rem' }}
                              title="Edit Project"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              style={{ background: 'none', border: 'none', color: 'var(--danger-500)', cursor: 'pointer', padding: '0.2rem' }}
                              title="Delete Project"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      <p style={{
                        color: 'var(--slate-600)',
                        fontSize: '0.85rem',
                        marginTop: '0.5rem',
                        marginBottom: '0.85rem',
                        lineHeight: 1.5,
                        flex: 1
                      }}>
                        {proj.description}
                      </p>

                      {/* Tech Stack Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                        {techList.map((tech, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: 'var(--slate-100)',
                              color: 'var(--slate-700)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Action Links Bar */}
                      <div style={{
                        display: 'flex',
                        gap: '0.65rem',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.85rem'
                      }}>
                        {proj.project_url && (
                          <a
                            href={proj.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                            style={{
                              flex: 1,
                              fontSize: '0.8rem',
                              padding: '0.4rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <ExternalLink size={14} /> Live Demo
                          </a>
                        )}

                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                            style={{
                              flex: 1,
                              fontSize: '0.8rem',
                              padding: '0.4rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Github size={14} /> Source Code
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Section: Completed Internships & Work Experience */}
      {(activeTab === 'ALL' || activeTab === 'INTERNSHIPS') && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                <Briefcase size={22} color="var(--primary-600)" /> Completed Internships & Industry Experience ({internships.length})
              </h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Corporate engagements, industry mentorship projects, and verifiable work experience.
              </p>
            </div>
          </div>

          {internships.length === 0 ? (
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              No completed internships recorded yet. Once student finishes an internship or an application is accepted, it displays here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {internships.map((intern, i) => (
                <div
                  key={intern.id || i}
                  style={{
                    padding: '1.25rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                      {intern.role} <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>@ {intern.company_name}</span>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                      {intern.duration || 'Internship'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--slate-500)', flexWrap: 'wrap' }}>
                    {intern.location && <span>📍 {intern.location}</span>}
                    {intern.technologies_used && <span>💻 Tech: {intern.technologies_used}</span>}
                  </div>

                  {intern.description && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', margin: '0.4rem 0 0 0', lineHeight: 1.5 }}>
                      {intern.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Section: Verified Skill Proficiencies */}
      {(activeTab === 'ALL' || activeTab === 'SKILLS') && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Sparkles size={22} color="var(--primary-600)" /> Verified Skill Proficiencies ({skills.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {skills.map((s) => (
              <div key={s.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                  <span>{s.skill_name}</span>
                  <span style={{ color: 'var(--primary-600)' }}>{s.score}%</span>
                </div>
                <div style={{ width: '100%', height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${s.score}%`, height: '100%', backgroundColor: 'var(--primary-600)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.4rem' }}>
                  <span>Level: <strong>{s.level || 'Intermediate'}</strong></span>
                  <span>{s.category_name || 'Core Tech'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Section: Certifications & Competitions */}
      {(activeTab === 'ALL' || activeTab === 'CERTIFICATIONS') && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Award size={22} color="var(--primary-600)" /> Certifications, Competitions & Extra-Curriculars ({certifications.length + achievements.length})
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            {certifications.map((c) => (
              <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--slate-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <BadgeCheck size={18} color="var(--success-600)" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--slate-900)' }}>{c.name}</h4>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                  Issuer: <strong>{c.issuing_organization}</strong>
                </div>
                {c.issue_date && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
                    Issued: {new Date(c.issue_date).toLocaleDateString()}
                  </div>
                )}
                {c.credential_url && (
                  <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.4rem' }}>
                    <ExternalLink size={12} /> Verify Credential
                  </a>
                )}
              </div>
            ))}

            {achievements.map((a) => (
              <div key={a.id} style={{ padding: '1rem', border: '1px solid #fef08a', borderRadius: 'var(--radius-md)', backgroundColor: '#fefce8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Trophy size={18} color="#ca8a04" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#854d0e' }}>{a.title}</h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#713f12', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Add / Edit Project Modal */}
      {isProjectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  {editingProjectId ? 'Edit Technical Project' : 'Add Technical Project to Portfolio'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '0.2rem 0 0 0' }}>
                  Showcase your work with code repository, demo link, and responsive preview image.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Project Title & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Project Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Adaptive Learning AI Engine"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Your Role</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Full Stack Developer, AI Lead"
                    value={projectForm.role}
                    onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                  />
                </div>
              </div>

              {/* Technologies */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, Node.js, Express, PostgreSQL, Redis"
                  value={projectForm.technologies}
                  onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                />
                {/* Quick Add Tech Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', alignSelf: 'center' }}>Quick Add:</span>
                  {COMMON_TECH_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTechTag(tag)}
                      style={{
                        background: 'var(--slate-100)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        color: 'var(--slate-700)'
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Preview Selector */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Front View Preview Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={projectForm.image_url}
                  onChange={(e) => setProjectForm({ ...projectForm, image_url: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', alignSelf: 'center' }}>Presets:</span>
                  {PROJECT_IMAGE_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setProjectForm(prev => ({ ...prev, image_url: preset.url }))}
                      style={{
                        background: projectForm.image_url === preset.url ? 'var(--primary-100)' : 'var(--slate-100)',
                        borderColor: projectForm.image_url === preset.url ? 'var(--primary-500)' : 'var(--border-color)',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderRadius: '4px',
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        color: projectForm.image_url === preset.url ? 'var(--primary-700)' : 'var(--slate-700)',
                        fontWeight: projectForm.image_url === preset.url ? 700 : 500
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Project Description & Highlights</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Built an automated grading and assessment system supporting 5,000+ active student submissions with real-time feedback..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>

              {/* GitHub and Live Demo URLs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>GitHub Repository URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://github.com/username/project"
                    value={projectForm.github_url}
                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Live Demo URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://myproject.vercel.app"
                    value={projectForm.project_url}
                    onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })}
                  />
                </div>
              </div>

              {/* Featured checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={projectForm.featured === 1}
                  onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked ? 1 : 0 })}
                />
                <span style={{ fontWeight: 600 }}>Mark as Featured Project on Portfolio</span>
              </label>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={projectSubmitting}
                >
                  {projectSubmitting ? 'Saving...' : editingProjectId ? 'Update Project' : 'Add Project to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Preview & Download Modal */}
      {showResumeModal && (
        <ResumePreviewModal
          studentId={studentProfileId}
          studentData={portfolio}
          onClose={() => setShowResumeModal(false)}
        />
      )}

    </div>
  );
};
