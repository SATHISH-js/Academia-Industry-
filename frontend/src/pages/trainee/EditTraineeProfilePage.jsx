import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const fieldStyle = { width: '100%', padding: '.7rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginTop: '.3rem' };
const Field = ({ label, ...props }) => <label style={{ display: 'block', marginBottom: '.85rem' }}>{label}<input {...props} style={fieldStyle} /></label>;
const TextField = ({ label, ...props }) => <label style={{ display: 'block', marginBottom: '.85rem' }}>{label}<textarea {...props} style={{ ...fieldStyle, minHeight: 90, resize: 'vertical' }} /></label>;
const Section = ({ title, children }) => <section className="card" style={{ padding: '1.4rem' }}><h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>{title}</h2>{children}</section>;
const emptyExperience = { organization: '', designation: '', start_date: '', end_date: '', description: '' };
const emptyCertificate = { title: '', issuing_organization: '', issue_date: '', credential_id: '', certificate_url: '' };

export const EditTraineeProfilePage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [personal, setPersonal] = useState({ name: '', phone: '', bio: '', degree: '', institution: '', specialization: '', graduation_year: '', avatar_url: '' });
  const [skill, setSkill] = useState('');
  const [interest, setInterest] = useState('');
  const [experience, setExperience] = useState(emptyExperience);
  const [experienceId, setExperienceId] = useState(null);
  const [certificate, setCertificate] = useState(emptyCertificate);
  const [certificateId, setCertificateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const { data } = await api.get('/trainee/profile');
    const p = data.data;
    setProfile(p);
    setPersonal({ name: p.name || '', phone: p.phone || '', bio: p.bio || '', degree: p.degree || '', institution: p.institution || '', specialization: p.specialization || '', graduation_year: p.graduation_year || '', avatar_url: p.avatar_url || '' });
  };
  useEffect(() => { load().catch(err => setError(err.response?.data?.error || 'Could not load profile.')).finally(() => setLoading(false)); }, []);

  const run = async action => {
    setError(''); setSuccess('');
    try { setSaving(true); await action(); await load(); setSuccess('Profile saved.'); }
    catch (err) { setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Could not save this change.'); }
    finally { setSaving(false); }
  };
  const updateField = e => setPersonal({ ...personal, [e.target.name]: e.target.value });
  const uploadPhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { setError('Choose a PNG, JPEG, or WebP image under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setPersonal(value => ({ ...value, avatar_url: reader.result }));
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading profile editor…</div>;
  return <div className="container" style={{ maxWidth: 900, padding: '2rem 1rem', display: 'grid', gap: '1rem' }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}><Link to="/trainee/profile"><ArrowLeft size={18} /> Profile</Link><h1 style={{ margin: 0 }}>Edit professional profile</h1></header>
    {error && <div role="alert" className="badge badge-danger" style={{ padding: '.8rem' }}>{error}</div>}{success && <div role="status" className="badge badge-primary" style={{ padding: '.8rem' }}>{success}</div>}
    <Section title="Personal and qualification"><form onSubmit={e => { e.preventDefault(); run(async () => { await api.put('/trainee/profile', { ...personal, graduation_year: personal.graduation_year || null, phone: personal.phone || null, avatar_url: personal.avatar_url || null }); updateUser({ name: personal.name, phone: personal.phone, avatar_url: personal.avatar_url }); }); }}>
      <Field label="Full name" name="name" required minLength={2} maxLength={120} value={personal.name} onChange={updateField} />
      <Field label="Email" type="email" value={profile?.email || ''} readOnly />
      <Field label="Phone" name="phone" type="tel" value={personal.phone} onChange={updateField} />
      <TextField label="Bio" name="bio" maxLength={3000} value={personal.bio} onChange={updateField} />
      <label style={{ display: 'block', marginBottom: '.8rem' }}>Profile photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} style={{ ...fieldStyle, padding: '.45rem' }} /></label>
      {personal.avatar_url && <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '1rem' }}><img src={personal.avatar_url} alt="Profile preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%' }} /><button type="button" className="btn btn-secondary" onClick={() => setPersonal({ ...personal, avatar_url: '' })}>Remove photo</button></div>}
      <h3>Qualification</h3>
      <Field label="Degree" name="degree" maxLength={100} value={personal.degree} onChange={updateField} />
      <Field label="Institution" name="institution" maxLength={200} value={personal.institution} onChange={updateField} />
      <Field label="Specialization" name="specialization" maxLength={200} value={personal.specialization} onChange={updateField} />
      <Field label="Graduation year" name="graduation_year" type="number" min="1950" max="2100" value={personal.graduation_year} onChange={updateField} />
      <button className="btn btn-primary" disabled={saving}>Save personal and qualification details</button>
    </form>
    </Section>

    <Section title="Skills"><form onSubmit={e => { e.preventDefault(); if (!skill.trim()) return; run(async () => { await api.post('/trainee/profile/skills', { name: skill.trim() }); setSkill(''); }); }} style={{ display: 'flex', gap: '.5rem' }}><Field label="Add a skill" value={skill} maxLength={100} onChange={e => setSkill(e.target.value)} placeholder="e.g. JavaScript" /><button className="btn btn-primary" style={{ alignSelf: 'start', marginTop: '1.5rem' }} aria-label="Add skill"><Plus /></button></form><div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>{profile?.skills.map(item => <span className="badge badge-primary" key={item.id}>{item.name}<button type="button" aria-label={`Remove ${item.name}`} onClick={() => run(() => api.delete(`/trainee/profile/skills/${item.id}`))} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><Trash2 size={13} /></button></span>)}</div></Section>

    <Section title="Interests"><form onSubmit={e => { e.preventDefault(); if (!interest.trim()) return; run(async () => { await api.post('/trainee/profile/interests', { name: interest.trim() }); setInterest(''); }); }} style={{ display: 'flex', gap: '.5rem' }}><Field label="Add an interest" value={interest} maxLength={100} onChange={e => setInterest(e.target.value)} placeholder="e.g. Product design" /><button className="btn btn-primary" style={{ alignSelf: 'start', marginTop: '1.5rem' }} aria-label="Add interest"><Plus /></button></form><div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>{profile?.interests.map(item => <span className="badge badge-primary" key={item.id}>{item.name}<button type="button" aria-label={`Remove ${item.name}`} onClick={() => run(() => api.delete(`/trainee/profile/interests/${item.id}`))} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><Trash2 size={13} /></button></span>)}</div></Section>

    <Section title="Work experience"><form onSubmit={e => { e.preventDefault(); run(async () => { await api.request({ method: experienceId ? 'put' : 'post', url: experienceId ? `/trainee/profile/experiences/${experienceId}` : '/trainee/profile/experiences', data: experience }); setExperience(emptyExperience); setExperienceId(null); }); }}>
      <Field label="Organization" required maxLength={180} value={experience.organization} onChange={e => setExperience({ ...experience, organization: e.target.value })} />
      <Field label="Designation" required maxLength={150} value={experience.designation} onChange={e => setExperience({ ...experience, designation: e.target.value })} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.75rem' }}><Field label="Start date" type="date" required value={experience.start_date} onChange={e => setExperience({ ...experience, start_date: e.target.value })} /><Field label="End date" type="date" value={experience.end_date || ''} onChange={e => setExperience({ ...experience, end_date: e.target.value })} /></div>
      <TextField label="Description" maxLength={3000} value={experience.description} onChange={e => setExperience({ ...experience, description: e.target.value })} />
      <button className="btn btn-primary">{experienceId ? 'Update experience' : 'Add experience'}</button>{experienceId && <button type="button" className="btn btn-secondary" onClick={() => { setExperience(emptyExperience); setExperienceId(null); }}>Cancel</button>}
    </form>{profile?.experiences.map(item => <article key={item.id} style={{ borderTop: '1px solid var(--border-color)', padding: '.8rem 0', display: 'flex', justifyContent: 'space-between', gap: '.5rem' }}><div><strong>{item.designation}</strong> · {item.organization}<div>{item.start_date} — {item.end_date || 'Present'}</div></div><div><button className="btn btn-secondary" type="button" onClick={() => { setExperience({ organization: item.organization, designation: item.designation, start_date: item.start_date, end_date: item.end_date || '', description: item.description || '' }); setExperienceId(item.id); }}>Edit</button> <button className="btn btn-secondary" type="button" onClick={() => run(() => api.delete(`/trainee/profile/experiences/${item.id}`))}>Delete</button></div></article>)}</Section>

    <Section title="Certificates"><form onSubmit={e => { e.preventDefault(); run(async () => { await api.request({ method: certificateId ? 'put' : 'post', url: certificateId ? `/trainee/profile/certificates/${certificateId}` : '/trainee/profile/certificates', data: certificate }); setCertificate(emptyCertificate); setCertificateId(null); }); }}>
      <Field label="Certificate title" required maxLength={180} value={certificate.title} onChange={e => setCertificate({ ...certificate, title: e.target.value })} />
      <Field label="Issuing organization" required maxLength={150} value={certificate.issuing_organization} onChange={e => setCertificate({ ...certificate, issuing_organization: e.target.value })} />
      <Field label="Issue date" type="date" value={certificate.issue_date} onChange={e => setCertificate({ ...certificate, issue_date: e.target.value })} />
      <Field label="Credential/reference" maxLength={100} value={certificate.credential_id} onChange={e => setCertificate({ ...certificate, credential_id: e.target.value })} />
      <Field label="Certificate file URL (optional)" type="url" maxLength={255} value={certificate.certificate_url} onChange={e => setCertificate({ ...certificate, certificate_url: e.target.value })} />
      <button className="btn btn-primary">{certificateId ? 'Update certificate' : 'Add certificate'}</button>{certificateId && <button type="button" className="btn btn-secondary" onClick={() => { setCertificate(emptyCertificate); setCertificateId(null); }}>Cancel</button>}
    </form>{profile?.certificates.map(item => <article key={item.id} style={{ borderTop: '1px solid var(--border-color)', padding: '.8rem 0', display: 'flex', justifyContent: 'space-between', gap: '.5rem' }}><div><strong>{item.title}</strong> · {item.issuing_organization}<div>{item.issue_date || 'Date not provided'} · {item.verification_status}</div>{item.certificate_url && <a href={item.certificate_url} target="_blank" rel="noreferrer">View certificate</a>}</div><div><button className="btn btn-secondary" type="button" onClick={() => { setCertificate({ title: item.title, issuing_organization: item.issuing_organization, issue_date: item.issue_date || '', credential_id: item.credential_id || '', certificate_url: item.certificate_url || '' }); setCertificateId(item.id); }}>Edit</button> <button className="btn btn-secondary" type="button" onClick={() => run(() => api.delete(`/trainee/profile/certificates/${item.id}`))}>Delete</button></div></article>)}</Section>
    <button className="btn btn-secondary" onClick={() => navigate('/trainee/profile')}>Finish editing</button>
  </div>;
};
