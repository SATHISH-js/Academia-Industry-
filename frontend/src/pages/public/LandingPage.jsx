import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  BarChart3, 
  Briefcase, 
  BookOpen,
  Building2, 
  CheckCircle2, 
  GraduationCap, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ArrowRight 
} from 'lucide-react';

export const LandingPage = () => {
  const stats = [
    { label: 'Guided learning', value: 'Programs' },
    { label: 'Expert support', value: 'Trainers' },
    { label: 'Progress tracking', value: 'Skills' },
    { label: 'Achievement records', value: 'Credentials' },
  ];

  const features = [
    {
      icon: Award,
      title: 'Skill Assessment Engine',
      description: 'Standardized technical & soft skill assessments with instant objective scoring and skill proficiencies.'
    },
    {
      icon: BarChart3,
      title: 'Competency Progress',
      description: 'Track learning progress and build evidence of practical skills over time.'
    },
    {
      icon: Sparkles,
      title: 'Guided Programs',
      description: 'Join structured programs designed around clear competencies and skill levels.'
    },
    {
      icon: BookOpen,
      title: 'Practical Learning',
      description: 'Build knowledge through focused lessons, exercises, and measurable milestones.'
    },
    {
      icon: Users,
      title: 'Trainer Workspace',
      description: 'Publish training programs and support learners as they build new competencies.'
    },
    {
      icon: TrendingUp,
      title: 'Platform Administration',
      description: 'Review trainer applications and manage platform accounts.'
    }
  ];

  const steps = [
    { step: '01', title: 'Assess', desc: 'Complete verified skill tests in coding, tech stacks, and soft skills.' },
    { step: '02', title: 'Choose', desc: 'Find a program suited to your current skill level.' },
    { step: '03', title: 'Learn', desc: 'Follow guided programs created by trainers.' },
    { step: '04', title: 'Practice', desc: 'Apply new concepts through focused practice.' },
    { step: '05', title: 'Track', desc: 'Record your progress as you work through a program.' },
    { step: '06', title: 'Grow', desc: 'Build skills with a clear record of completed learning.' },
  ];

  const roles = [
    {
      title: 'For Trainees',
      desc: 'Build practical skills, join guided programs, and track your competency progress.',
      link: '/register?role=TRAINEE'
    },
    {
      title: 'For Trainers',
      desc: 'Share your expertise through structured programs and support learner growth.',
      link: '/register?role=TRAINER'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '5rem 1.5rem 6rem'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
            border: '1px solid var(--primary-200)',
            color: 'var(--primary-700)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Sparkles size={16} /> Training and competency platform
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.6rem)',
            fontWeight: 800,
            color: 'var(--slate-900)',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            Build practical skills through <span style={{ color: 'var(--primary-600)' }}>guided training</span> and measurable progress
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--slate-600)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Join structured training programs, learn from experienced trainers, and track competency growth in one place.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Get Started Now <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="card" style={{ padding: '2rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-600)', marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Core Features */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-primary">Comprehensive Platform</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--slate-900)' }}>
            Empowering Every Stakeholder in the Talent Supply Chain
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works Workflow */}
      <section style={{ backgroundColor: 'var(--slate-900)', color: '#ffffff', padding: '5rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-warning">Workflow</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', color: '#ffffff' }}>
              How the Ecosystem Works
            </h2>
            <p style={{ color: 'var(--slate-400)', marginTop: '0.5rem', fontSize: '1rem' }}>
              From initial self-assessment to industry hiring and institutional insights.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.75rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-400)', marginBottom: '0.75rem' }}>
                  {s.step}
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {s.title}
                </h4>
                <p style={{ color: 'var(--slate-300)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Roles Breakdown */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-primary">Tailored Experiences</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--slate-900)' }}>
            Built for 4 Primary Ecosystem Stakeholders
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {roles.map((r, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
                  {r.title}
                </h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {r.desc}
                </p>
              </div>
              <Link to={r.link} className="btn btn-outline" style={{ width: '100%', fontSize: '0.875rem' }}>
                Join as {r.title.replace('For ', '')}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
