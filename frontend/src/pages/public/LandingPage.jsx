import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  BarChart3, 
  Briefcase, 
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
    { label: 'Registered Students', value: '5,000+' },
    { label: 'Partner Companies', value: '200+' },
    { label: 'Active Opportunities', value: '1,200+' },
    { label: 'Accredited Institutions', value: '50+' },
  ];

  const features = [
    {
      icon: Award,
      title: 'Skill Assessment Engine',
      description: 'Standardized technical & soft skill assessments with instant objective scoring and skill proficiencies.'
    },
    {
      icon: BarChart3,
      title: 'Dynamic Skill-Gap Analysis',
      description: 'Real-time comparison between student competencies and industry requirements to highlight priority areas.'
    },
    {
      icon: Sparkles,
      title: 'Intelligent Matching Engine',
      description: 'Algorithmic compatibility scoring that matches qualified candidates with industry internships and jobs.'
    },
    {
      icon: Briefcase,
      title: 'Recruitment & Placements',
      description: 'Streamlined application workflow from application review, shortlisting, and interviews to final hiring.'
    },
    {
      icon: Users,
      title: 'Academician Collaborations',
      description: 'Faculty industrial training, FDPs, consultancies, guest lectures, and joint research sponsorships.'
    },
    {
      icon: TrendingUp,
      title: 'Institutional Analytics',
      description: 'Deep visibility into department-level skill readiness, placement statistics, and corporate engagement.'
    }
  ];

  const steps = [
    { step: '01', title: 'Assess', desc: 'Complete verified skill tests in coding, tech stacks, and soft skills.' },
    { step: '02', title: 'Discover Gaps', desc: 'Identify exact missing proficiencies required by top hiring companies.' },
    { step: '03', title: 'Learn', desc: 'Upskill through curated learning recommendations, workshops, and courses.' },
    { step: '04', title: 'Connect', desc: 'Bridge with industry mentors, hackathons, and research projects.' },
    { step: '05', title: 'Apply', desc: 'Submit applications for high-compatibility internships and career roles.' },
    { step: '06', title: 'Grow', desc: 'Track placement outcomes and build a verified lifelong digital portfolio.' },
  ];

  const roles = [
    {
      title: 'For Students',
      desc: 'Verify your skills, discover where you stand, eliminate skill gaps, and land internships & high-growth jobs.',
      link: '/register?role=STUDENT'
    },
    {
      title: 'For Academicians',
      desc: 'Connect with leading industries for sponsored research, faculty development programs, and guest lectures.',
      link: '/register?role=ACADEMICIAN'
    },
    {
      title: 'For Industries',
      desc: 'Access pre-assessed, verified student talent with instant compatibility rankings and hire without friction.',
      link: '/register?role=INDUSTRY'
    },
    {
      title: 'For Institutions',
      desc: 'Track student readiness, monitor placement trends, benchmark departments, and formalize corporate MoUs.',
      link: '/register?role=INSTITUTION'
    }
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
            <Sparkles size={16} /> Intelligent Higher-Ed & Corporate Ecosystem
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.6rem)',
            fontWeight: 800,
            color: 'var(--slate-900)',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            Bridging Academia and Industry Through <span style={{ color: 'var(--primary-600)' }}>Skills, Opportunities</span> and Collaboration
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--slate-600)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Connect students, academicians, institutions, and industry leaders through one unified platform with automated skill assessments, gap analysis, matching algorithms, and analytics.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Get Started Now <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Explore Platform Demo
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
