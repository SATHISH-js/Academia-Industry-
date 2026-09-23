import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FolderGit2, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  PlusCircle, 
  Trophy, 
  Sparkles, 
  Github,
  History,
  Activity,
  Calendar,
  Layers,
  GraduationCap,
  MapPin,
  Clock,
  BadgeCheck,
  ShieldCheck
} from 'lucide-react';

export const DigitalPortfolioPage = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('PORTFOLIO'); // 'PORTFOLIO', 'ACTIVITY_HISTORY'
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', github_url: '', project_url: '' });

  useEffect(() => {
    fetchPortfolioAndActivities();
  }, []);

  const fetchPortfolioAndActivities = async () => {
    try {
      setLoading(true);
      const [portRes, actRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/activity/history')
      ]);

      if (portRes.data.success) {
        setPortfolio(portRes.data.data);
      }
      if (actRes.data.success) {
        setActivities(actRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio and activities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/portfolio/projects', newProject);
      if (res.data.success) {
        setShowAddProject(false);
        setNewProject({ title: '', description: '', technologies: '', github_url: '', project_url: '' });
        fetchPortfolioAndActivities();
      }
    } catch (err) {
      console.error('Failed to add project', err);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ROADMAP': return <Layers size={18} color="var(--primary-600)" />;
      case 'MOCK_INTERVIEW': return <Sparkles size={18} color="var(--warning-600)" />;
      case 'ASSESSMENT': return <Award size={18} color="var(--accent-600)" />;
      case 'RESUME': return <FolderGit2 size={18} color="var(--success-600)" />;
      case 'APPLICATION': return <CheckCircle2 size={18} color="var(--primary-700)" />;
      default: return <Activity size={18} color="var(--slate-500)" />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-600)' }}>
        <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 600 }}>Loading verified digital portfolio & activity history...</p>
      </div>
    );
  }

  const { profile, skills = [], projects = [], certifications = [], achievements = [] } = portfolio || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--slate-900), var(--primary-900))',
        color: '#ffffff',
        padding: '2.5rem',
        border: 'none',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            <div style={{
              width: 86,
              height: 86,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {profile?.name ? profile.name.charAt(0) : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>{profile?.name}</h1>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
                  Verified Portfolio
                </span>
              </div>
              <p style={{ fontSize: '1.05rem', color: 'var(--primary-200)', marginTop: '0.25rem' }}>
                {profile?.headline || 'Aspiring Tech Professional'}
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.65rem', fontSize: '0.85rem', color: 'var(--slate-300)', flexWrap: 'wrap' }}>
                <span>{profile?.department} • {profile?.degree}</span>
                <span>CGPA: <strong>{profile?.cgpa || '8.85'}</strong></span>
                <span>Institution: {profile?.institution_name || 'Campus Engineering Institute'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Pill */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem', borderRadius: 'var(--radius-md)', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('PORTFOLIO')}
              style={{
                background: activeTab === 'PORTFOLIO' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Digital Portfolio
            </button>
            <button
              onClick={() => setActiveTab('ACTIVITY_HISTORY')}
              style={{
                background: activeTab === 'ACTIVITY_HISTORY' ? 'var(--primary-600)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <History size={15} /> App Activity & Usage History ({activities.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'PORTFOLIO' ? (
        <>
          {/* Verified Skills Bar */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary-600)" /> Verified Skill Proficiencies
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {skills?.map((s) => (
                <div key={s.id} style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--slate-50)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
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

          {/* Featured Projects */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderGit2 size={20} color="var(--primary-600)" /> Featured Technical Projects
              </h2>
              <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => setShowAddProject(!showAddProject)}>
                <PlusCircle size={15} /> Add Project
              </button>
            </div>

            {showAddProject && (
              <form onSubmit={handleCreateProject} style={{ padding: '1.25rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Add New Project</h4>
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <textarea className="form-control" rows={2} placeholder="Project Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Technologies (e.g. React, Python, PostgreSQL)" value={newProject.technologies} onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input type="url" className="form-control" style={{ flex: 1 }} placeholder="GitHub URL" value={newProject.github_url} onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })} />
                  <input type="url" className="form-control" style={{ flex: 1 }} placeholder="Live Demo URL" value={newProject.project_url} onChange={(e) => setNewProject({ ...newProject, project_url: e.target.value })} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddProject(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Project</button>
                </div>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {projects?.map((proj) => (
                <div key={proj.id} style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>{proj.title}</h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.85rem', margin: '0.5rem 0 0.75rem', lineHeight: 1.5 }}>
                    {proj.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                    Tech: <code>{proj.technologies}</code>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Github size={14} /> Repository
                      </a>
                    )}
                    {proj.project_url && (
                      <a href={proj.project_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ExternalLink size={14} /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Achievements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="var(--primary-600)" /> Certifications & Credentials
                </h2>
                <button
                  onClick={() => navigate('/student/certificate-verify')}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--primary-700)',
                    borderColor: 'var(--primary-300)'
                  }}
                >
                  <ShieldCheck size={15} color="var(--primary-600)" /> + AI Verify Certificate
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {certifications?.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '0.9rem 1rem',
                      border: `1.5px solid ${c.badge_awarded || c.is_verified ? 'var(--primary-300)' : 'var(--border-color)'}`,
                      backgroundColor: c.badge_awarded ? 'var(--primary-50)' : '#ffffff',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--slate-900)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                          {c.issuing_organization} • {c.issue_date ? new Date(c.issue_date).toLocaleDateString() : ''}
                        </div>
                      </div>
                      {(c.badge_awarded || c.is_verified) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: 'var(--primary-600)',
                          color: '#ffffff',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-xl)',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          <BadgeCheck size={14} /> {c.score_percentage ? `${c.score_percentage}% Verified` : 'Verified'}
                        </div>
                      )}
                    </div>
                    {c.certificate_url && (
                      <div style={{ marginTop: '0.6rem' }}>
                        <a
                          href={c.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-600)', fontWeight: 600 }}
                        >
                          <ExternalLink size={13} /> View Verified Document
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="var(--warning-600)" /> Honors & Achievements
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {achievements?.map((a) => (
                  <div key={a.id} style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>{a.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>{a.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* In-App Activity & Usage History Tab */
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <History size={22} color="var(--primary-600)" /> In-App Activity & Platform Usage History
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Complete chronological record of your actions, assessments, roadmap tasks, mock interviews, and resume updates across the platform.
              </p>
            </div>
            <span className="badge badge-primary">
              {activities.length} Recorded Events
            </span>
          </div>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
              No in-app activities recorded yet. Complete roadmap tasks or take assessments to build your activity history!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-light)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getActivityIcon(act.activity_type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                        {act.title}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} /> {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {act.description}
                    </p>
                    <div style={{ marginTop: '0.4rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        Category: {act.activity_type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
