import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FolderGit2, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  PlusCircle, 
  Trophy, 
  Sparkles, 
  Github 
} from 'lucide-react';

export const DigitalPortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', github_url: '', project_url: '' });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      if (res.data.success) {
        setPortfolio(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio', err);
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
        fetchPortfolio();
      }
    } catch (err) {
      console.error('Failed to add project', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading digital portfolio...</div>;
  }

  const { profile, skills, projects, certifications, achievements } = portfolio || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--slate-900), var(--primary-900))',
        color: '#ffffff',
        padding: '2.5rem',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          backgroundColor: 'var(--primary-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 800,
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {profile?.name ? profile.name.charAt(0) : 'S'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{profile?.name}</h1>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
              Verified Portfolio
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: 'var(--primary-200)', marginTop: '0.25rem' }}>
            {profile?.headline}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--slate-300)' }}>
            <span>{profile?.department} • {profile?.degree}</span>
            <span>CGPA: <strong>{profile?.cgpa}</strong></span>
            <span>Institution: {profile?.institution_name || 'NIT'}</span>
          </div>
        </div>
      </div>

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
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="url" className="form-control" placeholder="GitHub URL" value={newProject.github_url} onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })} />
              <input type="url" className="form-control" placeholder="Live Demo URL" value={newProject.project_url} onChange={(e) => setNewProject({ ...newProject, project_url: e.target.value })} />
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--primary-600)" /> Certifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {certifications?.map((c) => (
              <div key={c.id} style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{c.issuing_organization} • {c.issue_date ? new Date(c.issue_date).toLocaleDateString() : ''}</div>
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
    </div>
  );
};
