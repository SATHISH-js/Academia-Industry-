import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const inputStyle = { width: '100%', padding: '.65rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' };
const blankExperience = { organization: '', designation: '', start_date: '', end_date: '', description: '' };

export const TrainerProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [experience, setExperience] = useState(blankExperience);
  const [item, setItem] = useState({ item_type: 'SKILL', title: '', issuing_organization: '', issue_date: '', credential_reference: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const load = async () => { const response = await api.get('/trainer/profile'); setProfile(response.data.data); setForm(response.data.data); };
  useEffect(() => { load().catch(err => setError(err.response?.data?.error || 'Could not load trainer profile.')); }, []);
  const saveProfile = async e => { e.preventDefault(); setSaving(true); setError(''); try { await api.put('/trainer/profile', form); await load(); setMessage('Profile saved.'); } catch (err) { setError(err.response?.data?.error || 'Could not save profile.'); } finally { setSaving(false); } };
  const saveExperience = async e => { e.preventDefault(); setError(''); try { await api.post('/trainer/profile/experiences', experience); setExperience(blankExperience); await load(); } catch (err) { setError(err.response?.data?.error || 'Could not add experience.'); } };
  const addItem = async e => { e.preventDefault(); setError(''); try { await api.post('/trainer/profile/items', item); setItem({ ...item, title: '', issuing_organization: '', issue_date: '', credential_reference: '' }); await load(); } catch (err) { setError(err.response?.data?.error || 'Could not add profile item.'); } };
  const remove = async (path, id) => { try { await api.delete(`${path}/${id}`); await load(); } catch (err) { setError(err.response?.data?.error || 'Could not remove item.'); } };
  if (!profile) return <main className="container" style={{ padding: '2rem' }}>{error || 'Loading trainer profile…'}</main>;
  const field = (label, key, props = {}) => <label style={{ display: 'grid', gap: '.35rem' }}>{label}<input style={inputStyle} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} {...props} /></label>;
  return <main className="container" style={{ maxWidth: 950, padding: '2rem 1rem', display: 'grid', gap: '1rem' }}>
    <header><span className="badge badge-primary">TRAINER PROFILE</span><h1 style={{ margin: '.5rem 0' }}>Professional profile</h1><p>Keep your teaching background and expertise up to date.</p></header>
    {error && <div role="alert" className="badge badge-danger">{error}</div>}{message && <div role="status" className="badge badge-primary">{message}</div>}
    <form className="card" onSubmit={saveProfile} style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1rem' }}>
      {field('Name', 'name', { required: true })}{field('Profile photo URL', 'avatar_url', { type: 'text' })}{field('Qualification', 'qualification')}{field('Years of experience', 'experience_years', { type: 'number', min: 0, max: 70 })}{field('Specialization', 'specialization')}
      <label style={{ display: 'grid', gap: '.35rem' }}>Expertise<textarea style={inputStyle} rows="3" value={form.expertise || ''} onChange={e => setForm({ ...form, expertise: e.target.value })} /></label>
      <label style={{ display: 'grid', gap: '.35rem', gridColumn: '1/-1' }}>Bio<textarea style={inputStyle} rows="4" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} /></label>
      <button disabled={saving} className="btn btn-primary" type="submit">{saving ? 'Saving…' : 'Save profile'}</button>
    </form>
    <section className="card" style={{ padding: '1.25rem' }}><h2>Work experience</h2>
      {profile.experiences.map(row => <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '.6rem 0' }}><span><strong>{row.designation}</strong> · {row.organization} ({row.start_date} – {row.end_date || 'Present'})</span><button className="btn btn-secondary" type="button" onClick={() => remove('/trainer/profile/experiences', row.id)}>Remove</button></div>)}
      <form onSubmit={saveExperience} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.7rem', marginTop: '1rem' }}><input required placeholder="Organization" style={inputStyle} value={experience.organization} onChange={e => setExperience({ ...experience, organization: e.target.value })} /><input required placeholder="Designation" style={inputStyle} value={experience.designation} onChange={e => setExperience({ ...experience, designation: e.target.value })} /><label>Start date<input required type="date" style={inputStyle} value={experience.start_date} onChange={e => setExperience({ ...experience, start_date: e.target.value })} /></label><label>End date<input type="date" style={inputStyle} value={experience.end_date} onChange={e => setExperience({ ...experience, end_date: e.target.value })} /></label><input placeholder="Description" style={inputStyle} value={experience.description} onChange={e => setExperience({ ...experience, description: e.target.value })} /><button className="btn btn-primary" type="submit">Add experience</button></form>
    </section>
    <section className="card" style={{ padding: '1.25rem' }}><h2>Skills, competencies, subjects and certifications</h2>
      {profile.items.map(row => <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '.6rem 0' }}><span><span className="badge badge-primary">{row.item_type}</span> {row.title}{row.issuing_organization ? ` · ${row.issuing_organization}` : ''}{row.issue_date ? ` · ${row.issue_date}` : ''}{row.credential_reference ? ` · Ref: ${row.credential_reference}` : ''}</span><button className="btn btn-secondary" type="button" onClick={() => remove('/trainer/profile/items', row.id)}>Remove</button></div>)}
      <form onSubmit={addItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.7rem', marginTop: '1rem' }}><select style={inputStyle} value={item.item_type} onChange={e => setItem({ ...item, item_type: e.target.value })}>{['SKILL','COMPETENCY','SUBJECT','CERTIFICATION'].map(x => <option key={x}>{x}</option>)}</select><input required placeholder="Name or title" style={inputStyle} value={item.title} onChange={e => setItem({ ...item, title: e.target.value })} /><input placeholder="Issuer (certification)" style={inputStyle} value={item.issuing_organization} onChange={e => setItem({ ...item, issuing_organization: e.target.value })} /><input placeholder="Credential reference" style={inputStyle} value={item.credential_reference} onChange={e => setItem({ ...item, credential_reference: e.target.value })} /><button className="btn btn-primary" type="submit">Add item</button></form>
    </section>
  </main>;
};
