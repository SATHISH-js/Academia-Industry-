import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Briefcase, GraduationCap, Heart, Pencil, UserRound } from 'lucide-react';
import api from '../../services/api';

const Section = ({ icon: Icon, title, children }) => <section className="card" style={{ padding: '1.4rem' }}>
  <h2 style={{ display: 'flex', alignItems: 'center', gap: '.55rem', margin: '0 0 1rem', fontSize: '1.1rem' }}><Icon size={19} />{title}</h2>
  {children}
</section>;

export const TraineeProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/trainee/profile').then(res => setProfile(res.data.data)).catch(err => setError(err.response?.data?.error || 'Could not load your profile.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading trainee profile…</div>;
  if (error) return <div className="container" style={{ padding: '2rem' }} role="alert">{error}</div>;
  const hasContent = value => value || 'Not added yet';
  return <div className="container" style={{ maxWidth: 1050, padding: '2rem 1rem', display: 'grid', gap: '1rem' }}>
    <header className="card" style={{ padding: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {profile.avatar_url ? <img src={profile.avatar_url} alt="Profile" style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: '50%' }} /> : <div aria-hidden="true" style={{ width: 76, height: 76, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--primary-100)', color: 'var(--primary-700)', fontSize: '1.8rem' }}>{profile.name?.[0]?.toUpperCase()}</div>}
        <div><span className="badge badge-primary">TRAINEE PROFILE</span><h1 style={{ margin: '.5rem 0 .2rem' }}>{profile.name}</h1><div style={{ color: 'var(--slate-600)' }}>{profile.email}</div></div>
      </div>
      <Link className="btn btn-primary" to="/trainee/profile/edit"><Pencil size={16} /> Edit profile</Link>
    </header>
    <Section icon={UserRound} title="Personal"><p>{hasContent(profile.bio)}</p><div>{profile.phone || 'Phone not added'}</div></Section>
    <Section icon={GraduationCap} title="Qualification"><div><strong>{hasContent(profile.degree)}</strong>{profile.specialization ? ` · ${profile.specialization}` : ''}</div><div>{hasContent(profile.institution)}{profile.graduation_year ? ` · ${profile.graduation_year}` : ''}</div></Section>
    <Section icon={Briefcase} title="Work experience">{profile.experiences.length ? profile.experiences.map(item => <article key={item.id} style={{ borderBottom: '1px solid var(--border-color)', padding: '.7rem 0' }}><strong>{item.designation}</strong> · {item.organization}<div style={{ color: 'var(--slate-600)' }}>{item.start_date} — {item.end_date || 'Present'}</div>{item.description && <p>{item.description}</p>}</article>) : <p>No work experience added yet.</p>}</Section>
    <Section icon={Heart} title="Interests">{profile.interests.length ? <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>{profile.interests.map(item => <span className="badge badge-primary" key={item.id}>{item.name}</span>)}</div> : <p>No interests added yet.</p>}</Section>
    <Section icon={GraduationCap} title="Skills">{profile.skills.length ? <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>{profile.skills.map(item => <span className="badge badge-primary" key={item.id}>{item.name}</span>)}</div> : <p>No skills added yet.</p>}</Section>
    <Section icon={Award} title="Certificates">{profile.certificates.length ? profile.certificates.map(item => <article key={item.id} style={{ borderBottom: '1px solid var(--border-color)', padding: '.7rem 0' }}><strong>{item.title}</strong> · {item.issuing_organization}<div>{item.issue_date || 'Issue date not provided'} · {item.verification_status}</div>{item.credential_id && <div>Credential: {item.credential_id}</div>}{item.certificate_url && <a href={item.certificate_url} target="_blank" rel="noreferrer">View certificate</a>}</article>) : <p>No certificates added yet.</p>}</Section>
  </div>;
};
