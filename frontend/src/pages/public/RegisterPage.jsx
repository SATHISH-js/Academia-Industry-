import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const RegisterPage = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ['TRAINEE', 'TRAINER'].includes(params.get('role')) ? params.get('role') : 'TRAINEE' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/register', form);
      const { user, token } = response.data.data;
      if (token) {
        login(user, token);
        const roleRoutes = { TRAINEE: '/trainee/dashboard', TRAINER: '/trainer/dashboard' };
        navigate(roleRoutes[user.role] || '/login', { replace: true });
      } else {
        setNotice(response.data.message || 'Your account was created, but no sign-in session was issued. Please try signing in.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginTop: '0.35rem' };
  return (
    <div className="container" style={{ maxWidth: 520, padding: '3rem 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <span className="badge badge-primary">Create account</span>
        <h1 style={{ margin: '0.8rem 0 0.4rem' }}>Join the training platform</h1>
        <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>Trainee and trainer accounts activate immediately after signup.</p>
        {error && <div role="alert" className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem' }}>{error}</div>}
        {notice && <div role="status" className="card" style={{ padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #16a34a' }}>{notice} <Link to="/login">Go to sign in</Link>.</div>}
        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
          <label>Name<input required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={fieldStyle} /></label>
          <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={fieldStyle} /></label>
          <label>Password<input required type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={fieldStyle} /><small>At least 8 characters, with uppercase, lowercase, and a number.</small></label>
          <label>Account type<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={fieldStyle}><option value="TRAINEE">Trainee</option><option value="TRAINER">Trainer</option></select></label>
          <button className="btn btn-primary" disabled={loading || !!notice}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p style={{ marginTop: '1.25rem' }}>Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};
