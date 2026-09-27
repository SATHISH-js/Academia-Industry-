import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const box = { padding: '1.25rem', marginBottom: '1rem' };
const field = { width: '100%', padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginTop: '0.35rem' };

export const TrainingDashboard = ({ role }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ title: '', description: '', competency: '', level: 'BEGINNER', duration_hours: 8 });
  const [moduleDrafts, setModuleDrafts] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const path = role === 'TRAINEE' ? '/training/catalog' : role === 'TRAINER' ? '/training/programs/mine' : '/admin/users';
      const response = await api.get(path);
      setItems(response.data.data || []);
      if (role === 'TRAINEE') {
        const enrolled = await api.get('/training/enrollments');
        const withModules = await Promise.all((enrolled.data.data || []).map(async enrollment => {
          const modules = await api.get(`/training/programs/${enrollment.program_id}/modules`);
          return { ...enrollment, modules: modules.data.data || [] };
        }));
        setEnrollments(withModules);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load platform data.');
    }
  }, [role]);

  useEffect(() => { load(); }, [load]);

  const act = async (operation) => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); setNotice('Saved successfully.'); await load(); }
    catch (err) { setError(err.response?.data?.error || 'The action could not be completed.'); }
    finally { setBusy(false); }
  };

  const createProgram = (event) => {
    event.preventDefault();
    act(async () => { await api.post('/training/programs', { ...form, duration_hours: Number(form.duration_hours) }); setForm({ title: '', description: '', competency: '', level: 'BEGINNER', duration_hours: 8 }); });
  };

  const title = role === 'TRAINEE' ? 'Training catalog' : role === 'TRAINER' ? 'Trainer workspace' : 'Platform administration';
  const intro = role === 'TRAINEE' ? 'Explore programs and track your learning progress.' : role === 'TRAINER' ? 'Publish practical programs and view learner enrollment.' : 'Manage trainer approvals and platform accounts.';

  return <section className="container" style={{ padding: '1.5rem 0' }}>
    <div style={{ marginBottom: '1.5rem' }}><span className="badge badge-primary">{role}</span><h1 style={{ margin: '0.6rem 0 0.25rem' }}>{title}</h1><p style={{ color: 'var(--slate-600)' }}>{intro} Welcome, {user?.name}.</p></div>
    {error && <div role="alert" className="card" style={{ ...box, borderLeft: '4px solid #dc2626' }}>{error}</div>}
    {notice && <div role="status" className="card" style={{ ...box, borderLeft: '4px solid #16a34a' }}>{notice}</div>}

    {role === 'TRAINER' && <div className="card" style={box}>
      <h2>Create a training program</h2>
      <form onSubmit={createProgram} style={{ display: 'grid', gap: '0.8rem', maxWidth: 720 }}>
        <label>Program title<input required maxLength={180} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={field} /></label>
        <label>Description<textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={field} /></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.8rem' }}>
          <label>Competency<input value={form.competency} onChange={e => setForm({ ...form, competency: e.target.value })} style={field} /></label>
          <label>Level<select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={field}><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select></label>
          <label>Duration (hours)<input type="number" min="1" max="5000" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} style={field} /></label>
        </div>
        <button disabled={busy} className="btn btn-primary">{busy ? 'Saving…' : 'Publish program'}</button>
      </form>
      {items.length === 0 && <p style={{ color: 'var(--slate-600)', marginTop: '1rem' }}>New trainer accounts need administrator approval before they can publish programs.</p>}
    </div>}

    <div style={{ display: 'grid', gap: '1rem' }}>
      {role === 'ADMIN' && items.map(account => <article key={account.id} className="card" style={{ ...box, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <div><strong>{account.name}</strong><div>{account.email}</div><small>{account.role} · {account.is_active ? 'Active' : 'Inactive'}{account.trainer_approval ? ` · Trainer ${account.trainer_approval.toLowerCase()}` : ''}</small></div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {account.role === 'TRAINER' && account.trainer_approval !== 'APPROVED' && <button disabled={busy} className="btn btn-primary" onClick={() => act(() => api.patch(`/admin/trainers/${account.id}/approval`, { approval_status: 'APPROVED' }))}>Approve trainer</button>}
          {account.role === 'TRAINER' && account.trainer_approval === 'APPROVED' && <button disabled={busy} className="btn btn-secondary" onClick={() => act(() => api.patch(`/admin/trainers/${account.id}/approval`, { approval_status: 'REJECTED' }))}>Revoke trainer</button>}
          <button disabled={busy} className="btn btn-secondary" onClick={() => act(() => api.patch(`/admin/users/${account.id}/status`, { is_active: !account.is_active }))}>{account.is_active ? 'Deactivate' : 'Activate'}</button>
        </div>
      </article>)}
      {role === 'TRAINEE' && items.map(program => <article key={program.id} className="card" style={box}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}><div><span className="badge badge-primary">{program.level}</span><h2 style={{ margin: '0.7rem 0 0.25rem' }}>{program.title}</h2></div><strong>{program.duration_hours} hours</strong></div>
        <p>{program.description}</p><p style={{ color: 'var(--slate-600)' }}>Trainer: {program.trainer_name}{program.competency ? ` · Competency: ${program.competency}` : ''}</p>
        <button disabled={busy || program.is_enrolled} className="btn btn-primary" onClick={() => act(() => api.post(`/training/programs/${program.id}/enroll`))}>{program.is_enrolled ? 'Enrolled' : 'Enroll'}</button>
      </article>)}
      {role === 'TRAINER' && items.map(program => <article key={program.id} className="card" style={box}>
        <span className="badge badge-primary">{program.status}</span><h2 style={{ margin: '0.7rem 0 0.25rem' }}>{program.title}</h2><p>{program.description}</p><small>{program.level} · {program.duration_hours} hours · {program.learner_count} active learners{program.competency ? ` · ${program.competency}` : ''}</small>
        <form onSubmit={e => { e.preventDefault(); const draft = moduleDrafts[program.id] || {}; act(async () => { await api.post(`/training/programs/${program.id}/modules`, draft); setModuleDrafts(current => ({ ...current, [program.id]: { title: '', description: '', resource_url: '' } })); }); }} style={{ display: 'grid', gap: '0.6rem', maxWidth: 650, marginTop: '1rem' }}>
          <strong>Add a learning module</strong>
          <input required aria-label="Module title" placeholder="Module title" value={moduleDrafts[program.id]?.title || ''} onChange={e => setModuleDrafts(current => ({ ...current, [program.id]: { ...current[program.id], title: e.target.value } }))} style={field} />
          <textarea aria-label="Module description" placeholder="Description" rows={2} value={moduleDrafts[program.id]?.description || ''} onChange={e => setModuleDrafts(current => ({ ...current, [program.id]: { ...current[program.id], description: e.target.value } }))} style={field} />
          <input aria-label="Learning resource URL" type="url" placeholder="Learning resource URL (optional)" value={moduleDrafts[program.id]?.resource_url || ''} onChange={e => setModuleDrafts(current => ({ ...current, [program.id]: { ...current[program.id], resource_url: e.target.value } }))} style={field} />
          <button disabled={busy} className="btn btn-secondary">Add module</button>
        </form>
      </article>)}
      {items.length === 0 && !error && <div className="card" style={box}><p style={{ margin: 0, color: 'var(--slate-600)' }}>{role === 'ADMIN' ? 'No platform accounts yet.' : role === 'TRAINEE' ? 'No published programs yet. Check back soon.' : 'No programs yet. Create your first program above.'}</p></div>}
    </div>
    {role === 'TRAINEE' && <div style={{ marginTop: '2rem' }}><h2>My learning</h2><div style={{ display: 'grid', gap: '1rem' }}>
      {enrollments.map(enrollment => <article key={enrollment.id} className="card" style={box}>
        <h3 style={{ marginTop: 0 }}>{enrollment.title}</h3><p>{enrollment.trainer_name} · {enrollment.duration_hours} hours</p>
        <p>Progress: {enrollment.progress_percent}%</p>
        <div style={{ display: 'grid', gap: '0.5rem' }}>{enrollment.modules.map(module => <label key={module.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <input type="checkbox" checked={Boolean(module.completed)} disabled={busy || enrollment.status === 'COMPLETED'} onChange={e => act(() => api.patch(`/training/modules/${module.id}/completion`, { completed: e.target.checked }))} />
          <span><strong>{module.title}</strong>{module.description && <span style={{ display: 'block' }}>{module.description}</span>}{module.resource_url && <a href={module.resource_url} target="_blank" rel="noreferrer">Open learning resource</a>}</span>
        </label>)}</div>
        {enrollment.modules.length === 0 && <small>Modules will appear here when the trainer adds them.</small>}
        <small style={{ display: 'block', marginTop: '0.5rem' }}>{enrollment.status === 'COMPLETED' ? 'Completed' : 'In progress'}</small>
      </article>)}
      {enrollments.length === 0 && <div className="card" style={box}><p style={{ margin: 0, color: 'var(--slate-600)' }}>Your enrolled programs will appear here.</p></div>}
    </div></div>}
  </section>;
};
