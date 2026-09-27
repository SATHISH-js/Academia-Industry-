import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

const card = { padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' };

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [roleDrafts, setRoleDrafts] = useState({});
  const load = useCallback(async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
      setRoleDrafts(current => Object.fromEntries((response.data.data || []).map(user => [user.id, current[user.id] || user.role])));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load accounts.');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (user, action) => {
    setBusyId(user.id); setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Account action failed.');
    } finally {
      setBusyId(null);
    }
  };

  return <section className="container" style={{ padding: '1.5rem 0' }}>
    <h1>Account administration</h1>
    <p>Review pending accounts and manage active access.</p>
    {error && <div role="alert" className="card" style={{ ...card, borderLeft: '4px solid #dc2626', marginBottom: '1rem' }}>{error}</div>}
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {users.map(user => <article key={user.id} className="card" style={card}>
        <div><strong>{user.name}</strong><div>{user.email}</div><small>{user.role} · {user.account_status}</small></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user.role !== 'ADMIN' && <>
            <select aria-label={`Role for ${user.email}`} value={roleDrafts[user.id] || user.role} disabled={busyId === user.id} onChange={e => setRoleDrafts(current => ({ ...current, [user.id]: e.target.value }))}>
              <option value="TRAINEE">TRAINEE</option><option value="TRAINER">TRAINER</option>
            </select>
            {(roleDrafts[user.id] || user.role) !== user.role && <button className="btn btn-secondary" disabled={busyId === user.id} onClick={() => run(user, () => api.patch(`/admin/users/${user.id}/role`, { role: roleDrafts[user.id] }))}>Change role</button>}
          </>}
          {user.account_status === 'ACTIVE' && <button className="btn btn-secondary" disabled={busyId === user.id || user.role === 'ADMIN'} onClick={() => run(user, () => api.patch(`/admin/users/${user.id}/disable`))}>Disable account</button>}
        </div>
      </article>)}
      {!users.length && !error && <div className="card" style={card}>No accounts to manage.</div>}
    </div>
  </section>;
};
